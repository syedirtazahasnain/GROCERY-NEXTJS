"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import Header from "@/app/_components/adminheader/index";
import ErrorMessage from "@/app/_components/error/index";
import Loader from "@/app/_components/loader/index";
import { DateRangePicker } from "@heroui/react";
import Sidebar from "@/app/_components/adminsidebar/index";
import Breadcrumb from "@/app/_components/ui/Breadcrumb";
import { XMarkIcon } from '@heroicons/react/24/solid';

interface User {
  id: number;
  name: string;
  emp_id: string;
  email: string;
}

interface Product {
  id: number;
  name: string;
  type: string;
  brand: string;
  measure: string;
  image: string | null;
}

interface OrderItem {
  id: number;
  product: Product;
  quantity: number;
  unit_price: number;
  price: number;
}

interface Order {
  id: number;
  order_number: string;
  user: User;
  items: OrderItem[];
  status: string;
  grand_total: number;
  discount: number;
  created_at: string;
  updated_at: string;
}

interface PaginatedOrders {
  current_page: number;
  data: Order[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: {
    url: string | null;
    label: string;
    active: boolean;
  }[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

type DateValue = {
  start: Date | null;
  end: Date | null;
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<PaginatedOrders | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchEmpId, setSearchEmpId] = useState("");
  const [dateRange, setDateRange] = useState<{
    start: Date | null;
    end: Date | null;
  }>({
    start: null,
    end: null,
  });
  const [isSearching, setIsSearching] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [empIdList, setEmpIdList] = useState<string[]>([]);

  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = searchParams.get("page") || "1";

  const fetchOrders = async (
    page = currentPage,
    empIds: string[] = [],
    startDate = "",
    endDate = ""
  ) => {
    try {
      setIsSearching(true);
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/auth/login");
        return;
      }

      const params = new URLSearchParams();
      params.append("page", page);

      if (empIds.length > 0) {
        params.append("emp_id", empIds.join(","));
      }
      if (startDate) {
        params.append("start_date", startDate);
      }
      if (endDate) {
        params.append("end_date", endDate);
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL
        }/api/admin/orders/all?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch orders");
      }

      setOrders(data.data);
      setSelectedOrder(data.data?.data?.[0] ?? null);

      if (data.data?.data?.length === 0) {
        toast.info(data.message || "No orders found matching your criteria");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load orders";
      toast.error(msg);
      setError(msg);
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`?${params.toString()}`);
  };

  const handleSearch = () => {
    const formatDate = (date: Date | null) => {
      if (!date) return "";
      const d = new Date(date);
      const pad = (n: number) => n.toString().padStart(2, "0");
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    };

    const startDate = formatDate(dateRange.start);
    const endDate = formatDate(dateRange.end);

    // Include any final value still in input before search
    const allEmpIds = [...empIdList];
    const trimmed = searchEmpId.trim();
    if (trimmed && !allEmpIds.includes(trimmed)) {
      allEmpIds.push(trimmed);
    }

    fetchOrders("1", allEmpIds, startDate, endDate);
  };

  const generateOrderReport = async () => {
    try {
      setIsGeneratingReport(true);
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/auth/login");
        return;
      }

      const url = new URL(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/order/summary`
      );

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to generate report");
      }
      if (data.success && data.data?.url) {
        window.open(data.data.url, "_blank");
        toast.success("Report generated successfully");
      } else {
        throw new Error(data.message || "Unexpected response format");
      }
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to generate report";
      toast.error(msg);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const clearFilters = () => {
    setSearchEmpId("");
    setDateRange({ start: null, end: null });
    setEmpIdList([]);
    fetchOrders();
  };

  useEffect(() => {
    fetchOrders();
  }, [currentPage, router]);

  return (
    <div className="min-h-screen flex gap-[20px] px-[20px] xl:px-[30px]">
      <div className="w-[15%] relative">
        <Sidebar />
      </div>
      <div className="w-full mx-auto space-y-4 p-4">
        <Header />
        <div className="px-6 py-6 bg-[#f9f9f9] rounded-[20px] xl:rounded-[25px] text-[#2b3990]">
          <h1 className="text-2xl font-bold">All Orders Details</h1>
          <Breadcrumb
            items={[{ label: "Dashboard" }, { label: "All Orders" }]}
          />
        </div>

        <div>
          <div className="flex gap-2 justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="">
                {/* Input field + tags container */}
                <div className="w-full px-3 py-2 rounded-[10px] text-sm border-[#2b3990] border-[2px] bg-gray-100">
                  {/* Tags */}
                  {empIdList.map((id, index) => (
                    <span
                      key={index}
                      className="text-xs px-[10px] py-[4px] bg-[#2b3990] rounded-[10px] text-white flex justify-between items-center gap-1 mb-[2px]"
                    >
                      {id}
                      <button
                        onClick={() =>
                          setEmpIdList((prev) =>
                            prev.filter((_, i) => i !== index)
                          )
                        }
                        className="text-red-300 text-xs"
                      >
                        <XMarkIcon className="h-4 w-4 text-[#fff]" />
                      </button>
                    </span>
                  ))}

                  {/* Actual input */}
                  <input
                    type="text"
                    value={searchEmpId}
                    onChange={(e) => setSearchEmpId(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === ",") {
                        e.preventDefault();
                        const trimmed = searchEmpId.trim();
                        if (trimmed && !empIdList.includes(trimmed)) {
                          setEmpIdList((prev) => [...prev, trimmed]);
                          setSearchEmpId("");
                        }
                      }
                    }}
                    placeholder="Search Emp ID and press enter"
                    className="outline-none bg-transparent"
                  />
                </div>
              </div>

              <DateRangePicker
                className=""
                value={dateRange}
                onChange={setDateRange}
                classNames={{
                  inputWrapper: "w-full px-3 py-2 rounded-[10px] text-sm border-[#2b3990] border-[2px]",
                }}s
                visibleMonths={2}
              />
              <div className="rounded-[10px] flex items-center justify-center bg-[#2b3990] hover:bg-[#00aeef] text-[#fff] transition-all duration-300 ease-in-out text-xs uppercase px-4 py-[10px] text-nowrap">
                <button
                  className="flex items-center gap-2 uppercase"
                  onClick={handleSearch}
                  disabled={isSearching}
                >
                  {isSearching ? "Searching..." : "Search"}
                </button>
              </div>
              <div className="shadow-sm rounded-[10px] flex items-center justify-center bg-[#c00]/80 hover:bg-[#c00] text-[#fff] transition-all duration-300 ease-in-out border-none text-nowrap text-xs uppercase px-4 py-[10px]">
                <button
                  className="flex items-center gap-2 uppercase"
                  onClick={clearFilters}
                >
                  Clear Filters
                </button>
              </div>
            </div>
            <div className="rounded-[10px] flex items-center justify-center bg-[#2b3990] hover:bg-[#00aeef] text-[#fff] transition-all duration-300 ease-in-out text-xs uppercase px-4 py-[10px] text-nowrap">
              <button
                className="flex items-center gap-2 uppercase"
                onClick={generateOrderReport}
                disabled={isGeneratingReport}
                title="Download order report for the current month"
              >
                {isGeneratingReport ? "Generating..." : "Order Report"}
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <Loader />
        ) : error ? (
          <ErrorMessage error={error} />
        ) : !orders?.data.length ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-gray-500 text-lg mb-4">
              No orders found matching your criteria
            </div>
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-[#2b3990] text-white rounded-lg hover:bg-[#00aeef] transition"
            >
              Clear Search Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-[10px] md:gap-[15px] lg:gap-[20px] mb-8 items-start">
            {/* Left: Order List */}
            <div className="bg-[#f9f9f9] rounded-[15px] xl:rounded-[20px] p-4 grid grid-cols-1 gap-[10px]">
              {orders.data.map((order) => (
                <div
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className={`cursor-pointer bg-[#fff] p-[8px] rounded-[15px] flex items-center gap-[10px] hover:bg-blue-50 ${selectedOrder?.id === order.id
                    ? "border border-blue-500"
                    : ""
                    }`}
                >
                  <div className="w-[45px] h-[45px] bg-[#2b3990] rounded-full flex items-center justify-center overflow-hidden">
                    <img src="/avatar.svg" alt="Item" />
                  </div>
                  <div>
                    <p className="text-xs my-0 uppercase leading-none">
                      {order.user.emp_id}
                    </p>
                    <p className="font-semibold text-[15px] my-0 leading-none">
                      {order.user.name}
                    </p>
                    <p className="text-xs my-0 uppercase">
                      {order.order_number}
                    </p>
                  </div>
                </div>
              ))}

              {/* Pagination Controls */}
              {orders.last_page > 1 && (
                <div className="flex justify-center items-center mt-4">
                  <nav className="flex items-center gap-2">
                    {/* Previous Page */}
                    <button
                      onClick={() => handlePageChange(orders.current_page - 1)}
                      disabled={!orders.prev_page_url}
                      className={`px-3 py-1 rounded-md ${!orders.prev_page_url
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-blue-600 hover:bg-blue-100"
                        }`}
                    >
                      &laquo; Previous
                    </button>

                    {/* Page Numbers */}
                    {orders.links.map((link, index) => {
                      if (
                        link.url === null ||
                        link.label.includes("Previous") ||
                        link.label.includes("Next")
                      )
                        return null;

                      const page =
                        link.label === "..." ? null : parseInt(link.label);

                      return (
                        <button
                          key={index}
                          onClick={() => page && handlePageChange(page)}
                          className={`px-3 py-1 rounded-md ${link.active
                            ? "bg-blue-600 text-white"
                            : "text-blue-600 hover:bg-blue-100"
                            }`}
                          disabled={!page}
                        >
                          {link.label}
                        </button>
                      );
                    })}

                    {/* Next Page */}
                    <button
                      onClick={() => handlePageChange(orders.current_page + 1)}
                      disabled={!orders.next_page_url}
                      className={`px-3 py-1 rounded-md ${!orders.next_page_url
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-blue-600 hover:bg-blue-100"
                        }`}
                    >
                      Next &raquo;
                    </button>
                  </nav>
                </div>
              )}
            </div>

            {/* Right: Invoice Viewer */}
            <div className="bg-[#f9f9f9] rounded-[15px] xl:rounded-[20px] p-4 xl:p-8 md:col-span-2 lg:col-span-4">
              {selectedOrder ? (
                <>
                  <div className="flex items-center justify-between pb-2">
                    <p className="my-0 font-semibold text-lg">Invoice</p>
                    <p className="my-0 text-lg">
                      EMP ID# {selectedOrder.user.emp_id}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-[10px] border-[1px] p-4 mb-4 items-start rounded-[15px]">
                    <div className="grid grid-cols-1 gap-[10px] md:border-r-[1px]">
                      <div>
                        <p className="my-0 text-xs">Name</p>
                        <p className="my-0 text-lg font-semibold">
                          {selectedOrder.user.name}
                        </p>
                      </div>
                      <div>
                        <p className="my-0 text-xs">Order No</p>
                        <p className="my-0 text-md font-semibold">
                          {selectedOrder.order_number}
                        </p>
                      </div>
                      <div>
                        <p className="my-0 text-xs">Order Created</p>
                        <p className="my-0 text-md font-semibold">
                          {selectedOrder.created_at}
                        </p>
                      </div>
                      <div>
                        <p className="my-0 text-xs">Status</p>
                        <p className="my-0 text-xs inline-block px-[10px] py-[2px] rounded-[6px] bg-green-200 uppercase">
                          {selectedOrder.status}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-[5px] text-right">
                      <div>
                        <p className="my-0 text-xs">
                          Company Contribution -{" "}
                          <span className="text-[10px]">PKR</span>{" "}
                          <span className="text-sm font-semibold">
                            {selectedOrder.discount}
                          </span>{" "}
                        </p>
                      </div>
                      <div>
                        <p className="my-0 text-xs">
                          Employee Contribution -{" "}
                          <span className="text-[10px]">PKR</span>{" "}
                          <span className="text-sm font-semibold">
                            {selectedOrder.grand_total - selectedOrder.discount}
                          </span>{" "}
                        </p>
                      </div>
                      <div>
                        <p className="my-0 font-semibold text-sm">
                          Grand Total
                        </p>
                        <p className="my-0 text-xl font-semibold text-red-500">
                          <span className="font-normal text-sm">PKR</span>{" "}
                          {selectedOrder.grand_total}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="w-full overflow-x-auto">
                    <table className="min-w-full">
                      <thead className="">
                        <tr className="">
                          <th className="py-2 px-4">
                            <div className="flex items-center">
                              <p className="font-medium text-[#000] text-xs">
                                Items
                              </p>
                            </div>
                          </th>
                          <th className="py-2 px-4">
                            <div className="flex items-center justify-center">
                              <p className="font-medium text-[#000] text-xs">
                                Type
                              </p>
                            </div>
                          </th>
                          <th className="py-2 px-4">
                            <div className="flex items-center justify-center">
                              <p className="font-medium text-[#000] text-xs">
                                Brand
                              </p>
                            </div>
                          </th>
                          <th className="py-2 px-4">
                            <div className="flex items-center justify-center">
                              <p className="font-medium text-[#000] text-xs">
                                Measure
                              </p>
                            </div>
                          </th>
                          <th className="py-2 px-4">
                            <div className="flex items-center justify-center">
                              <p className="font-medium text-[#000] text-xs">
                                Quantity
                              </p>
                            </div>
                          </th>
                          <th className="py-2 px-4">
                            <div className="flex items-center justify-center col-span-2">
                              <p className="font-medium text-[#000] text-xs">
                                Sub Total
                              </p>
                            </div>
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {selectedOrder.items.map((item) => (
                          <tr key={`${selectedOrder.id}-${item.id}`}>
                            <td className="py-3 px-4">
                              <div className="flex items-center">
                                <div className="flex items-center gap-3">
                                  <div className="h-[40px] w-[40px] overflow-hidden rounded-full">
                                    <img
                                      src={
                                        item.product.image
                                          ? `${process.env.NEXT_PUBLIC_BACKEND_URL_PUBLIC}${item.product.image}`
                                          : "/images/items/product-default.png"
                                      }
                                      alt="Product"
                                      onError={(e) => {
                                        e.currentTarget.src =
                                          "/images/items/product-default.png";
                                      }}
                                    />
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-800 text-sm dark:text-white/90 capitalize">
                                      {item.product.name}
                                    </p>
                                    <span className="text-gray-500 text-sm">
                                      {item.unit_price} Rs
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center justify-center">
                                <p className="text-gray-500 text-sm dark:text-gray-400">
                                  {item.product.type}
                                </p>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center justify-center">
                                <p className="text-gray-500 text-sm dark:text-gray-400">
                                  {item.product.brand}
                                </p>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center justify-center">
                                <p className="text-gray-500 text-sm dark:text-gray-400">
                                  {item.product.measure}
                                </p>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center justify-center">
                                <p className="text-gray-500 text-sm dark:text-gray-400">
                                  {item.quantity}x
                                </p>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center justify-center">
                                <p className="text-gray-500 text-sm dark:text-gray-400">
                                  {item.price}
                                </p>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex justify-end">
                    <div className="shadow-sm border-[2px] rounded-[10px] flex items-center justify-center bg-[#2b3990] hover:text-[#fff] transition-all duration-300 ease-in-out border-[#2b3990]">
                      <button className="text-sm text-[#fff] uppercase px-4 py-2 rounded-[10px] flex items-center gap-2">
                        Print
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-gray-500 text-sm">
                  Select an order to view invoice details.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}