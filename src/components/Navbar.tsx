import React from 'react';
import { 
  Receipt, 
  Upload, 
  FileSpreadsheet, 
  Trash2, 
  HardDrive, 
  UserCheck, 
  RotateCcw
} from 'lucide-react';
import type { StorageStats } from '../types/receipt';

interface NavbarProps {
  userRole: 'employee' | 'admin';
  setUserRole: (role: 'employee' | 'admin') => void;
  stats: StorageStats;
  onOpenUpload: () => void;
  onOpenPurge: () => void;
  onExportExcel: () => void;
  onResetData: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  userRole,
  setUserRole,
  stats,
  onOpenUpload,
  onOpenPurge,
  onExportExcel,
  onResetData
}) => {
  // Format bytes to MB
  const usedMB = (stats.currentImagesSizeBytes / (1024 * 1024)).toFixed(1);
  const maxSimulatedMB = 50; // 50MB limit indicator
  const fillPercent = Math.min(100, Math.max(5, Math.round((stats.currentImagesSizeBytes / (maxSimulatedMB * 1024 * 1024)) * 100)));

  return (
    <nav className="navbar">
      <div className="brand">
        <div className="brand-icon">
          <Receipt size={24} />
        </div>
        <div>
          <div className="brand-title">ReceiptVault AI</div>
          <div className="brand-subtitle">Smart OCR Expense & Storage Management</div>
        </div>
      </div>

      <div className="nav-actions">
        {/* Role Switcher */}
        <div className="role-toggle">
          <button 
            className={`role-btn ${userRole === 'employee' ? 'active' : ''}`}
            onClick={() => setUserRole('employee')}
            title="Member view to upload and manage receipts"
          >
            Employee
          </button>
          <button 
            className={`role-btn ${userRole === 'admin' ? 'active' : ''}`}
            onClick={() => setUserRole('admin')}
            title="Admin view to transfer data, review OCR & purge old images"
          >
            <UserCheck size={14} style={{ display: 'inline', marginRight: 4 }} />
            Admin Studio
          </button>
        </div>

        {/* Storage Bar Indicator */}
        <div className="storage-widget" title="Monthly DB Storage meter. Purge images past 30 days to free space.">
          <HardDrive size={18} className="text-muted" />
          <div className="storage-info">
            <span className="storage-label">Image DB Storage</span>
            <span className="storage-val">{usedMB} MB / {maxSimulatedMB} MB</span>
          </div>
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{ width: `${fillPercent}%` }} />
          </div>
        </div>

        {/* Action Buttons */}
        <button className="btn btn-primary" onClick={onOpenUpload}>
          <Upload size={16} />
          <span>Upload Receipt</span>
        </button>

        <button className="btn btn-emerald" onClick={onExportExcel}>
          <FileSpreadsheet size={16} />
          <span>Export Excel</span>
        </button>

        {userRole === 'admin' && (
          <button className="btn btn-secondary" onClick={onOpenPurge}>
            <Trash2 size={16} className="text-amber" />
            <span>Monthly Cleanup</span>
          </button>
        )}

        <button 
          className="btn btn-secondary btn-sm" 
          onClick={onResetData} 
          title="Reset to initial demo receipt data"
        >
          <RotateCcw size={14} />
        </button>
      </div>
    </nav>
  );
};
