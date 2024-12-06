"use client";
import { useSearchParams } from "next/navigation";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import CategoryForm from "@/components/Category/CategoryForm";

const AddCategoryPage = () => {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  return (
    <DefaultLayout>
      <Breadcrumb pageName="Add Category" />

      <div className="flex flex-col gap-10">
        <CategoryForm id="" />
      </div>
    </DefaultLayout>
  );
};

export default AddCategoryPage;
