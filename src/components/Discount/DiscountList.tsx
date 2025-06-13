"use client";

import { useState, useEffect } from "react";
import { handleError, httpDelete, httpGet } from "@/utils/apiClient";
import Link from "next/link";
import Pagination from "../Pagination";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { format, set } from 'date-fns';

interface Discount {
  _id: string;
  slug: string;
  name: string;
  discountType: string;
  value: number;
  startDate: string;
  endDate: string;
  minimumPurchase: number;
  usageLimit: number;
  promoCode: string;

}

const DiscountList = () => {
  const [discountData, setDiscountData] = useState<Discount[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(10);
  const router = useRouter();

  useEffect(() => {
    fetchDiscounts();
  }, [currentPage, perPage]);
  
  const fetchDiscounts = async () => {
    try {
      setLoading(true);
      const response = await httpGet(
        `discounts?page=${currentPage}&perPage=${perPage}`,
      );
  
      if (response.data.data.length < 1) {
        router.push("/discounts/add");
      }
  
      setDiscountData(response.data.data);
      setTotalPages(response.data.pageCounts);
    } catch (err) {
      console.error(err);
      handleError(err, router);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = (slug: string) => {
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
          setLoading(true);
          await httpDelete(`discounts/${slug}`);
  
          Swal.fire("Deleted!", "Your discount has been deleted.", "success");
  
          fetchDiscounts();
        } catch (error) {
          console.error("Failed to delete discount", error);
          handleError(error, router);
        } finally {
          setLoading(false);
        }
      }
    });
  };
  
  const handlePageChange = (page: number, perPage: number) => {
    setCurrentPage(page);
    setPerPage(perPage);
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
    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark min-h-screen">
      <div className="flex justify-between px-4 py-6 md:px-6 xl:px-7.5">
        <h4 className="text-xl font-semibold text-black dark:text-white">
          Discount List
        </h4>
        <Link href="/discounts/add">
          <button className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">
            Add Discount
          </button>
        </Link>
      </div>

      <table className="min-w-full divide-y divide-stroke">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th className="th">Name</th>
            <th className="th">Type</th>
            <th className="th">Value</th>
            <th className="th w-32">Start Date</th>
            <th className="th w-32">End Date</th>
            <th className="th w-22">Minimum Purchase</th>
            <th className="th">Usage Limit</th>
            <th className="th">Promo Code</th>
            <th className="th">Action</th>

          </tr>
        </thead>
        <tbody>
          {discountData.map((discount) => (
            <tr key={discount.slug} className="border-t border-stroke">
              <td className="td">{discount.name}</td>
             
              <td className="td">{discount.discountType}</td>
              <td className="td">{discount.value}</td>
              <td className="td"> {format(new Date(discount.startDate), 'MM/dd/ yyyy')}</td>
              <td className="td"> {format(new Date(discount.endDate), 'MM/dd/ yyyy')}</td>
              <td className="td">{discount.minimumPurchase}</td>
              <td className="td">{discount.usageLimit}</td>
              <td className="td">{discount.promoCode}</td>

              <td className="td">
                <div className="flex space-x-2">
                  <Link href={`/discounts/edit?_id=${discount._id}`}>
                    <button className="text-blue-500 hover:text-blue-600">
                      Edit
                    </button>
                  </Link>
                  <button
                    className="text-red-500 hover:text-red-600"
                    onClick={() => handleDelete(discount._id)}
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

export default DiscountList;
