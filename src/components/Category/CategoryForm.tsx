"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { handleError, httpGet, httpPost, httpPut } from "@/utils/apiClient";

interface Category {
  _id?: string;
  name: string;
  description: string;
}

interface CategoryFormProps {
  id: string | null;
}

const CategoryForm: React.FC<CategoryFormProps> = ({ id }) => {
  const [category, setCategory] = useState<Category>({
    name: "",
    description: "",
  });
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    const fetchCategory = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const response = await httpGet(`categories/${id}`);
        if (response.data.returncode === "200") {
          setCategory(response.data.data);
        }
      } catch (err) {
        console.error(err);
        handleError(err, router);
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setCategory({ ...category, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let res: any = {};
      if (id) {
        res = await httpPut(`categories/${id}`, category);
      } else {
        res = await httpPost("categories", category);
      }

      Swal.fire({
        icon: "success",
        text: res.data.returnmessage,
        showConfirmButton: false,
        timer: 5000,
      });
      router.push("/categories");
    } catch (error) {
      console.error("Failed to save category", error);
      handleError(error, router);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-md">
      <h4 className="mb-6 text-center text-2xl font-semibold">
        {id ? "Edit Category" : "New Category"}
      </h4>

      {loading ? (
        <p className="text-center">Loading...</p>
      ) : (
        <div className="mx-auto max-w-4xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Category Name */}
            <div className="flex items-center gap-4">
              <label className="w-1/4 text-sm font-medium">Category Name</label>
              <input
                type="text"
                name="name"
                value={category.name}
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
                value={category.description}
                onChange={handleChange}
                required
                className="w-3/4 rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring"
                rows={4}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="mx-auto block w-1/4 rounded-lg bg-blue-600 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Saving..." : id ? "Update Category" : "Add Category"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default CategoryForm;
