import React from 'react';
import { DollarSign, FileText, Clock, HardDrive } from 'lucide-react';
import type { StorageStats } from '../types/receipt';

interface StatsOverviewProps {
  stats: StorageStats;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ stats }) => {
  const savedMB = (stats.savedSpaceBytes / (1024 * 1024)).toFixed(1);

  return (
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-content">
          <span className="stat-title">Total Spending Recorded</span>
          <span className="stat-value" style={{ color: '#06b6d4' }}>
            ${stats.totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className="stat-subtext">Preserved in financial metadata</span>
        </div>
        <div className="stat-icon-wrapper" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4' }}>
          <DollarSign size={24} />
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-content">
          <span className="stat-title">Total Receipts Logged</span>
          <span className="stat-value">{stats.totalCount}</span>
          <span className="stat-subtext">{stats.verifiedCount} Verified • {stats.pendingCount} Pending</span>
        </div>
        <div className="stat-icon-wrapper" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#6366f1' }}>
          <FileText size={24} />
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-content">
          <span className="stat-title">Pending Data Transfers</span>
          <span className="stat-value" style={{ color: stats.pendingCount > 0 ? '#f59e0b' : '#10b981' }}>
            {stats.pendingCount}
          </span>
          <span className="stat-subtext">Awaiting admin review / OCR check</span>
        </div>
        <div className="stat-icon-wrapper" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
          <Clock size={24} />
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-content">
          <span className="stat-title">Monthly Image Purges</span>
          <span className="stat-value" style={{ color: '#10b981' }}>{stats.purgedCount}</span>
          <span className="stat-subtext">Freed ~{savedMB} MB storage space</span>
        </div>
        <div className="stat-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
          <HardDrive size={24} />
        </div>
      </div>
    </div>
  );
};
