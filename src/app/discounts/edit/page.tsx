"use client";
import { useSearchParams } from "next/navigation";
import ProductForm from "@/components/Products/ProductForm";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DiscountForm from "@/components/Discount/DiscountForm";

const EditDiscountPage = () => {
  const searchParams = useSearchParams();
  const id = searchParams.get("_id");

  return (
    <DefaultLayout>
      <Breadcrumb pageName="Edit Product" />

      <div className="flex flex-col gap-10">
        <DiscountForm slug={id} />
      </div>
    </DefaultLayout>
  );
};

export default EditDiscountPage;
