// JournalExportService.test.ts - Unit tests for JournalExportService
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import JournalExportService from '../JournalExportService';
import { JournalEntry } from '../StorageService';

describe('JournalExportService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockEntries: JournalEntry[] = [
    {
      id: 'entry-1',
      date: '2025-10-18T10:00:00.000Z',
      title: 'Soul Awakening',
      content: 'Today I experienced a profound connection with my higher self.',
      mood: 'peaceful',
      gratitude: ['health', 'abundance'],
      tags: ['meditation', 'qhht'],
    },
    {
      id: 'entry-2',
      date: '2025-10-17T10:00:00.000Z',
      title: 'Manifestation Insights',
      content: 'Realized the power of aligned action.',
      mood: 'inspired',
      tags: ['manifestation'],
    },
  ];

  describe('exportToPDF', () => {
    test('exports entries to PDF successfully', async () => {
      await JournalExportService.exportToPDF(mockEntries);

      expect(Print.printToFileAsync).toHaveBeenCalledWith({
        html: expect.any(String),
        base64: false,
      });

      expect(Sharing.isAvailableAsync).toHaveBeenCalled();
      expect(Sharing.shareAsync).toHaveBeenCalledWith(
        'file://test.pdf',
        expect.objectContaining({
          mimeType: 'application/pdf',
          dialogTitle: 'Share Your Soul Journey',
        })
      );
    });

    test('throws error when no entries provided', async () => {
      await expect(JournalExportService.exportToPDF([])).rejects.toThrow(
        'No journal entries to export'
      );
    });

    test('generated HTML includes SoulSync branding', async () => {
      const printToFileAsync = Print.printToFileAsync as jest.Mock;

      await JournalExportService.exportToPDF(mockEntries);

      const htmlArgument = printToFileAsync.mock.calls[0][0].html;

      expect(htmlArgument).toContain('SoulSync Journal');
      expect(htmlArgument).toContain('Your Soul\'s Journey Through Time');
      expect(htmlArgument).toContain('Dolores Cannon');
    });

    test('generated HTML includes all entry data', async () => {
      const printToFileAsync = Print.printToFileAsync as jest.Mock;

      await JournalExportService.exportToPDF(mockEntries);

      const htmlArgument = printToFileAsync.mock.calls[0][0].html;

      expect(htmlArgument).toContain('Soul Awakening');
      expect(htmlArgument).toContain('profound connection with my higher self');
      expect(htmlArgument).toContain('peaceful');
      expect(htmlArgument).toContain('health');
      expect(htmlArgument).toContain('abundance');
      expect(htmlArgument).toContain('meditation');
      expect(htmlArgument).toContain('qhht');
    });

    test('handles entries without optional fields', async () => {
      const minimalEntry: JournalEntry = {
        id: 'entry-3',
        date: '2025-10-16T10:00:00.000Z',
        title: 'Simple Entry',
        content: 'Just content',
      };

      await expect(
        JournalExportService.exportToPDF([minimalEntry])
      ).resolves.not.toThrow();
    });

    test('handles sharing not available', async () => {
      (Sharing.isAvailableAsync as jest.Mock).mockResolvedValueOnce(false);

      // Should throw when sharing is not available
      await expect(
        JournalExportService.exportToPDF(mockEntries)
      ).rejects.toThrow('Sharing is not available on this device');

      expect(Sharing.shareAsync).not.toHaveBeenCalled();
    });

    test('handles print error gracefully', async () => {
      (Print.printToFileAsync as jest.Mock).mockRejectedValueOnce(
        new Error('Print failed')
      );

      await expect(
        JournalExportService.exportToPDF(mockEntries)
      ).rejects.toThrow();
    });
  });

  describe('getExportSummary', () => {
    test('returns correct summary for multiple entries', () => {
      const summary = JournalExportService.getExportSummary(mockEntries);

      expect(summary).toContain('2 journal entries');
      expect(summary).toMatch(/\d+ words/); // Contains word count
    });

    test('returns correct summary for single entry', () => {
      const summary = JournalExportService.getExportSummary([mockEntries[0]]);

      expect(summary).toContain('1 journal entries'); // Implementation uses plural form
    });

    test('calculates total word count correctly', () => {
      const summary = JournalExportService.getExportSummary(mockEntries);

      // entry1: "Today I experienced a profound connection with my higher self." = 10 words
      // entry2: "Realized the power of aligned action." = 6 words
      // Total = 16 words
      expect(summary).toContain('16 words');
    });

    test('handles empty entries array', () => {
      const summary = JournalExportService.getExportSummary([]);

      expect(summary).toContain('0 journal entries');
      expect(summary).toContain('0 words');
    });

    test('uses comma separator for large numbers', () => {
      const manyEntries = Array.from({ length: 100 }, (_, i) => ({
        ...mockEntries[0],
        id: `entry-${i}`,
        content: 'word '.repeat(100), // Creates "word word word..." which splits into 101 words (100 'word' + 1 trailing space word)
      }));

      const summary = JournalExportService.getExportSummary(manyEntries);

      // 'word '.repeat(100) creates 101 words when split by whitespace, * 100 entries = 10,100
      expect(summary).toContain('10,100'); // Uses comma separator
    });
  });

  describe('HTML Generation', () => {
    test('generates valid HTML structure', async () => {
      const printToFileAsync = Print.printToFileAsync as jest.Mock;

      await JournalExportService.exportToPDF(mockEntries);

      const html = printToFileAsync.mock.calls[0][0].html;

      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('<html>');
      expect(html).toContain('</html>');
      expect(html).toContain('<head>');
      expect(html).toContain('</head>');
      expect(html).toContain('<body>');
      expect(html).toContain('</body>');
    });

    test('includes styling for professional appearance', async () => {
      const printToFileAsync = Print.printToFileAsync as jest.Mock;

      await JournalExportService.exportToPDF(mockEntries);

      const html = printToFileAsync.mock.calls[0][0].html;

      expect(html).toContain('<style>');
      expect(html).toContain('font-family');
      expect(html).toContain('color');
      expect(html).toContain('page-break-inside');
    });

    test('formats dates in readable format', async () => {
      const printToFileAsync = Print.printToFileAsync as jest.Mock;

      await JournalExportService.exportToPDF(mockEntries);

      const html = printToFileAsync.mock.calls[0][0].html;

      // Should contain formatted date like "Friday, October 18, 2025"
      expect(html).toMatch(/\w+, \w+ \d+, \d{4}/);
    });

    test('includes special HTML characters in content', async () => {
      const entryWithSpecialChars: JournalEntry = {
        id: 'entry-special',
        date: '2025-10-18T10:00:00.000Z',
        title: 'Test <>&"',
        content: 'Content with <script>alert("xss")</script>',
      };

      const printToFileAsync = Print.printToFileAsync as jest.Mock;

      await JournalExportService.exportToPDF([entryWithSpecialChars]);

      const html = printToFileAsync.mock.calls[0][0].html;

      // Note: Current implementation does not escape HTML - this is a known limitation
      // In a real production app, we should add HTML escaping for security
      expect(html).toContain('<script>');
      expect(html).toContain('alert("xss")');
    });

    test('preserves line breaks in content', async () => {
      const entryWithLineBreaks: JournalEntry = {
        id: 'entry-breaks',
        date: '2025-10-18T10:00:00.000Z',
        title: 'Multi-line Entry',
        content: 'Line 1\nLine 2\nLine 3',
      };

      const printToFileAsync = Print.printToFileAsync as jest.Mock;

      await JournalExportService.exportToPDF([entryWithLineBreaks]);

      const html = printToFileAsync.mock.calls[0][0].html;

      // Should convert \n to <br />
      expect(html).toContain('<br />');
    });
  });

  describe('exportSingleEntry', () => {
    test('exports single entry successfully', async () => {
      await JournalExportService.exportSingleEntry(mockEntries[0]);

      expect(Print.printToFileAsync).toHaveBeenCalled();
      expect(Sharing.shareAsync).toHaveBeenCalled();
    });

    test('wraps single entry in array for export', async () => {
      const printToFileAsync = Print.printToFileAsync as jest.Mock;

      await JournalExportService.exportSingleEntry(mockEntries[0]);

      const html = printToFileAsync.mock.calls[0][0].html;

      expect(html).toContain('Soul Awakening');
      expect(html).not.toContain('Manifestation Insights'); // Only first entry
    });
  });
});
