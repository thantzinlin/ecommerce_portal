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
    _id: string | null;
    name: string;
    slug: string;
    description: string;
    image?: string;
    parentCategory: string | null;
  }>({
    _id: null,
    name: "",
    slug: "",
    description: "",
    image: "",
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCategory((prev) => ({
          ...prev,
          image: reader.result as string, // Base64 string
        }));
      };
      reader.readAsDataURL(file); // Convert image to Base64 string
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoading(true);
    
    try {
      const response = slug
        ? await httpPut(`categories/${category._id}`, category) // Use `slug` for updates
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
    <div className="rounded-lg theme-bg border border-gray-200 p-6 shadow-md">
      <h4 className="mb-6 text-center text-h4">
        {slug ? "Edit Category" : "New Category"}
      </h4>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-4">
          <label className="w-1/4 label">Category Name<span className="text-red-500 ml-1">*</span></label>
          <input
            type="text"
            name="name"
            value={category.name}
            onChange={handleChange}
            required
            className="text-input w-3/4"
          />
        </div>

        <div className="flex items-center gap-4">
          <label className="w-1/4 label">Description</label>
          <textarea
            name="description"
            value={category.description}
            onChange={handleChange}
            className="w-3/4 text-input"
          />
        </div>



        <div className="flex items-center gap-4">
          <label className="w-1/4 label">Parent Category</label>
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

        <div className="flex items-center gap-6">
          <label className="w-1/4 label">Category Image</label>
          <div className="w-3/4">
            <div className="flex flex-col space-y-4">
              <div className="flex items-center justify-center w-full">
                <label htmlFor="dropzone-file" className="relative flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  {category.image ? (
                    <div className="relative w-full h-full">
                      <img
                        src={category.image}
                        alt="Category preview"
                        className="object-cover w-full h-full rounded-lg"
                      />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black bg-opacity-50 rounded-lg">
                        <p className="text-sm text-white font-medium">Replace image</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-6">
                      <svg className="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                      <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Upload category image</span></p>
                    </div>
                  )}
                  <input
                    id="dropzone-file"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
            
            </div>
          </div>
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
