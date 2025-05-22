"use client";

import { useState, useEffect } from "react";
import { handleError, httpDelete, httpGet } from "@/utils/apiClient";
import Link from "next/link";
import Pagination from "../Pagination";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

interface Address {
  city: string;
  township: string;
  street: string;
  postalcode: string;
}
interface Custoemr {
  _id: string;
  username: string;
  phone: string;
  email: string;
  address: Address;
  createdAt: string;
  updatedAt: string;
}

const CustomerList = () => {
  const [customerData, setCustomerData] = useState<Custoemr[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(10);
  const [search, setSearch] = useState<string>();

  const router = useRouter();

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const response = await httpGet(
          `users?page=${currentPage}&perPage=${perPage}&search=${search}`,
        );

        setCustomerData(response.data.data);
        setTotalPages(response.data.pageCounts);
      } catch (err) {
        console.error(err);
        handleError(err, router);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, [currentPage, perPage]);

  const handlePageChange = (page: number, perPage: number) => {
    setCurrentPage(page);
    setPerPage(perPage);
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center ">
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
        <h4 className="text-h4">
          Customer List
        </h4>
      </div>

      <table className="min-w-full divide-y divide-stroke">
        <thead>
          <tr>
            <th className="th"> Name</th>
            <th className="th">Phone</th>
            <th className="th">Email</th>
            <th className="th">Address</th>
          </tr>
        </thead>
        <tbody>
          {customerData.map((data) => (
            <tr key={data._id} className="border-t border-stroke">
              <td className="td">{data.username}</td>
              <td className="td">{data.phone}</td>
              <td className="td">{data.email}</td>
              <td className="td">
                {data.address ? (
                  <>
                    {data.address.street}, {data.address.city},
                    {data.address.township}, {data.address.postalcode}
                  </>
                ) : (
                  "No address provided"
                )}
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

export default CustomerList;
