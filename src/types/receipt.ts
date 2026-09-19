export type CategoryType = 
  | 'Meals & Dining'
  | 'Travel & Lodging'
  | 'Office Supplies'
  | 'Software & Tech'
  | 'Utilities & Services'
  | 'Transportation'
  | 'Other';

export type ReceiptStatus = 'pending' | 'verified' | 'purged';

export interface ReceiptItem {
  id: string;
  uploaderName: string;
  uploaderRole: 'employee' | 'admin';
  uploadDate: string; // ISO string
  category: CategoryType;
  vendorName: string;
  receiptDate: string; // YYYY-MM-DD
  totalAmount: number;
  taxAmount: number;
  currency: string;
  status: ReceiptStatus;
  imageUrl: string | null; // base64 / blob data; null if purged
  imageSizeKB: number;
  notes: string;
  ocrRawText?: string;
  ocrConfidence?: number;
  purgedAt?: string;
  verifiedBy?: string;
  verifiedAt?: string;
}

export interface ExtractedReceiptData {
  vendorName: string;
  receiptDate: string;
  totalAmount: number;
  taxAmount: number;
  currency: string;
  category: CategoryType;
  ocrRawText: string;
  ocrConfidence: number;
}

export interface StorageStats {
  totalCount: number;
  totalSpent: number;
  pendingCount: number;
  verifiedCount: number;
  purgedCount: number;
  currentImagesSizeBytes: number;
  savedSpaceBytes: number;
}
