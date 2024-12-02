"use client";

import { useState, useEffect } from "react";
import { handleError, httpDelete, httpGet } from "@/utils/apiClient";
import Link from "next/link";
import Pagination from "../Pagination";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

interface Township {
  _id: string;
  name: string;
  cityId: {
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

const RegionList = () => {
  const [townshipData, setTownshipData] = useState<Township[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(10);
  const router = useRouter();

  useEffect(() => {
    const fetchTownships = async () => {
      try {
        setLoading(true);
        const response = await httpGet(
          `townships?page=${currentPage}&perPage=${perPage}`,
        );
        if (response.data.data.length < 1) {
          router.push("region/add");
        }
        setTownshipData(response.data.data);
        setTotalPages(response.data.pageCounts);
      } catch (err) {
        console.error(err);
        handleError(err, router);
      } finally {
        setLoading(false);
      }
    };
    fetchTownships();
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
          await httpDelete(`townships/${id}`);
          setTownshipData((prevData) =>
            prevData.filter((township) => township._id !== id),
          );
          Swal.fire("Deleted!", "Your Region has been deleted.", "success");
        } catch (error) {
          console.error("Failed to delete Region", error);
          handleError(error, router);
        } finally {
          setLoading(false);
        }
      }
    });
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="flex justify-between px-4 py-6 md:px-6 xl:px-7.5">
        <h4 className="text-xl font-semibold text-black dark:text-white">
          Region List
        </h4>
        <Link href="/region/add">
          <button className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">
            Add Region
          </button>
        </Link>
      </div>

      <table className="min-w-full divide-y divide-stroke">
        <thead>
          <tr>
            <th className="px-4 py-2 text-left font-semibold">Twonship </th>
            <th className="px-4 py-2 text-left font-semibold">City </th>

            <th className="px-4 py-2 text-left font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {townshipData.map((township) => (
            <tr key={township._id} className="border-t border-stroke">
              <td className="px-4 py-2">{township.name}</td>
              <td className="px-4 py-2">{township.cityId.name}</td>

              <td className="px-4 py-2">
                <div className="flex space-x-2">
                  <Link href={`/region/edit?_id=${township._id}`}>
                    <button className="text-blue-500 hover:text-blue-600">
                      Edit
                    </button>
                  </Link>
                  <button
                    className="text-red-500 hover:text-red-600"
                    onClick={() => handleDelete(township._id)}
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

export default RegionList;
