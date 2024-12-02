"use client";
import { useSearchParams } from "next/navigation";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import RegionForm from "@/components/Region/RegionForm";

const EditRegionPage = () => {
  const searchParams = useSearchParams();
  const id = searchParams.get("_id");

  return (
    <DefaultLayout>
      <Breadcrumb pageName="Edit Region" />

      <div className="flex flex-col gap-10">
        <RegionForm id={id} />
      </div>
    </DefaultLayout>
  );
};

export default EditRegionPage;
