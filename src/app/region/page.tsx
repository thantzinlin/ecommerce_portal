import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import RegionList from "@/components/Region/RegionList";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

const RegionListPage = () => {
  return (
    <DefaultLayout>
      <Breadcrumb pageName="Categories" />
      <div className="flex flex-col gap-10">
        <RegionList />
      </div>
    </DefaultLayout>
  );
};

export default RegionListPage;
