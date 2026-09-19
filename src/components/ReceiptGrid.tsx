import React, { useState } from 'react';
import { Search, Filter, Eye, Trash2, Calendar, FileText } from 'lucide-react';
import type { ReceiptItem } from '../types/receipt';

interface ReceiptGridProps {
  receipts: ReceiptItem[];
  userRole: 'employee' | 'admin';
  onSelectReceipt: (receipt: ReceiptItem) => void;
  onOpenUpload: () => void;
}

export const ReceiptGrid: React.FC<ReceiptGridProps> = ({
  receipts,
  userRole,
  onSelectReceipt,
  onOpenUpload
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  const filteredReceipts = receipts.filter(r => {
    const matchesSearch = 
      r.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.uploaderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.notes.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'ALL' || r.category === selectedCategory;
    const matchesStatus = selectedStatus === 'ALL' || r.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div>
      {/* Controls Bar */}
      <div className="controls-bar">
        <div className="search-input-group">
          <Search size={18} />
          <input 
            type="text" 
            className="input-field"
            placeholder="Search by vendor, employee name, receipt ID..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filters-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Filter size={16} className="text-muted" />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Filters:</span>
          </div>

          <select 
            className="select-field"
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
          >
            <option value="ALL">All Categories</option>
            <option value="Meals & Dining">Meals & Dining</option>
            <option value="Travel & Lodging">Travel & Lodging</option>
            <option value="Office Supplies">Office Supplies</option>
            <option value="Software & Tech">Software & Tech</option>
            <option value="Utilities & Services">Utilities & Services</option>
            <option value="Transportation">Transportation</option>
            <option value="Other">Other</option>
          </select>

          <select 
            className="select-field"
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="pending">Pending Transfer</option>
            <option value="verified">Verified Log</option>
            <option value="purged">Purged (Image Wiped)</option>
          </select>
        </div>
      </div>

      {/* Grid List */}
      {filteredReceipts.length === 0 ? (
        <div className="empty-state">
          <FileText className="empty-icon" />
          <h3 style={{ fontSize: '1.2rem', marginBottom: 8, color: '#fff' }}>No Receipts Found</h3>
          <p>No receipt records match your current search and filter criteria.</p>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={onOpenUpload}>
            + Upload New Receipt
          </button>
        </div>
      ) : (
        <div className="receipts-grid">
          {filteredReceipts.map(receipt => (
            <div key={receipt.id} className="receipt-card">
              {/* Status Badge */}
              <div className={`badge badge-${receipt.status}`}>
                {receipt.status === 'pending' && 'Pending Transfer'}
                {receipt.status === 'verified' && 'Verified'}
                {receipt.status === 'purged' && 'Image Wiped'}
              </div>

              {/* Card Header Preview */}
              <div className="receipt-card-header">
                {receipt.imageUrl ? (
                  <img src={receipt.imageUrl} alt={receipt.vendorName} className="receipt-img-preview" />
                ) : (
                  <div className="purged-placeholder">
                    <Trash2 size={32} />
                    <p><b>Image Asset Purged</b><br />Financial audit record active</p>
                  </div>
                )}
              </div>

              {/* Card Body */}
              <div className="receipt-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h4 className="vendor-title">{receipt.vendorName}</h4>
                    <span className="category-pill">{receipt.category}</span>
                  </div>
                  <div className="amount-display">${receipt.totalAmount.toFixed(2)}</div>
                </div>

                <div className="meta-row">
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Calendar size={13} /> {receipt.receiptDate}
                  </span>
                  <span>By: {receipt.uploaderName}</span>
                </div>

                {receipt.notes && (
                  <p style={{ 
                    fontSize: '0.775rem', 
                    color: 'var(--text-muted)', 
                    display: '-webkit-box', 
                    WebkitLineClamp: 2, 
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    lineHeight: 1.4
                  }}>
                    {receipt.notes}
                  </p>
                )}

                <div className="card-actions">
                  <button 
                    className={`btn ${userRole === 'admin' ? 'btn-primary' : 'btn-secondary'} btn-sm`} 
                    style={{ width: '100%' }}
                    onClick={() => onSelectReceipt(receipt)}
                  >
                    <Eye size={14} />
                    <span>{userRole === 'admin' ? 'Review & Transfer' : 'View Receipt'}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
