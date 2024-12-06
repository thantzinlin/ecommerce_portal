import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import CategoryList from "@/components/Category/CategoryList";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

const CategoryListPage = () => {
  return (
    <DefaultLayout>
      <Breadcrumb pageName="Categories" /> {/* Updated page name */}
      <div className="flex flex-col gap-10">
        <CategoryList /> {/* Updated to use CategoryList */}
      </div>
    </DefaultLayout>
  );
};

export default CategoryListPage;
