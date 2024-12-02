"use client"; // This line marks the component as a Client Component

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { httpPost } from "@/utils/apiClient";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext"; // Adjust the import path if needed

// import { useAuth } from "../../auth/context/AuthContext";
const SignIn: React.FC = () => {
  const router = useRouter();
  //const [username, setUserName] = useState("");
  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  // const { login } = useAuth(); // Access the login function

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission

    try {
      const response = await httpPost("auth/login", { phone: email, password });

      if (response.data.returncode === "200") {
        console.log("access token: " + response.data.data.token);
        localStorage.setItem("token", response.data.data.token);
        // login();
        router.push("/");
      } else {
        Swal.fire({
          title: "Failed!",
          text: response.data.returnmessage || "Login failed",
          icon: "error",
          showConfirmButton: false,
          timer: 3000,
        });
      }
    } catch (error: any) {
      console.error("Error during login:", error);
      Swal.fire({
        title: "Error!",
        text:
          "Login failed: " +
          (error.response?.data?.returnmessage || "Unknown error"),
        icon: "error",
        showConfirmButton: false,
        timer: 3000,
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-6">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <div className="mb-6 text-center">
          <Link href="/" passHref>
            <Image
              src="/images/logo/logo.svg"
              alt="Logo"
              width={150}
              height={30}
              className="mx-auto mb-4 dark:hidden"
            />
            <Image
              src="/images/logo/logo-dark.svg"
              alt="Logo Dark"
              width={150}
              height={30}
              className="mx-auto hidden dark:block"
            />
          </Link>
          <h2 className="text-2xl font-semibold text-gray-800">
            Welcome Back!
          </h2>
          <p className="text-sm text-gray-500">
            Sign in to your account to continue
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleLogin}>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="text"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-md border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-md border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input type="checkbox" className="form-checkbox" />
              <span className="ml-2 text-sm text-gray-600">Remember me</span>
            </label>
            <Link href="/forgot-password" className="text-sm text-blue-500">
              Forgot password?
            </Link>
          </div>
          <button
            type="submit"
            className="w-full rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            Sign In
          </button>
        </form>

        {message && (
          <p className="mt-4 text-center text-sm text-red-500">{message}</p>
        )}

        <p className="mt-6 text-center text-sm text-gray-600">
          Don’t have an account?{" "}
          <Link href="/signup" className="text-blue-500 hover:underline">
            Sign up now
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignIn;
