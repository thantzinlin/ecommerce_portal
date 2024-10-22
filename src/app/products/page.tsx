import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import ProductList from "@/components/Products/ProductList";

const ProductListPage = () => {
  return (
    <DefaultLayout>
      <Breadcrumb pageName="Products" />

      <div className="flex flex-col gap-10">
        <ProductList />
      </div>
    </DefaultLayout>
  );
};

export default ProductListPage;
