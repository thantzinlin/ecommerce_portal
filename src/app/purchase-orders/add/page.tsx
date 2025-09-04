import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import PurchaseOrderFormWithVariants from "@/components/PurchaseOrders/PurchaseOrderFormWithVariants";

const AddPurchaseOrderPage = () => {
  return (
    <DefaultLayout>
      <Breadcrumb pageName="Create Purchase Order" />
      <div className="flex flex-col gap-10">
        <PurchaseOrderFormWithVariants />
      </div>
    </DefaultLayout>
  );
};

export default AddPurchaseOrderPage;
