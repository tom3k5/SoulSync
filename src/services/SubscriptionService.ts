// SubscriptionService.ts - RevenueCat integration for premium subscriptions
import Purchases, {
  LOG_LEVEL,
  PurchasesOffering,
  PurchasesPackage,
  PurchasesStoreProduct,
  CustomerInfo,
} from 'react-native-purchases';
import { Platform, Alert } from 'react-native';
import StorageService from './StorageService';

/**
 * Configuration keys for RevenueCat
 * IMPORTANT: Replace these with your actual RevenueCat API keys
 * Get them from: https://app.revenuecat.com/
 */
const API_KEYS = {
  ios: 'appl_YOUR_IOS_API_KEY_HERE', // Replace with your iOS API key
  android: 'goog_YOUR_ANDROID_API_KEY_HERE', // Replace with your Android API key
};

export interface SubscriptionOffering {
  identifier: string;
  serverDescription: string;
  monthly?: PurchasesPackage;
  annual?: PurchasesPackage;
  lifetime?: PurchasesPackage;
  availablePackages: PurchasesPackage[];
}

export interface PremiumStatus {
  isPremium: boolean;
  entitlementIdentifier?: string;
  willRenew: boolean;
  periodType?: string;
  expirationDate?: string;
  originalPurchaseDate?: string;
}

class SubscriptionService {
  private initialized = false;

  /**
   * Initializes RevenueCat SDK
   * Call this once when the app starts
   */
  async initialize(): Promise<void> {
    try {
      if (this.initialized) {
        console.log('RevenueCat already initialized');
        return;
      }

      // Set log level for debugging
      Purchases.setLogLevel(LOG_LEVEL.DEBUG);

      // Configure RevenueCat
      const apiKey = Platform.OS === 'ios' ? API_KEYS.ios : API_KEYS.android;

      await Purchases.configure({ apiKey });

      this.initialized = true;
      console.log('RevenueCat initialized successfully');

      // Sync premium status with local storage
      await this.syncPremiumStatus();
    } catch (error) {
      console.error('Error initializing RevenueCat:', error);
      throw error;
    }
  }

  /**
   * Sets the user ID for RevenueCat
   * Call this after user authentication
   */
  async identifyUser(userId: string): Promise<void> {
    try {
      await Purchases.logIn(userId);
      console.log('User identified:', userId);
      await this.syncPremiumStatus();
    } catch (error) {
      console.error('Error identifying user:', error);
      throw error;
    }
  }

  /**
   * Logs out the current user
   * Call this when user signs out
   */
  async logoutUser(): Promise<void> {
    try {
      await Purchases.logOut();
      console.log('User logged out from RevenueCat');
    } catch (error) {
      console.error('Error logging out user:', error);
      throw error;
    }
  }

  /**
   * Fetches available subscription offerings
   * Returns null if no offerings are configured
   */
  async getOfferings(): Promise<SubscriptionOffering | null> {
    try {
      const offerings = await Purchases.getOfferings();

      if (!offerings.current) {
        console.log('No offerings configured in RevenueCat');
        return null;
      }

      const current = offerings.current;

      return {
        identifier: current.identifier,
        serverDescription: current.serverDescription,
        monthly: current.monthly ?? undefined,
        annual: current.annual ?? undefined,
        lifetime: current.lifetime ?? undefined,
        availablePackages: current.availablePackages,
      };
    } catch (error) {
      console.error('Error fetching offerings:', error);
      return null;
    }
  }

  /**
   * Purchases a subscription package
   * Returns true if successful, false otherwise
   */
  async purchasePackage(pkg: PurchasesPackage): Promise<boolean> {
    try {
      const { customerInfo } = await Purchases.purchasePackage(pkg);

      // Update local storage with premium status
      await this.updatePremiumStatus(customerInfo);

      return true;
    } catch (error: any) {
      if (error.userCancelled) {
        console.log('User cancelled purchase');
        return false;
      }

      console.error('Purchase error:', error);
      Alert.alert(
        'Purchase Failed',
        'Could not complete your purchase. Please try again or contact support.'
      );
      return false;
    }
  }

