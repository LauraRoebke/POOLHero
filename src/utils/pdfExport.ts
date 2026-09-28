import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';

export interface PdfExportOptions {
  filename?: string;
  marginMm?: number;
}

export async function exportElementToPdf(
  element: HTMLElement,
  options: PdfExportOptions = {}
): Promise<void> {
  const filename = options.filename || `PoolHero_Wasseranalyse_${new Date().toISOString().slice(0, 10)}.pdf`;
  const margin = options.marginMm ?? 8;

  // Render element to canvas using html2canvas-pro (full support for oklch, modern colors and Tailwind v4)
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    windowWidth: element.scrollWidth || 1200,
  });

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  const printWidth = pdfWidth - margin * 2;
  const printHeight = (canvas.height * printWidth) / canvas.width;

  const imgData = canvas.toDataURL('image/jpeg', 0.95);

  let heightLeft = printHeight;
  let position = margin;
  let pageNumber = 1;

  // First page
  pdf.addImage(imgData, 'JPEG', margin, position, printWidth, printHeight);
  heightLeft -= (pdfHeight - margin * 2);

  // Subsequent pages if content overflows A4
  while (heightLeft > 0) {
    position = margin - (pageNumber * (pdfHeight - margin * 2));
    pdf.addPage();
    pageNumber++;
    pdf.addImage(imgData, 'JPEG', margin, position, printWidth, printHeight);
    heightLeft -= (pdfHeight - margin * 2);
  }

  pdf.save(filename);
}

// Polyfill / provide window.html2pdf for seamless library compatibility
if (typeof window !== 'undefined') {
  (window as unknown as { html2pdf: any }).html2pdf = () => {
    let targetEl: HTMLElement | null = null;
    let customFilename = `PoolHero_Wasseranalyse_${new Date().toISOString().slice(0, 10)}.pdf`;

    const chain = {
      set: (opts: { filename?: string } = {}) => {
        if (opts?.filename) customFilename = opts.filename;
        return chain;
      },
      from: (el: HTMLElement) => {
        targetEl = el;
        return chain;
      },
      save: async (name?: string) => {
        if (targetEl) {
          await exportElementToPdf(targetEl, { filename: name || customFilename });
        }
      },
      output: () => Promise.resolve(),
    };
    return chain;
  };
}
