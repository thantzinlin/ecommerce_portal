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
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newCity, setNewCity] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchCities();
        if (id) await fetchTownshipData(id);
      } catch (error) {
        handleError(error, router);
      }
    };
    fetchData();
  }, [id]);

  const fetchCities = async () => {
    try {
      const response = await httpGet("cities");
      if (response.data.returncode === "200") {
        setCities(response.data.data);
      }
    } catch (error) {
      handleError(error, router);
    }
  };

  const fetchTownshipData = async (id: string) => {
    try {
      const response = await httpGet(`townships/${id}`);
      if (response.data.returncode === "200") {
        setRegionData(response.data.data);
      }
    } catch (error) {
      handleError(error, router);
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
        : await httpPost("townships", regionData);

      Swal.fire({
        icon: "success",
        text: res.data.returnmessage,
        showConfirmButton: false,
        timer: 5000,
      });
      router.push("/region");
    } catch (error) {
      handleError(error, router);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCity = () => {
    setShowModal(true); // Open the modal
  };

  const handleSaveCity = async () => {
    if (newCity.trim()) {
      const response = await httpPost(`cities`, { name: newCity });
      if (response.data.returncode === "200") {
        //setRegionData(response.data.data);
        fetchCities();
        Swal.fire({
          icon: "success",
          text: response.data.returnmessage,
          showConfirmButton: false,
          timer: 5000,
        });
      }
      setNewCity("");
      setShowModal(false);
    }
  };

  const renderCityOptions = () =>
    cities.map((city) => (
      <option key={city._id} value={city._id}>
        {city.name}
      </option>
    ));

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
            <div className="flex items-center gap-4">
              <label className="w-1/4 text-sm font-medium">City</label>
              <div className="relative flex w-3/4 items-center gap-2">
                <select
                  name="cityId"
                  value={regionData.cityId}
                  onChange={handleChange}
                  required
                  className="flex-grow rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring"
                >
                  <option value="" disabled>
                    Select a city
                  </option>
                  {renderCityOptions()}
                </select>
                <button
                  type="button"
                  onClick={handleAddCity}
                  className="rounded-full bg-blue-500 p-2 text-white hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300"
                  title="Add City"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                    className="h-5 w-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </button>
              </div>
            </div>

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
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-1/3 rounded-lg bg-white p-6 shadow-lg">
            <h3 className="mb-4 text-center text-lg font-semibold">
              Add New City
            </h3>
            <input
              type="text"
              value={newCity}
              onChange={(e) => setNewCity(e.target.value)}
              placeholder="Enter city name"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring"
            />
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)} // Close modal on Cancel
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCity}
                className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:outline-none focus:ring"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegionForm;
