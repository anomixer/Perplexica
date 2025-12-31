'use client';

import { FileDown, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { exportChatToPDF, loadPDFFonts } from '@/lib/utils/pdfExport';
import { useChat } from '@/lib/hooks/useChat';
import { toast } from 'sonner';

const ExportPDF = () => {
  const [exporting, setExporting] = useState(false);
  const { messages, sections } = useChat();

  const handleExport = async () => {
    console.log('=== Export button clicked ===');
    console.log('Messages count:', messages.length);
    console.log('Exporting state:', exporting);

    if (exporting) {
      console.log('Already exporting, returning...');
      return;
    }

    if (messages.length === 0) {
      console.log('No messages, returning...');
      return;
    }

    setExporting(true);
    const toastId = toast.loading('Generating PDF...');

    try {
      console.log('Step 1: Checking fonts...');
      await loadPDFFonts();
      console.log('Fonts check passed');

      const title = messages[0]?.query.substring(0, 50) || 'Perplexica Chat';
      console.log('Step 2: Title:', title);

      console.log('Step 3: Starting exportChatToPDF...');
      await exportChatToPDF(messages, title);
      console.log('Export completed!');

      toast.success('PDF exported successfully!', { id: toastId });
    } catch (error) {
      console.error('=== Export error ===');
      console.error('Error type:', typeof error);
      console.error('Error:', error);

      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }

      toast.error(
        `Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        { id: toastId, duration: 5000 }
      );
    } finally {
      console.log('=== Export finished, resetting state ===');
      setExporting(false);
    }
  };

  console.log('ExportPDF render - messages:', messages.length);

  if (messages.length === 0) {
    console.log('ExportPDF hidden - no messages');
    return null;
  }

  return (
    <button
      onClick={handleExport}
      disabled={exporting}
      className="p-2 text-black/70 dark:text-white/70 rounded-xl hover:bg-light-secondary dark:hover:bg-dark-secondary transition duration-200 hover:text-black dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
      title="Export as PDF"
    >
      {exporting ? (
        <Loader2 size={18} className="animate-spin" />
      ) : (
        <FileDown size={18} />
      )}
    </button>
  );
};

export default ExportPDF;
