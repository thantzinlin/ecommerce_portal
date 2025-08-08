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
  const [tab, setTab] = useState<"automatic" | "promo">("automatic");

  const router = useRouter();

  
const [form, setForm] = useState<{
  _id: string | null;
  name: string;
  discountType: string;
  value: string;
  targets: string[];
  startDate: string;
  endDate: string;
  minPurchase: string;
  usageLimit: string;
  cuponCode: string;
  isPublic: boolean;
}>({
  _id: null,
  name: "",
  discountType: "percentage",
  value: "",
  targets: [],
  startDate: "",
  endDate: "",
  minPurchase: "",
  usageLimit: "",
  cuponCode: "",
  isPublic: true,
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
              resData.startDate = new Date(resData.startDate)
                .toISOString()
                .split("T")[0];
            }
            if (resData.endDate) {
              resData.endDate = new Date(resData.endDate)
                .toISOString()
                .split("T")[0];
            }

            setForm(resData);
            setTab(resData.cuponCode ? "promo" : "automatic");
          }
        }

        const resproduct = await httpGet("products");
        setProducts(resproduct.data.data);
      } catch (err) {
        handleError(err, router);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);


  useEffect(() => {
  setForm((prev) => ({
    ...prev,
    isPublic: tab === "automatic",
    cuponCode: tab === "automatic" ? "" : prev.cuponCode,
    usageLimit: tab === "automatic" ? "" : prev.usageLimit,
    minPurchase: tab === "automatic" ? "" : prev.minPurchase,
    targets: tab === "promo" ? [] : prev.targets
  }));
}, [tab]);


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
    } else if (type === "checkbox") {
      const input = e.target as HTMLInputElement;
      setForm((prev) => ({ ...prev, [name]: input.checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = { ...form };

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

      {/* Tabs */}
      <div className="flex mb-4">
        <button
          type="button"
          onClick={() => setTab("automatic")}
          className={`px-4 py-2 rounded-t-lg ${
            tab === "automatic" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          Automatic Discount
        </button>
        <button
          type="button"
          onClick={() => setTab("promo")}
          className={`px-4 py-2 rounded-t-lg ${
            tab === "promo" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          Promo Code Discount
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Common Fields */}
        <div className="flex items-center gap-4">
          <label className="w-1/4 label">Name<span className="text-red-500 ml-1">*</span></label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-3/4 text-input"
          />
        </div>

        <div className="flex items-center gap-4">
          <label className="w-1/4 label">Type <span className="text-red-500 ml-1">*</span></label>
          <select
            name="discountType"
            value={form.discountType}
            onChange={handleChange}
            required
            className="w-3/4 text-input"
          >
            <option value="percentage">Percentage (%)</option>
            <option value="fixed">Fixed (MMK)</option>
          </select>
        </div>

        <div className="flex items-center gap-4">
          <label className="w-1/4 label">Discount Value<span className="text-red-500 ml-1">*</span></label>
          <input
            type="number"
            name="value"
            min={0}
            value={form.value}
            onChange={handleChange}
            required
            className="w-3/4 text-input"
          />
        </div>

        {tab === "automatic" && (
          <div className="flex items-start gap-4">
            <label className="w-1/4 label">Select Products</label>
            <select
              name="targets"
              multiple
              value={form.targets}
              onChange={handleChange}
              className="w-3/4 text-input"
            >
              {products.map((product) => (
                <option key={product._id} value={product._id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex items-center gap-4">
          <label className="w-1/4 label">Start Date</label>
          <input
            type="date"
            name="startDate"
            value={form.startDate}
            onChange={handleChange}
            className="w-3/4 text-input"
          />
        </div>

        <div className="flex items-center gap-4">
          <label className="w-1/4 label">End Date</label>
          <input
            type="date"
            name="endDate"
            value={form.endDate}
            onChange={handleChange}
            className="w-3/4 text-input"
          />
        </div>

        {/* Promo Code Fields */}
        {tab === "promo" && (
          <>
            <div className="flex items-center gap-4">
              <label className="w-1/4 label">Minimum Purchase (MMK)</label>
              <input
                type="number"
                name="minPurchase"
                value={form.minPurchase}
                min={0}
                onChange={handleChange}
                className="w-3/4 text-input"
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="w-1/4 label">Usage Limit</label>
              <input
                type="number"
                name="usageLimit"
                value={form.usageLimit}
                min={0}
                onChange={handleChange}
                className="w-3/4 text-input"
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="w-1/4 label">Promo Code<span className="text-red-500 ml-1">*</span></label>
              <input
                type="text"
                name="cuponCode"
                value={form.cuponCode}
                onChange={handleChange}
                required
                className="w-3/4 text-input"
              />
            </div>
          </>
        )}

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
