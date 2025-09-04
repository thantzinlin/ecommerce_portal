"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { handleError, httpGet, httpPost, httpPut } from "@/utils/apiClient";
import Swal from "sweetalert2";
import { FaPlus, FaTrash, FaSave, FaInfoCircle } from "react-icons/fa";
import { ProductWithVariants, ProductVariant } from "@/types/product";

interface Supplier {
  _id: string;
  name: string;
  email: string;
  phone: string;
}

interface PurchaseOrderItem {
  productId: string;
  productName: string;
  variantId?: string;
  variantSku?: string;
  variantAttributes?: { [key: string]: string };
  quantity: number;
  unitCost: number;
  totalCost: number;
  hasVariants: boolean;
}

interface PurchaseOrderFormData {
  supplierId: string;
  expectedDeliveryDate: string;
  notes: string;
  items: PurchaseOrderItem[];
}

interface PurchaseOrderFormWithVariantsProps {
  editId?: string;
}

const PurchaseOrderFormWithVariants = ({ editId }: PurchaseOrderFormWithVariantsProps = {}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const finalEditId = editId || searchParams.get("_id");

  const [formData, setFormData] = useState<PurchaseOrderFormData>({
    supplierId: "",
    expectedDeliveryDate: "",
    notes: "",
    items: []
  });

  const [products, setProducts] = useState<ProductWithVariants[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  useEffect(() => {
    fetchProducts();
    fetchSuppliers();
    if (finalEditId) {
      setIsEditing(true);
      fetchPurchaseOrder(finalEditId);
    }
  }, [finalEditId]);

  const fetchProducts = async () => {
    try {
      // Mock data for testing
      const mockProducts = [
        {
          _id: "1",
          name: "T-Shirt Basic",
          sku: "TSH-BASIC",
          price: 15.99,
          stockQuantity: 100,
          currentStock: 100,
          lowStockThreshold: 10,
          hasVariants: true,
          variants: [
            {
              _id: "v1",
              size: "S",
              color: "Red",
              weight: "150g",
              sku: "TSH-RED-S",
              price: 15.99,
              stockQuantity: 25,
              attributeValues: { size: "S", color: "Red", weight: "150g" }
            },
            {
              _id: "v2", 
              size: "M",
              color: "Red",
              weight: "160g",
              sku: "TSH-RED-M",
              price: 15.99,
              stockQuantity: 30,
              attributeValues: { size: "M", color: "Red", weight: "160g" }
            },
            {
              _id: "v3",
              size: "L",
              color: "Blue",
              weight: "170g", 
              sku: "TSH-BLU-L",
              price: 16.99,
              stockQuantity: 20,
              attributeValues: { size: "L", color: "Blue", weight: "170g" }
            }
          ]
        },
        {
          _id: "2",
          name: "Jeans Premium",
          sku: "JNS-PREM",
          price: 49.99,
          stockQuantity: 50,
          currentStock: 50,
          lowStockThreshold: 5,
          hasVariants: true,
          variants: [
            {
              _id: "v4",
              size: "30",
              color: "Dark Blue",
              weight: "500g",
              sku: "JNS-DB-30",
              price: 49.99,
              stockQuantity: 15,
              attributeValues: { size: "30", color: "Dark Blue", weight: "500g" }
            },
            {
              _id: "v5",
              size: "32", 
              color: "Dark Blue",
              weight: "520g",
              sku: "JNS-DB-32",
              price: 49.99,
              stockQuantity: 20,
              attributeValues: { size: "32", color: "Dark Blue", weight: "520g" }
            },
            {
              _id: "v6",
              size: "34",
              color: "Light Blue",
              weight: "510g",
              sku: "JNS-LB-34", 
              price: 52.99,
              stockQuantity: 10,
              attributeValues: { size: "34", color: "Light Blue", weight: "510g" }
            }
          ]
        },
        {
          _id: "3",
          name: "Simple Mug",
          sku: "MUG-SMP",
          price: 8.99,
          stockQuantity: 200,
          currentStock: 200,
          lowStockThreshold: 20,
          hasVariants: false,
          variants: []
        }
      ];
      
      setProducts(mockProducts);
      
      // Comment out API call
      // const response = await httpGet("products?perPage=1000&includeVariants=true");
      // const productsData = response.data.data.map((product: any) => ({
      //   ...product,
      //   hasVariants: product.variants && product.variants.length > 0
      // }));
      // setProducts(productsData);
    } catch (err) {
      handleError(err, router);
    }
  };

  const fetchSuppliers = async () => {
    try {
      // Mock suppliers data for testing
      const mockSuppliers = [
        {
          _id: "sup1",
          name: "Fashion Wholesale Co.",
          email: "orders@fashionwholesale.com",
          phone: "+1-555-0123",
          address: "123 Fashion Street, NY 10001"
        },
        {
          _id: "sup2", 
          name: "Textile Masters Ltd.",
          email: "supply@textilemasters.com",
          phone: "+1-555-0456",
          address: "456 Textile Ave, CA 90210"
        },
        {
          _id: "sup3",
          name: "Home Goods Supply",
          email: "info@homegoods.com", 
          phone: "+1-555-0789",
          address: "789 Home Blvd, TX 75001"
        }
      ];
      
      setSuppliers(mockSuppliers);
      
      // Comment out API call
      // const response = await httpGet("suppliers?perPage=1000");
      // setSuppliers(response.data.data);
    } catch (err) {
      handleError(err, router);
    }
  };

  const fetchPurchaseOrder = async (id: string) => {
    try {
      setLoading(true);
      
      // Comment out API call - use mock data for testing
      // const response = await httpGet(`purchase-orders/${id}`);
      // const order = response.data.data;
      
      // Mock data for editing - you can uncomment and modify as needed
      // setFormData({
      //   supplierId: "sup1",
      //   expectedDeliveryDate: "2025-08-20",
      //   notes: "Sample purchase order for testing",
      //   items: [{
      //     productId: "1",
      //     productName: "T-Shirt Basic",
      //     variantId: "v1",
      //     variantSku: "TSH-RED-S",
      //     quantity: 10,
      //     unitCost: 15.99,
      //     totalCost: 159.90
      //   }]
      // });
    } catch (err) {
      handleError(err, router);
    } finally {
      setLoading(false);
    }
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, {
        productId: "",
        productName: "",
        variantId: undefined,
        variantSku: undefined,
        variantAttributes: undefined,
        quantity: 1,
        unitCost: 0,
        totalCost: 0,
        hasVariants: false
      }]
    }));
  };

  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const updateItem = (index: number, field: keyof PurchaseOrderItem, value: any) => {
    setFormData(prev => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], [field]: value };

      // Auto-calculate total cost
      if (field === 'quantity' || field === 'unitCost') {
        newItems[index].totalCost = newItems[index].quantity * newItems[index].unitCost;
      }

      // Auto-fill product details when product is selected
      if (field === 'productId') {
        const selectedProduct = products.find(p => p._id === value);
        if (selectedProduct) {
          newItems[index].productName = selectedProduct.name;
          newItems[index].hasVariants = selectedProduct.hasVariants;
          
          // Reset variant fields when changing product
          newItems[index].variantId = undefined;
          newItems[index].variantSku = undefined;
          newItems[index].variantAttributes = undefined;
          
          // If product has no variants, use product's base price
          if (!selectedProduct.hasVariants) {
            newItems[index].unitCost = selectedProduct.variants?.[0]?.price || 0;
            newItems[index].totalCost = newItems[index].quantity * newItems[index].unitCost;
          }
        }
      }

      // Auto-fill variant details when variant is selected
      if (field === 'variantId') {
        const selectedProduct = products.find(p => p._id === newItems[index].productId);
        const selectedVariant = selectedProduct?.variants?.find(v => v._id === value);
        if (selectedVariant) {
          newItems[index].variantSku = selectedVariant.sku;
          newItems[index].variantAttributes = selectedVariant.attributeValues;
          newItems[index].unitCost = selectedVariant.price;
          newItems[index].totalCost = newItems[index].quantity * selectedVariant.price;
        }
      }

      return { ...prev, items: newItems };
    });
  };

  const getVariantDisplayName = (variant: ProductVariant) => {
    const attributes = Object.entries(variant.attributeValues)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
    return `${variant.sku} (${attributes})`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.supplierId) {
      Swal.fire("Error", "Please select a supplier", "error");
      return;
    }

    if (formData.items.length === 0) {
      Swal.fire("Error", "Please add at least one item", "error");
      return;
    }

    // Validate items
    for (const item of formData.items) {
      if (!item.productId || item.quantity <= 0 || item.unitCost <= 0) {
        Swal.fire("Error", "Please fill in all item details correctly", "error");
        return;
      }
      
      // If product has variants, ensure variant is selected
      if (item.hasVariants && !item.variantId) {
        Swal.fire("Error", "Please select a variant for products that have variants", "error");
        return;
      }
    }

    try {
      setLoading(true);
      
      const payload = {
        supplierId: formData.supplierId,
        expectedDeliveryDate: formData.expectedDeliveryDate,
        notes: formData.notes,
        items: formData.items.map(item => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          unitCost: item.unitCost
        }))
      };

      // Comment out API calls for testing with mock data
      if (isEditing && finalEditId) {
        // await httpPut(`purchase-orders/${finalEditId}`, payload);
        Swal.fire("Success", "Purchase order updated successfully (Mock)", "success");
      } else {
        // await httpPost("purchase-orders", payload);
        Swal.fire("Success", "Purchase order created successfully (Mock)", "success");
      }
      
      // Comment out navigation for testing
      // router.push("/purchase-orders");
      
      console.log("Mock Purchase Order Payload:", payload);
    } catch (err) {
      handleError(err, router);
    } finally {
      setLoading(false);
    }
  };

  const getTotalAmount = () => {
    return formData.items.reduce((sum, item) => sum + item.totalCost, 0);
  };

  if (loading && isEditing) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="relative">
          <div className="h-24 w-24 rounded-full border-t-4 border-b-4 border-blue-500 animate-spin"></div>
          <div className="mt-4 text-center text-xl font-semibold text-gray-700 dark:text-gray-300">
            Loading Purchase Order...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="px-4 py-6 md:px-6 xl:px-7.5">
        <h4 className="text-h4 mb-6">
          {isEditing ? "Edit Purchase Order" : "Create Purchase Order"}
        </h4>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="mb-2.5 block text-black dark:text-white">
                Supplier <span className="text-meta-1">*</span>
              </label>
              <select
                className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                value={formData.supplierId}
                onChange={(e) => setFormData(prev => ({ ...prev, supplierId: e.target.value }))}
                required
              >
                <option value="">Select Supplier</option>
                {suppliers.map(supplier => (
                  <option key={supplier._id} value={supplier._id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2.5 block text-black dark:text-white">
                Expected Delivery Date <span className="text-meta-1">*</span>
              </label>
              <input
                type="date"
                className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                value={formData.expectedDeliveryDate}
                onChange={(e) => setFormData(prev => ({ ...prev, expectedDeliveryDate: e.target.value }))}
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-2.5 block text-black dark:text-white">
              Notes
            </label>
            <textarea
              className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Additional notes for this purchase order..."
            />
          </div>

          {/* Items Section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h5 className="text-lg font-medium">Order Items</h5>
              <button
                type="button"
                onClick={addItem}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                <FaPlus className="w-4 h-4" />
                Add Item
              </button>
            </div>

            {formData.items.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No items added yet. Click "Add Item" to get started.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {formData.items.map((item, index) => {
                  const selectedProduct = products.find(p => p._id === item.productId);
                  
                  return (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Product</label>
                          <select
                            className="w-full rounded border border-stroke px-3 py-2 text-sm"
                            value={item.productId}
                            onChange={(e) => updateItem(index, 'productId', e.target.value)}
                            required
                          >
                            <option value="">Select Product</option>
                            {products.map(product => (
                              <option key={product._id} value={product._id}>
                                {product.name} {product.hasVariants && '(Has Variants)'}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Variant Selection - Only show if product has variants */}
                        {item.hasVariants && selectedProduct?.variants && (
                          <div>
                            <label className="block text-sm font-medium mb-1">
                              Variant <span className="text-red-500">*</span>
                            </label>
                            <select
                              className="w-full rounded border border-stroke px-3 py-2 text-sm"
                              value={item.variantId || ""}
                              onChange={(e) => updateItem(index, 'variantId', e.target.value)}
                              required
                            >
                              <option value="">Select Variant</option>
                              {selectedProduct.variants.map(variant => (
                                <option key={variant._id} value={variant._id}>
                                  {getVariantDisplayName(variant)} - ${variant.price}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

                        <div>
                          <label className="block text-sm font-medium mb-1">Quantity</label>
                          <input
                            type="number"
                            min="1"
                            className="w-full rounded border border-stroke px-3 py-2 text-sm"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-1">Unit Cost ($)</label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            className="w-full rounded border border-stroke px-3 py-2 text-sm"
                            value={item.unitCost}
                            onChange={(e) => updateItem(index, 'unitCost', parseFloat(e.target.value) || 0)}
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-1">Total Cost</label>
                          <input
                            type="text"
                            className="w-full rounded border border-stroke px-3 py-2 text-sm bg-gray-50"
                            value={`$${item.totalCost.toFixed(2)}`}
                            readOnly
                          />
                        </div>

                        <div className="flex items-end">
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <FaTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Show variant info if selected */}
                      {item.variantAttributes && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <FaInfoCircle className="text-blue-500 w-4 h-4" />
                            <span className="text-sm font-medium text-blue-700">Variant Details</span>
                          </div>
                          <div className="text-sm text-blue-600">
                            <p><strong>SKU:</strong> {item.variantSku}</p>
                            <p><strong>Attributes:</strong> {Object.entries(item.variantAttributes)
                              .map(([key, value]) => `${key}: ${value}`).join(', ')}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Total Amount */}
          <div className="border-t pt-4">
            <div className="flex justify-end">
              <div className="text-right">
                <p className="text-lg font-medium">Total Amount: <span className="text-primary">${getTotalAmount().toFixed(2)}</span></p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.push("/purchase-orders")}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg disabled:opacity-50"
            >
              <FaSave className="w-4 h-4" />
              {loading ? "Saving..." : (isEditing ? "Update Order" : "Create Order")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PurchaseOrderFormWithVariants;
