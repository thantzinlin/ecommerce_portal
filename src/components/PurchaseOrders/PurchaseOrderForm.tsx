// "use client";

// import { useState, useEffect } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import { handleError, httpGet, httpPost, httpPut } from "@/utils/apiClient";
// import Swal from "sweetalert2";
// import { FaPlus, FaTrash, FaSave } from "react-icons/fa";

// interface Product {
//   _id: string;
//   name: string;
//   sku: string;
//   currentStock: number;
//   lowStockThreshold: number;
// }

// interface Supplier {
//   _id: string;
//   name: string;
//   email: string;
//   phone: string;
// }

// interface PurchaseOrderItem {
//   productId: string;
//   productName: string;
//   sku: string;
//   quantity: number;
//   unitCost: number;
//   totalCost: number;
// }

// interface PurchaseOrderFormData {
//   supplierId: string;
//   expectedDeliveryDate: string;
//   notes: string;
//   items: PurchaseOrderItem[];
// }

// const PurchaseOrderForm = () => {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const editId = searchParams.get("_id");

//   const [formData, setFormData] = useState<PurchaseOrderFormData>({
//     supplierId: "",
//     expectedDeliveryDate: "",
//     notes: "",
//     items: []
//   });

//   const [products, setProducts] = useState<Product[]>([]);
//   const [suppliers, setSuppliers] = useState<Supplier[]>([]);
//   const [loading, setLoading] = useState<boolean>(false);
//   const [isEditing, setIsEditing] = useState<boolean>(false);

//   useEffect(() => {
//     fetchProducts();
//     fetchSuppliers();
//     if (editId) {
//       setIsEditing(true);
//       fetchPurchaseOrder(editId);
//     }
//   }, [editId]);

//   const fetchProducts = async () => {
//     try {
//       const response = await httpGet("products?perPage=1000");
//       setProducts(response.data.data);
//     } catch (err) {
//       handleError(err, router);
//     }
//   };

//   const fetchSuppliers = async () => {
//     try {
//       const response = await httpGet("suppliers?perPage=1000");
//       setSuppliers(response.data.data);
//     } catch (err) {
//       handleError(err, router);
//     }
//   };

//   const fetchPurchaseOrder = async (id: string) => {
//     try {
//       setLoading(true);
//       const response = await httpGet(`purchase-orders/${id}`);
//       const order = response.data.data;
      
//       setFormData({
//         supplierId: order.supplierId,
//         expectedDeliveryDate: order.expectedDeliveryDate.split('T')[0],
//         notes: order.notes || "",
//         items: order.items.map((item: any) => ({
//           productId: item.productId,
//           productName: item.productName,
//           sku: item.productSku,
//           quantity: item.quantity,
//           unitCost: item.unitCost,
//           totalCost: item.totalCost
//         }))
//       });
//     } catch (err) {
//       handleError(err, router);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const addItem = () => {
//     setFormData(prev => ({
//       ...prev,
//       items: [...prev.items, {
//         productId: "",
//         productName: "",
//         sku: "",
//         quantity: 1,
//         unitCost: 0,
//         totalCost: 0
//       }]
//     }));
//   };

//   const removeItem = (index: number) => {
//     setFormData(prev => ({
//       ...prev,
//       items: prev.items.filter((_, i) => i !== index)
//     }));
//   };

//   const updateItem = (index: number, field: keyof PurchaseOrderItem, value: any) => {
//     setFormData(prev => {
//       const newItems = [...prev.items];
//       newItems[index] = { ...newItems[index], [field]: value };

//       // Auto-calculate total cost
//       if (field === 'quantity' || field === 'unitCost') {
//         newItems[index].totalCost = newItems[index].quantity * newItems[index].unitCost;
//       }

//       // Auto-fill product details when product is selected
//       if (field === 'productId') {
//         const selectedProduct = products.find(p => p._id === value);
//         if (selectedProduct) {
//           newItems[index].productName = selectedProduct.name;
//           newItems[index].sku = selectedProduct.sku;
//         }
//       }

//       return { ...prev, items: newItems };
//     });
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
    
//     if (!formData.supplierId) {
//       Swal.fire("Error", "Please select a supplier", "error");
//       return;
//     }

//     if (formData.items.length === 0) {
//       Swal.fire("Error", "Please add at least one item", "error");
//       return;
//     }

//     if (formData.items.some(item => !item.productId || item.quantity <= 0 || item.unitCost <= 0)) {
//       Swal.fire("Error", "Please fill in all item details correctly", "error");
//       return;
//     }

//     try {
//       setLoading(true);
      
//       const payload = {
//         supplierId: formData.supplierId,
//         expectedDeliveryDate: formData.expectedDeliveryDate,
//         notes: formData.notes,
//         items: formData.items.map(item => ({
//           productId: item.productId,
//           quantity: item.quantity,
//           unitCost: item.unitCost
//         }))
//       };

//       if (isEditing && editId) {
//         await httpPut(`purchase-orders/${editId}`, payload);
//         Swal.fire("Success", "Purchase order updated successfully", "success");
//       } else {
//         await httpPost("purchase-orders", payload);
//         Swal.fire("Success", "Purchase order created successfully", "success");
//       }
      
//       router.push("/purchase-orders");
//     } catch (err) {
//       handleError(err, router);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getTotalAmount = () => {
//     return formData.items.reduce((sum, item) => sum + item.totalCost, 0);
//   };

