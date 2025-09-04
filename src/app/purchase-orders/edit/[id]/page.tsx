import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import PurchaseOrderFormWithVariants from "@/components/PurchaseOrders/PurchaseOrderFormWithVariants";

interface EditPurchaseOrderPageProps {
  params: {
    id: string;
  };
}

const EditPurchaseOrderPage = ({ params }: EditPurchaseOrderPageProps) => {
  return (
    <DefaultLayout>
      <Breadcrumb pageName="Edit Purchase Order" />
      <div className="flex flex-col gap-10">
        <PurchaseOrderFormWithVariants editId={params.id} />
      </div>
    </DefaultLayout>
  );
};

export default EditPurchaseOrderPage;
