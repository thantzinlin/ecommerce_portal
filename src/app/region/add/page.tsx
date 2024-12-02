"use client";
import { useSearchParams } from "next/navigation";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import RegionForm from "@/components/Region/RegionForm";

const AddRegionPage = () => {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  return (
    <DefaultLayout>
      <Breadcrumb pageName="Add Region" />

      <div className="flex flex-col gap-10">
        <RegionForm id="" />
      </div>
    </DefaultLayout>
  );
};

export default AddRegionPage;
