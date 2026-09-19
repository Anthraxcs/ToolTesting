import type { ReceiptItem, StorageStats } from '../types/receipt';
import { generateSampleReceiptSvg } from '../utils/sampleImages';

const STORAGE_KEY = 'receipt_vault_db_v1';

const INITIAL_DEMO_DATA: ReceiptItem[] = [
  {
    id: 'rct_001',
    uploaderName: 'Sarah Jenkins',
    uploaderRole: 'employee',
    uploadDate: '2026-09-18T14:22:00Z',
    category: 'Meals & Dining',
    vendorName: 'Bistro Luxe',
    receiptDate: '2026-09-18',
    totalAmount: 142.50,
    taxAmount: 14.25,
    currency: 'USD',
    status: 'verified',
    imageUrl: generateSampleReceiptSvg('Bistro Luxe', '142.50', '2026-09-18', ['Client Lunch (2x): $120.00', 'Sparkling Water: $9.50']),
    imageSizeKB: 185,
    notes: 'Q3 Partner Lunch with TechCorp Reps',
    ocrConfidence: 94,
    verifiedBy: 'Alex Chen (Admin)',
    verifiedAt: '2026-09-18T15:10:00Z'
  },
  {
    id: 'rct_002',
    uploaderName: 'David Miller',
    uploaderRole: 'employee',
    uploadDate: '2026-09-19T09:15:00Z',
    category: 'Software & Tech',
    vendorName: 'AWS Cloud Services',
    receiptDate: '2026-09-15',
    totalAmount: 849.00,
    taxAmount: 84.90,
    currency: 'USD',
    status: 'pending',
    imageUrl: generateSampleReceiptSvg('AWS Cloud Services', '849.00', '2026-09-15', ['EC2 Hosting Suite: $600.00', 'S3 Storage Tier: $171.82']),
    imageSizeKB: 210,
    notes: 'Monthly infrastructure server hosting cost',
    ocrConfidence: 98
  },
  {
    id: 'rct_003',
    uploaderName: 'Emily Zhang',
    uploaderRole: 'employee',
    uploadDate: '2026-08-10T11:45:00Z',
    category: 'Office Supplies',
    vendorName: 'Staples Enterprise',
    receiptDate: '2026-08-10',
    totalAmount: 315.80,
    taxAmount: 31.58,
    currency: 'USD',
    status: 'purged',
    imageUrl: null, // Image wiped in last month's scheduled purge!
    imageSizeKB: 0,
    notes: 'Purged during August monthly storage cleanup.',
    ocrConfidence: 91,
    purgedAt: '2026-09-01T00:00:00Z',
    verifiedBy: 'Alex Chen (Admin)',
    verifiedAt: '2026-08-11T10:00:00Z'
  },
  {
    id: 'rct_004',
    uploaderName: 'Michael Brown',
    uploaderRole: 'employee',
    uploadDate: '2026-09-12T16:00:00Z',
    category: 'Travel & Lodging',
    vendorName: 'Grand Hyatt Hotel',
    receiptDate: '2026-09-11',
    totalAmount: 520.00,
    taxAmount: 52.00,
    currency: 'USD',
    status: 'pending',
    imageUrl: generateSampleReceiptSvg('Grand Hyatt Hotel', '520.00', '2026-09-11', ['2 Night Deluxe Suite: $472.73']),
    imageSizeKB: 240,
    notes: 'Annual developer conference accommodation',
    ocrConfidence: 89
  }
];

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
