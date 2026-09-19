import type { ReceiptItem, StorageStats } from '../types/receipt';

const STORAGE_KEY = 'receipt_vault_db_v2';

const INITIAL_DEMO_DATA: ReceiptItem[] = [];

export const getReceiptsFromStorage = (): ReceiptItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DEMO_DATA));
      return INITIAL_DEMO_DATA;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load receipts:', err);
    return INITIAL_DEMO_DATA;
  }
};

export const saveReceiptToStorage = (receipt: ReceiptItem): ReceiptItem[] => {
  const receipts = getReceiptsFromStorage();
  const existingIdx = receipts.findIndex(r => r.id === receipt.id);
  
  if (existingIdx >= 0) {
    receipts[existingIdx] = receipt;
  } else {
    receipts.unshift(receipt);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(receipts));
  return receipts;
};

export const deleteReceiptFromStorage = (id: string): ReceiptItem[] => {
  const receipts = getReceiptsFromStorage();
  const filtered = receipts.filter(r => r.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  return filtered;
};

export const purgeOldImages = (retentionDays: number = 30): { updatedReceipts: ReceiptItem[]; purgedCount: number; freedSpaceKB: number } => {
  const receipts = getReceiptsFromStorage();
  const now = new Date();
  const cutoffTime = now.getTime() - retentionDays * 24 * 60 * 60 * 1000;
  
  let purgedCount = 0;
  let freedSpaceKB = 0;

  const updatedReceipts = receipts.map(item => {
    const itemUploadTime = new Date(item.uploadDate).getTime();
    
    // Purge if uploaded before cutoff and has an image
    if (itemUploadTime < cutoffTime && item.imageUrl !== null) {
      purgedCount++;
      freedSpaceKB += item.imageSizeKB || 150;
      
      return {
        ...item,
        status: 'purged' as const,
        imageUrl: null,
        imageSizeKB: 0,
        ocrRawText: undefined,
        purgedAt: new Date().toISOString()
      };
    }
    return item;
  });

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedReceipts));

  return {
    updatedReceipts,
    purgedCount,
    freedSpaceKB
  };
};

export const calculateStorageStats = (receipts: ReceiptItem[]): StorageStats => {
  let totalSpent = 0;
  let pendingCount = 0;
  let verifiedCount = 0;
  let purgedCount = 0;
  let currentImagesSizeBytes = 0;
  let savedSpaceBytes = 0;

  receipts.forEach(r => {
    totalSpent += r.totalAmount || 0;
    if (r.status === 'pending') pendingCount++;
    if (r.status === 'verified') verifiedCount++;
    if (r.status === 'purged') purgedCount++;

    if (r.imageUrl) {
      currentImagesSizeBytes += (r.imageSizeKB || 150) * 1024;
    } else {
      // Estimated saved space for purged entries
      savedSpaceBytes += 180 * 1024;
    }
  });

  return {
    totalCount: receipts.length,
    totalSpent,
    pendingCount,
    verifiedCount,
    purgedCount,
    currentImagesSizeBytes,
    savedSpaceBytes
  };
};

export const resetStorageToDefaults = (): ReceiptItem[] => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DEMO_DATA));
  return INITIAL_DEMO_DATA;
};
