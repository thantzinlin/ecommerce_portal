"use client";
import { useState, useEffect } from "react";
import { handleError, httpGet, httpPut } from "@/utils/apiClient";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

interface ProductVariant {
  _id: string;
  size: string;
  color: string;
  weight: string;
  sku: string;
  price: number;
  stockQuantity: number;
  attributeValues: Record<string, string>;
}

interface ProductWithVariants {
  _id: string;
  name: string;
  sku: string;
  currentStock: number;
  stockQuantity: number;
  categoryName: string;
  hasVariants: boolean;
  variants: ProductVariant[];
}

const StockAdjustmentWithVariantsPage = () => {
  const [products, setProducts] = useState<ProductWithVariants[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [selectedVariant, setSelectedVariant] = useState<string>("");
  const [adjustmentType, setAdjustmentType] = useState<"add" | "subtract">("add");
  const [quantity, setQuantity] = useState<number>(0);
  const [notes, setNotes] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  const router = useRouter();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      
      // Mock data for testing - replace with API call
      const mockProducts = [
        {
          _id: "1",
          name: "T-Shirt Basic",
          sku: "TSH-BASIC",
          currentStock: 100,
          stockQuantity: 100,
          categoryName: "Clothing",
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
          currentStock: 50,
          stockQuantity: 50,
          categoryName: "Clothing",
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
            }
          ]
        },
        {
          _id: "3",
          name: "Simple Mug",
          sku: "MUG-SMP",
          currentStock: 200,
          stockQuantity: 200,
          categoryName: "Home",
          hasVariants: false,
          variants: []
        }
      ];
      
      setProducts(mockProducts);
      
      // Comment out API call
      // const response = await httpGet("products?includeVariants=true");
      // const productsData = response.data.data.map((product: any) => ({
      //   ...product,
      //   hasVariants: product.variants && product.variants.length > 0
      // }));
      // setProducts(productsData);
    } catch (err) {
      handleError(err, router);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProduct || quantity <= 0) {
      Swal.fire({
        icon: "error",
        title: "Validation Error",
        text: "Please select a product and enter a valid quantity",
      });
      return;
    }

    const selectedProductData = products.find(p => p._id === selectedProduct);
    if (selectedProductData?.hasVariants && !selectedVariant) {
      Swal.fire({
        icon: "error",
        title: "Validation Error",
        text: "Please select a variant for this product",
      });
      return;
    }

    try {
      setSubmitting(true);
      
      const adjustmentData = {
        adjustmentType: adjustmentType === "add" ? "received" : "damaged",
        adjustmentQuantity: quantity,
        variantId: selectedVariant || null,
        notes: notes || `Manual ${adjustmentType === "add" ? "addition" : "reduction"}`
      };

      // Comment out API call for testing
      // if (selectedVariant) {
      //   await httpPut(`products/${selectedProduct}/variants/${selectedVariant}/stock`, adjustmentData);
      // } else {
      //   await httpPut(`products/${selectedProduct}/stock`, adjustmentData);
      // }

      Swal.fire({
        icon: "success",
        title: "Stock Updated (Mock)",
        text: "Product inventory has been updated successfully",
      });

      console.log("Mock stock adjustment:", {
        productId: selectedProduct,
        variantId: selectedVariant,
        adjustmentData
      });

      // Reset form
      setSelectedProduct("");
      setSelectedVariant("");
      setAdjustmentType("add");
      setQuantity(0);
      setNotes("");
      
      // Refresh products
      // fetchProducts();

    } catch (err) {
      handleError(err, router);
    } finally {
      setSubmitting(false);
    }
  };

  const selectedProductData = products.find(p => p._id === selectedProduct);
  const selectedVariantData = selectedProductData?.variants.find(v => v._id === selectedVariant);

  const getCurrentStock = () => {
    if (selectedVariantData) {
      return selectedVariantData.stockQuantity;
    }
    return selectedProductData?.currentStock || 0;
  };

  const getDisplayName = () => {
    if (selectedVariantData) {
      const attributes = Object.entries(selectedVariantData.attributeValues)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');
      return `${selectedProductData?.name} (${attributes})`;
    }
    return selectedProductData?.name || "";
  };

  const getSKU = () => {
    return selectedVariantData?.sku || selectedProductData?.sku || "";
  };

  if (loading) {
    return (
      <DefaultLayout>
        <Breadcrumb pageName="Stock Adjustment with Variants" />
        <div className="flex h-screen items-center justify-center">
          <div className="relative">
            <div className="h-24 w-24 rounded-full border-t-4 border-b-4 border-blue-500 animate-spin"></div>
            <div className="mt-4 text-center text-xl font-semibold text-gray-700 dark:text-gray-300">
              Loading Products...
            </div>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <Breadcrumb pageName="Stock Adjustment with Variants" />
      <div className="flex flex-col gap-10">
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="px-4 py-6 md:px-6 xl:px-7.5">
            <h4 className="text-h4 mb-6">Manual Stock Adjustment (Variant Support)</h4>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Product Selection */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Select Product <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedProduct}
                  onChange={(e) => {
                    setSelectedProduct(e.target.value);
                    setSelectedVariant(""); // Reset variant selection
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Choose a product...</option>
                  {products.map((product) => (
                    <option key={product._id} value={product._id}>
                      {product.name} - {product.sku} 
                      {product.hasVariants ? " (Has Variants)" : ` (Stock: ${product.currentStock})`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Variant Selection */}
              {selectedProductData?.hasVariants && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Select Variant <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedVariant}
                    onChange={(e) => setSelectedVariant(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Choose a variant...</option>
                    {selectedProductData.variants.map((variant) => {
                      const attributes = Object.entries(variant.attributeValues)
                        .map(([key, value]) => `${key}: ${value}`)
                        .join(', ');
                      return (
                        <option key={variant._id} value={variant._id}>
                          {variant.sku} - {attributes} (Stock: {variant.stockQuantity})
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}

              {/* Current Stock Display */}
              {selectedProductData && (!selectedProductData.hasVariants || selectedVariantData) && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h5 className="font-medium mb-2">Current Stock Information</h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Product:</span> {getDisplayName()}
                    </div>
                    <div>
                      <span className="font-medium">SKU:</span> {getSKU()}
                    </div>
                    <div>
                      <span className="font-medium">Current Stock:</span> {getCurrentStock()}
                    </div>
                  </div>
                  {selectedVariantData && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Size:</span> {selectedVariantData.size}
                        </div>
                        <div>
                          <span className="font-medium">Color:</span> {selectedVariantData.color}
                        </div>
                        <div>
                          <span className="font-medium">Weight:</span> {selectedVariantData.weight}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Adjustment Type */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Adjustment Type <span className="text-red-500">*</span>
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="add"
                      checked={adjustmentType === "add"}
                      onChange={(e) => setAdjustmentType(e.target.value as "add" | "subtract")}
                      className="mr-2"
                    />
                    Add Stock (+)
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="subtract"
                      checked={adjustmentType === "subtract"}
                      onChange={(e) => setAdjustmentType(e.target.value as "add" | "subtract")}
                      className="mr-2"
                    />
                    Reduce Stock (-)
                  </label>
                </div>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Quantity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter quantity"
                  required
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Reason for adjustment (optional)"
                />
              </div>

              {/* Preview */}
              {selectedProductData && (!selectedProductData.hasVariants || selectedVariantData) && quantity > 0 && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h5 className="font-medium mb-2 text-blue-800">Adjustment Preview</h5>
                  <div className="text-sm text-blue-700">
                    <p><strong>Product:</strong> {getDisplayName()}</p>
                    <p><strong>SKU:</strong> {getSKU()}</p>
                    <p><strong>Current Stock:</strong> {getCurrentStock()}</p>
                    <p><strong>Adjustment:</strong> {adjustmentType === "add" ? "+" : "-"}{quantity}</p>
                    <p><strong>New Stock:</strong> {adjustmentType === "add" ? getCurrentStock() + quantity : Math.max(0, getCurrentStock() - quantity)}</p>
                    {selectedVariantData && (
                      <p><strong>Variant:</strong> {Object.entries(selectedVariantData.attributeValues).map(([key, value]) => `${key}: ${value}`).join(', ')}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !selectedProduct || quantity <= 0 || (selectedProductData?.hasVariants && !selectedVariant)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "Updating..." : "Update Stock"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default StockAdjustmentWithVariantsPage;
