import React from 'react';
import {  View,  Text,  StyleSheet,  Modal as RNModal } from 'react-native';
import {  COLORS,  SPACING,  SIZES,  SHADOWS  } from '../constants/theme';
import Button from './Button';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  message?: string;
  children?: React.ReactNode;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
}

const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  title,
  message,
  children,
  onConfirm,
  confirmText = 'OK',
  cancelText = 'Cancel',
}) => {
  const handleConfirm = () => {
    console.log('Modal confirm clicked');
    if (onConfirm) {
      onConfirm();
    } else {
      onClose();
    }
  };

  const handleCancel = () => {
    console.log('Modal cancel clicked');
    onClose();
  };

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modal}>
            <Text style={styles.title}>{title}</Text>
            {message && <Text style={styles.message}>{message}</Text>}
            {children}

            <View style={styles.buttonContainer}>
              {onConfirm && (
                <View style={styles.button}>
                  <Button
                    title={cancelText}
                    onPress={handleCancel}
                    variant="outline"
                  />
                </View>
              )}
              <View style={styles.button}>
                <Button
                  title={confirmText}
                  onPress={handleConfirm}
                  variant="primary"
                />
              </View>
            </View>
          </View>
        </View>
      </View>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxWidth: 400,
  },
  modal: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius.lg,
    padding: SPACING.xl,
    ...SHADOWS.large,
  },
  title: {
    fontSize: SIZES.font.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  message: {
    fontSize: SIZES.font.md,
    color: COLORS.textSecondary,
    lineHeight: 24,
    marginBottom: SPACING.xl,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  button: {
    flex: 1,
  },
});

export default Modal;
