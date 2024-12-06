"use client";
import { useSearchParams } from "next/navigation";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import OrderDetails from "@/components/Orders/OrderDetails";

const OrderDetailPage = () => {
  const searchParams = useSearchParams();
  const id = searchParams.get("_id"); // Retrieve the order ID from query params

  if (!id) {
    return <p>Order ID not found.</p>;
  }

  return (
    <DefaultLayout>
      <Breadcrumb pageName="Order Details" />

      <div className="flex flex-col gap-10">
        {/* Pass the order ID as a prop to OrderDetails */}
        <OrderDetails orderId={id} />
      </div>
    </DefaultLayout>
  );
};

export default OrderDetailPage;
