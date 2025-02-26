"use client";

import { useState, useEffect } from "react";
import { handleError, httpGet } from "@/utils/apiClient";
import Link from "next/link";
import Pagination from "../Pagination";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { format } from 'date-fns';
import { FaFileExcel, FaFilePdf, FaEye, FaFilter } from 'react-icons/fa';

interface Address {
  city: string;
  township: string;
  street: string;
  postalCode: string;
}

interface Product {
  _id: string;
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

interface Order {
  _id: string;
  orderNumber: string;
  userId: string;
  username: string;
  products: Product[];
  totalPrice: number;
  orderStatus: string;
  orderDate: string;
  shippingAddress: Address;
  paymentMethod: string;
  paymentStatus: string;
}

const OrderList = () => {
  const [orderData, setOrderData] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(10);
  const [filters, setFilters] = useState({
    dateRange: 'all',
    status: 'all',
    paymentStatus: 'all',
    search: ''
  });
  const router = useRouter();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const queryParams = new URLSearchParams({
          page: currentPage.toString(),
          perPage: perPage.toString(),
          ...filters
        });
        
        const response = await httpGet(`orders?${queryParams.toString()}`);
        setOrderData(response.data.data);
        setTotalPages(response.data.pageCounts);
      } catch (err) {
        handleError(err, router);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [currentPage, perPage, filters]);

  const handlePageChange = (page: number, perPage: number) => {
    setCurrentPage(page);
    setPerPage(perPage);
  };

  
  const handleDownloadReport = async (format: 'excel' | 'pdf') => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams(filters);
      const response = await httpGet(
        `orders/report/${format}?${queryParams.toString()}`, 
        { responseType: 'blob' }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const extension = format === 'excel' ? 'xlsx' : 'pdf';
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 16);
      link.setAttribute('download', `orders-report-${timestamp}.${extension}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: `Orders report has been downloaded successfully!`
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to download report. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'processing': 'bg-blue-100 text-blue-800',
      'shipped': 'bg-purple-100 text-purple-800',
      'delivered': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    const status_key = status.toLowerCase() as keyof typeof colors;
    return colors[status_key] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentStatusColor = (status: string) => {
    const colors = {
      'paid': 'bg-green-100 text-green-800',
      'pending': 'bg-yellow-100 text-yellow-800',
      'failed': 'bg-red-100 text-red-800'
    };
    // Add null check for status
    const status_key = (status || '').toLowerCase() as keyof typeof colors;
    return colors[status_key] || 'bg-gray-100 text-gray-800';
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center">
      <div className="relative">
        <div className="h-24 w-24 rounded-full border-t-4 border-b-4 border-blue-500 animate-spin"></div>
        <div className="mt-4 text-center text-xl font-semibold text-gray-700 dark:text-gray-300">
          Loading...
        </div>
      </div>
    </div>
  );

  return (
    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="p-4 md:p-6 xl:p-7.5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h4 className="text-xl font-semibold text-black dark:text-white">
            Order List
          </h4>
          
          <div className="flex flex-wrap gap-3">
            <select
              className="px-3 py-2 border rounded-md text-sm"
              value={filters.dateRange}
              onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>

            <select
              className="px-3 py-2 border rounded-md text-sm"
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <input
              type="text"
              placeholder="Search orders..."
              className="px-3 py-2 border rounded-md text-sm"
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            />

            <button
              onClick={() => handleDownloadReport('excel')}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors flex items-center gap-2"
            >
              <FaFileExcel /> Excel
            </button>
            <button
              onClick={() => handleDownloadReport('pdf')}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors flex items-center gap-2"
            >
              <FaFilePdf /> PDF
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-stroke">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Number</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:divide-gray-600">
              {orderData.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="font-medium">{order.orderNumber}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {format(new Date(order.orderDate), 'MMM dd, yyyy HH:mm')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm">
                      <div className="font-medium">{order.username}</div>
                      <div className="text-gray-500 text-xs">
                        {order.shippingAddress.city}, {order.shippingAddress.township}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="font-medium">${order.totalPrice.toFixed(2)}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentStatusColor(order.paymentStatus)}`}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.orderStatus)}`}>
                      {order.orderStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Link 
                      href={`/orders/view?_id=${order._id}`}
                      className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                    >
                      <FaEye className="w-4 h-4" />
                      <span>View</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Showing {orderData.length} of {totalPages * perPage} orders
          </div>
          <Pagination
            total={totalPages}
            initialPage={currentPage}
            perPage={perPage}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
};

export default OrderList;
