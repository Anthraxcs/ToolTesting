# ReceiptVault AI - Expense Management & Image-to-Excel Data Extraction

A modern web application built with **React, TypeScript, Vite, and Vanilla CSS** designed for company members to upload receipt images, extract data automatically using OCR (Image-to-Text), transfer and review records, export formatted Microsoft Excel (`.xlsx`) files, and enforce a 30-day monthly database image purge.

---

## 🌟 Key Features

1. **Member Upload Hub**:
   - Upload receipt images (JPG, PNG, WebP, SVG).
   - Drag-and-drop interface with built-in sample receipt presets for quick testing.

2. **Smart OCR Data Extraction**:
   - Automatically scans receipt text to extract **Vendor Name**, **Receipt Date**, **Tax Amount**, **Total Amount**, and **Category**.
   - Eliminates repetitive manual data entry.

3. **Admin Verification & Transfer Studio**:
   - Side-by-side inspection viewer with image zoom and pan controls.
   - Re-scan OCR capability and 1-click **Approve & Verify** workflow.

4. **Microsoft Excel Exporter (`.xlsx`)**:
   - Exports formatted Excel workbooks containing:
     - **Sheet 1 (Detailed Log)**: Full receipt audit log with IDs, dates, vendors, tax, amounts, employees, and verification status.
     - **Sheet 2 (Category Breakdown)**: Spending breakdown by category, average spend per item, and grand total.

5. **Monthly Database Purge & Retention Policy**:
   - Automated 30-day retention engine that wipes heavy image blobs and raw OCR text past 30 days to keep database storage light.
   - Financial metadata is retained 100% permanently for accounting audits.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```

Open [http://localhost:5173/](http://localhost:5173/) in your browser.

### 3. Build for Production
```bash
npm run build
```

---

## 🛠 Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Modern Vanilla CSS with dark glassmorphic design system
- **OCR Engine**: Tesseract.js (Client-side Image Recognition)
- **Spreadsheet Generation**: `xlsx` (SheetJS)
- **Icons & FX**: Lucide React, Canvas Confetti
