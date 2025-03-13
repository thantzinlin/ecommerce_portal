// import { server_domain } from "@/constants";
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import Swal from "sweetalert2";

// Helper function for extracting the token from localStorage
const getToken = (): string | null => {
  return localStorage.getItem("token");
};

// Utility for POST request
export async function httpPost<T>(
  url: string,
  body: T,
  config: AxiosRequestConfig = {},
): Promise<AxiosResponse<any>> {
  const headers = {
    Authorization: `Bearer ${getToken()}`,
  };

  console.log(`[${url}] method: POST`);
  console.log(`[${url}] config: ${JSON.stringify(config)}`);
  console.log(`[${url}] body: ${JSON.stringify(body)}`);
  console.log(`[${url}] headers: ${JSON.stringify(headers)}`);

  const res = await axios.post(
    `${process.env.NEXT_PUBLIC_API_URL}${url}`,
    body,
    {
      headers,
      ...config,
    },
  );

  console.log(`[${url}] response: ${JSON.stringify(res.data)}`);
  return res;
}

// Utility for PUT request
export async function httpPut<T>(
  url: string,
  body: T,
  config: AxiosRequestConfig = {},
): Promise<AxiosResponse<any>> {
  const headers = {
    Authorization: `Bearer ${getToken()}`,
  };

  console.log(`[${url}] method: PUT`);
  console.log(`[${url}] config: ${JSON.stringify(config)}`);
  console.log(`[${url}] body: ${JSON.stringify(body)}`);
  console.log(`[${url}] headers: ${JSON.stringify(headers)}`);

  const res = await axios.put(
    `${process.env.NEXT_PUBLIC_API_URL}${url}`,
    body,
    {
      headers,
      ...config,
    },
  );

  console.log(`[${url}] response: ${JSON.stringify(res.data)}`);
  return res;
}

// Utility for PATCH request
export async function httpPatch<T>(
  url: string,
  body: T,
  config: AxiosRequestConfig = {},
): Promise<AxiosResponse<any>> {
  const headers = {
    Authorization: `Bearer ${getToken()}`,
  };

  console.log(`[${url}] method: PATCH`);
  console.log(`[${url}] config: ${JSON.stringify(config)}`);
  console.log(`[${url}] body: ${JSON.stringify(body)}`);
  console.log(`[${url}] headers: ${JSON.stringify(headers)}`);

  const res = await axios.patch(
    `${process.env.NEXT_PUBLIC_API_URL}${url}`,
    body,
    {
      headers,
      ...config,
    },
  );

  console.log(`[${url}] response: ${JSON.stringify(res.data)}`);
  return res;
}

// Utility for GET request
export async function httpGet(
  url: string,
  config: AxiosRequestConfig = {},
): Promise<AxiosResponse<any>> {
  const headers = {
    Authorization: `Bearer ${getToken()}`,
  };

  console.log(`[${url}] method: GET`);
  console.log(`[${url}] config: ${JSON.stringify(config)}`);
  console.log(`[${url}] headers: ${JSON.stringify(headers)}`);

  const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}${url}`, {
    headers,
    ...config,
  });

  console.log(`[${url}] response: ${JSON.stringify(res.data)}`);
  return res;
}

// Utility for DELETE request
export async function httpDelete(
  url: string,
  config: AxiosRequestConfig = {},
): Promise<AxiosResponse<any>> {
  const headers = {
    Authorization: `Bearer ${getToken()}`,
  };

  console.log(`[${url}] method: DELETE`);
  console.log(`[${url}] config: ${JSON.stringify(config)}`);
  console.log(`[${url}] headers: ${JSON.stringify(headers)}`);

  const res = await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}${url}`, {
    headers,
    ...config,
  });

  console.log(`[${url}] response: ${JSON.stringify(res.data)}`);
  return res;
}

// Error handling function
export const handleError = (err: any, router: any): void => {
  console.log(err);
  if (err.status === 401 ) {
    // const message = err.response.data.returnmessage.toLowerCase();
    // if (
    //   message === "invalid token" ||
    //   message === "token expired" ||
    //   message === "invalid authorization header format"
    // ) {
      localStorage.setItem("token", "");
      router.push("/auth/signin");
      Swal.fire({
        title: "Session Expired",
        text: "Your session has ended due to inactivity. For your security, we've logged you out. Please log in again to continue.",
        showConfirmButton: false,
        icon: "warning",
        timer: 5000,
      });
    } else if ( err.status === 204 ) {
      Swal.fire({
        icon: "info",
        text: "Data Not Found.",
        showConfirmButton: false,
        timer: 5000,
      });
    } else {
      Swal.fire({
        icon: "error",
        text: err.response.data.returnmessage,
        showConfirmButton: false,
        timer: 5000,
      });
    }

};

// File upload function
export const uploadFile = async (
  url: string,
  file: File,
): Promise<AxiosResponse<any>> => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await axios.post(
    `${process.env.NEXT_PUBLIC_API_URL}${url}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  console.log(`[${url}] response: ${JSON.stringify(res.data)}`);
  return res;
};
