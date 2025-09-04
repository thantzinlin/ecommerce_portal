"use client";

import { useState, useEffect } from "react";
import { handleError, httpGet, httpPut } from "@/utils/apiClient";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { format } from "date-fns";
import { FaEye, FaCheck, FaTruck, FaBoxes, FaEdit } from "react-icons/fa";
import Pagination from "../Pagination";

interface PurchaseOrder {
  _id: string;
  orderNumber: string;
  supplierName: string;
  totalAmount: number;
  status: 'pending' | 'ordered' | 'shipped' | 'received' | 'cancelled';
  orderDate: string;
  expectedDeliveryDate: string;
  actualDeliveryDate?: string;
  items: PurchaseOrderItem[];
}

interface PurchaseOrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  receivedQuantity: number;
  status: 'pending' | 'received' | 'partial' | 'cancelled';
}

const PurchaseOrderList = () => {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [filters, setFilters] = useState({
    status: '',
    supplier: '',
    fromDate: '',
    toDate: ''
  });

  const router = useRouter();

  useEffect(() => {
    fetchPurchaseOrders();
  }, [currentPage, filters]);

  const fetchPurchaseOrders = async () => {
    try {
      setLoading(true);
      
      // Mock purchase orders data for testing
      const mockPurchaseOrders = [
        {
          _id: "po1",
          orderNumber: "PO-2025-000001",
          supplierName: "Fashion Wholesale Co.",
          totalAmount: 159.90,
          status: "pending" as const,
          orderDate: "2025-08-10T00:00:00.000Z",
          expectedDeliveryDate: "2025-08-20T00:00:00.000Z",
          items: [
            {
              _id: "item1",
              productId: "1",
              productName: "T-Shirt Basic",
              variantSku: "TSH-RED-S",
              quantity: 10,
              unitCost: 15.99,
              totalCost: 159.90,
              receivedQuantity: 0,
              status: "pending" as const
            }
          ]
        },
        {
          _id: "po2", 
          orderNumber: "PO-2025-000002",
          supplierName: "Textile Masters Ltd.",
          totalAmount: 999.80,
          status: "ordered" as const,
          orderDate: "2025-08-12T00:00:00.000Z",
          expectedDeliveryDate: "2025-08-25T00:00:00.000Z",
          items: [
            {
              _id: "item2",
              productId: "2",
              productName: "Jeans Premium",
              variantSku: "JNS-DB-30",
              quantity: 20,
              unitCost: 49.99,
              totalCost: 999.80,
              receivedQuantity: 0,
              status: "pending" as const
            }
          ]
        },
        {
          _id: "po3",
          orderNumber: "PO-2025-000003", 
          supplierName: "Home Goods Supply",
          totalAmount: 179.80,
          status: "shipped" as const,
          orderDate: "2025-08-08T00:00:00.000Z",
          expectedDeliveryDate: "2025-08-18T00:00:00.000Z",
          items: [
            {
              _id: "item3",
              productId: "3",
              productName: "Simple Mug",
              variantSku: null,
              quantity: 20,
              unitCost: 8.99,
              totalCost: 179.80,
              receivedQuantity: 0,
              status: "pending" as const
            }
          ]
        },
        {
          _id: "po4",
          orderNumber: "PO-2025-000004",
          supplierName: "Fashion Wholesale Co.",
          totalAmount: 339.80,
          status: "received" as const,
          orderDate: "2025-08-05T00:00:00.000Z",
          expectedDeliveryDate: "2025-08-15T00:00:00.000Z",
          actualDeliveryDate: "2025-08-14T00:00:00.000Z",
          items: [
            {
              _id: "item4",
              productId: "1",
              productName: "T-Shirt Basic",
              variantSku: "TSH-BLU-L",
              quantity: 20,
              unitCost: 16.99,
              totalCost: 339.80,
              receivedQuantity: 20,
              status: "received" as const
            }
          ]
        },
        {
          _id: "po5",
          orderNumber: "PO-2025-000005",
          supplierName: "Textile Masters Ltd.",
          totalAmount: 529.90,
          status: "cancelled" as const,
          orderDate: "2025-08-01T00:00:00.000Z",
          expectedDeliveryDate: "2025-08-10T00:00:00.000Z",
          items: [
            {
              _id: "item5",
              productId: "2",
              productName: "Jeans Premium",
              variantSku: "JNS-LB-34",
              quantity: 10,
              unitCost: 52.99,
              totalCost: 529.90,
              receivedQuantity: 0,
              status: "cancelled" as const
            }
          ]
        }
      ];
      
      setPurchaseOrders(mockPurchaseOrders);
      
      // Comment out API call
      // const response = await httpGet("purchase-orders?perPage=1000");
      // setPurchaseOrders(response.data.data);
    } catch (err) {
      handleError(err, router);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      // Comment out API call for testing with mock data
      // await httpPut(`purchase-orders/${orderId}/status`, { status: newStatus });
      
      Swal.fire({
        icon: "success",
        title: "Status Updated (Mock)",
        text: `Purchase order status updated to ${newStatus}`,
      });
      
      console.log(`Mock status update: Order ${orderId} -> ${newStatus}`);
      
      // fetchPurchaseOrders();
    } catch (err) {
      handleError(err, router);
    }
  };

  const navigateToReceive = (orderId: string) => {
    router.push(`/purchase-orders/receive/${orderId}`);
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
      <div className="flex h-screen items-center justify-center">
        <div className="relative">
          <div className="h-24 w-24 rounded-full border-t-4 border-b-4 border-blue-500 animate-spin"></div>
          <div className="mt-4 text-center text-xl font-semibold text-gray-700 dark:text-gray-300">
            Loading Purchase Orders...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="flex justify-between px-4 py-6 md:px-6 xl:px-7.5">
        <h4 className="text-h4">Purchase Orders</h4>
        <button
          onClick={() => router.push('/purchase-orders/add')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          Create Purchase Order
        </button>
      </div>

      {/* Filters */}
      <div className="p-4 md:p-6 xl:p-7.5">
        <div className="flex flex-wrap gap-4 mb-6">
          <select
            className="px-3 py-2 border rounded-md text-sm"
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="ordered">Ordered</option>
            <option value="shipped">Shipped</option>
            <option value="received">Received</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <input
            type="date"
            className="px-3 py-2 border rounded-md text-sm"
            value={filters.fromDate}
            onChange={(e) => setFilters(prev => ({ ...prev, fromDate: e.target.value }))}
            placeholder="From Date"
          />

          <input
            type="date"
            className="px-3 py-2 border rounded-md text-sm"
            value={filters.toDate}
            onChange={(e) => setFilters(prev => ({ ...prev, toDate: e.target.value }))}
            placeholder="To Date"
          />
        </div>

        {/* Purchase Orders Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-stroke">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="th">Order #</th>
                <th className="th">Supplier</th>
                <th className="th">Total Amount</th>
                <th className="th">Status</th>
                <th className="th">Order Date</th>
                <th className="th">Expected Delivery</th>
                <th className="th">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
              {purchaseOrders.map((order) => (
                <tr key={order._id} className="border-t border-stroke">
                  <td className="td font-medium">{order.orderNumber}</td>
                  <td className="td">{order.supplierName}</td>
                  <td className="td">${order.totalAmount.toFixed(2)}</td>
                  <td className="td">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                      <span className="mr-1">{getStatusIcon(order.status)}</span>
                      {order.status}
                    </span>
                  </td>
                  <td className="td">
                    {format(new Date(order.orderDate), 'MMM dd, yyyy')}
                  </td>
                  <td className="td">
                    {format(new Date(order.expectedDeliveryDate), 'MMM dd, yyyy')}
                  </td>
                  <td className="td">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => router.push(`/purchase-orders/details/${order._id}`)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Details"
                      >
                        <FaEye className="w-4 h-4" />
                      </button>
                      
                      {['pending', 'ordered'].includes(order.status) && (
                        <button
                          onClick={() => router.push(`/purchase-orders/edit/${order._id}`)}
                          className="text-yellow-600 hover:text-yellow-900"
                          title="Edit Order"
                        >
                          <FaEdit className="w-4 h-4" />
                        </button>
                      )}
                      
                      {order.status === 'shipped' && (
                        <button
                          onClick={() => navigateToReceive(order._id)}
                          className="text-green-600 hover:text-green-900"
                          title="Mark as Received"
                        >
                          <FaCheck className="w-4 h-4" />
                        </button>
                      )}
                      
                      {['pending', 'ordered'].includes(order.status) && (
                        <button
                          onClick={() => updateOrderStatus(order._id, 'cancelled')}
                          className="text-red-600 hover:text-red-900"
                          title="Cancel Order"
                        >
                          ❌
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex justify-center">
          <Pagination
            total={totalPages}
            initialPage={currentPage}
            perPage={10}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      </div>
    </div>
  );
};

export default PurchaseOrderList;
