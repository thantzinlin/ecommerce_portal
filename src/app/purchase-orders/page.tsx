import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import PurchaseOrderList from "@/components/PurchaseOrders/PurchaseOrderList";

const PurchaseOrdersPage = () => {
  return (
    <DefaultLayout>
      <Breadcrumb pageName="Purchase Orders" />
      <div className="flex flex-col gap-10">
        <PurchaseOrderList />
      </div>
    </DefaultLayout>
  );
};

export default PurchaseOrdersPage;
