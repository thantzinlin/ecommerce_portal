"use client";

import { useState, useEffect } from "react";
import { handleError, httpGet, httpPut } from "@/utils/apiClient";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { format } from "date-fns";
import { FaCheck, FaTimes, FaBoxes, FaExclamationTriangle } from "react-icons/fa";

interface ReceiveInventoryProps {
  purchaseOrderId: string;
  onComplete?: () => void;
}

interface PurchaseOrderItem {
  _id: string;
  productId: string;
  productName: string;
  productSku: string;
  orderedQuantity: number;
  unitCost: number;
  totalCost: number;
  receivedQuantity: number;
  status: 'pending' | 'received' | 'partial';
  currentStock: number;
}
// 
interface PurchaseOrder {
  _id: string;
  orderNumber: string;
  supplierName: string;
  status: string;
  orderDate: string;
  expectedDeliveryDate: string;
  items: PurchaseOrderItem[];
}

const ReceiveInventory: React.FC<ReceiveInventoryProps> = ({ 
  purchaseOrderId, 
  onComplete 
}) => {
  const [purchaseOrder, setPurchaseOrder] = useState<PurchaseOrder | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [receivingItems, setReceivingItems] = useState<{
    [key: string]: {
      receivedQuantity: number;
      notes: string;
      qualityCheck: 'passed' | 'failed' | 'pending';
    };
  }>({});
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
      
      // Initialize receiving items
      const initialReceiving = order.items.reduce((acc: any, item: PurchaseOrderItem) => {
        acc[item._id] = {
          receivedQuantity: 0,
          notes: '',
          qualityCheck: 'pending'
        };
        return acc;
      }, {});
      setReceivingItems(initialReceiving);
    } catch (err) {
      handleError(err, router);
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (itemId: string, quantity: number) => {
    setReceivingItems(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        receivedQuantity: Math.max(0, quantity)
      }
    }));
  };

  const handleNotesChange = (itemId: string, notes: string) => {
    setReceivingItems(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        notes
      }
    }));
  };

  const handleQualityCheck = (itemId: string, status: 'passed' | 'failed') => {
    setReceivingItems(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        qualityCheck: status
      }
    }));
  };

  const validateReceiving = () => {
    const errors: string[] = [];
    
    purchaseOrder?.items.forEach(item => {
      const receiving = receivingItems[item._id];
      if (receiving.receivedQuantity > item.orderedQuantity) {
        errors.push(`${item.productName}: Received quantity cannot exceed ordered quantity`);
      }
      if (receiving.qualityCheck === 'pending') {
        errors.push(`${item.productName}: Quality check is required`);
      }
    });

    return errors;
  };

  const handleReceiveInventory = async () => {
    const errors = validateReceiving();
    if (errors.length > 0) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Errors',
        html: errors.map(error => `<p>• ${error}</p>`).join(''),
      });
      return;
    }

    try {
      setSubmitting(true);
      
      const receiveData = {
        purchaseOrderId,
        receivedDate: new Date().toISOString(),
        items: Object.entries(receivingItems).map(([itemId, data]) => ({
          itemId,
          receivedQuantity: data.receivedQuantity,
          notes: data.notes,
          qualityCheck: data.qualityCheck
        }))
      };

      await httpPut(`purchase-orders/${purchaseOrderId}/receive-inventory`, receiveData);

      Swal.fire({
        icon: 'success',
        title: 'Inventory Received Successfully!',
        text: 'Product stock levels have been updated.',
        showConfirmButton: true,
        confirmButtonText: 'View Updated Inventory'
      }).then((result) => {
        if (result.isConfirmed) {
          router.push('/products');
        }
        if (onComplete) {
          onComplete();
        }
      });

    } catch (err) {
      handleError(err, router);
    } finally {
      setSubmitting(false);
    }
  };

  const getQualityCheckColor = (status: string) => {
    switch (status) {
      case 'passed': return 'text-green-600';
      case 'failed': return 'text-red-600';
      default: return 'text-yellow-600';
    }
  };

  const getQualityCheckIcon = (status: string) => {
    switch (status) {
      case 'passed': return <FaCheck className="w-4 h-4" />;
      case 'failed': return <FaTimes className="w-4 h-4" />;
      default: return <FaExclamationTriangle className="w-4 h-4" />;
    }
  };

  if (loading) {
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

  if (!purchaseOrder) {
    return <div className="text-center text-red-600">Purchase order not found</div>;
  }

  return (
    <div className="rounded-lg border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Receive Inventory</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium">Order #:</span> {purchaseOrder.orderNumber}
          </div>
          <div>
            <span className="font-medium">Supplier:</span> {purchaseOrder.supplierName}
          </div>
          <div>
            <span className="font-medium">Expected Delivery:</span> {format(new Date(purchaseOrder.expectedDeliveryDate), 'MMM dd, yyyy')}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {purchaseOrder.items.map((item) => {
          const receiving = receivingItems[item._id];
          const remainingToReceive = item.orderedQuantity - item.receivedQuantity;
          
          return (
            <div key={item._id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-medium text-lg">{item.productName}</h4>
                  <p className="text-sm text-gray-600">SKU: {item.productSku}</p>
                  <p className="text-sm text-gray-600">
                    Current Stock: {item.currentStock} | 
                    Ordered: {item.orderedQuantity} | 
                    Already Received: {item.receivedQuantity}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Unit Cost: ${item.unitCost}</p>
                  <p className="text-sm text-gray-600">Total Cost: ${item.totalCost}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Quantity Input */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Quantity to Receive (Max: {remainingToReceive})
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={remainingToReceive}
                    value={receiving.receivedQuantity}
                    onChange={(e) => handleQuantityChange(item._id, parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Quality Check */}
                <div>
                  <label className="block text-sm font-medium mb-1">Quality Check</label>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleQualityCheck(item._id, 'passed')}
                      className={`px-3 py-2 rounded-md border ${
                        receiving.qualityCheck === 'passed'
                          ? 'bg-green-100 border-green-500 text-green-700'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <FaCheck className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleQualityCheck(item._id, 'failed')}
                      className={`px-3 py-2 rounded-md border ${
                        receiving.qualityCheck === 'failed'
                          ? 'bg-red-100 border-red-500 text-red-700'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <FaTimes className="w-4 h-4" />
                    </button>
                  </div>
                  <span className={`text-sm ${getQualityCheckColor(receiving.qualityCheck)}`}>
                    {getQualityCheckIcon(receiving.qualityCheck)}
                    {receiving.qualityCheck === 'passed' && ' Passed'}
                    {receiving.qualityCheck === 'failed' && ' Failed'}
                    {receiving.qualityCheck === 'pending' && ' Pending'}
                  </span>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium mb-1">Notes</label>
                  <textarea
                    value={receiving.notes}
                    onChange={(e) => handleNotesChange(item._id, e.target.value)}
                    placeholder="Any notes about received items..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                  />
                </div>
              </div>

              {/* Warning if quantity exceeds ordered */}
              {receiving.receivedQuantity > remainingToReceive && (
                <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded text-red-700 text-sm">
                  ⚠️ Received quantity exceeds remaining ordered quantity
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex justify-end space-x-3">
        <button
          onClick={() => router.back()}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={handleReceiveInventory}
          disabled={submitting}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {submitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Receiving...
            </>
          ) : (
            <>
              <FaBoxes className="w-4 h-4 mr-2" />
              Receive Inventory
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ReceiveInventory;
