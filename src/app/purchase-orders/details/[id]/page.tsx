"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { handleError, httpGet } from "@/utils/apiClient";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { format } from "date-fns";
import { FaEdit, FaTruck, FaBoxes, FaArrowLeft } from "react-icons/fa";

interface PurchaseOrderItem {
  _id: string;
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  receivedQuantity: number;
  status: 'pending' | 'received' | 'partial';
}

interface PurchaseOrder {
  _id: string;
  orderNumber: string;
  supplierId: string;
  supplierName: string;
  items: PurchaseOrderItem[];
  totalAmount: number;
  status: 'pending' | 'ordered' | 'shipped' | 'received' | 'cancelled';
  orderDate: string;
  expectedDeliveryDate: string;
  actualDeliveryDate?: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

const PurchaseOrderDetailsPage = () => {
  const params = useParams();
  const router = useRouter();
  const [purchaseOrder, setPurchaseOrder] = useState<PurchaseOrder | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (params.id) {
      fetchPurchaseOrder(params.id as string);
    }
  }, [params.id]);

  const fetchPurchaseOrder = async (id: string) => {
    try {
      setLoading(true);
      const response = await httpGet(`purchase-orders/${id}`);
      setPurchaseOrder(response.data.data);
    } catch (err) {
      handleError(err, router);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'ordered': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'received': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'ordered': return '📋';
      case 'shipped': return <FaTruck className="w-4 h-4" />;
      case 'received': return <FaBoxes className="w-4 h-4" />;
      case 'cancelled': return '❌';
      default: return '📄';
    }
  };

  if (loading) {
    return (
      <DefaultLayout>
        <div className="flex h-screen items-center justify-center">
          <div className="relative">
            <div className="h-24 w-24 rounded-full border-t-4 border-b-4 border-blue-500 animate-spin"></div>
            <div className="mt-4 text-center text-xl font-semibold text-gray-700 dark:text-gray-300">
              Loading Purchase Order Details...
            </div>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  if (!purchaseOrder) {
    return (
      <DefaultLayout>
        <div className="text-center text-red-600">Purchase order not found.</div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <Breadcrumb pageName="Purchase Order Details" />
      <div className="flex flex-col gap-10">
        {/* Header */}
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="px-4 py-6 md:px-6 xl:px-7.5">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h4 className="text-h4 mb-2">{purchaseOrder.orderNumber}</h4>
                <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getStatusColor(purchaseOrder.status)}`}>
                  <span className="mr-2">{getStatusIcon(purchaseOrder.status)}</span>
                  {purchaseOrder.status.toUpperCase()}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => router.push(`/purchase-orders/edit/${purchaseOrder._id}`)}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                >
                  <FaEdit className="w-4 h-4" />
                  Edit
                </button>
                {purchaseOrder.status === 'shipped' && (
                  <button
                    onClick={() => router.push(`/purchase-orders/view?_id=${purchaseOrder._id}`)}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                  >
                    <FaBoxes className="w-4 h-4" />
                    Receive
                  </button>
                )}
              </div>
            </div>

            {/* Order Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div>
                <h5 className="text-sm font-medium text-gray-500 mb-1">Supplier</h5>
                <p className="text-lg font-semibold">{purchaseOrder.supplierName}</p>
              </div>
              <div>
                <h5 className="text-sm font-medium text-gray-500 mb-1">Order Date</h5>
                <p className="text-lg font-semibold">{format(new Date(purchaseOrder.orderDate), 'MMM dd, yyyy')}</p>
              </div>
              <div>
                <h5 className="text-sm font-medium text-gray-500 mb-1">Expected Delivery</h5>
                <p className="text-lg font-semibold">{format(new Date(purchaseOrder.expectedDeliveryDate), 'MMM dd, yyyy')}</p>
              </div>
              <div>
                <h5 className="text-sm font-medium text-gray-500 mb-1">Total Amount</h5>
                <p className="text-lg font-semibold text-primary">${purchaseOrder.totalAmount.toFixed(2)}</p>
              </div>
            </div>

            {purchaseOrder.notes && (
              <div className="mb-6">
                <h5 className="text-sm font-medium text-gray-500 mb-2">Notes</h5>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{purchaseOrder.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Items Table */}
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="px-4 py-6 md:px-6 xl:px-7.5">
            <h4 className="text-h4 mb-6">Order Items</h4>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-stroke">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="th">Product</th>
                    <th className="th">SKU</th>
                    <th className="th">Quantity</th>
                    <th className="th">Unit Cost</th>
                    <th className="th">Total Cost</th>
                    <th className="th">Received</th>
                    <th className="th">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                  {purchaseOrder.items.map((item) => (
                    <tr key={item._id} className="border-t border-stroke">
                      <td className="td font-medium">{item.productName}</td>
                      <td className="td">{item.productSku}</td>
                      <td className="td">{item.quantity}</td>
                      <td className="td">${item.unitCost.toFixed(2)}</td>
                      <td className="td">${item.totalCost.toFixed(2)}</td>
                      <td className="td">{item.receivedQuantity}</td>
                      <td className="td">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          item.status === 'received' ? 'bg-green-100 text-green-800' :
                          item.status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary */}
            <div className="mt-6 flex justify-end">
              <div className="text-right">
                <p className="text-lg font-medium">Total Amount: <span className="text-primary">${purchaseOrder.totalAmount.toFixed(2)}</span></p>
              </div>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="flex justify-start">
          <button
            onClick={() => router.push("/purchase-orders")}
            className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
          >
            <FaArrowLeft className="w-4 h-4" />
            Back to Purchase Orders
          </button>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default PurchaseOrderDetailsPage;