//   if (loading && isEditing) {
//     return (
//       <div className="flex h-screen items-center justify-center">
//         <div className="relative">
//           <div className="h-24 w-24 rounded-full border-t-4 border-b-4 border-blue-500 animate-spin"></div>
//           <div className="mt-4 text-center text-xl font-semibold text-gray-700 dark:text-gray-300">
//             Loading Purchase Order...
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
//       <div className="px-4 py-6 md:px-6 xl:px-7.5">
//         <h4 className="text-h4 mb-6">
//           {isEditing ? "Edit Purchase Order" : "Create Purchase Order"}
//         </h4>

//         <form onSubmit={handleSubmit} className="space-y-6">
//           {/* Basic Information */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <div>
//               <label className="mb-2.5 block text-black dark:text-white">
//                 Supplier <span className="text-meta-1">*</span>
//               </label>
//               <select
//                 className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
//                 value={formData.supplierId}
//                 onChange={(e) => setFormData(prev => ({ ...prev, supplierId: e.target.value }))}
//                 required
//               >
//                 <option value="">Select Supplier</option>
//                 {suppliers.map(supplier => (
//                   <option key={supplier._id} value={supplier._id}>
//                     {supplier.name}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div>
//               <label className="mb-2.5 block text-black dark:text-white">
//                 Expected Delivery Date <span className="text-meta-1">*</span>
//               </label>
//               <input
//                 type="date"
//                 className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
//                 value={formData.expectedDeliveryDate}
//                 onChange={(e) => setFormData(prev => ({ ...prev, expectedDeliveryDate: e.target.value }))}
//                 required
//               />
//             </div>
//           </div>

//           <div>
//             <label className="mb-2.5 block text-black dark:text-white">
//               Notes
//             </label>
//             <textarea
//               className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
//               rows={3}
//               value={formData.notes}
//               onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
//               placeholder="Additional notes for this purchase order..."
//             />
//           </div>

//           {/* Items Section */}
//           <div>
//             <div className="flex justify-between items-center mb-4">
//               <h5 className="text-lg font-medium">Order Items</h5>
//               <button
//                 type="button"
//                 onClick={addItem}
//                 className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
//               >
//                 <FaPlus className="w-4 h-4" />
//                 Add Item
//               </button>
//             </div>

//             {formData.items.length === 0 ? (
//               <div className="text-center py-8 text-gray-500">
//                 <p>No items added yet. Click "Add Item" to get started.</p>
//               </div>
//             ) : (
//               <div className="space-y-4">
//                 {formData.items.map((item, index) => (
//                   <div key={index} className="border border-gray-200 rounded-lg p-4">
//                     <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
//                       <div>
//                         <label className="block text-sm font-medium mb-1">Product</label>
//                         <select
//                           className="w-full rounded border border-stroke px-3 py-2 text-sm"
//                           value={item.productId}
//                           onChange={(e) => updateItem(index, 'productId', e.target.value)}
//                           required
//                         >
//                           <option value="">Select Product</option>
//                           {products.map(product => (
//                             <option key={product._id} value={product._id}>
//                               {product.name} ({product.sku})
//                             </option>
//                           ))}
//                         </select>
//                       </div>

//                       <div>
//                         <label className="block text-sm font-medium mb-1">Quantity</label>
//                         <input
//                           type="number"
//                           min="1"
//                           className="w-full rounded border border-stroke px-3 py-2 text-sm"
//                           value={item.quantity}
//                           onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
//                           required
//                         />
//                       </div>

//                       <div>
//                         <label className="block text-sm font-medium mb-1">Unit Cost ($)</label>
//                         <input
//                           type="number"
//                           min="0"
//                           step="0.01"
//                           className="w-full rounded border border-stroke px-3 py-2 text-sm"
//                           value={item.unitCost}
//                           onChange={(e) => updateItem(index, 'unitCost', parseFloat(e.target.value) || 0)}
//                           required
//                         />
//                       </div>

//                       <div>
//                         <label className="block text-sm font-medium mb-1">Total Cost</label>
//                         <input
//                           type="text"
//                           className="w-full rounded border border-stroke px-3 py-2 text-sm bg-gray-50"
//                           value={`$${item.totalCost.toFixed(2)}`}
//                           readOnly
//                         />
//                       </div>

//                       <div className="flex items-end">
//                         <button
//                           type="button"
//                           onClick={() => removeItem(index)}
//                           className="text-red-600 hover:text-red-800"
//                         >
//                           <FaTrash className="w-4 h-4" />
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>

//           {/* Total Amount */}
//           <div className="border-t pt-4">
//             <div className="flex justify-end">
//               <div className="text-right">
//                 <p className="text-lg font-medium">Total Amount: <span className="text-primary">${getTotalAmount().toFixed(2)}</span></p>
//               </div>
//             </div>
//           </div>

//           {/* Action Buttons */}
//           <div className="flex justify-end gap-4">
//             <button
//               type="button"
//               onClick={() => router.push("/purchase-orders")}
//               className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               disabled={loading}
//               className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg disabled:opacity-50"
//             >
//               <FaSave className="w-4 h-4" />
//               {loading ? "Saving..." : (isEditing ? "Update Order" : "Create Order")}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default PurchaseOrderForm;
