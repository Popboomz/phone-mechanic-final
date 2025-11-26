
"use client";

import { useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Button } from "@/components/ui/button";
import { Printer, Share2, Loader2 } from "lucide-react";
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
                scale: 2, // Higher scale for better quality
                useCORS: true,
                backgroundColor: '#ffffff', // Force a white background for consistency
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
            
            if (navigator.share && navigator.canShare({ files: [pdfFile] })) {
                await navigator.share({
                    title: `Invoice for ${customer.customerName}`,
                    text: `Here is the invoice for ${customer.phoneModel}.`,
                    files: [pdfFile],
                });
            } else {
                toast({
                    variant: "destructive",
                    title: "Feature Not Supported",
                    description: "Your browser does not support sharing files. You can print the invoice instead.",
                });
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

  return (
    <div className="flex items-center gap-2">
      <Button onClick={handleShare} className="bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isSharing}>
        {isSharing ? (
            <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Preparing...
            </>
        ) : (
            <>
                <Share2 className="mr-2 h-4 w-4" />
                Share
            </>
        )}
      </Button>
    </div>
  );
}
