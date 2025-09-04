"use client";

import { useState, useEffect } from "react";
import { handleError, httpGet } from "@/utils/apiClient";
import { useRouter } from "next/navigation";
import { FaExclamationTriangle, FaBoxes, FaTruck, FaChartLine } from "react-icons/fa";
import CardDataStats from "../CardDataStats";

interface InventoryStats {
  totalProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  totalValue: number;
  pendingOrders: number;
  shippedOrders: number;
}

interface LowStockProduct {
  _id: string;
  name: string;
  currentStock: number;
  lowStockThreshold: number;
  reorderPoint: number;
  lastRestocked: string;
  supplierName: string;
}

interface PendingOrder {
  _id: string;
  orderNumber: string;
  supplierName: string;
  expectedDeliveryDate: string;
  totalItems: number;
  status: string;
}

const InventoryDashboard = () => {
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([]);
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const router = useRouter();

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      
      // Fetch inventory statistics
      const statsResponse = await httpGet('inventory/stats');
      setStats(statsResponse.data.data);
      
      // Fetch low stock products
      const lowStockResponse = await httpGet('inventory/low-stock');
      setLowStockProducts(lowStockResponse.data.data);
      
      // Fetch pending orders
      const pendingOrdersResponse = await httpGet('purchase-orders?status=shipped');
      setPendingOrders(pendingOrdersResponse.data.data);
      
    } catch (err) {
      handleError(err, router);
    } finally {
      setLoading(false);
    }
  };

  const getStockStatusColor = (currentStock: number, threshold: number) => {
    if (currentStock === 0) return 'text-red-600';
    if (currentStock <= threshold) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getStockStatusText = (currentStock: number, threshold: number) => {
    if (currentStock === 0) return 'Out of Stock';
    if (currentStock <= threshold) return 'Low Stock';
    return 'In Stock';
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="relative">
          <div className="h-24 w-24 rounded-full border-t-4 border-b-4 border-blue-500 animate-spin"></div>
          <div className="mt-4 text-center text-xl font-semibold text-gray-700 dark:text-gray-300">
            Loading Inventory Dashboard...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Inventory Statistics Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
        <CardDataStats
          title="Total Products"
          total={stats?.totalProducts.toString() || "0"}
          rate=""
        >
          <FaBoxes className="fill-primary dark:fill-white" width="22" height="22" />
        </CardDataStats>
        
        <CardDataStats
          title="Low Stock Alert"
          total={stats?.lowStockProducts.toString() || "0"}
          rate=""
          levelDown={(stats?.lowStockProducts ?? 0) > 0}
        >
          <FaExclamationTriangle className="fill-warning dark:fill-white" width="22" height="22" />
        </CardDataStats>
        
        <CardDataStats
          title="Out of Stock"
          total={stats?.outOfStockProducts.toString() || "0"}
          rate=""
          levelDown={(stats?.outOfStockProducts ?? 0) > 0}
        >
          <FaExclamationTriangle className="fill-danger dark:fill-white" width="22" height="22" />
        </CardDataStats>
        
        <CardDataStats
          title="Inventory Value"
          total={`$${stats?.totalValue.toLocaleString() || "0"}`}
          rate=""
        >
          <FaChartLine className="fill-primary dark:fill-white" width="22" height="22" />
        </CardDataStats>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Low Stock Products */}
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="flex justify-between px-4 py-6 md:px-6 xl:px-7.5">
            <h4 className="text-h4">Low Stock Products</h4>
            <button
              onClick={() => router.push('/products')}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              View All
            </button>
          </div>

          <div className="p-4 md:p-6 xl:p-7.5">
            {lowStockProducts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FaBoxes className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No low stock products</p>
              </div>
            ) : (
              <div className="space-y-4">
                {lowStockProducts.slice(0, 5).map((product) => (
                  <div
                    key={product._id}
                    className="flex justify-between items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => router.push(`/products/edit?_id=${product._id}`)}
                  >
                    <div>
                      <h5 className="font-medium text-sm">{product.name}</h5>
                      <p className="text-xs text-gray-600">
                        Supplier: {product.supplierName}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${getStockStatusColor(product.currentStock, product.lowStockThreshold)}`}>
                        {product.currentStock} / {product.lowStockThreshold}
                      </p>
                      <p className="text-xs text-gray-500">
                        {getStockStatusText(product.currentStock, product.lowStockThreshold)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Pending Orders */}
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="flex justify-between px-4 py-6 md:px-6 xl:px-7.5">
            <h4 className="text-h4">Pending Receipts</h4>
            <button
              onClick={() => router.push('/purchase-orders')}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              View All
            </button>
          </div>

          <div className="p-4 md:p-6 xl:p-7.5">
            {pendingOrders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FaTruck className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No pending receipts</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingOrders.slice(0, 5).map((order) => (
                  <div
                    key={order._id}
                    className="flex justify-between items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => router.push(`/purchase-orders/view?_id=${order._id}`)}
                  >
                    <div>
                      <h5 className="font-medium text-sm">{order.orderNumber}</h5>
                      <p className="text-xs text-gray-600">
                        {order.supplierName} • {order.totalItems} items
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-blue-600">
                        {new Date(order.expectedDeliveryDate).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">
                        {order.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="px-4 py-6 md:px-6 xl:px-7.5">
          <h4 className="text-h4 mb-4">Quick Actions</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => router.push('/purchase-orders/add')}
              className="p-4 border border-blue-200 rounded-lg hover:bg-blue-50 text-left"
            >
              <FaTruck className="w-6 h-6 text-blue-600 mb-2" />
              <h5 className="font-medium text-sm">Create Purchase Order</h5>
              <p className="text-xs text-gray-600">Order new inventory from suppliers</p>
            </button>
            
            <button
              onClick={() => router.push('/products/add')}
              className="p-4 border border-green-200 rounded-lg hover:bg-green-50 text-left"
            >
              <FaBoxes className="w-6 h-6 text-green-600 mb-2" />
              <h5 className="font-medium text-sm">Add New Product</h5>
              <p className="text-xs text-gray-600">Add new products to inventory</p>
            </button>
            
            <button
              onClick={() => router.push('/inventory/adjustment')}
              className="p-4 border border-orange-200 rounded-lg hover:bg-orange-50 text-left"
            >
              <FaChartLine className="w-6 h-6 text-orange-600 mb-2" />
              <h5 className="font-medium text-sm">Stock Adjustment</h5>
              <p className="text-xs text-gray-600">Adjust stock levels manually</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryDashboard;
