"use client";
import { useSearchParams } from "next/navigation";
import DiscountForm from "@/components/Discount/DiscountForm";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";

const AddDiscountPage = () => {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  return (
    <DefaultLayout>
      <Breadcrumb pageName="Add Discount" />

      <div className="flex flex-col gap-10">
        <DiscountForm  slug={""} />
      </div>
    </DefaultLayout>
  );
};

export default AddDiscountPage;
