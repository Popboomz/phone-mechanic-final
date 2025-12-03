
"use client";

import { useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Button } from "@/components/ui/button";
import { Printer, Share2, Loader2, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Customer } from "@/lib/types";

export function InvoiceActions({ customer }: { customer: Customer }) {
    const { toast } = useToast();
    const [isSharing, setIsSharing] = useState(false);

    const handleShare = async () => {
        setIsSharing(true);
        const invoiceElement = document.getElementById('printable-area');
        if (!invoiceElement) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Could not find the invoice content to share.",
            });
            setIsSharing(false);
            return;
        }

        try {
            const canvas = await html2canvas(invoiceElement, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff',
            });
            
            const imgData = canvas.toDataURL('image/png');
            
            // A4 size in points (width, height)
            const pdf = new jsPDF({
                orientation: 'p',
                unit: 'px',
                format: 'a4',
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;
            const canvasAspectRatio = canvasWidth / canvasHeight;
            const pdfAspectRatio = pdfWidth / pdfHeight;

            let finalWidth, finalHeight;

            if (canvasAspectRatio > pdfAspectRatio) {
                finalWidth = pdfWidth;
                finalHeight = pdfWidth / canvasAspectRatio;
            } else {
                finalHeight = pdfHeight;
                finalWidth = pdfHeight * canvasAspectRatio;
            }
            
            const x = (pdfWidth - finalWidth) / 2;
            const y = (pdfHeight - finalHeight) / 2;

            pdf.addImage(imgData, 'PNG', x, y, finalWidth, finalHeight);
            const pdfBlob = pdf.output('blob');
            const pdfFile = new File([pdfBlob], `Invoice-${customer.customerName}.pdf`, { type: 'application/pdf' });
            if (navigator.share && navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
                await navigator.share({
                    title: `Invoice for ${customer.customerName}`,
                    text: `Here is the invoice for ${customer.phoneModel}.`,
                    files: [pdfFile],
                });
            } else {
                pdf.save(`Invoice-${customer.customerName}.pdf`);
                toast({ title: '已下载', description: '浏览器不支持分享，已自动下载 PDF。' });
            }
        } catch (error) {
            console.error("Error generating or sharing PDF: ", error);
            toast({
                variant: "destructive",
                title: "Share Failed",
                description: "An error occurred while trying to generate or share the invoice PDF.",
            });
        } finally {
            setIsSharing(false);
        }
    };

    const handleDownload = async () => {
        const invoiceElement = document.getElementById('printable-area');
        if (!invoiceElement) return;
        const canvas = await html2canvas(invoiceElement, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({ orientation: 'p', unit: 'px', format: 'a4' });
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const ar = canvas.width / canvas.height;
        let w, h;
        if (ar > pdfWidth / pdfHeight) { w = pdfWidth; h = pdfWidth / ar; } else { h = pdfHeight; w = pdfHeight * ar; }
        const x = (pdfWidth - w) / 2;
        const y = (pdfHeight - h) / 2;
        pdf.addImage(imgData, 'PNG', x, y, w, h);
        pdf.save(`Invoice-${customer.customerName}.pdf`);
    };

    const handlePrint = () => {
        window.print();
    };

  return (
    <div className="flex items-center gap-1">
      <Button
        onClick={handleDownload}
        size="sm"
        className="bg-accent hover:bg-accent/90 text-accent-foreground h-9 px-2 text-xs sm:h-10 sm:px-4 sm:text-sm"
      >
        <Download className="mr-1 h-3 w-3 sm:h-4 sm:w-4" /> Download
      </Button>
      <Button
        onClick={handlePrint}
        size="sm"
        className="bg-accent hover:bg-accent/90 text-accent-foreground h-9 px-2 text-xs sm:h-10 sm:px-4 sm:text-sm"
      >
        <Printer className="mr-1 h-3 w-3 sm:h-4 sm:w-4" /> Print
      </Button>
      <Button
        onClick={handleShare}
        size="sm"
        className="bg-accent hover:bg-accent/90 text-accent-foreground h-9 px-2 text-xs sm:h-10 sm:px-4 sm:text-sm"
        disabled={isSharing}
      >
        {isSharing ? (
            <>
                <Loader2 className="mr-1 h-3 w-3 animate-spin sm:h-4 sm:w-4" />
                Preparing...
            </>
        ) : (
            <>
                <Share2 className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                Share
            </>
        )}
      </Button>
    </div>
  );
}
