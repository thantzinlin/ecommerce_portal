"use client";
import { useSearchParams } from "next/navigation";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import ReceiveInventory from "@/components/Inventory/ReceiveInventory";

const PurchaseOrderViewPage = () => {
  const searchParams = useSearchParams();
  const id = searchParams.get("_id");

  if (!id) {
    return (
      <DefaultLayout>
        <div className="text-center text-red-600">Purchase order ID not found.</div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <Breadcrumb pageName="Receive Inventory" />
      <div className="flex flex-col gap-10">
        <ReceiveInventory purchaseOrderId={id} />
      </div>
    </DefaultLayout>
  );
};

export default PurchaseOrderViewPage;
