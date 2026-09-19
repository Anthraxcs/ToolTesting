import * as XLSX from 'xlsx';
import type { ReceiptItem } from '../types/receipt';

export const exportReceiptsToExcel = (receipts: ReceiptItem[], filenamePrefix: string = 'Company_Receipt_Register'): void => {
  // 1. Prepare Sheet 1: Detailed Logs
  const detailedData = receipts.map((r, index) => ({
    'No.': index + 1,
    'Receipt ID': r.id,
    'Status': r.status.toUpperCase(),
    'Vendor / Merchant': r.vendorName,
    'Receipt Date': r.receiptDate,
    'Category': r.category,
    'Total Amount ($)': r.totalAmount.toFixed(2),
    'Tax Amount ($)': r.taxAmount.toFixed(2),
    'Currency': r.currency,
    'Employee Name': r.uploaderName,
    'Upload Date': new Date(r.uploadDate).toLocaleString(),
    'Notes / Description': r.notes || '-',
    'Image Status': r.imageUrl ? 'Active Attachment' : 'Wiped / Purged',
    'Verified By': r.verifiedBy || '-'
  }));

  // 2. Prepare Sheet 2: Category & Status Summary
  const categoryTotals: Record<string, { count: number; totalSpent: number }> = {};
  receipts.forEach(r => {
    if (!categoryTotals[r.category]) {
      categoryTotals[r.category] = { count: 0, totalSpent: 0 };
    }
    categoryTotals[r.category].count += 1;
    categoryTotals[r.category].totalSpent += r.totalAmount;
  });

  const summaryData = Object.entries(categoryTotals).map(([cat, val]) => ({
    'Category': cat,
    'Total Receipts': val.count,
    'Total Spending ($)': val.totalSpent.toFixed(2),
    'Average Per Receipt ($)': (val.totalSpent / (val.count || 1)).toFixed(2)
  }));

  // Add Grand Total row to summary
  const grandTotal = receipts.reduce((acc, curr) => acc + curr.totalAmount, 0);
  summaryData.push({
    'Category': 'GRAND TOTAL',
    'Total Receipts': receipts.length,
    'Total Spending ($)': grandTotal.toFixed(2),
    'Average Per Receipt ($)': (grandTotal / (receipts.length || 1)).toFixed(2)
  });

  // Create Workbook
  const workbook = XLSX.utils.book_new();

  const worksheetDetailed = XLSX.utils.json_to_sheet(detailedData);
  const worksheetSummary = XLSX.utils.json_to_sheet(summaryData);

  // Set column widths for readability
  worksheetDetailed['!cols'] = [
    { wch: 5 },  // No
    { wch: 12 }, // ID
    { wch: 10 }, // Status
    { wch: 22 }, // Vendor
    { wch: 14 }, // Receipt Date
    { wch: 22 }, // Category
    { wch: 16 }, // Total Amount
    { wch: 14 }, // Tax
    { wch: 10 }, // Currency
    { wch: 18 }, // Employee
    { wch: 20 }, // Upload Date
    { wch: 30 }, // Notes
    { wch: 18 }, // Image Status
    { wch: 18 }  // Verified By
  ];

  worksheetSummary['!cols'] = [
    { wch: 26 },
    { wch: 16 },
    { wch: 20 },
    { wch: 22 }
  ];

  // Append sheets
  XLSX.utils.book_append_sheet(workbook, worksheetDetailed, 'Receipt Register');
  XLSX.utils.book_append_sheet(workbook, worksheetSummary, 'Category Breakdown');

  // Trigger file download
  const dateStr = new Date().toISOString().split('T')[0];
  const fullFilename = `${filenamePrefix}_${dateStr}.xlsx`;
  
  XLSX.writeFile(workbook, fullFilename);
};
