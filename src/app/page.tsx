import ECommerce from "@/components/Dashboard/E-commerce";
import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { AuthProvider } from "./auth/context/AuthContext";
import SignIn from "./auth/signin/page";

export const metadata: Metadata = {
  title:
    "Next.js E-commerce Dashboard | TailAdmin - Next.js Dashboard Template",
  description: "This is Next.js Home for TailAdmin Dashboard Template",
};

export default function Home() {
  return (
    // <AuthProvider>
    // <SignIn />
    <DefaultLayout>
      <ECommerce />
    </DefaultLayout>
    // </AuthProvider>
  );
}
