import { jsPDF } from "jspdf";
import "jspdf-autotable";
import fs from "fs";
import path from "path";

export class InvoiceService {
  static async generateInvoicePdf(transaction: any, store: any) {
    const doc = new jsPDF() as any;

    // Header Area
    doc.setFillColor(30, 64, 175); // Indigo-700
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("BusinessConnect.bd", 15, 25);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Electronic Payment Receipt", 15, 32);
    
    // Invoice Info
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(18);
    doc.text("INVOICE", 15, 60);
    
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(`Invoice ID: ${transaction.id.toUpperCase()}`, 15, 68);
    doc.text(`Trx ID: ${transaction.trxId || 'N/A'}`, 15, 73);
    doc.text(`Date: ${new Date(transaction.createdAt).toLocaleString()}`, 15, 78);

    // Bill To
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.text("BILL TO:", 140, 60);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(store.name || "Merchant Store", 140, 68);
    doc.text(store.ownerName || "Merchant Owner", 140, 73);
    doc.text(store.phone || "No Phone", 140, 78);

    // Table
    const tableData = [
      [
        transaction.type.replace('_', ' '),
        `৳${transaction.amount.toLocaleString()}`,
        transaction.credits > 0 ? `${transaction.credits} Units` : 'N/A',
        `৳${transaction.amount.toLocaleString()}`
      ]
    ];

    doc.autoTable({
      startY: 95,
      head: [['Description', 'Unit Price', 'Quantity', 'Total']],
      body: tableData,
      headStyles: { fillColor: [30, 64, 175], textColor: 255, fontStyle: 'bold' },
      bodyStyles: { textColor: 50 },
      alternateRowStyles: { fillColor: [249, 250, 251] },
      margin: { left: 15, right: 15 }
    });

    // Summary
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Total Amount Paid:", 135, finalY + 10);
    doc.setFontSize(14);
    doc.setTextColor(30, 64, 175);
    doc.text(`BDT ${transaction.amount.toLocaleString()}`, 170, finalY + 10);

    // Footer
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(8);
    doc.text("This is a computer generated invoice. No signature is required.", 105, 280, { align: "center" });
    doc.text("Powered by BusinessConnect.bd - The Ultimate Business OS", 105, 285, { align: "center" });

    // Save File
    const dir = path.join(process.cwd(), "public", "invoices");
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const fileName = `invoice-${transaction.id}.pdf`;
    const filePath = path.join(dir, fileName);
    const pdfOutput = doc.output('arraybuffer');
    
    fs.writeFileSync(filePath, Buffer.from(pdfOutput));

    return `/invoices/${fileName}`;
  }
}
