'use client';

import { useEffect } from 'react';
import { preloadPDFFonts } from '@/lib/utils/pdfExport';

export default function PDFFontPreloader() {
  useEffect(() => {
    // 預加載 PDF 字體
    preloadPDFFonts();
  }, []);

  return null;
}
