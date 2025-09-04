export type Product = {
  image: string;
  name: string;
  category: string;
  price: number;
  sold: number;
  profit: number;
  // Inventory tracking fields
  stockQuantity: number;
  reservedQuantity: number; // Items in cart/checkout
  availableQuantity: number; // stockQuantity - reservedQuantity
  lowStockThreshold: number;
  reorderPoint: number;
  supplierInfo: {
    supplierId: string;
    supplierName: string;
    leadTime: number; // days
    minimumOrderQuantity: number;
  };
  // Purchase order tracking
  purchaseOrders: PurchaseOrder[];
  lastRestocked: Date;
  nextRestockDate: Date;
};

export type PurchaseOrder = {
  _id: string;
  orderNumber: string;
  supplierId: string;
  supplierName: string;
  items: PurchaseOrderItem[];
  totalAmount: number;
  status: "pending" | "ordered" | "shipped" | "received" | "cancelled";
  orderDate: Date;
  expectedDeliveryDate: Date;
  actualDeliveryDate?: Date;
  notes: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
};

export type PurchaseOrderItem = {
  productId: string;
  productName: string;
  variantId?: string; // Optional for products without variants
  variantSku?: string;
  variantAttributes?: { [key: string]: string }; // e.g., { "Size": "M", "Color": "Red" }
  quantity: number;
  unitCost: number;
  totalCost: number;
  receivedQuantity: number;
  status: "pending" | "received" | "partial";
};

// Extended product type for purchase order selection
export type ProductWithVariants = {
  _id: string;
  name: string;
  sku: string;
  currentStock: number;
  lowStockThreshold: number;
  hasVariants: boolean;
  variants?: ProductVariant[];
};

export type ProductVariant = {
  _id: string;
  attributeValues: { [key: string]: string };
  sku: string;
  price: number;
  stockQuantity: number;
};
