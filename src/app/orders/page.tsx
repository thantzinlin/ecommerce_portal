import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import OrderList from "@/components/Orders/OrderList";

const ProductListPage = () => {
  return (
    <DefaultLayout>
      <Breadcrumb pageName="Orders" />

      <div className="flex flex-col gap-10">
        <OrderList />
      </div>
    </DefaultLayout>
  );
};

export default ProductListPage;
