import React, { useState } from 'react';
import { X, CheckCircle, RefreshCw, ZoomIn, ZoomOut, UserCheck, Trash2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { CategoryType, ReceiptItem } from '../types/receipt';
import { scanReceiptImage } from '../services/ocrService';

interface ReviewStudioModalProps {
  receipt: ReceiptItem | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateReceipt: (receipt: ReceiptItem) => void;
  onDeleteReceipt: (id: string) => void;
  adminName: string;
}

const CATEGORIES: CategoryType[] = [
  'Meals & Dining',
  'Travel & Lodging',
  'Office Supplies',
  'Software & Tech',
  'Utilities & Services',
  'Transportation',
  'Other'
];

export const ReviewStudioModal: React.FC<ReviewStudioModalProps> = ({
  receipt,
  isOpen,
  onClose,
  onUpdateReceipt,
  onDeleteReceipt,
  adminName
}) => {
  if (!isOpen || !receipt) return null;

  const [vendorName, setVendorName] = useState(receipt.vendorName);
  const [totalAmount, setTotalAmount] = useState(receipt.totalAmount);
  const [taxAmount, setTaxAmount] = useState(receipt.taxAmount);
  const [receiptDate, setReceiptDate] = useState(receipt.receiptDate);
  const [category, setCategory] = useState<CategoryType>(receipt.category);
  const [notes, setNotes] = useState(receipt.notes || '');

  const [zoomScale, setZoomScale] = useState(1);
  const [isRescanning, setIsRescanning] = useState(false);

  const handleRescanOCR = async () => {
    if (!receipt.imageUrl) return;
    setIsRescanning(true);
    try {
      const result = await scanReceiptImage(receipt.imageUrl);
      setVendorName(result.vendorName);
      setTotalAmount(result.totalAmount);
      setTaxAmount(result.taxAmount);
      setReceiptDate(result.receiptDate);
      setCategory(result.category);
    } catch (err) {
      console.error(err);
    } finally {
      setIsRescanning(false);
    }
  };

  const handleApprove = () => {
    const updated: ReceiptItem = {
      ...receipt,
      vendorName,
      totalAmount,
      taxAmount,
      receiptDate,
      category,
      notes,
      status: 'verified',
      verifiedBy: adminName || 'Admin Transfer Officer',
      verifiedAt: new Date().toISOString()
    };

    onUpdateReceipt(updated);

    // Confetti celebration
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 }
    });

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '980px' }}>
        <div className="modal-header">
          <div className="modal-title">
            <UserCheck size={20} className="text-emerald" />
            <span>Admin Data Transfer & Verification Studio</span>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="split-studio">
            {/* Left: Image Viewer & Pan controls */}
            <div>
              <div className="image-preview-panel">
                {receipt.imageUrl ? (
                  <img 
                    src={receipt.imageUrl} 
                    alt="Uploaded receipt" 
                    className="studio-img"
                    style={{ 
                      transform: `scale(${zoomScale})`, 
                      transition: 'transform 0.2s ease',
                      cursor: 'zoom-in'
                    }} 
                  />
                ) : (
                  <div className="purged-placeholder">
                    <Trash2 size={40} />
                    <p style={{ fontWeight: 600, color: '#f8fafc' }}>Image Asset Purged</p>
                    <p>Image binary was wiped during monthly DB maintenance to save disk space. Financial log data remains preserved.</p>
                  </div>
                )}
              </div>

              {receipt.imageUrl && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => setZoomScale(s => Math.min(2.5, s + 0.25))}>
                      <ZoomIn size={14} /> Zoom In
                    </button>
                    <button className="btn btn-secondary btn-sm" onClick={() => setZoomScale(s => Math.max(0.75, s - 0.25))}>
                      <ZoomOut size={14} /> Zoom Out
                    </button>
                    <button className="btn btn-secondary btn-sm" onClick={() => setZoomScale(1)}>
                      Reset
                    </button>
                  </div>

                  <button className="btn btn-secondary btn-sm" onClick={handleRescanOCR} disabled={isRescanning}>
                    <RefreshCw size={14} className={isRescanning ? 'spinner' : ''} />
                    <span>Re-scan OCR</span>
                  </button>
                </div>
              )}
            </div>

            {/* Right: Transfer Verification Form */}
            <div className="form-panel">
              <div style={{ 
                background: 'rgba(255, 255, 255, 0.03)', 
                border: '1px solid var(--border-subtle)',
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.8rem',
                display: 'flex',
                flexDirection: 'column',
                gap: 4
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Uploaded By:</span>
                  <span style={{ fontWeight: 600 }}>{receipt.uploaderName}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Upload Time:</span>
                  <span>{new Date(receipt.uploadDate).toLocaleString()}</span>
                </div>
                {receipt.verifiedBy && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981' }}>
                    <span>Verified By:</span>
                    <span>{receipt.verifiedBy}</span>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Vendor / Merchant Name</label>
                <input 
                  type="text" 
                  className="form-input"
                  value={vendorName}
                  onChange={e => setVendorName(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Total Amount ($)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    className="form-input"
                    value={totalAmount}
                    onChange={e => setTotalAmount(parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Tax Amount ($)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    className="form-input"
                    value={taxAmount}
                    onChange={e => setTaxAmount(parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Receipt Date</label>
                  <input 
                    type="date" 
                    className="form-input"
                    value={receiptDate}
                    onChange={e => setReceiptDate(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select 
                    className="form-input"
                    value={category}
                    onChange={e => setCategory(e.target.value as CategoryType)}
                  >
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Transfer Notes / Verification Log</label>
                <textarea 
                  className="form-input"
                  rows={3}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: 12 }}>
                <button 
                  type="button" 
                  className="btn btn-rose btn-sm"
                  onClick={() => {
                    if (confirm('Delete this receipt record permanently?')) {
                      onDeleteReceipt(receipt.id);
                      onClose();
                    }
                  }}
                >
                  <Trash2 size={14} /> Delete
                </button>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="button" className="btn btn-secondary" onClick={onClose}>
                    Close
                  </button>
                  <button type="button" className="btn btn-emerald" onClick={handleApprove}>
                    <CheckCircle size={16} />
                    <span>Approve & Verify</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
