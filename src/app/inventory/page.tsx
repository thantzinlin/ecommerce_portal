import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import InventoryDashboard from "@/components/Inventory/InventoryDashboard";

const InventoryPage = () => {
  return (
    <DefaultLayout>
      <Breadcrumb pageName="Inventory Dashboard" />
      <div className="flex flex-col gap-10">
        <InventoryDashboard />
      </div>
    </DefaultLayout>
  );
};

export default InventoryPage;
