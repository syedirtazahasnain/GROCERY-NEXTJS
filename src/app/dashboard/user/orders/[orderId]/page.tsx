"use client";

import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import Header from "@/app/_components/header/index";
import Sidebar from "@/app/_components/sidebar/index";
import Loader from "@/app/_components/loader/index";
import Breadcrumb from "@/app/_components/ui/Breadcrumb";
import { toast } from "react-toastify";

interface Order {
  id: number;
  order_number: string;
  status: string;
  grand_total: string;
  discount: string;
  created_at: string;
  is_editable: number;
  items: {
    id: number;
    product_id: number;
    quantity: string;
    unit_price: string;
    price: string;
    product: {
      id: number;
      name: string;
      detail: string;
      price: string;
      type: string;
      brand: string;
      measure: string;
      image: string | null;
      status: number;
    };
  }[];
}

export default function OrderDetailsPage() {
  const params = useParams();
  const orderId = params.orderId as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/auth/login");
          return;
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/orders/${orderId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          toast.error("Failed to fetch order");
        }

        const data = await response.json();
        setOrder(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        if (err instanceof Error) {
          toast.error(err.message);
          setError(err.message);
        } else {
          toast.error("An error occurred");
          setError("An error occurred");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, router]);

  if (loading) return <Loader />;
  if (error)
    return <div className="container mx-auto p-4 text-red-500">{error}</div>;
  if (!order)
    return <div className="container mx-auto p-4">No order found</div>;

  return (
    <div className="min-h-screen flex gap-[20px] px-[20px] xl:px-[30px]">
      <div className="w-[15%] relative">
        <Sidebar />
      </div>
      <div className="w-full mx-auto space-y-4 p-4">
        <div><Header /></div>
        <div className="px-6 py-6 bg-[#f9f9f9] rounded-[20px] xl:rounded-[25px] text-[#2b3990]">
          <h1 className="text-2xl font-bold my-0">Order Detail</h1>
          <Breadcrumb
            items={[{ label: "Dashboard" }, { label: "Single Order Detail" }]}
          />
        </div>

        <div className="overflow-hidden rounded-[20px] xl:rounded-[25px] border border-gray-200 bg-white">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between px-6 py-4">
            <div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                    Order #{order.order_number}
                  </h3>
                </div>
                <div className="flex items-center rounded justify-center bg-green-700 px-3 py-1 text-xs uppercase leading-none font-semibold text-[#fff]">
                  {order.status}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <p className="rounded-full pr-3 py-0.5 text-xs capitalize">
                  <span className="pr-[10px]">Company Contribution:</span>
                  <span className="text-xs"> PKR </span>
                  <span className="text-lg font-semibold">
                    {order.discount}
                  </span>
                </p>
                <p className="rounded-full px-3 py-0.5 text-xs capitalize">
                  <span className="pr-[10px]">Employee Contribution:</span>
                  <span className="text-xs"> PKR </span>
                  <span className="text-lg font-semibold">
                    {Number(order.grand_total) - Number(order.discount)}
                  </span>
                </p>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-3">
                <p className="rounded-full px-3 py-0.5 text-xs capitalize">
                  <span className="pr-[10px]">Order Date:</span>
                  <span className="text-sm font-semibold">
                    {order.created_at}
                  </span>
                </p>
                <p className="rounded-[10px] text-[#fff] px-3 py-0.5 text-xs capitalize bg-[#2b3990]">
                  <span className="pr-[10px]">Grand Total:</span>
                  <span className="text-sm"> PKR </span>
                  <span className="text-xl font-semibold">
                    {order.grand_total}
                  </span>
                </p>
              </div>

              <div className="flex items-center justify-end mt-2">
                <button
                  className={`px-3 py-1 text-xs rounded uppercase font-semibold ${order.is_editable === 1
                    ? "bg-blue-500 text-white hover:bg-blue-600"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  disabled={order.is_editable !== 1}
                  onClick={async () => {
                    try {
                      const token = localStorage.getItem("token");
                      if (!token) {
                        toast.error("thorized! Please login again.");
                        router.push("/auth/login");
                        return;
                      }

                      const response = await fetch(
                        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/orders/edit-last-order`,
                        {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                          },
                        }
                      );

                      const data = await response.json();

                      if (response.ok && data.success) {
                        toast.success("Order is now editable!");
                        router.push("/dashboard/user/product-list");
                      } else {
                        toast.error(data.message || "Something went wrong.");
                      }
                    } catch (error) {
                      toast.error(
                        error instanceof Error ? error.message : "Failed to update order."
                      );
                    }
                  }}
                >
                  Edit Order
                </button>
              </div>
            </div>
          </div>

          <div className="w-full overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr className="border-gray-100 border-y dark:border-gray-800">
                  <th className="py-2 px-4">
                    <div className="flex items-center">
                      <p className="font-medium text-[#000] text-xs">Products</p>
                    </div>
                  </th>
                  <th className="py-2 px-4">
                    <div className="flex items-center justify-center">
                      <p className="font-medium text-[#000] text-xs">Type</p>
                    </div>
                  </th>
                  <th className="py-2 px-4">
                    <div className="flex items-center justify-center">
                      <p className="font-medium text-[#000] text-xs">Brand</p>
                    </div>
                  </th>
                  <th className="py-2 px-4">
                    <div className="flex items-center justify-center">
                      <p className="font-medium text-[#000] text-xs">Measure</p>
                    </div>
                  </th>
                  <th className="py-2 px-4">
                    <div className="flex items-center justify-center">
                      <p className="font-medium text-[#000] text-xs">Quantity</p>
                    </div>
                  </th>
                  <th className="py-2 px-4">
                    <div className="flex items-center justify-center col-span-2">
                      <p className="font-medium text-[#000] text-xs">Price</p>
                    </div>
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {order.items.map((item, itemIndex) => (
                  <tr
                    key={`${order.id}-${item.id}`} // Combine order.id and item.id to create a unique key
                    className={`border-b ${itemIndex % 2 !== 0 ? "bg-gray-50" : "bg-white"
                      }`}
                  >
                    <td className="py-2 px-4">
                      <div className="flex items-center">
                        <div className="flex items-center gap-3">
                          <div className="h-[40px] w-[40px] overflow-hidden rounded-full">
                            <img src={item.product.image ? `${process.env.NEXT_PUBLIC_BACKEND_URL_PUBLIC}${item.product.image}` : "/images/items/product-default.png"} alt="Product"
                              onError={(e) => {
                                e.currentTarget.src = "/images/items/product-default.png";
                              }}
                            />
                          </div>
                          <div>
                            <p className="font-medium text-gray-800 text-sm dark:text-white/90 capitalize">
                              {item.product.name}
                            </p>
                            <span className="text-gray-500">
                              {item.unit_price} Rs
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-2 px-4">
                      <div className="flex items-center justify-center">
                        <p className="text-gray-500 text-sm dark:text-gray-400">
                          {item.product.type}
                        </p>
                      </div>
                    </td>
                    <td className="py-2 px-4">
                      <div className="flex items-center justify-center">
                        <p className="text-gray-500 text-sm dark:text-gray-400">
                          {item.product.brand}
                        </p>
                      </div>
                    </td>
                    <td className="py-2 px-4">
                      <div className="flex items-center justify-center">
                        <p className="text-gray-500 text-sm dark:text-gray-400">
                          {item.product.measure}
                        </p>
                      </div>
                    </td>
                    <td className="py-2 px-4">
                      <div className="flex items-center justify-center">
                        <p className="text-gray-500 text-sm dark:text-gray-400">
                          {item.quantity}x
                        </p>
                      </div>
                    </td>
                    <td className="py-2 px-4">
                      <div className="flex items-center justify-center">
                        <p className="rounded-full px-2 py-0.5 text-lg text-[#2b3990] font-semibold">
                          <span className="text-xs font-normal"> PKR </span> {item.price}
                        </p>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
