import { Clock, Edit, Share, Trash, FileText, FileDown } from 'lucide-react';
import { Message } from './ChatWindow';
import { useEffect, useState, Fragment } from 'react';
import { formatTimeDifference } from '@/lib/utils';
import DeleteChat from './DeleteChat';
import {
  Popover,
  PopoverButton,
  PopoverPanel,
  Transition,
} from '@headlessui/react';
import { jsPDF } from 'jspdf';
import { useChat, Section } from '@/lib/hooks/useChat';
import { SourceBlock } from '@/lib/types';
import { toast } from 'sonner';

const downloadFile = (filename: string, content: string, type: string) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 0);
};

const exportAsMarkdown = (sections: Section[], title: string) => {
  const date = new Date(
    sections[0].message.createdAt || Date.now(),
  ).toLocaleString();
  let md = `# 💬 Chat Export: ${title}\n\n`;
  md += `*Exported on: ${date}*\n\n---\n`;

  sections.forEach((section, idx) => {
    md += `\n---\n`;
    md += `**🧑 User**  \n`;
    md += `*${new Date(section.message.createdAt).toLocaleString()}*\n\n`;
    md += `> ${section.message.query.replace(/\n/g, '\n> ')}\n`;

    if (section.message.responseBlocks.length > 0) {
      md += `\n---\n`;
      md += `**🤖 Assistant**  \n`;
      md += `*${new Date(section.message.createdAt).toLocaleString()}*\n\n`;

      const assistantText = section.parsedTextBlocks
        ? section.parsedTextBlocks.join('\n')
        : section.message.responseBlocks
          .filter((b) => b.type === 'text')
          .map((block) => block.data)
          .join('\n');

      md += `> ${assistantText.replace(/\n/g, '\n> ')}\n`;
    }

    const sourceResponseBlock = section.message.responseBlocks.find(
      (block) => block.type === 'source',
    ) as SourceBlock | undefined;

    if (
      sourceResponseBlock &&
      sourceResponseBlock.data &&
      sourceResponseBlock.data.length > 0
    ) {
      md += `\n**Citations:**\n`;
      sourceResponseBlock.data.forEach((src: any, i: number) => {
        const url = src.metadata?.url || '';
        md += `- [${i + 1}] [${url}](${url})\n`;
      });
    }
  });
  md += '\n---\n';
  downloadFile(`${title || 'chat'}.md`, md, 'text/markdown');
};

/**
 * 將 Blob 轉換為 base64
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
 * 檢測單一字元使用哪種語言字體（逐字判斷）
 */
const detectLanguageChar = (ch: string): 'TC' | 'SC' | 'JP' | 'KR' | 'EN' => {
  if (!ch) return 'EN';
  const code = ch.codePointAt(0) || 0;

  // Hangul (韓文) 範圍
  if (code >= 0xac00 && code <= 0xd7af) return 'KR';
  // Hiragana 和 Katakana (日文)
  if ((code >= 0x3040 && code <= 0x309f) || (code >= 0x30a0 && code <= 0x30ff)) return 'JP';
  // CJK Unified Ideographs (基本漢字範圍)
  if (code >= 0x4e00 && code <= 0x9fff) {
    // 我們無法從單一字元可靠分辨繁/簡體，預設使用 'TC'（可配合字型選擇）
    return 'TC';
  }
  // 全形標點/延伸漢字範圍，也視為 CJK
  if ((code >= 0x3400 && code <= 0x4dbf) || (code >= 0x20000 && code <= 0x2a6df)) return 'TC';

  return 'EN';
};

/**
 * 導出為 PDF（支持繁體中文、簡體中文、日文、韓文）
 * 使用逐字級別的字型選擇與 fallback
 */
