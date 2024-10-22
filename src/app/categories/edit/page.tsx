"use client";
import { useSearchParams } from "next/navigation";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import CategoryForm from "@/components/Category/CategoryForm";

const EditCategoryPage = () => {
  const searchParams = useSearchParams();
  const id = searchParams.get("_id");

  return (
    <DefaultLayout>
      <Breadcrumb pageName="Edit Category" />

      <div className="flex flex-col gap-10">
        <CategoryForm id={id} />
      </div>
    </DefaultLayout>
  );
};

export default EditCategoryPage;
