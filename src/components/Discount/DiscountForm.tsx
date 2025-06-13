"use client";
import { useState, useEffect } from "react";
import { handleError, httpGet, httpPost, httpPut } from "@/utils/apiClient";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

interface DiscountFormProps {
  slug: string | null;
}

const DiscountForm: React.FC<DiscountFormProps> = ({ slug }) => {
  const [products, setProducts] = useState<
    { discountId: string; _id: string; name: string }[]
  >([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const router = useRouter();

  const [form, setForm] = useState({
    _id: "",
    name: "",
    discountType: "percentage",
    value: "",
    targets: [] as string[],
    startDate: "",
    endDate: "",
    minPurchase: "",
    usageLimit: "",
    promoCode: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {

        if (slug) {
          const response = await httpGet(`discounts/${slug}`);
          if (response.data.returncode === "200") {
            const resData = response.data.data;

          if (resData.startDate) {
            resData.startDate = new Date(resData.startDate).toISOString().split("T")[0];
          }
          if (resData.endDate) {
            resData.endDate = new Date(resData.endDate).toISOString().split("T")[0];
          }

          setForm(resData);
          }
        }

        const resproduct = await httpGet("products");
        const productList = resproduct.data.data;

        setProducts(productList);
      
      } catch (err) {
        handleError(err, router);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === "select-multiple") {
      const select = e.target as HTMLSelectElement;
      const values = Array.from(select.selectedOptions).map(
        (opt) => opt.value
      );
      setForm((prev) => ({ ...prev, [name]: values }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        name: form.name,
        discountType: form.discountType,
        value: form.value,
        startDate: form.startDate,
        endDate: form.endDate,
        minPurchase: form.minPurchase,
        usageLimit: form.usageLimit,
        promoCode: form.promoCode,
        targets: form.targets,
      };

      const response = slug
        ? await httpPut(`discounts/${form._id}`, data)
        : await httpPost("discounts", data);

      Swal.fire({
        icon: "success",
        text: response.data.returnmessage,
        showConfirmButton: false,
        timer: 5000,
      });

      router.push("/discounts");
    } catch (err) {
      console.error("Failed to save discount", err);
      handleError(err, router);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-lg theme-bg border border-gray-200 p-6 shadow-md">
      <h4 className="mb-6 text-center text-h4">
        {slug ? "Edit Discount" : "New Discount"}
      </h4>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div className="flex items-center gap-4">
          <label className="w-1/4 label">
            Name<span className="text-red-500 ml-1">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-3/4 rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring"
          />
        </div>

        {/* Type */}
        <div className="flex items-center gap-4">
          <label className="w-1/4 label">
            Type<span className="text-red-500 ml-1">*</span>
          </label>
          <select
            name="discountType"
            value={form.discountType}
            onChange={handleChange}
            className={`w-3/4 rounded-lg border ${
              errors.discountType ? "border-red-500" : "border-gray-300"
            } px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring`}
          >
            <option value="percentage">Percentage (%)</option>
            <option value="fixed">Fixed (MMK)</option>
          </select>
        </div>

        {/* Discount Value */}
        <div className="flex items-center gap-4">
          <label className="w-1/4 label">Discount Value</label>
          <input
            type="number"
            name="value"
            value={form.value}
            onChange={handleChange}
            required
            className="w-3/4 rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring"
          />
        </div>

        {/* Select Products */}
        <div className="flex items-start gap-4">
          <label className="w-1/4 label">Select Products</label>
          <select
            name="targets"
            multiple
            value={form.targets}
            onChange={handleChange}
            className="w-3/4 rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring h-32"
          >
            {products.map((product) => (
              <option key={product._id} value={product._id}>
                {product.name}
              </option>
            ))}
          </select>
        </div>

        {/* Date Range */}
        <div className="flex items-center gap-4">
          <label className="w-1/4 label">Start Date</label>
          <input
            type="date"
            name="startDate"
            value={form.startDate}
            onChange={handleChange}
            className="w-3/4 rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring"
          />
        </div>
        <div className="flex items-center gap-4">
          <label className="w-1/4 label">End Date</label>
          <input
            type="date"
            name="endDate"
            value={form.endDate}
            onChange={handleChange}
            className="w-3/4 rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring"
          />
        </div>

        {/* Minimum Purchase */}
        <div className="flex items-center gap-4">
          <label className="w-1/4 label">Minimum Purchase (MMK)</label>
          <input
            type="number"
            name="minPurchase"
            min={0}
            value={form.minPurchase}
            onChange={handleChange}
            className="w-3/4 rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring"
          />
        </div>

        {/* Usage Limit */}
        <div className="flex items-center gap-4">
          <label className="w-1/4 label">Usage Limit</label>
          <input
            type="number"
            name="usageLimit"
            min={0}
            value={form.usageLimit}
            onChange={handleChange}
            className="w-3/4 rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring"
          />
        </div>

        {/* Promo Code */}
        <div className="flex items-center gap-4">
          <label className="w-1/4 label">Promo Code</label>
          <input
            type="text"
            name="promoCode"
            value={form.promoCode}
            onChange={handleChange}
            className="w-3/4 rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring"
          />
        </div>

        {/* Submit Button */}
        <div className="text-center">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg shadow"
          >
            {loading ? "Saving..." : "Save Discount"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DiscountForm;
