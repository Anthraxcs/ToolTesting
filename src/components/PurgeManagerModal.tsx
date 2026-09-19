import React, { useState } from 'react';
import { X, Trash2, CheckCircle2, ShieldAlert } from 'lucide-react';
import type { ReceiptItem, StorageStats } from '../types/receipt';

interface PurgeManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: StorageStats;
  receipts: ReceiptItem[];
  onTriggerPurge: (retentionDays: number) => void;
}

export const PurgeManagerModal: React.FC<PurgeManagerModalProps> = ({
  isOpen,
  onClose,
  stats,
  receipts,
  onTriggerPurge
}) => {
  const [retentionDays, setRetentionDays] = useState(30);
  const [purgeResults, setPurgeResults] = useState<{ purgedCount: number; freedSpaceKB: number } | null>(null);

  if (!isOpen) return null;

  const currentMB = (stats.currentImagesSizeBytes / (1024 * 1024)).toFixed(2);

  // Calculate items eligible for purge
  const now = new Date().getTime();
  const cutoffTime = now - retentionDays * 24 * 60 * 60 * 1000;
  const eligibleCount = receipts.filter(r => new Date(r.uploadDate).getTime() < cutoffTime && r.imageUrl !== null).length;

  const handleRunPurge = () => {
    onTriggerPurge(retentionDays);
    setPurgeResults({
      purgedCount: eligibleCount,
      freedSpaceKB: eligibleCount * 180
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '640px' }}>
        <div className="modal-header">
          <div className="modal-title">
            <Trash2 size={20} className="text-amber" />
            <span>Monthly Storage Cleanup & Retention Policy</span>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Storage Meter Summary */}
          <div style={{ 
            background: 'rgba(255, 255, 255, 0.03)', 
            border: '1px solid var(--border-subtle)',
            padding: '20px',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            flexDirection: 'column',
            gap: 12
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Active Image Blob Storage</span>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#06b6d4' }}>{currentMB} MB</span>
            </div>

            <div className="progress-bar-bg" style={{ width: '100%', height: 10 }}>
              <div className="progress-bar-fill" style={{ width: `${Math.min(100, (stats.currentImagesSizeBytes / (20 * 1024 * 1024)) * 100)}%` }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
              <span>{stats.totalCount - stats.purgedCount} Active Images</span>
              <span>{stats.purgedCount} Previously Purged</span>
            </div>
          </div>

          {/* Retention Rule Explanation Banner */}
          <div style={{ 
            background: 'rgba(245, 158, 11, 0.1)', 
            border: '1px solid rgba(245, 158, 11, 0.3)',
            padding: '14px 16px',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.85rem',
            color: '#f59e0b',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12
          }}>
            <ShieldAlert size={20} style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>How Monthly Database Purge Works</div>
              <div>
                To prevent database overflow, receipt <b>image files and heavy raw scans</b> older than 30 days are permanently wiped at the end of each billing cycle. 
                <br />
                <b>Financial metadata</b> (Vendor, Amount, Tax, Date, Category & Excel Logs) is 100% retained forever for accounting audits!
              </div>
            </div>
          </div>

          {/* Execution Controls */}
          <div className="form-group">
            <label className="form-label">Retention Policy Horizon</label>
            <select 
              className="select-field" 
              style={{ width: '100%' }}
              value={retentionDays}
              aria-label="Retention Policy Horizon"
              onChange={e => setRetentionDays(Number(e.target.value))}
            >
              <option value={30}>30 Days (Standard Monthly Billing Cleanup)</option>
              <option value={14}>14 Days (Bi-weekly High Density Purge)</option>
              <option value={7}>7 Days (Aggressive Storage Saving)</option>
              <option value={0}>Instant Purge All Old Image Assets</option>
            </select>
          </div>

          <div style={{ 
            background: 'rgba(0, 0, 0, 0.3)', 
            padding: '12px 16px', 
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.875rem'
          }}>
            <span>Receipts Eligible for Image Purge:</span>
            <span style={{ fontWeight: 800, color: eligibleCount > 0 ? '#f59e0b' : '#10b981' }}>
              {eligibleCount} Receipt Images
            </span>
          </div>

          {purgeResults && (
            <div style={{ 
              background: 'rgba(16, 185, 129, 0.15)', 
              border: '1px solid #10b981', 
              padding: '12px 16px', 
              borderRadius: 'var(--radius-md)',
              color: '#10b981',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontSize: '0.85rem'
            }}>
              <CheckCircle2 size={20} />
              <div>
                <b>Monthly Purge Executed!</b> Successfully wiped {purgeResults.purgedCount} image files and freed ~{(purgeResults.freedSpaceKB / 1024).toFixed(2)} MB of storage.
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 10 }}>
            <button className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
            <button 
              className="btn btn-amber" 
              onClick={handleRunPurge}
              disabled={eligibleCount === 0}
            >
              <Trash2 size={16} />
              <span>Run Monthly Purge Now</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
