import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import CustomerList from "@/components/Customer/CustomerList";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

const CustomerListPage = () => {
  return (
    <DefaultLayout>
      <Breadcrumb pageName="Customer" />
      <div className="flex flex-col gap-10">
        <CustomerList />
      </div>
    </DefaultLayout>
  );
};

export default CustomerListPage;
