"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { handleError, httpGet, httpPost, httpPut } from "@/utils/apiClient";

interface Product {
  _id?: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  stockQuantity: number;
  images: string[]; // Store Base64 image(s)
}

interface Category {
  _id: string;
  name: string;
}

interface ProductFormProps {
  id: string | null;
}

const ProductForm: React.FC<ProductFormProps> = ({ id }) => {
  const [product, setProduct] = useState<Product>({
    name: "",
    description: "",
    price: 0,
    categoryId: "",
    stockQuantity: 0,
    images: [""],
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await httpGet("categories");
        setCategories(response.data.data);
      } catch (err) {
        console.error("Failed to load categories", err);
        setLoading(false);
        handleError(err, router);
      }
    };

    const fetchProduct = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const response = await httpGet(`products/${id}`);
        if (response.data.returncode === "200") {
          setProduct(response.data.data);
        }
      } catch (err) {
        console.error(err);
        setLoading(false);
        handleError(err, router);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
    fetchProduct();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setProduct({ ...product, [name]: value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setProduct((prev) => ({
        ...prev,
        images: [base64String], // Store as Base64 string
      }));
    };
    reader.readAsDataURL(file); // Convert image to Base64
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let res: any = {};
      if (id) {
        res = await httpPut(`products/${id}`, product);
      } else {
        res = await httpPost("products", product);
      }

      Swal.fire({
        icon: "success",
        text: res.data.returnmessage,
        showConfirmButton: false,
        timer: 5000,
      });
      router.push("/products");
    } catch (error) {
      console.error("Failed to save product", error);
      Swal.fire("Error", "Failed to save product", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-md">
      <h4 className="mb-6 text-center text-2xl font-semibold">
        {id ? "Update Product" : "New Product"}
      </h4>

      {loading ? (
        <p className="text-center">Loading...</p>
      ) : (
        <div className="mx-auto max-w-4xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Product Name */}
            <div className="flex items-center gap-4">
              <label className="w-1/4 text-sm font-medium">Product Name</label>
              <input
                type="text"
                name="name"
                value={product.name}
                onChange={handleChange}
                required
                className="w-3/4 rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring"
              />
            </div>

            {/* Description */}
            <div className="flex items-center gap-4">
              <label className="w-1/4 text-sm font-medium">Description</label>
              <textarea
                name="description"
                value={product.description}
                onChange={handleChange}
                required
                className="w-3/4 rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring"
                rows={4}
              />
            </div>

            {/* Price */}
            <div className="flex items-center gap-4">
              <label className="w-1/4 text-sm font-medium">Price</label>
              <input
                type="number"
                name="price"
                value={product.price}
                onChange={handleChange}
                required
                className="w-3/4 rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring"
              />
            </div>

            {/* Category */}
            <div className="flex items-center gap-4">
              <label className="w-1/4 text-sm font-medium">Category</label>
              <select
                name="categoryId"
                value={product.categoryId}
                onChange={handleChange}
                required
                className="w-3/4 rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring"
              >
                <option value="" disabled>
                  Select a category
                </option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Stock Quantity */}
            <div className="flex items-center gap-4">
              <label className="w-1/4 text-sm font-medium">
                Stock Quantity
              </label>
              <input
                type="number"
                name="stockQuantity"
                value={product.stockQuantity}
                onChange={handleChange}
                required
                className="w-3/4 rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring"
              />
            </div>

            {/* Upload Image */}
            <div className="flex items-center gap-4">
              <label className="w-1/4 text-sm font-medium">Upload Image</label>
              <div className="w-3/4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full"
                />
                {product.images[0] && (
                  <img
                    src={product.images[0]}
                    alt="Preview"
                    className="mt-4 h-32 w-32 object-cover"
                  />
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="mx-auto block w-1/4 rounded-lg bg-blue-600 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Saving..." : id ? "Update Product" : "Add Product"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ProductForm;
