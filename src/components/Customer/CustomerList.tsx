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

  if (loading) return <p>Loading...</p>;

  return (
    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="flex justify-between px-4 py-6 md:px-6 xl:px-7.5">
        <h4 className="text-xl font-semibold text-black dark:text-white">
          Customer List
        </h4>
      </div>

      <table className="min-w-full divide-y divide-stroke">
        <thead>
          <tr>
            <th className="px-4 py-2 text-left font-semibold"> Name</th>
            <th className="px-4 py-2 text-left font-semibold">Phone</th>
            <th className="px-4 py-2 text-left font-semibold">Email</th>
            <th className="px-4 py-2 text-left font-semibold">Address</th>
          </tr>
        </thead>
        <tbody>
          {customerData.map((data) => (
            <tr key={data._id} className="border-t border-stroke">
              <td className="px-4 py-2">{data.username}</td>
              <td className="px-4 py-2">{data.phone}</td>
              <td className="px-4 py-2">{data.email}</td>
              <td className="px-4 py-2">
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
