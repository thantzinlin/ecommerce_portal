"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { handleError, httpDelete, httpGet } from "@/utils/apiClient";
import Link from "next/link";
import Pagination from "../Pagination";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  categoryName: string;
  stockQuantity: number;
  images: string[];
  createdAt: string;
  updatedAt: string;
}

const ProductList = () => {
  const [productData, setProductData] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  //  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1); // Local page state
  const [perPage, setPerPage] = useState<number>(10); // Local perPage state
  const router = useRouter();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await httpGet(
          `products?page=${currentPage}&perPage=${perPage}`,
        );
        if (response.data.data.length < 1) {
          router.push("products/add");
        }
        setProductData(response.data.data);
        setTotalPages(response.data.pageCounts);
      } catch (err) {
        console.error(err);
        //  setError("Failed to load products");
        handleError(err, router);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
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
          await httpDelete(`products/${id}`);
          setProductData((prevData) =>
            prevData.filter((product) => product._id !== id),
          );
          Swal.fire("Deleted!", "Your product has been deleted.", "success");
        } catch (err) {
          console.error("Failed to delete product", err);
          setLoading(false);
          handleError(err, router);
        }
      }
    });
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
      <div className="flex justify-between px-4 py-6 md:px-6 xl:px-7.5">
        <h4 className="text-xl font-semibold text-black dark:text-white">
          Product List
        </h4>
        <Link href="/products/add">
          <button className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">
            Add Product
          </button>
        </Link>
      </div>

      <table className="min-w-full divide-y divide-stroke">
        <thead>
          <tr>
            <th className="px-4 py-2 text-left font-semibold">Product</th>
            <th className="px-4 py-2 text-left font-semibold">Category</th>
            <th className="px-4 py-2 text-left font-semibold">Price</th>
            <th className="px-4 py-2 text-left font-semibold">Stock</th>
            <th className="px-4 py-2 text-left font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {productData.map((product) => (
            <tr key={product._id} className="border-t border-stroke">
              <td className="px-4 py-2">
                <div className="flex items-center">
                  <Image
                    src={product.images[0] || "/placeholder.png"}
                    width={60}
                    height={50}
                    alt={product.name}
                    className="rounded-md"
                  />
                  <p className="ml-4">{product.name}</p>
                </div>
              </td>
              <td className="px-4 py-2">{product.categoryName}</td>
              <td className="px-4 py-2">{product.price}</td>
              <td className="px-4 py-2">{product.stockQuantity}</td>
              <td className="px-4 py-2">
                <div className="flex space-x-2">
                  <Link href={`/products/edit?_id=${product._id}`}>
                    <button className="text-blue-500 hover:text-blue-600">
                      Edit
                    </button>
                  </Link>
                  <button
                    className="text-red-500 hover:text-red-600"
                    onClick={() => handleDelete(product._id)}
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

export default ProductList;
