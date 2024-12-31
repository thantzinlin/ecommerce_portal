import { useRouter } from "next/router";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import CategoryForm from "@/components/Category/CategoryForm";

const EditCategoryPage = () => {
  const router = useRouter();
  const { slug } = router.query;
  if (!slug) {
    return <p>Loading...</p>; // Or show an error/loading state while the slug is being resolved
  }

  return (
    <DefaultLayout>
      <Breadcrumb pageName="Edit Category" />

      <div className="flex flex-col gap-10">
        <CategoryForm slug={slug as string} />
      </div>
    </DefaultLayout>
  );
};

export default EditCategoryPage;
