import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import ReceiveInventoryWithVariants from "@/components/Inventory/ReceiveInventoryWithVariants";

interface ReceivePurchaseOrderPageProps {
  params: {
    id: string;
  };
}

const ReceivePurchaseOrderPage = ({ params }: ReceivePurchaseOrderPageProps) => {
  return (
    <DefaultLayout>
      <Breadcrumb pageName="Receive Purchase Order" />
      <div className="flex flex-col gap-10">
        <ReceiveInventoryWithVariants purchaseOrderId={params.id} />
      </div>
    </DefaultLayout>
  );
};

export default ReceivePurchaseOrderPage;
