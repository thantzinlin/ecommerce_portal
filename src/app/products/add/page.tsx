"use client";
import { useSearchParams } from "next/navigation";
import ProductForm from "@/components/Products/ProductForm";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";

const AddProductPage = () => {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  return (
    <DefaultLayout>
      <Breadcrumb pageName="Add Product" />

      <div className="flex flex-col gap-10">
        <ProductForm id="" />
      </div>
    </DefaultLayout>
  );
};

export default AddProductPage;
