import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { StatsOverview } from './components/StatsOverview';
import { ReceiptGrid } from './components/ReceiptGrid';
import { UploadModal } from './components/UploadModal';
import { ReviewStudioModal } from './components/ReviewStudioModal';
import { PurgeManagerModal } from './components/PurgeManagerModal';

import type { ReceiptItem, StorageStats } from './types/receipt';
import { 
  getReceiptsFromStorage, 
  saveReceiptToStorage, 
  deleteReceiptFromStorage, 
  purgeOldImages, 
  calculateStorageStats,
  resetStorageToDefaults
} from './services/db';
import { exportReceiptsToExcel } from './services/excelService';

export const App: React.FC = () => {
  const [userRole, setUserRole] = useState<'employee' | 'admin'>('admin');
  const [receipts, setReceipts] = useState<ReceiptItem[]>([]);
  const [stats, setStats] = useState<StorageStats>({
    totalCount: 0,
    totalSpent: 0,
    pendingCount: 0,
    verifiedCount: 0,
    purgedCount: 0,
    currentImagesSizeBytes: 0,
    savedSpaceBytes: 0
  });

  // Modal States
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isPurgeOpen, setIsPurgeOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptItem | null>(null);

  // Load receipts from storage on initial mount
  useEffect(() => {
    const loaded = getReceiptsFromStorage();
    setReceipts(loaded);
    setStats(calculateStorageStats(loaded));

    // Automated 30-day purge check on startup
    const autoPurgeResult = purgeOldImages(30);
    if (autoPurgeResult.purgedCount > 0) {
      setReceipts(autoPurgeResult.updatedReceipts);
      setStats(calculateStorageStats(autoPurgeResult.updatedReceipts));
    }
  }, []);

  const handleSaveReceipt = (receipt: ReceiptItem) => {
    const updated = saveReceiptToStorage(receipt);
    setReceipts(updated);
    setStats(calculateStorageStats(updated));
  };

  const handleUpdateReceipt = (receipt: ReceiptItem) => {
    const updated = saveReceiptToStorage(receipt);
    setReceipts(updated);
    setStats(calculateStorageStats(updated));
  };

  const handleDeleteReceipt = (id: string) => {
    const updated = deleteReceiptFromStorage(id);
    setReceipts(updated);
    setStats(calculateStorageStats(updated));
  };

  const handleTriggerPurge = (retentionDays: number) => {
    const result = purgeOldImages(retentionDays);
    setReceipts(result.updatedReceipts);
    setStats(calculateStorageStats(result.updatedReceipts));
  };

  const handleExportExcel = () => {
    exportReceiptsToExcel(receipts);
  };

  const handleResetData = () => {
    if (confirm('Reset all receipt records to initial demonstration state?')) {
      const resetData = resetStorageToDefaults();
      setReceipts(resetData);
      setStats(calculateStorageStats(resetData));
    }
  };

  return (
    <div className="app-container">
      {/* Top Header / Navigation Bar */}
      <Navbar 
        userRole={userRole}
        setUserRole={setUserRole}
        stats={stats}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenPurge={() => setIsPurgeOpen(true)}
        onExportExcel={handleExportExcel}
        onResetData={handleResetData}
      />

      {/* KPI Stats Overview */}
      <StatsOverview stats={stats} />

      {/* Main Content Receipt Grid */}
      <ReceiptGrid 
        receipts={receipts}
        userRole={userRole}
        onSelectReceipt={r => setSelectedReceipt(r)}
        onOpenUpload={() => setIsUploadOpen(true)}
      />

      {/* Upload Modal */}
      <UploadModal 
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSaveReceipt={handleSaveReceipt}
        currentUser={userRole === 'admin' ? 'Alex Chen (Admin)' : 'Sarah Jenkins'}
      />

      {/* Admin Transfer & Verification Studio Modal */}
      <ReviewStudioModal 
        receipt={selectedReceipt}
        isOpen={selectedReceipt !== null}
        onClose={() => setSelectedReceipt(null)}
        onUpdateReceipt={handleUpdateReceipt}
        onDeleteReceipt={handleDeleteReceipt}
        adminName="Alex Chen (Admin)"
      />

      {/* Purge Manager Modal */}
      <PurgeManagerModal 
        isOpen={isPurgeOpen}
        onClose={() => setIsPurgeOpen(false)}
        stats={stats}
        receipts={receipts}
        onTriggerPurge={handleTriggerPurge}
      />
    </div>
  );
};

export default App;