  /**
   * Restores previous purchases
   * Useful when user reinstalls app or switches devices
   */
  async restorePurchases(): Promise<boolean> {
    try {
      const customerInfo = await Purchases.restorePurchases();

      // Update local storage
      await this.updatePremiumStatus(customerInfo);

      const premiumStatus = this.getPremiumStatusFromCustomerInfo(customerInfo);

      if (premiumStatus.isPremium) {
        Alert.alert(
          'Purchases Restored',
          'Your premium subscription has been restored successfully.'
        );
        return true;
      } else {
        Alert.alert(
          'No Purchases Found',
          'No previous purchases were found for this account.'
        );
        return false;
      }
    } catch (error) {
      console.error('Error restoring purchases:', error);
      Alert.alert(
        'Restore Failed',
        'Could not restore your purchases. Please try again or contact support.'
      );
      return false;
    }
  }

  /**
   * Checks current premium status
   * Returns premium status object
   */
  async checkPremiumStatus(): Promise<PremiumStatus> {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      return this.getPremiumStatusFromCustomerInfo(customerInfo);
    } catch (error) {
      console.error('Error checking premium status:', error);
      return { isPremium: false, willRenew: false };
    }
  }

  /**
   * Syncs premium status with local storage
   * Call this periodically to keep status up to date
   */
  async syncPremiumStatus(): Promise<void> {
    try {
      const premiumStatus = await this.checkPremiumStatus();

      // Update user profile in local storage
      const profile = await StorageService.getUserProfile();
      if (profile) {
        profile.isPremium = premiumStatus.isPremium;
        await StorageService.saveUserProfile(profile);
      }

      console.log('Premium status synced:', premiumStatus.isPremium);
    } catch (error) {
      console.error('Error syncing premium status:', error);
    }
  }

  /**
   * Gets premium entitlements from customer info
   * Private helper method
   */
  private getPremiumStatusFromCustomerInfo(customerInfo: CustomerInfo): PremiumStatus {
    // Check for "premium" entitlement (configure this in RevenueCat dashboard)
    const premiumEntitlement = customerInfo.entitlements.active['premium'];

    if (premiumEntitlement) {
      return {
        isPremium: true,
        entitlementIdentifier: premiumEntitlement.identifier,
        willRenew: premiumEntitlement.willRenew,
        periodType: premiumEntitlement.periodType,
        expirationDate: premiumEntitlement.expirationDate ?? undefined,
        originalPurchaseDate: premiumEntitlement.originalPurchaseDate,
      };
    }

    return { isPremium: false, willRenew: false };
  }

  /**
   * Updates local storage with premium status
   * Private helper method
   */
  private async updatePremiumStatus(customerInfo: CustomerInfo): Promise<void> {
    const premiumStatus = this.getPremiumStatusFromCustomerInfo(customerInfo);

    const profile = await StorageService.getUserProfile();
    if (profile) {
      profile.isPremium = premiumStatus.isPremium;
      await StorageService.saveUserProfile(profile);
    }
  }

  /**
   * Gets product information for display
   * Useful for showing prices and descriptions
   */
  getProductInfo(pkg: PurchasesPackage): {
    title: string;
    description: string;
    price: string;
    pricePerMonth?: string;
  } {
    const product = pkg.product;

    // Calculate price per month for annual subscriptions
    let pricePerMonth: string | undefined;
    if (pkg.packageType === 'ANNUAL') {
      const annualPrice = product.price;
      const monthlyEquivalent = annualPrice / 12;
      pricePerMonth = monthlyEquivalent.toFixed(2);
    }

    return {
      title: product.title,
      description: product.description,
      price: product.priceString,
      pricePerMonth,
    };
  }

  /**
   * Checks if user is on a free trial
   */
  async isOnFreeTrial(): Promise<boolean> {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      const premiumEntitlement = customerInfo.entitlements.active['premium'];

      return premiumEntitlement?.periodType === 'TRIAL' ?? false;
    } catch (error) {
      console.error('Error checking trial status:', error);
      return false;
    }
  }

  /**
   * Gets subscription management URL
   * Redirects user to App Store / Play Store subscription settings
   */
  async openSubscriptionManagement(): Promise<void> {
    try {
      await Purchases.showManagementUI();
    } catch (error) {
      console.error('Error opening subscription management:', error);
      Alert.alert(
        'Cannot Open Settings',
        'Please manage your subscription through the App Store or Play Store.'
      );
    }
  }
}

export default new SubscriptionService();
