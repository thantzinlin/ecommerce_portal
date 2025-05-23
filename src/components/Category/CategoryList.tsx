"use client";

import { useState, useEffect } from "react";
import { handleError, httpDelete, httpGet } from "@/utils/apiClient";
import Link from "next/link";
import Pagination from "../Pagination";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

interface Category {
  _id: string;
  slug: string;
  name: string;
  description: string;
  image: string;
  createdAt: string;
  isDeleted: boolean;
  parentCategory: string | null;
  children: Category[];
  updatedAt: string;
}

const CategoryList = () => {
  const [categoryData, setCategoryData] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(10);
  const router = useRouter();

  useEffect(() => {
    fetchCategories();
  }, [currentPage, perPage]);
  
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await httpGet(
        `categories/getall?page=${currentPage}&perPage=${perPage}&isAdmin=true`,
      );
  
      if (response.data.data.length < 1) {
        router.push("/categories/add");
      }
  
      setCategoryData(response.data.data);
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
          await httpDelete(`categories/${slug}`);
  
          Swal.fire("Deleted!", "Your category has been deleted.", "success");
  
          fetchCategories();
        } catch (error) {
          console.error("Failed to delete category", error);
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
          Category List
        </h4>
        <Link href="/categories/add">
          <button className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">
            Add Category
          </button>
        </Link>
      </div>

      <table className="min-w-full divide-y divide-stroke">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th className="th">Category Name</th>
            <th className="th">Image</th>
            <th className="th">Description</th>
            <th className="th">Actions</th>
          </tr>
        </thead>
        <tbody>
          {categoryData.map((category) => (
            <tr key={category.slug} className="border-t border-stroke">
              <td className="td">{category.name}</td>
              <td className="td">
                {category.image && (
                  <img src={category.image} alt={category.name} className="w-15 h-15" />
                )}
              </td>
              <td className="td">{category.description}</td>
              <td className="td">
                <div className="flex space-x-2">
                  <Link href={`/categories/edit/${category.slug}`}>
                    <button className="text-blue-500 hover:text-blue-600">
                      Edit
                    </button>
                  </Link>
                  <button
                    className="text-red-500 hover:text-red-600"
                    onClick={() => handleDelete(category._id)}
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

export default CategoryList;
