"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { handleError, httpGet, httpPut } from "@/utils/apiClient";
import Swal from "sweetalert2";
import { FaCheck, FaExclamationTriangle, FaInfoCircle } from "react-icons/fa";

interface PurchaseOrderItem {
  _id: string;
  productId: string;
  productName: string;
  variantId?: string;
  variantSku?: string;
  variantAttributes?: { [key: string]: string };
  quantity: number;
  unitCost: number;
  totalCost: number;
  receivedQuantity: number;
  status: "pending" | "received" | "partial";
  currentStock?: number;
}

interface PurchaseOrder {
  _id: string;
  orderNumber: string;
  supplierName: string;
  status: string;
  items: PurchaseOrderItem[];
  totalAmount: number;
  orderDate: string;
  expectedDeliveryDate: string;
}

interface ReceiveInventoryProps {
  purchaseOrderId: string;
  onClose?: () => void;
  onSuccess?: () => void;
}

const ReceiveInventoryWithVariants: React.FC<ReceiveInventoryProps> = ({
  purchaseOrderId,
  onClose,
  onSuccess
}) => {
  const [purchaseOrder, setPurchaseOrder] = useState<PurchaseOrder | null>(null);
  const [receivingData, setReceivingData] = useState<{
    [itemId: string]: {
      receivedQuantity: number;
      notes: string;
      qualityCheck: "passed" | "failed" | "partial";
    };
  }>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    fetchPurchaseOrder();
  }, [purchaseOrderId]);

  const fetchPurchaseOrder = async () => {
    try {
      setLoading(true);
      const response = await httpGet(`purchase-orders/${purchaseOrderId}`);
      const order = response.data.data;
      setPurchaseOrder(order);

      // Initialize receiving data for each item
      const initialReceivingData: typeof receivingData = {};
      order.items.forEach((item: PurchaseOrderItem) => {
        initialReceivingData[item._id] = {
          receivedQuantity: item.quantity - item.receivedQuantity, // Default to remaining quantity
          notes: "",
          qualityCheck: "passed"
        };
      });
      setReceivingData(initialReceivingData);
    } catch (err) {
      handleError(err, router);
    } finally {
      setLoading(false);
    }
  };

  const updateReceivingData = (
    itemId: string,
    field: keyof typeof receivingData[string],
    value: any
  ) => {
    setReceivingData(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [field]: value
      }
    }));
  };

  const getVariantDisplayName = (item: PurchaseOrderItem) => {
    if (!item.variantAttributes) return item.productName;
    
    const attributes = Object.entries(item.variantAttributes)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
    return `${item.productName} (${attributes})`;
  };

  const getRemainingQuantity = (item: PurchaseOrderItem) => {
    return item.quantity - item.receivedQuantity;
  };

  const getQualityCheckColor = (status: string) => {
    switch (status) {
      case 'passed': return 'text-green-600 bg-green-50';
      case 'failed': return 'text-red-600 bg-red-50';
      case 'partial': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const handleSubmit = async () => {
    // Validate that at least one item has received quantity > 0
    const hasItemsToReceive = Object.values(receivingData).some(data => data.receivedQuantity > 0);
    
    if (!hasItemsToReceive) {
      Swal.fire("Error", "Please specify received quantities for at least one item", "error");
      return;
    }

    // Validate received quantities don't exceed ordered quantities
    const invalidItems = purchaseOrder?.items.filter(item => {
      const receivingItem = receivingData[item._id];
      const maxReceivable = getRemainingQuantity(item);
      return receivingItem.receivedQuantity > maxReceivable;
    });

    if (invalidItems && invalidItems.length > 0) {
      Swal.fire("Error", "Received quantity cannot exceed the remaining quantity to receive", "error");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        purchaseOrderId,
        receivedDate: new Date().toISOString(),
        items: purchaseOrder?.items
          .filter(item => receivingData[item._id].receivedQuantity > 0)
          .map(item => ({
            itemId: item._id,
            productId: item.productId,
            variantId: item.variantId, // Include variant ID for proper stock update
            receivedQuantity: receivingData[item._id].receivedQuantity,
            notes: receivingData[item._id].notes,
            qualityCheck: receivingData[item._id].qualityCheck
          })) || []
      };

      await httpPut(`purchase-orders/${purchaseOrderId}/receive-inventory`, payload);

      Swal.fire({
        icon: "success",
        title: "Inventory Received",
        text: "Inventory has been successfully received and stock updated",
      });

      onSuccess?.();
    } catch (err) {
      handleError(err, router);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="relative">
          <div className="h-12 w-12 rounded-full border-t-4 border-b-4 border-blue-500 animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!purchaseOrder) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600">Purchase order not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Receive Inventory - {purchaseOrder.orderNumber}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Supplier: {purchaseOrder.supplierName}
          </p>
        </div>

        <div className="p-6">
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <FaInfoCircle className="text-blue-500" />
              <span className="font-medium text-blue-700">Instructions</span>
            </div>
            <ul className="text-sm text-blue-600 space-y-1">
              <li>• Enter the actual quantity received for each item</li>
              <li>• Specify quality check status for each item</li>
              <li>• Add notes for any discrepancies or issues</li>
              <li>• Stock will be automatically updated for the correct variants</li>
            </ul>
          </div>

          <div className="space-y-4">
            {purchaseOrder.items.map((item) => {
              const remainingQty = getRemainingQuantity(item);
              const receivingItem = receivingData[item._id];

              return (
                <div key={item._id} className="border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    {/* Product Info */}
                    <div className="lg:col-span-4">
                      <h4 className="font-medium text-gray-900">
                        {getVariantDisplayName(item)}
                      </h4>
                      {item.variantSku && (
                        <p className="text-sm text-gray-600">SKU: {item.variantSku}</p>
                      )}
                      {item.variantAttributes && (
                        <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                          <strong>Variant:</strong> {Object.entries(item.variantAttributes)
                            .map(([key, value]) => `${key}: ${value}`).join(', ')}
                        </div>
                      )}
                    </div>

                    {/* Quantities */}
                    <div className="lg:col-span-2">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Ordered
                      </label>
                      <div className="text-sm font-medium">{item.quantity}</div>
                    </div>

                    <div className="lg:col-span-2">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Previously Received
                      </label>
                      <div className="text-sm">{item.receivedQuantity}</div>
                    </div>

                    <div className="lg:col-span-2">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Remaining
                      </label>
                      <div className="text-sm font-medium text-orange-600">{remainingQty}</div>
                    </div>

                    <div className="lg:col-span-2">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Receiving Now <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        max={remainingQty}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        value={receivingItem?.receivedQuantity || 0}
                        onChange={(e) => updateReceivingData(
                          item._id,
                          'receivedQuantity',
                          parseInt(e.target.value) || 0
                        )}
                      />
                    </div>
                  </div>

                  {/* Quality Check and Notes */}
                  <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Quality Check
                      </label>
                      <select
                        className={`w-full px-3 py-2 border border-gray-300 rounded-md text-sm ${getQualityCheckColor(receivingItem?.qualityCheck || 'passed')}`}
                        value={receivingItem?.qualityCheck || 'passed'}
                        onChange={(e) => updateReceivingData(
                          item._id,
                          'qualityCheck',
                          e.target.value as "passed" | "failed" | "partial"
                        )}
                      >
                        <option value="passed">✅ Passed</option>
                        <option value="partial">⚠️ Partial (Some Issues)</option>
                        <option value="failed">❌ Failed</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Notes
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        placeholder="Any issues or notes..."
                        value={receivingItem?.notes || ''}
                        onChange={(e) => updateReceivingData(item._id, 'notes', e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Warnings */}
                  {receivingItem && receivingItem.receivedQuantity > remainingQty && (
                    <div className="mt-3 p-3 bg-red-50 rounded-lg flex items-center gap-2">
                      <FaExclamationTriangle className="text-red-500" />
                      <span className="text-sm text-red-700">
                        Received quantity cannot exceed remaining quantity ({remainingQty})
                      </span>
                    </div>
                  )}

                  {receivingItem && receivingItem.qualityCheck === 'failed' && (
                    <div className="mt-3 p-3 bg-yellow-50 rounded-lg flex items-center gap-2">
                      <FaExclamationTriangle className="text-yellow-500" />
                      <span className="text-sm text-yellow-700">
                        Failed quality check - please add detailed notes
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg disabled:opacity-50"
            >
              <FaCheck className="w-4 h-4" />
              {submitting ? "Processing..." : "Receive Inventory"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiveInventoryWithVariants;
