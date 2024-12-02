"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { handleError, httpGet, httpPost, httpPut } from "@/utils/apiClient";

interface Township {
  cityId: string;
  name: string;
}

interface City {
  _id: string;
  name: string;
}

interface RegionFormProps {
  id: string | null;
}

const RegionForm: React.FC<RegionFormProps> = ({ id }) => {
  const [regionData, setRegionData] = useState<Township>({
    cityId: "",
    name: "",
  });
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      await fetchCities();
      if (id) {
        await fetchTownshipData(id);
      }
    } catch (err) {
      console.error(err);
      handleError(err, router);
    }
  };

  const fetchCities = async () => {
    try {
      const response = await httpGet("cities");
      if (response.data.returncode === "200") {
        setCities(response.data.data);
      }
    } catch (err) {
      console.error(err);
      handleError(err, router);
    }
  };

  const fetchTownshipData = async (id: string) => {
    try {
      const response = await httpGet(`townships/${id}`);
      if (response.data.returncode === "200") {
        setRegionData(response.data.data);
      }
    } catch (err) {
      console.error(err);
      handleError(err, router);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setRegionData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = id
        ? await httpPut(`townships/${id}`, regionData)
        : await httpPost(`townships`, regionData);

      Swal.fire({
        icon: "success",
        text: res.data.returnmessage,
        showConfirmButton: false,
        timer: 5000,
      });
      router.push("/region");
    } catch (error) {
      console.error("Failed to save region data", error);
      handleError(error, router);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-md">
      <h4 className="mb-6 text-center text-2xl font-semibold">
        {id ? "Edit Region" : "New Region"}
      </h4>

      {loading ? (
        <p className="text-center">Loading...</p>
      ) : (
        <div className="mx-auto max-w-4xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* City Dropdown */}
            <div className="flex items-center gap-4">
              <label className="w-1/4 text-sm font-medium">City</label>
              <select
                name="cityId"
                value={regionData.cityId}
                onChange={handleChange}
                required
                className="w-3/4 rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring"
              >
                <option value="" disabled>
                  Select a city
                </option>
                {cities.map((city) => (
                  <option key={city._id} value={city._id}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Township Name Input */}
            <div className="flex items-center gap-4">
              <label className="w-1/4 text-sm font-medium">Township Name</label>
              <input
                type="text"
                name="name"
                value={regionData.name}
                onChange={handleChange}
                required
                className="w-3/4 rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="mx-auto block w-1/4 rounded-lg bg-blue-600 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Saving..." : id ? "Update" : "Save"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default RegionForm;
