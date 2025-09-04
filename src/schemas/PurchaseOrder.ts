// import mongoose, { Schema, Document } from "mongoose";

// export interface PurchaseOrderItem {
//   _id?: mongoose.Types.ObjectId;
//   productId: mongoose.Types.ObjectId;
//   productName: string;
//   productSku: string;
  
//   // Variant-specific fields
//   variantId?: mongoose.Types.ObjectId;
//   variantSku?: string;
//   size?: string;
//   color?: string;
//   weight?: string;
  
//   // Order details
//   quantity: number;
//   unitCost: number;
//   totalCost: number;
  
//   // Receiving details
//   receivedQuantity: number;
//   pendingQuantity: number;
//   qualityStatus?: 'pending' | 'approved' | 'rejected';
//   qualityNotes?: string;
//   receivedDate?: Date;
//   status: 'pending' | 'partial' | 'received' | 'cancelled';
// }

// export interface PurchaseOrder extends Document {
//   orderNumber: string;
//   supplierId: mongoose.Types.ObjectId;
//   supplierName: string;
  
//   // Order dates
//   orderDate: Date;
//   expectedDeliveryDate: Date;
//   actualDeliveryDate?: Date;
  
//   // Order status
//   status: 'draft' | 'pending' | 'ordered' | 'shipped' | 'received' | 'cancelled';
  
//   // Financial details
//   subtotal: number;
//   taxAmount: number;
//   shippingCost: number;
//   totalAmount: number;
  
//   // Items
//   items: PurchaseOrderItem[];
  
//   // Additional details
//   notes?: string;
//   terms?: string;
//   paymentTerms?: string;
//   shippingAddress?: {
//     street: string;
//     city: string;
//     state: string;
//     zipCode: string;
//     country: string;
//   };
  
//   // Tracking
//   trackingNumber?: string;
  
//   // Audit fields
//   createdBy: mongoose.Types.ObjectId;
//   updatedBy?: mongoose.Types.ObjectId;
//   receivedBy?: mongoose.Types.ObjectId;
  
//   // Flags
//   isDeleted: boolean;
//   isUrgent: boolean;
// }

// const PurchaseOrderItemSchema = new Schema({
//   productId: {
//     type: Schema.Types.ObjectId,
//     ref: "Product",
//     required: true,
//   },
//   productName: { type: String, required: true },
//   productSku: { type: String, required: true },
  
//   // Variant-specific fields
//   variantId: {
//     type: Schema.Types.ObjectId,
//     required: false,
//   },
//   variantSku: { type: String },
//   size: { type: String },
//   color: { type: String },
//   weight: { type: String },
  
//   // Order details
//   quantity: { type: Number, required: true, min: 1 },
//   unitCost: { type: Number, required: true, min: 0 },
//   totalCost: { type: Number, required: true, min: 0 },
  
//   // Receiving details
//   receivedQuantity: { type: Number, default: 0, min: 0 },
//   pendingQuantity: { type: Number, default: 0, min: 0 },
//   qualityStatus: {
//     type: String,
//     enum: ['pending', 'approved', 'rejected'],
//     default: 'pending',
//   },
//   qualityNotes: { type: String },
//   receivedDate: { type: Date },
//   status: {
//     type: String,
//     enum: ['pending', 'partial', 'received', 'cancelled'],
//     default: 'pending',
//   },
// });

// const PurchaseOrderSchema: Schema = new Schema(
//   {
//     orderNumber: {
//       type: String,
//       required: true,
//       unique: true,
//     },
//     supplierId: {
//       type: Schema.Types.ObjectId,
//       ref: "Supplier",
//       required: true,
//     },
//     supplierName: { type: String, required: true },
    
//     // Order dates
//     orderDate: { type: Date, default: Date.now },
//     expectedDeliveryDate: { type: Date, required: true },
//     actualDeliveryDate: { type: Date },
    
//     // Order status
//     status: {
//       type: String,
//       enum: ['draft', 'pending', 'ordered', 'shipped', 'received', 'cancelled'],
//       default: 'draft',
//     },
    
