import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import DiscountList from "@/components/Discount/DiscountList";

const DiscountListPage = () => {
  return (
    <DefaultLayout>
      <Breadcrumb pageName="Discounts" />

      <div className="flex flex-col gap-10">
        <DiscountList/>
      </div>
    </DefaultLayout>
  );
};

export default DiscountListPage;