const exportAsPDF = async (sections: Section[], title: string) => {
  const toastId = toast.loading('Generating PDF with CJK support...');

  try {
    console.log('Starting PDF export with multi-language CJK fonts...');

    // 定義所有需要的字體
    const fontConfigs = [
      { name: 'SourceHanSans', regular: '/fonts/SourceHanSans-Regular.ttf', bold: '/fonts/SourceHanSans-Bold.ttf', lang: 'CJK', code: 'TC' as const }
    ];

    console.log('Checking available fonts...');
    const availableFonts: typeof fontConfigs = [];

    // 檢查並載入所有可用字體
    for (const config of fontConfigs) {
      try {
        const regularResponse = await fetch(config.regular);
        const boldResponse = await fetch(config.bold);

        if (regularResponse.ok && boldResponse.ok) {
          availableFonts.push(config);
          console.log(`✓ ${config.name} (${config.lang}) found`);
        } else {
          console.log(`✗ ${config.name} (${config.lang}) not found`);
        }
      } catch (e) {
        console.log(`✗ ${config.name} (${config.lang}) failed to load`);
      }
    }

    if (availableFonts.length === 0) {
      throw new Error('No CJK fonts found. Please ensure fonts are installed in public/fonts/');
    }

    console.log(`Found ${availableFonts.length} font(s):`, availableFonts.map(f => f.lang).join(', '));

    // 創建 PDF
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    console.log('Loading and registering fonts...');

    // 載入並註冊所有可用字體
    for (const config of availableFonts) {
      const regularResponse = await fetch(config.regular);
      const boldResponse = await fetch(config.bold);

      const regularBlob = await regularResponse.blob();
      const boldBlob = await boldResponse.blob();

      const regularBase64 = await blobToBase64(regularBlob);
      const boldBase64 = await blobToBase64(boldBlob);

      const regularFileName = config.regular.split('/').pop()!;
      const boldFileName = config.bold.split('/').pop()!;

      doc.addFileToVFS(regularFileName, regularBase64);
      doc.addFileToVFS(boldFileName, boldBase64);

      doc.addFont(regularFileName, config.name, 'normal');
      doc.addFont(boldFileName, config.name, 'bold');

      console.log(`Registered: ${config.name} (${config.lang})`);
    }

    // 創建字體映射
    const fontMap = new Map<'TC' | 'SC' | 'JP' | 'KR' | 'EN', string>(availableFonts.map(f => [f.code, f.name]));

    // fallback order when glyph missing or unknown
    const fallbackOrder: Array<'TC' | 'SC' | 'JP' | 'KR' | 'EN'> = ['TC', 'SC', 'JP', 'KR', 'EN'];

    // 智能選擇字體的輔助函數(給定語種代碼)
    const pickFontForCode = (code: 'TC' | 'SC' | 'JP' | 'KR' | 'EN'): string => {
      const font = fontMap.get(code);
      if (font) return font;
      for (const c of fallbackOrder) {
        const f = fontMap.get(c);
        if (f) return f;
      }
      return availableFonts[0].name;
    };

    // set font by language code + weight
    const setFontByCode = (code: 'TC' | 'SC' | 'JP' | 'KR' | 'EN', weight: 'normal' | 'bold' = 'normal') => {
      const name = pickFontForCode(code);
      doc.setFont(name, weight);
      return name;
    };

    // 設置默認字體為第一個可用字體
    const primaryFont = availableFonts[0].name;
    doc.setFont(primaryFont, 'normal');
    console.log(`Primary font set to: ${primaryFont}`);

    const date = new Date(
      sections[0]?.message?.createdAt || Date.now(),
    ).toLocaleString();

    let y = 15;
    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 10;
    const maxWidth = pageWidth - 2 * margin;

    // 標題
    doc.setFontSize(18);
    // 對標題使用逐字策略也適用，但通常標題是英文或單一語言
    setFontByCode(detectLanguageChar(title.slice(0, 1)), 'bold');
    const titleLines = doc.splitTextToSize(`Chat Export: ${title}`, maxWidth);
    titleLines.forEach((line: string) => {
      // 逐字輸出每個 line
      let x = margin;
      const groups: Array<{ text: string; code: 'TC' | 'SC' | 'JP' | 'KR' | 'EN' }> = [];
      for (const ch of line) {
        const code = detectLanguageChar(ch);
        if (groups.length === 0 || groups[groups.length - 1].code !== code) {
          groups.push({ text: ch, code });
        } else {
          groups[groups.length - 1].text += ch;
        }
      }
      groups.forEach(g => {
        setFontByCode(g.code, 'bold');
        doc.text(g.text, x, y);
        const w = doc.getTextWidth(g.text);
        x += w;
      });
      y += 8;
    });

    // 日期
    doc.setFontSize(11);
    doc.setFont(primaryFont, 'normal');
    doc.setTextColor(100);
    doc.text(`Exported on: ${date}`, margin, y);
    y += 8;

    // 分隔線
    doc.setDrawColor(200);
    doc.line(margin, y, pageWidth - margin, y);
    y += 6;
    doc.setTextColor(30);

    console.log(`Exporting ${sections.length} sections...`);

    // Helper to print multi-language text
    const printMultiLangText = (text: string, xStart: number, yStart: number) => {
      const lines = doc.splitTextToSize(text, maxWidth - 2);
      let y = yStart;

      for (let i = 0; i < lines.length; i++) {
        if (y > pageHeight - 20) {
          doc.addPage();
          y = 15;
          doc.setFont(primaryFont, 'normal');
        }

        const line = lines[i];
        let x = xStart;
        const groups: Array<{ text: string; code: 'TC' | 'SC' | 'JP' | 'KR' | 'EN' }> = [];
        for (const ch of line) {
          const code = detectLanguageChar(ch);
          if (groups.length === 0 || groups[groups.length - 1].code !== code) {
            groups.push({ text: ch, code });
          } else {
            groups[groups.length - 1].text += ch;
          }
        }

        for (const g of groups) {
          setFontByCode(g.code, 'normal');
          doc.text(g.text, x, y);
          const w = doc.getTextWidth(g.text);
          x += w;
        }

        y += 5;
      }
      return y;
    };

    sections.forEach((section, idx) => {
      // 用戶消息
      if (y > pageHeight - 30) {
        doc.addPage();
        y = 15;
        doc.setFont(primaryFont, 'normal');
      }

      doc.setFont(primaryFont, 'bold');
      doc.setFontSize(12);
      doc.setTextColor(37, 99, 235); // 藍色
      doc.text('User', margin, y);

      doc.setFont(primaryFont, 'normal');
      doc.setFontSize(10);
      doc.setTextColor(120);
      doc.text(
        `${new Date(section.message.createdAt).toLocaleString()}`,
        margin + 20,
        y,
      );
      y += 6;

      doc.setTextColor(30);
      doc.setFontSize(11);

      // Use section.message.query
      const cleanedUser = cleanMarkdown(section.message.query);
      y = printMultiLangText(cleanedUser, margin + 2, y);

      y += 4;
      doc.setDrawColor(230);
      if (y > pageHeight - 10) {
        doc.addPage();
        y = 15;
      }
      doc.line(margin, y, pageWidth - margin, y);
      y += 4;

      // 助手消息
      if (section.message.responseBlocks.length > 0) {
        if (y > pageHeight - 30) {
          doc.addPage();
          y = 15;
          doc.setFont(primaryFont, 'normal');
        }

        doc.setFont(primaryFont, 'bold');
        doc.setFontSize(12);
        doc.setTextColor(16, 185, 129); // 綠色
        doc.text('Assistant', margin, y);

        doc.setFont(primaryFont, 'normal');
        doc.setFontSize(10);
        doc.setTextColor(120);
        doc.text(
          `${new Date(section.message.createdAt).toLocaleString()}`,
          margin + 30,
          y,
        );
        y += 6;

        doc.setTextColor(30);
        doc.setFontSize(11);

        // Use parsedTextBlocks or construct from responseBlocks
        const assistantText = section.parsedTextBlocks
          ? section.parsedTextBlocks.join('\n')
          : section.message.responseBlocks
            .filter((b) => b.type === 'text')
            .map((block) => block.data)
            .join('\n');

        const cleanedAssistant = cleanMarkdown(assistantText);
        y = printMultiLangText(cleanedAssistant, margin + 2, y);

        // 引用來源
        const sourceResponseBlock = section.message.responseBlocks.find(
          (block) => block.type === 'source',
        ) as SourceBlock | undefined;

        if (
          sourceResponseBlock &&
          sourceResponseBlock.data &&
          sourceResponseBlock.data.length > 0
        ) {
          y += 3;
          doc.setFontSize(10);
          doc.setTextColor(80);
          doc.setFont(primaryFont, 'bold');

          if (y > pageHeight - 20) {
            doc.addPage();
            y = 15;
          }
          doc.text('Citations:', margin + 2, y);
          y += 5;

          doc.setFont(primaryFont, 'normal');
          sourceResponseBlock.data.forEach((src: any, i: number) => {
            const url = src.metadata?.url || '';
            if (y > pageHeight - 15) {
              doc.addPage();
              y = 15;
              doc.setFont(primaryFont, 'normal');
            }
            const citationLines = doc.splitTextToSize(`[${i + 1}] ${url}`, maxWidth - 7);
            citationLines.forEach((line: string) => {
              doc.text(line, margin + 5, y);
              y += 4;
            });
          });
          doc.setTextColor(30);
        }

        y += 4;
        doc.setDrawColor(230);
        if (y > pageHeight - 10) {
          doc.addPage();
          y = 15;
        }
        doc.line(margin, y, pageWidth - margin, y);
        y += 4;
      }
    });

    // 頁碼
    const totalPages = (doc as any).internal.getNumberOfPages();
    doc.setFont(primaryFont, 'normal');
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.setTextColor(150);
      doc.text(
        `Page ${i} of ${totalPages}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' },
      );
    }

    const fileName = `${title || 'chat'}.pdf`;
    console.log(`Saving as: ${fileName}`);
    doc.save(fileName);

    const langs = availableFonts.map(f => f.lang).join('/');
    toast.success(`PDF exported! Supports: ${langs}`, { id: toastId });
    console.log('PDF export completed');
  } catch (error) {
    console.error('PDF export error:', error);

    let errorMsg = 'Failed to export PDF. ';
    if (error instanceof Error) {
      if (error.message.includes('Font files not found')) {
        errorMsg += 'Font files missing. Please check README-CJK.md';
      } else {
        errorMsg += error.message;
      }
    }

    toast.error(errorMsg, { id: toastId, duration: 5000 });
  }
};

const Navbar = () => {
  const [title, setTitle] = useState<string>('');
  const [timeAgo, setTimeAgo] = useState<string>('');

  const { sections, chatId } = useChat();

  useEffect(() => {
    if (sections.length > 0 && sections[0].message) {
      const newTitle =
        sections[0].message.query.length > 30
          ? `${sections[0].message.query.substring(0, 30).trim()}...`
          : sections[0].message.query || 'New Conversation';

      setTitle(newTitle);
      const newTimeAgo = formatTimeDifference(
        new Date(),
        sections[0].message.createdAt,
      );
      setTimeAgo(newTimeAgo);
    }
  }, [sections]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (sections.length > 0 && sections[0].message) {
        const newTimeAgo = formatTimeDifference(
          new Date(),
          sections[0].message.createdAt,
        );
        setTimeAgo(newTimeAgo);
      }
    }, 1000);

    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="sticky -mx-4 lg:mx-0 top-0 z-40 bg-light-primary/95 dark:bg-dark-primary/95 backdrop-blur-sm border-b border-light-200/50 dark:border-dark-200/30">
      <div className="px-4 lg:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center min-w-0">
            <a
              href="/"
              className="lg:hidden mr-3 p-2 -ml-2 rounded-lg hover:bg-light-secondary dark:hover:bg-dark-secondary transition-colors duration-200"
            >
              <Edit size={18} className="text-black/70 dark:text-white/70" />
            </a>
            <div className="hidden lg:flex items-center gap-2 text-black/50 dark:text-white/50 min-w-0">
              <Clock size={14} />
              <span className="text-xs whitespace-nowrap">{timeAgo} ago</span>
            </div>
          </div>

          <div className="flex-1 mx-4 min-w-0">
            <h1 className="text-center text-sm font-medium text-black/80 dark:text-white/90 truncate">
              {title || 'New Conversation'}
            </h1>
          </div>

          <div className="flex items-center gap-1 min-w-0">
            <Popover className="relative">
              <PopoverButton className="p-2 rounded-lg hover:bg-light-secondary dark:hover:bg-dark-secondary transition-colors duration-200">
                <Share size={16} className="text-black/60 dark:text-white/60" />
              </PopoverButton>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-200"
                enterFrom="opacity-0 translate-y-1"
                enterTo="opacity-100 translate-y-0"
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100 translate-y-0"
                leaveTo="opacity-0 translate-y-1"
              >
                <PopoverPanel className="absolute right-0 mt-2 w-64 origin-top-right rounded-2xl bg-light-primary dark:bg-dark-primary border border-light-200 dark:border-dark-200 shadow-xl shadow-black/10 dark:shadow-black/30 z-50">
                  <div className="p-3">
                    <div className="mb-2">
                      <p className="text-xs font-medium text-black/40 dark:text-white/40 uppercase tracking-wide">
                        Export Chat
                      </p>
                    </div>
                    <div className="space-y-1">
                      <button
                        className="w-full flex items-center gap-3 px-3 py-2 text-left rounded-xl hover:bg-light-secondary dark:hover:bg-dark-secondary transition-colors duration-200"
                        onClick={() => exportAsMarkdown(sections, title || '')}
                      >
                        <FileText size={16} className="text-[#24A0ED]" />
                        <div>
                          <p className="text-sm font-medium text-black dark:text-white">
                            Markdown
                          </p>
                          <p className="text-xs text-black/50 dark:text-white/50">
                            .md format
                          </p>
                        </div>
                      </button>
                      <button
                        className="w-full flex items-center gap-3 px-3 py-2 text-left rounded-xl hover:bg-light-secondary dark:hover:bg-dark-secondary transition-colors duration-200"
                        onClick={() => exportAsPDF(sections, title || '')}
                      >
                        <FileDown size={16} className="text-[#24A0ED]" />
                        <div>
                          <p className="text-sm font-medium text-black dark:text-white">
                            PDF
                          </p>
                          <p className="text-xs text-black/50 dark:text-white/50">
                            Full CJK support 🌏
                          </p>
                        </div>
                      </button>
                    </div>
                  </div>
                </PopoverPanel>
              </Transition>
            </Popover>
            <DeleteChat
              redirect
              chatId={chatId!}
              chats={[]}
              setChats={() => { }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
