import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import Select from "react-select";
import { handleError, httpGet, httpPost, httpPut } from "@/utils/apiClient";

interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  parentCategory?: string | null;
}

interface CategoryFormProps {
  slug: string | null; // Slug for editing, null for creating a new category
}

const CategoryForm: React.FC<CategoryFormProps> = ({ slug }) => {
  const router = useRouter();

  const [category, setCategory] = useState<{
    name: string;
    slug: string;
    description: string;
    parentCategory: string | null;
  }>({
    name: "",
    slug: "",
    description: "",
    parentCategory: null,
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

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

  useEffect(() => {
    const fetchCategory = async () => {
      if (!slug) return;

      try {
        const response = await httpGet(`categories/getBySlug?slug=${slug}`);
        if (response.data.returncode === "200") {
          const data = response.data.data;
          setCategory(data);
        }
      } catch (err) {
        console.error("Failed to fetch category details", err);
        handleError(err, router);
      }
    };
    fetchCategory();
  }, [slug]); // Use `slug` here instead of `id`

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/ /g, "-")
      .replace(/[^\w-]+/g, "");
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setCategory((prev) => ({
      ...prev,
      [name]: value,
      slug: name === "name" ? generateSlug(value) : prev.slug,
    }));
  };

  const handleCategoryChange = (selectedOption: any) => {
    setCategory((prev) => ({
      ...prev,
      parentCategory: selectedOption ? selectedOption.value : null,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = slug
        ? await httpPut(`categories/${slug}`, category) // Use `slug` for updates
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
    } finally {
      setLoading(false);
    }
  };

  const categoryOptions = categories.map((cat) => ({
    value: cat._id,
    label: cat.name,
  }));

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-md">
      <h4 className="mb-6 text-center text-2xl font-semibold">
        {slug ? "Edit Category" : "New Category"}
      </h4>
      <form onSubmit={handleSubmit} className="space-y-4">
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

        <div className="flex items-center gap-4">
          <label className="w-1/4 text-sm font-medium">Description</label>
          <textarea
            name="description"
            value={category.description}
            onChange={handleChange}
            required
            className="w-3/4 rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring"
          />
        </div>

        <div className="flex items-center gap-4">
          <label className="w-1/4 text-sm font-medium">Parent Category</label>
          <Select
            value={categoryOptions.find(
              (option) => option.value === category.parentCategory,
            )}
            onChange={handleCategoryChange}
            options={categoryOptions}
            isClearable
            placeholder="Search..."
            className="w-3/4"
          />
        </div>

        <button
          type="submit"
          className="mx-auto block w-1/4 rounded-lg bg-blue-600 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Saving..." : slug ? "Update Category" : "Add Category"}
        </button>
      </form>
    </div>
  );
};

export default CategoryForm;
