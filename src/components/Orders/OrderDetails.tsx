"use client";
import { useEffect, useState } from "react";
import { handleError, httpGet, httpPost, httpPut } from "@/utils/apiClient";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

interface Product {
  quantity: number;
  price: number;
  productName: string;
  imageurl: string;
  discount: number;
  subtotal: number;
  color: string;
  size: string;
}

interface Address {
  city: string;
  township: string;
  street: string;
  postalCode: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  userId: string;
  username: string;
  products: Product[];
  subTotal: number;
  discount: number;
  shippingCharge: number;
  tax: number;
  totalAmount: number;
  orderStatus: string;
  orderDate: string;
  shippingAddress: Address;
  paymentMethod: string;
}

interface OrderDetailsProps {
  orderId: string;
}

const OrderDetails: React.FC<OrderDetailsProps> = ({ orderId }) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [status, setStatus] = useState<string>(""); // Track order status
  const router = useRouter();

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const response = await httpGet(`orders/${orderId}`);
        const orderData = response.data.data;
        setOrder(orderData);
        setStatus(orderData.orderStatus);
      } catch (err) {
        console.error("Error fetching order details", err);
        handleError(err, router);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  const updateOrderStatus = async (newStatus: string) => {
    try {
      setLoading(true);
      const res = await httpPut(`orders/${orderId}`, {
        orderStatus: newStatus,
      });
      setStatus(newStatus);
      Swal.fire({
        icon: "success",
        text: res.data.returnmessage,
        showConfirmButton: false,
        timer: 5000,
      });
    } catch (err) {
      console.error("Error updating order status", err);
      handleError(err, router);
    } finally {
      setLoading(false);
    }
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
  );  if (!order) return <p className="text-center">Order not found.</p>;

  return (
    <div className="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
      {/* Header Section */}
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-h3">Order #{order.orderNumber}</h3>
        <div className="flex gap-4">
          <button
            className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
            onClick={() => window.print()}
          >
            Print Invoice
          </button>
          <button className="rounded-md bg-green-500 px-4 py-2 text-white hover:bg-green-600">
            View Customer
          </button>
        </div>
      </div>

      {/* Product Details Section */}
      <h4 className="text-h4">Product Details</h4>
      <table className="mb-6 w-full rounded-lg shadow-sm">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th className="th">Product</th>
            <th className="th">Item Price</th>
            <th className="th">Quantity</th>
            <th className="th">Discount</th>
            <th className="th">Total Amount</th>
          </tr>
        </thead>
        <tbody>
          {order.products.map((product, index) => (
            <tr key={index} className="border-t border-stroke">
              <td className="td">
                <img
                  src={product.imageurl}
                  alt={product.productName}
                  className="mr-4 h-12 w-12 rounded-lg"
                />
                <div>
                  <p className="font-semibold">{product.productName}</p>
                  <p className="text-sm text-gray-500">
                    Color: {product.color}, Size: {product.size}
                  </p>
                </div>
              </td>
              <td className="td">{product.price} MMK</td>
              <td className="td">{product.quantity}</td>
              <td className="td">{product.discount} MMK</td>

              <td className="td">{product.subtotal} MMK</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Shipping and Payment Info */}
      <div className="flex justify-between border-t pt-4">
        <div className="text-left">
          <p className="text-p">
            Shipping Address:{" "}
            {order.shippingAddress && (
              <>
                <p>{order.shippingAddress.street}</p>
                <p>
                  {order.shippingAddress.township}, {order.shippingAddress.city}
                </p>
                <p>{order.shippingAddress.postalCode}</p>
              </>
            )}
          </p>
          <p className="text-p">Payment Method: {order.paymentMethod}</p>
          <p className="text-p">Order Date: {order.orderDate}</p>
        </div>

        {/* Order Summary */}
        <div className="w-1/3 text-p">
          <div className="flex justify-between">
            <span>Sub Total:</span>
            <span>{order.subTotal} MMK</span>
          </div>
          <div className="flex justify-between">
            <span>Discount:</span>
            <span>{order.discount} MMK</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping Charge:</span>
            <span>{order.shippingCharge} MMK</span>
          </div>
          <div className="flex justify-between">
            <span>Tax:</span>
            <span>{order.tax} MMK</span>
          </div>
          <div className="mt-2 flex justify-between font-semibold">
            <span>Total :</span>
            <span>{order.totalAmount} MMK</span>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center">
        <div className="flex items-center gap-4">
          <span className="text-p">Order Status:</span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="select-style"
          >
            <option value="Pending" className="text-p">Pending</option>
            <option value="Processing" className="text-p">Processing</option>
            <option value="Shipped" className="text-p">Shipped</option>
            <option value="Delivered" className="text-p">Delivered</option>
            <option value="Cancelled" className="text-p">Cancelled</option>
          </select>
        </div>
        <button
          onClick={() => updateOrderStatus(status)}
          className="ml-4 rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-green-600"
        >
          Update Order
        </button>
      </div>
    </div>
  );
};

export default OrderDetails;
