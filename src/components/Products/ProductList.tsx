"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { handleError, httpDelete, httpGet } from "@/utils/apiClient";
import Link from "next/link";
import Pagination from "../Pagination";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { FaSearch } from "react-icons/fa";

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
  const [currentPage, setCurrentPage] = useState<number>(1); 
  const [perPage, setPerPage] = useState<number>(10); 
  const [filters, setFilters] = useState<{ search: string }>({
    search: "",
  });

  const router = useRouter();

  useEffect(() => {
    
    fetchProducts();
  }, [currentPage, perPage]);

  const handlePageChange = (page: number, perPage: number) => {
    setCurrentPage(page);
    setPerPage(perPage);
  };
  const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await httpGet(
          `products?page=${currentPage}&perPage=${perPage}&search=${filters.search}`,
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
  
  const handleSearch = () => {
    fetchProducts();
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
    <div className="rounded-sm border min-h-screen border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="flex justify-between px-4 py-6 md:px-6 xl:px-7.5">
        <h4 className="text-h4">
          Product List
        </h4>
        <Link href="/products/add">
          <button className="btn-style">
            Add Product
          </button>
        </Link>
      </div>

                <div className="flex justify-end px-4 py-6 md:px-6 xl:px-7.5">
                  
      
                  <input
                    type="text"
                    placeholder="Search orders..."
                    className="px-3 py-2 border rounded-md text-sm mr-2"
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  />
      
                  <button
                    onClick={handleSearch}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex items-center gap-2"
                  >
                    <FaSearch /> 
                  </button>
      
                 
                </div>

      <table className="min-w-full divide-y divide-stroke">
        <thead>
          <tr>
            <th className="th">Product</th>
            <th className="th">Category</th>
            <th className="th">Price</th>
            <th className="th">Stock</th>
            <th className="th">Actions</th>
          </tr>
        </thead>
        <tbody>
          {productData.map((product) => (
            <tr key={product._id} className="border-t border-stroke">
              <td className="td">
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
              <td className="td">{product.categoryName}</td>
              <td className="td">{product.price}</td>
              <td className="td">{product.stockQuantity}</td>
              <td className="td">
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
