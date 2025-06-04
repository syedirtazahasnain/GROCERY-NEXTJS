// app/orders/page.tsx
"use client";
import { toast } from "react-toastify";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Order } from "@/types";
import Sidebar from "@/app/_components/sidebar/index";
import Header from "@/app/_components/header/index";
import Breadcrumb from "@/app/_components/ui/Breadcrumb";
import { Visibility } from "@mui/icons-material";

import ErrorMessage from "@/app/_components/error/index";
import Loader from "@/app/_components/loader/index";

interface PaginatedOrders {
  data: Order[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  links: {
    url: string | null;
    label: string;
    active: boolean;
  }[];
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<PaginatedOrders | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = searchParams.get("page") || "1";

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/auth/login");
          return;
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/orders?page=${currentPage}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          toast.error("Failed to fetch orders");
        }

        const data = await response.json();
        setOrders(data.data);
      } catch (err) {
        if (err instanceof Error) {
          toast.error(err.message);
          setError(err.message);
        } else {
          toast.error("Failed to load orders");
          setError("Failed to load order");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [currentPage, router]);


  if (loading) {
    return (
      <Loader />
    );
  }

  if (error) {
    return (
      <ErrorMessage error={error} />
    );
  }

  // if (!orders?.data.length) {
  //   return <ErrorMessage error="No orders found" />;
  // }

  return (
    <div className="min-h-screen flex gap-[20px] px-[20px] xl:px-[30px]">
      <div className="w-[15%] relative">
        <Sidebar />
      </div>
      <div className="w-full mx-auto space-y-4 p-4">
        <div><Header /></div>
        <div className="px-6 py-6 bg-[#f9f9f9] rounded-[20px] xl:rounded-[25px] text-[#2b3990]">
          <h1 className="text-2xl font-bold my-0">All Orders Details</h1>
          <Breadcrumb
            items={[{ label: "Dashboard" }, { label: "User Orders" }]}
          />
        </div>

        <div className="overflow-x-auto mb-8">
          <div className="p-[15px] rounded-[20px] xl:rounded-[25px] bg-[#f9f9f9]">
            <table className="w-full">
              <thead className="">
                <tr>
                  <th className="px-6 py-2 text-left text-sm font-medium text-[#000] rounded-l-[15px] bg-gray-200">
                    Order #
                  </th>
                  <th className="px-6 py-2 text-left text-sm font-medium text-[#000] bg-gray-200">
                    Status
                  </th>
                  <th className="px-6 py-2 text-left text-sm font-medium text-[#000] bg-gray-200">
                    Date
                  </th>
                  <th className="px-6 py-2 text-left text-sm font-medium text-[#000] bg-gray-200">
                    Total
                  </th>
                  <th className="px-6 py-2 text-left text-sm font-medium text-[#000] bg-gray-200 rounded-r-[15px]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {orders.data.map((order, index) => (
                  <tr
                    key={order.id}
                    className={`border-b ${index % 2 === 0 ? "bg-gray-50" : "bg-white"
                      }`}
                  >
                    <td className="px-6 py-2 text-sm text-gray-900">
                      {order.order_number}
                    </td>
                    <td className="px-6 py-2 text-sm text-gray-900 capitalize">
                      <div className="bg-yellow-400 rounded-[10px] uppercase text-xs inline-block px-2 py-1 text-[#000]">
                        {order.status}
                      </div>
                    </td>
                    <td className="px-6 py-2 text-sm text-gray-900">
                      {order.created_at}
                    </td>
                    <td className="px-6 py-2 text-lg text-gray-900 font-semibold">
                      <span className="text-xs font-normal mr-[5px]"> PKR </span>
                      {order.grand_total}
                    </td>
                    <td className="px-6 py-2 text-sm text-gray-900">
                      <Link
                        href={`/dashboard/user/orders/${order.id}`}
                        className="text-blue-300 hover:text-blue-800"
                      >
                        <div className="bg-blue-500 rounded-[10px] uppercase text-xs inline-block px-2 py-1 text-[#fff]">
                          View
                        </div>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination Controls */}
        <div className="flex justify-end gap-2 mt-6 mr-[20px]">
          {orders.links.map((link, index) => {
            if (link.url === null) return null;

            const page = new URL(link.url).searchParams.get("page") || "1";
            const isActive = link.active;
            const isPrevious = link.label.includes("Previous");
            const isNext = link.label.includes("Next");

            return (
              <Link
                key={index}
                href={`/dashboard/user/orders?page=${page}`}
                className={`m-0 w-[30px] h-[30px] flex items-center justify-center rounded-lg ${isActive
                  ? "bg-[#2b3990] text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
                  } ${isPrevious || isNext ? "font-semibold" : ""}`}
              >
                {isPrevious ? "«" : isNext ? "»" : link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
