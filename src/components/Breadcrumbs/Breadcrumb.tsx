"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface BreadcrumbProps {
  pageName: string; // The name to display for the current page (e.g., "Edit Product")
}

const Breadcrumb = ({ pageName }: BreadcrumbProps) => {
  const pathname = usePathname(); // Get the current route path (e.g., "/products/edit")
  const paths = pathname.split("/").filter((path) => path); // Split path into segments

  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <nav>
        <ol className="flex items-center gap-2">
          <li>
            <Link href="/" className="font-medium">
              Dashboard /
            </Link>
          </li>

          {/* Loop through path segments and create links */}
          {paths.map((segment, index) => {
            const href = "/" + paths.slice(0, index + 1).join("/");
            const isLast = index === paths.length - 1;

            return (
              <li key={href}>
                {!isLast ? (
                  <Link href={href} className="font-medium">
                    {capitalize(segment)} /
                  </Link>
                ) : (
                  <span className="font-medium text-primary">
                    {pageName || capitalize(segment)}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
};

// Helper function to capitalize breadcrumb labels
const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

export default Breadcrumb;
