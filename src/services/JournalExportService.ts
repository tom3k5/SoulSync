// JournalExportService.ts - Export journal entries to beautifully formatted PDF
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { JournalEntry } from './StorageService';

export class JournalExportService {
  /**
   * Generate HTML for journal entries
   */
  private static generateHTML(entries: JournalEntry[]): string {
    const entriesHTML = entries
      .map(
        (entry) => `
      <div class="entry">
        <div class="entry-header">
          <div class="entry-date">${new Date(entry.date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}</div>
          ${entry.mood ? `<div class="entry-mood">${entry.mood}</div>` : ''}
        </div>
        <h2 class="entry-title">${entry.title}</h2>
        <div class="entry-content">${entry.content.replace(/\n/g, '<br />')}</div>
        ${
          entry.gratitude && entry.gratitude.length > 0
            ? `
          <div class="gratitude-section">
            <h3>Gratitude</h3>
            <ul>
              ${entry.gratitude.map((item) => `<li>${item}</li>`).join('')}
            </ul>
          </div>
        `
            : ''
        }
        ${
          entry.tags && entry.tags.length > 0
            ? `
          <div class="tags">
            ${entry.tags.map((tag) => `<span class="tag">${tag}</span>`).join(' ')}
          </div>
        `
            : ''
        }
      </div>
    `
      )
      .join('');

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>SoulSync Journal</title>
          <style>
            @page {
              margin: 1in;
            }

            * {
              box-sizing: border-box;
            }

            body {
              font-family: 'Georgia', serif;
              color: #2c3e50;
              line-height: 1.6;
              padding: 0;
              margin: 0;
            }

            .header {
              text-align: center;
              margin-bottom: 40px;
              padding-bottom: 20px;
              border-bottom: 3px solid #4A90E2;
            }

            .header h1 {
              font-size: 36px;
              color: #4A90E2;
              margin: 0 0 10px 0;
              font-weight: 700;
            }

            .header .subtitle {
              font-size: 18px;
              color: #7f8c8d;
              font-style: italic;
            }

            .header .date-range {
              font-size: 14px;
              color: #95a5a6;
              margin-top: 10px;
            }

            .entry {
              page-break-inside: avoid;
              margin-bottom: 40px;
              padding: 20px;
              border-left: 4px solid #FFD700;
              background: linear-gradient(to right, #f8f9fa, #ffffff);
            }

            .entry-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 15px;
            }

            .entry-date {
              font-size: 14px;
              color: #7f8c8d;
              text-transform: uppercase;
              letter-spacing: 1px;
              font-weight: 600;
            }

            .entry-mood {
              font-size: 24px;
            }

            .entry-title {
              font-size: 24px;
              color: #2c3e50;
              margin: 0 0 15px 0;
              font-weight: 700;
            }

            .entry-content {
              font-size: 16px;
              line-height: 1.8;
              color: #34495e;
              margin-bottom: 15px;
            }

            .gratitude-section {
              background: #fff9e6;
              padding: 15px;
              border-radius: 8px;
              margin-top: 15px;
            }

            .gratitude-section h3 {
              font-size: 18px;
              color: #FFD700;
              margin: 0 0 10px 0;
              font-weight: 600;
            }

            .gratitude-section ul {
              margin: 0;
              padding-left: 20px;
            }

            .gratitude-section li {
              margin-bottom: 5px;
              color: #34495e;
            }

            .tags {
              margin-top: 15px;
            }

            .tag {
              display: inline-block;
              background: #4A90E2;
              color: white;
              padding: 4px 12px;
              border-radius: 15px;
              font-size: 12px;
              margin-right: 8px;
              margin-bottom: 8px;
            }

            .footer {
              text-align: center;
              margin-top: 60px;
              padding-top: 20px;
              border-top: 2px solid #ecf0f1;
              color: #95a5a6;
              font-size: 12px;
            }

            .footer .soul-quote {
              font-style: italic;
              color: #7f8c8d;
              margin-top: 10px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🌌 SoulSync Journal</h1>
            <div class="subtitle">Your Soul's Journey Through Time</div>
            <div class="date-range">
              ${entries.length} entries • Generated on ${new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          </div>

          ${entriesHTML}

          <div class="footer">
            <div>Created with SoulSync</div>
            <div class="soul-quote">
              "You are an eternal soul experiencing a temporary human journey."
              <br />
              - Dolores Cannon
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Export journal entries to PDF
   */
  static async exportToPDF(entries: JournalEntry[]): Promise<void> {
    try {
      if (entries.length === 0) {
        throw new Error('No journal entries to export');
      }

      // Generate HTML
      const html = this.generateHTML(entries);

      // Create PDF
      const { uri } = await Print.printToFileAsync({
        html,
        base64: false,
      });

      // Share the PDF directly
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Share Your Soul Journey',
          UTI: 'com.adobe.pdf',
        });
      } else {
        throw new Error('Sharing is not available on this device');
      }
    } catch (error) {
      console.error('Error exporting journal to PDF:', error);
      throw error;
    }
  }

  /**
   * Export a single journal entry to PDF
   */
  static async exportSingleEntry(entry: JournalEntry): Promise<void> {
    return this.exportToPDF([entry]);
  }

  /**
   * Get export preview (for showing user before exporting)
   */
  static getExportSummary(entries: JournalEntry[]): string {
    const totalWords = entries.reduce((sum, entry) => {
      return sum + entry.content.split(/\s+/).length;
    }, 0);

    const dateRange = entries.length > 0 ? {
      first: new Date(entries[entries.length - 1].date),
      last: new Date(entries[0].date),
    } : null;

    return `
📖 ${entries.length} journal entries
✍️ Approximately ${totalWords.toLocaleString()} words
📅 ${dateRange ? `From ${dateRange.first.toLocaleDateString()} to ${dateRange.last.toLocaleDateString()}` : 'No date range'}

Your soul journey, beautifully formatted and ready to share or keep for posterity.
    `.trim();
  }
}

export default JournalExportService;