//     // Financial details
//     subtotal: { type: Number, required: true, min: 0 },
//     taxAmount: { type: Number, default: 0, min: 0 },
//     shippingCost: { type: Number, default: 0, min: 0 },
//     totalAmount: { type: Number, required: true, min: 0 },
    
//     // Items
//     items: [PurchaseOrderItemSchema],
    
//     // Additional details
//     notes: { type: String },
//     terms: { type: String },
//     paymentTerms: { type: String },
//     shippingAddress: {
//       street: { type: String },
//       city: { type: String },
//       state: { type: String },
//       zipCode: { type: String },
//       country: { type: String },
//     },
    
//     // Tracking
//     trackingNumber: { type: String },
    
//     // Audit fields
//     createdBy: {
//       type: Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//     updatedBy: {
//       type: Schema.Types.ObjectId,
//       ref: "User",
//     },
//     receivedBy: {
//       type: Schema.Types.ObjectId,
//       ref: "User",
//     },
    
//     // Flags
//     isDeleted: { type: Boolean, default: false },
//     isUrgent: { type: Boolean, default: false },
//   },
//   { 
//     timestamps: true,
//     toJSON: { virtuals: true },
//     toObject: { virtuals: true }
//   }
// );

// // Indexes for better query performance
// PurchaseOrderSchema.index({ orderNumber: 1 });
// PurchaseOrderSchema.index({ supplierId: 1 });
// PurchaseOrderSchema.index({ status: 1 });
// PurchaseOrderSchema.index({ orderDate: -1 });
// PurchaseOrderSchema.index({ expectedDeliveryDate: 1 });
// PurchaseOrderSchema.index({ createdBy: 1 });
// PurchaseOrderSchema.index({ isDeleted: 1 });

// // Compound indexes
// PurchaseOrderSchema.index({ supplierId: 1, status: 1 });
// PurchaseOrderSchema.index({ orderDate: -1, status: 1 });

// // Virtual for calculating pending quantity
// PurchaseOrderItemSchema.virtual('pendingQuantity').get(function() {
//   return this.quantity - this.receivedQuantity;
// });

// // Pre-save middleware to generate order number
// PurchaseOrderSchema.pre('save', async function(next) {
//   if (this.isNew && !this.orderNumber) {
//     const count = await mongoose.model('PurchaseOrder').countDocuments();
//     this.orderNumber = `PO-${new Date().getFullYear()}-${String(count + 1).padStart(6, '0')}`;
//   }
  
//   // Calculate totals
//   this.subtotal = this.items.reduce((sum, item) => sum + item.totalCost, 0);
//   this.totalAmount = this.subtotal + this.taxAmount + this.shippingCost;
  
//   // Update pending quantities
//   this.items.forEach(item => {
//     item.pendingQuantity = item.quantity - item.receivedQuantity;
//   });
  
//   next();
// });

// // Instance method to check if order is fully received
// PurchaseOrderSchema.methods.isFullyReceived = function() {
//   return this.items.every((item: PurchaseOrderItem) => item.receivedQuantity >= item.quantity);
// };

// // Instance method to check if order is partially received
// PurchaseOrderSchema.methods.isPartiallyReceived = function() {
//   return this.items.some((item: PurchaseOrderItem) => item.receivedQuantity > 0) && 
//          !this.isFullyReceived();
// };

// // Static method to find orders by supplier
// PurchaseOrderSchema.statics.findBySupplier = function(supplierId: mongoose.Types.ObjectId) {
//   return this.find({ supplierId, isDeleted: false });
// };

// // Static method to find pending orders
// PurchaseOrderSchema.statics.findPending = function() {
//   return this.find({ 
//     status: { $in: ['pending', 'ordered', 'shipped'] }, 
//     isDeleted: false 
//   });
// };

// export const PurchaseOrder = mongoose.model<PurchaseOrder>("PurchaseOrder", PurchaseOrderSchema);
