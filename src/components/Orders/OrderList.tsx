"use client";

import { useState, useEffect } from "react";
import { handleError, httpDelete, httpGet } from "@/utils/apiClient";
import Link from "next/link";
import Pagination from "../Pagination";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

interface Product {
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  orderNumber: string;
  userId: string;
  username: String;
  products: Product;
  totalPrice: number;
  orderStatus: string;
  orderDate: string;
  shippingAddress: string;
  paymentMethod: string;
}

const OrderList = () => {
  const [orderData, setOrderData] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(10);
  const router = useRouter();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await httpGet(
          `orders?page=${currentPage}&perPage=${perPage}`,
        );
        setOrderData(response.data.data);
        setTotalPages(response.data.pageCounts);
        // setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);

        handleError(err, router);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [currentPage, perPage]);

  const handlePageChange = (page: number, perPage: number) => {
    setCurrentPage(page);
    setPerPage(perPage);
  };

  const handleDelete = (id: string) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await httpDelete(`orders/${id}`);
          setOrderData((prevData) =>
            prevData.filter((order) => order._id !== id),
          );
          Swal.fire("Deleted!", "Order has been deleted.", "success");
        } catch (error) {
          console.error("Failed to delete order", error);
          setLoading(false);
          handleError(error, router);
        }
      }
    });
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="flex justify-between px-4 py-6 md:px-6 xl:px-7.5">
        <h4 className="text-xl font-semibold text-black dark:text-white">
          Order List
        </h4>
      </div>

      <table className="min-w-full divide-y divide-stroke">
        <thead>
          <tr>
            <th className="px-4 py-2 text-left font-semibold">Order Number</th>
            <th className="px-4 py-2 text-left font-semibold">User Name</th>
            <th className="px-4 py-2 text-left font-semibold">
              Shipping Address
            </th>
            <th className="px-4 py-2 text-left font-semibold">Total Price</th>
            <th className="px-4 py-2 text-left font-semibold">
              Payment Method
            </th>
            <th className="px-4 py-2 text-left font-semibold">Status</th>
            <th className="px-4 py-2 text-left font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orderData.map((order) => (
            <tr key={order._id} className="border-t border-stroke">
              <td className="px-4 py-2">{order.orderNumber}</td>
              <td className="px-4 py-2">{order.username}</td>
              <td className="px-4 py-2">{order.shippingAddress}</td>
              <td className="px-4 py-2">{order.totalPrice.toFixed(2)}</td>
              <td className="px-4 py-2">{order.paymentMethod}</td>
              <td className="px-4 py-2">{order.orderStatus}</td>
              <td className="px-4 py-2">
                <div className="flex space-x-2">
                  <Link href={`/orders/view?_id=${order._id}`}>
                    <button className="text-blue-500 hover:text-blue-600">
                      View
                    </button>
                  </Link>
                  <button
                    className="text-red-500 hover:text-red-600"
                    onClick={() => handleDelete(order._id)}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-6 flex justify-center">
        <Pagination
          total={totalPages}
          initialPage={currentPage}
          perPage={perPage}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default OrderList;
