"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { handleError, httpGet, httpPost, httpPut } from "@/utils/apiClient";

// Interface for category structure
interface Category {
  _id: string;
  name: string;
  slug: string;
  parentCategory?: string | null;
  children?: Category[];
}

interface CategoryFormProps {
  id: string | null; // ID for editing, null for creating a new category
}

const CategoryForm: React.FC<CategoryFormProps> = ({ id }) => {
  const router = useRouter();

  // State for category form
  const [category, setCategory] = useState<{
    name: string;
    slug: string;
    parentCategory: string | null; // Explicitly define it as string | null
  }>({
    name: "",
    slug: "",
    parentCategory: null, // Initialize as null
  });

  // State for all categories and selected category hierarchy
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Fetch all categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await httpGet("categories");
        if (response.data.returncode === "200") {
          setCategories(response.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch categories", err);
        handleError(err, router);
      }
    };
    fetchCategories();
  }, []);

  // Fetch category details for editing
  useEffect(() => {
    const fetchCategory = async () => {
      if (!id) return;

      try {
        const response = await httpGet(`categories/${id}`);
        if (response.data.returncode === "200") {
          const data = response.data.data;
          setCategory(data);
          if (data.parentCategory)
            populateParentCategories(data.parentCategory);
        }
      } catch (err) {
        console.error("Failed to fetch category details", err);
        handleError(err, router);
      }
    };

    const populateParentCategories = (parentId: string) => {
      const hierarchy: string[] = [];
      let currentId = parentId;

      while (currentId) {
        const parent = categories.find((cat) => cat._id === currentId);
        if (parent) {
          hierarchy.unshift(parent._id);
          currentId = parent.parentCategory || "";
        } else break;
      }

      setSelectedCategories(hierarchy);
    };

    fetchCategory();
  }, [id, categories]);

  // Handle changes to the category form inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCategory((prev) => ({ ...prev, [name]: value }));
  };

  // Handle category dropdown changes
  const handleCategoryChange = (level: number, categoryId: string) => {
    const updatedSelectedCategories = [...selectedCategories];
    updatedSelectedCategories[level] = categoryId;

    // Remove deeper levels when changing a higher-level category
    updatedSelectedCategories.splice(level + 1);
    console.log(
      "updated category: " + JSON.stringify(updatedSelectedCategories),
    );

    setSelectedCategories(updatedSelectedCategories);
    setCategory((prev) => ({
      ...prev,
      parentCategory: updatedSelectedCategories.at(0) || null,
    }));
    console.log("category: " + JSON.stringify(category));
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = id
        ? await httpPut(`categories/${id}`, category)
        : await httpPost("categories", category);

      Swal.fire({
        icon: "success",
        text: response.data.returnmessage,
        showConfirmButton: false,
        timer: 5000,
      });
      router.push("/categories");
    } catch (err) {
      console.error("Failed to save category", err);
      handleError(err, router);
    }
  };

  // Render category dropdown for a specific level
  const renderCategoryDropdown = (level: number) => {
    console.log("selected categories : " + JSON.stringify(selectedCategories));
    const parentId = selectedCategories[level > 0 ? level - 1 : level];
    console.log("parent category id : " + parentId);
    const filteredCategories =
      parentId && level > 0
        ? categories.find((cat) => cat._id === parentId)?.children || []
        : categories;
    console.log("filter category ..." + JSON.stringify(filteredCategories));

    return (
      <div key={level} className="flex items-center gap-4">
        <label className="w-1/4 text-sm font-medium">
          {level === 0 ? "Parent Category" : `Subcategory Level ${level}`}
        </label>
        <select
          value={selectedCategories[level] || ""}
          onChange={(e) => handleCategoryChange(level, e.target.value)}
          className="w-3/4 rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring"
        >
          <option value="">None</option>
          {filteredCategories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>
    );
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-md">
      <h4 className="mb-6 text-center text-2xl font-semibold">
        {id ? "Edit Category" : "New Category"}
      </h4>
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

        {/* Slug */}
        <div className="flex items-center gap-4">
          <label className="w-1/4 text-sm font-medium">Slug</label>
          <input
            type="text"
            name="slug"
            value={category.slug}
            onChange={handleChange}
            required
            className="w-3/4 rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring"
          />
        </div>

        {/* Recursive Category Dropdowns */}
        {selectedCategories.map((_, index) => renderCategoryDropdown(index))}
        {renderCategoryDropdown(selectedCategories.length)}

        {/* Submit Button */}
        <button
          type="submit"
          className="mx-auto block w-1/4 rounded-lg bg-blue-600 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {id ? "Update Category" : "Add Category"}
        </button>
      </form>
    </div>
  );
};

export default CategoryForm;
