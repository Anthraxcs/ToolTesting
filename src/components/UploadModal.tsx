import React, { useState } from 'react';
import { X, Upload, Sparkles, Check, Image as ImageIcon } from 'lucide-react';
import type { CategoryType, ReceiptItem } from '../types/receipt';
import { scanReceiptImage } from '../services/ocrService';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveReceipt: (receipt: ReceiptItem) => void;
  currentUser: string;
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

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onSaveReceipt,
  currentUser
}) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageSizeKB, setImageSizeKB] = useState<number>(180);
  const [isScanning, setIsScanning] = useState(false);
  const [ocrStatus, setOcrStatus] = useState('');
  const [ocrProgress, setOcrProgress] = useState(0);

  // Form Fields
  const [vendorName, setVendorName] = useState('');
  const [receiptDate, setReceiptDate] = useState(new Date().toISOString().split('T')[0]);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [taxAmount, setTaxAmount] = useState<number>(0);
  const [category, setCategory] = useState<CategoryType>('Meals & Dining');
  const [notes, setNotes] = useState('');
  const [ocrConfidence, setOcrConfidence] = useState<number>(90);

  if (!isOpen) return null;

  const handleFileUpload = (file: File) => {
    const sizeKB = Math.round(file.size / 1024);
    setImageSizeKB(sizeKB);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const src = e.target?.result as string;
      setImagePreview(src);
      await triggerOCR(src);
    };
    reader.readAsDataURL(file);
  };

  const triggerOCR = async (src: string) => {
    setIsScanning(true);
    try {
      const extracted = await scanReceiptImage(src, (percent, status) => {
        setOcrProgress(percent);
        setOcrStatus(status);
      });

      setVendorName(extracted.vendorName);
      setReceiptDate(extracted.receiptDate);
      setTotalAmount(extracted.totalAmount);
      setTaxAmount(extracted.taxAmount);
      setCategory(extracted.category);
      setOcrConfidence(extracted.ocrConfidence);
    } catch (err) {
      console.error('OCR Scanning failed:', err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorName || totalAmount <= 0) return;

    const newReceipt: ReceiptItem = {
      id: `rct_${Date.now()}`,
      uploaderName: currentUser || 'Company Member',
      uploaderRole: 'employee',
      uploadDate: new Date().toISOString(),
      category,
      vendorName,
      receiptDate,
      totalAmount,
      taxAmount,
      currency: 'USD',
      status: 'pending', // Pending Admin transfer & verification
      imageUrl: imagePreview,
      imageSizeKB: imagePreview ? imageSizeKB : 0,
      notes,
      ocrConfidence
    };

    onSaveReceipt(newReceipt);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '860px' }}>
        <div className="modal-header">
          <div className="modal-title">
            <Upload size={20} className="text-cyan" />
            <span>Upload New Receipt / Invoice</span>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="split-studio">
            {/* Left Column: Image Upload & Preset Selector */}
            <div>
              <div 
                className="image-preview-panel" 
                style={{ cursor: 'pointer', borderStyle: 'dashed' }}
                onClick={() => document.getElementById('file-upload-input')?.click()}
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="Receipt preview" className="studio-img" />
                ) : (
                  <div className="purged-placeholder">
                    <ImageIcon size={48} />
                    <p style={{ fontWeight: 600, color: '#f8fafc' }}>Click or Drop Receipt Image Here</p>
                    <p>Supports JPG, PNG, WebP & SVG receipts</p>
                  </div>
                )}

                {isScanning && (
                  <div className="ocr-indicator">
                    <div className="spinner" />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{ocrStatus}</div>
                      <div className="progress-bar-bg" style={{ width: '100%', marginTop: 4 }}>
                        <div className="progress-bar-fill" style={{ width: `${ocrProgress}%` }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <input 
                id="file-upload-input"
                type="file" 
                accept="image/*" 
                style={{ display: 'none' }}
                onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
              />

              </div>

            {/* Right Column: Form Fields with OCR Auto-fill */}
            <form onSubmit={handleSubmit} className="form-panel">
              {imagePreview && (
                <div style={{ 
                  background: 'rgba(6, 182, 212, 0.1)', 
                  border: '1px solid rgba(6, 182, 212, 0.3)',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  fontSize: '0.775rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  color: '#06b6d4'
                }}>
                  <Sparkles size={16} />
                  <span>AI OCR Auto-filled from receipt scan ({ocrConfidence}% match)</span>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Vendor / Merchant Name</label>
                <input 
                  type="text" 
                  required
                  className="form-input"
                  placeholder="e.g. Bistro Luxe"
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
                    required
                    className="form-input"
                    placeholder="0.00"
                    value={totalAmount || ''}
                    onChange={e => setTotalAmount(parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Tax Amount ($)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    className="form-input"
                    placeholder="0.00"
                    value={taxAmount || ''}
                    onChange={e => setTaxAmount(parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Transaction Date</label>
                  <input 
                    type="date" 
                    required
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
                <label className="form-label">Description / Notes</label>
                <textarea 
                  className="form-input"
                  rows={3}
                  placeholder="Purpose of expense, attendees, project tag..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 'auto' }}>
                <button type="button" className="btn btn-secondary" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={!imagePreview}>
                  <Check size={16} />
                  <span>Submit to Database</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
