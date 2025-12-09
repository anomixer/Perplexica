import { jsPDF } from 'jspdf';

// 字體加載狀態
let fontLoaded = false;

/**
 * 加載並註冊字體
 */
export const loadPDFFonts = async () => {
  if (fontLoaded) return;

  try {
    console.log('Checking font files...');
    
    // 驗證字體文件是否存在
    const regularResponse = await fetch('/fonts/NotoSansTC-Regular.ttf');
    const boldResponse = await fetch('/fonts/NotoSansTC-Bold.ttf');

    if (!regularResponse.ok) {
      throw new Error('NotoSansTC-Regular.ttf not found. Please download fonts first.');
    }
    if (!boldResponse.ok) {
      throw new Error('NotoSansTC-Bold.ttf not found. Please download fonts first.');
    }

    console.log('Font files found');
    fontLoaded = true;
  } catch (error) {
    console.error('Error loading PDF fonts:', error);
    throw error;
  }
};

/**
 * 將 Blob 轉換為 base64（與 test-pdf.html 使用相同的方法）
 */
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * 清理 Markdown 格式
 */
const cleanMarkdown = (text: string): string => {
  return text
    .replace(/<think>[\s\S]*?<\/think>/g, '') // 移除 think 標籤
    .replace(/<citation[^>]*>.*?<\/citation>/g, '') // 移除 citation 標籤
    .replace(/\*\*(.*?)\*\*/g, '$1') // 移除粗體
    .replace(/\*(.*?)\*/g, '$1') // 移除斜體  
    .replace(/`(.*?)`/g, '$1') // 移除代碼標記
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // 移除鏈接，保留文本
    .replace(/^#+\s/gm, '') // 移除標題標記
    .replace(/^>\s/gm, '') // 移除引用標記
    .replace(/^[-*+]\s/gm, '• ') // 列表轉為bullet
    .trim();
};

/**
 * 導出聊天記錄為 PDF
 */
export const exportChatToPDF = async (
  messages: any[],
  chatTitle: string,
) => {
  try {
    console.log('Starting PDF export...');
    
    // 確保字體已加載
    if (!fontLoaded) {
      await loadPDFFonts();
    }

    console.log('Loading fonts...');
    
    // 加載字體文件（使用與 test-pdf.html 完全相同的方法）
    const regularResponse = await fetch('/fonts/NotoSansTC-Regular.ttf');
    const boldResponse = await fetch('/fonts/NotoSansTC-Bold.ttf');
    
    if (!regularResponse.ok || !boldResponse.ok) {
      throw new Error('Font files not found');
    }
    
    const regularBlob = await regularResponse.blob();
    const boldBlob = await boldResponse.blob();
    
    console.log('Converting fonts to base64...');
    
    // 轉換為 base64
    const regularBase64 = await blobToBase64(regularBlob);
    const boldBase64 = await blobToBase64(boldBlob);
    
    console.log('Creating PDF document...');

    // 創建 PDF 文檔
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });
    
    console.log('Registering fonts...');
    
    // 註冊字體（使用與 test-pdf.html 完全相同的方法）
    doc.addFileToVFS('NotoSansTC-Regular.ttf', regularBase64);
    doc.addFileToVFS('NotoSansTC-Bold.ttf', boldBase64);
    
    doc.addFont('NotoSansTC-Regular.ttf', 'NotoSansTC', 'normal');
    doc.addFont('NotoSansTC-Bold.ttf', 'NotoSansTC', 'bold');
    
    console.log('Fonts registered successfully');

    // 設置字體
    doc.setFont('NotoSansTC', 'normal');

    // 頁面設置
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const maxWidth = pageWidth - 2 * margin;
    let yPosition = margin;

    // 標題
    doc.setFontSize(18);
    doc.setFont('NotoSansTC', 'bold');
    const titleLines = doc.splitTextToSize(chatTitle, maxWidth);
    titleLines.forEach((line: string) => {
      if (yPosition > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
      }
      doc.text(line, margin, yPosition);
      yPosition += 8;
    });

    yPosition += 5;

    // 添加時間戳
    doc.setFontSize(10);
    doc.setFont('NotoSansTC', 'normal');
    doc.setTextColor(128, 128, 128);
    const dateStr = new Date().toLocaleString();
    doc.text(`Exported: ${dateStr}`, margin, yPosition);
    yPosition += 10;

    // 過濾出用戶和助手消息
    const chatTurns = messages.filter(
      (msg: any) => msg.role === 'user' || msg.role === 'assistant',
    );

    console.log(`Exporting ${chatTurns.length} messages...`);

    // 遍歷消息
    for (let i = 0; i < chatTurns.length; i++) {
      const message = chatTurns[i];

      // 檢查是否需要新頁面
      if (yPosition > pageHeight - 40) {
        doc.addPage();
        yPosition = margin;
        // 在新頁面上也要設置字體
        doc.setFont('NotoSansTC', 'normal');
      }

      // 角色標籤
      doc.setFontSize(12);
      doc.setFont('NotoSansTC', 'bold');

      if (message.role === 'user') {
        doc.setTextColor(37, 99, 235); // 藍色
        doc.text('Question:', margin, yPosition);
      } else {
        doc.setTextColor(16, 185, 129); // 綠色
        doc.text('Answer:', margin, yPosition);
      }
      yPosition += 7;

      // 消息內容
      doc.setFontSize(10);
      doc.setFont('NotoSansTC', 'normal');
      doc.setTextColor(0, 0, 0);

      const cleanedContent = cleanMarkdown(message.content);
      const contentLines = doc.splitTextToSize(cleanedContent, maxWidth);

      contentLines.forEach((line: string) => {
        if (yPosition > pageHeight - margin - 5) {
          doc.addPage();
          yPosition = margin;
          // 在新頁面上也要設置字體
          doc.setFont('NotoSansTC', 'normal');
          doc.setTextColor(0, 0, 0);
        }
        doc.text(line, margin, yPosition);
        yPosition += 5;
      });

      yPosition += 5;

      // 添加來源（如果是助手消息）
      if (message.role === 'assistant') {
        const sourceMessage = messages.find(
          (m: any, j: number) =>
            j > messages.indexOf(message) &&
            m.role === 'source' &&
            (messages[j + 1]?.role === 'user' || j === messages.length - 1),
        );

        if (sourceMessage && sourceMessage.sources?.length > 0) {
          doc.setFontSize(9);
          doc.setTextColor(100, 100, 100);
          doc.setFont('NotoSansTC', 'bold');
          doc.text('Sources:', margin, yPosition);
          yPosition += 5;

          doc.setFont('NotoSansTC', 'normal');
          sourceMessage.sources.forEach((source: any, idx: number) => {
            if (yPosition > pageHeight - margin - 5) {
              doc.addPage();
              yPosition = margin;
              // 在新頁面上也要設置字體
              doc.setFont('NotoSansTC', 'normal');
              doc.setTextColor(100, 100, 100);
            }
            const sourceText = `[${idx + 1}] ${source.metadata?.url || 'N/A'}`;
            const sourceLines = doc.splitTextToSize(sourceText, maxWidth - 5);
            sourceLines.forEach((line: string) => {
              doc.text(line, margin + 2, yPosition);
              yPosition += 4;
            });
          });
          yPosition += 3;
        }
      }

      // 分隔線
      if (i < chatTurns.length - 1) {
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 8;
      }
    }

    // 頁碼
    const totalPages = (doc as any).internal.getNumberOfPages();
    doc.setFont('NotoSansTC', 'normal');
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Page ${i} of ${totalPages}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' },
      );
    }

    // 下載文件
    const safeTitle = chatTitle
      .replace(/[^a-zA-Z0-9\u4e00-\u9fa5\s]/g, '_')
      .substring(0, 50)
      .trim();
    const fileName = `${safeTitle}_${Date.now()}.pdf`;
    
    console.log(`Saving PDF as: ${fileName}`);
    doc.save(fileName);

    console.log('PDF export completed successfully');
    return true;
  } catch (error) {
    console.error('Error exporting PDF:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Stack:', error.stack);
    }
    throw error;
  }
};

/**
 * 預加載字體（在應用啟動時調用）
 */
export const preloadPDFFonts = () => {
  if (typeof window !== 'undefined' && !fontLoaded) {
    loadPDFFonts().catch((err) => {
      console.warn('Failed to preload PDF fonts. Fonts will be loaded on first export.', err);
    });
  }
};
