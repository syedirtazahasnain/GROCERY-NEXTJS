"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import "@/app/extra.css";
import {
  AddShoppingCart,
  Delete,
  HighlightOff,
  Close,
  ArrowForwardIos,
} from "@mui/icons-material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import ErrorMessage from "@/app/_components/error/index";
import Loader from "@/app/_components/loader/index";

interface AdminDashboardData {
  success: boolean;
  status_code: number;
  message: string;
  data: {
    total_users: number;
    employee_ration_this_month: number;
    employee_cash_this_month: number;
    recent_orders: Array<{
      order_no: number;
      user_name: string;
      grand_total: string;
      discount: string;
    }>;
    top_users: Array<{
      employee_name: string;
      grand_total: number;
    }>;
    month_wise_ration: Array<{
      month: string;
      grand_total: string | number;
    }>;
  };
}

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/auth/login");
          return;
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/dashboard-summary`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || "Failed to fetch dashboard data");
        }

        const data = await response.json();
        setDashboardData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [router]);

  // Prepare chart data from month_wise_ration
  const prepareRationChartData = () => {
    if (!dashboardData?.data?.month_wise_ration) return [];

    return dashboardData.data.month_wise_ration.map(item => ({
      name: item.month.split(" ")[0], // Get just the month name
      Orders: typeof item.grand_total === 'string' ? parseFloat(item.grand_total) : item.grand_total,
    }));
  };

  // Prepare recent orders data for table
  const prepareRecentOrders = () => {
    if (!dashboardData?.data?.recent_orders) return [];
    
    return dashboardData.data.recent_orders.map(order => ({
      ...order,
      employeeContribution: (parseFloat(order.grand_total) - parseFloat(order.discount)).toFixed(2),
      companyContribution: order.discount,
    }));
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <ErrorMessage error={error} />;
  }

  if (!dashboardData) {
    return <ErrorMessage error="No dashboard data available" />;
  }

  return (
    <div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[10px] lg:gap-[15px] xl:gap-[20px]">
          <div className="bg-[#00aeef] bg-opacity-10 rounded-[15px] xl:rounded-[20px] p-[10px] lg:p-[15px] xl:p-[20px]">
            <div className="w-[50px] h-[50px] bg-[#fff] rounded-[15px] flex items-center justify-center">
              <AddShoppingCart />
            </div>
            <div className="mt-[10px] pl-[5px]">
              <p className="my-0 text-[24px] font-semibold">
                {dashboardData.data.total_users}
              </p>
              <p className="text-[12px] my-0">Total Users</p>
            </div>
          </div>
          <div className="bg-[#79f123] bg-opacity-10 rounded-[15px] xl:rounded-[20px] p-[10px] lg:p-[15px] xl:p-[20px]">
            <div className="w-[50px] h-[50px] bg-[#fff] rounded-[15px] flex items-center justify-center">
              <AddShoppingCart />
            </div>
            <div className="mt-[10px] pl-[5px]">
              <p className="my-0 text-[24px] font-semibold">
                {dashboardData.data.employee_ration_this_month}
              </p>
              <p className="text-[12px] my-0">Total Ration Count</p>
            </div>
          </div>
          <div className="bg-[#2b3990] bg-opacity-10 rounded-[15px] xl:rounded-[20px] p-[10px] lg:p-[15px] xl:p-[20px]">
            <div className="w-[50px] h-[50px] bg-[#fff] rounded-[15px] flex items-center justify-center">
              <AddShoppingCart />
            </div>
            <div className="mt-[10px] pl-[5px]">
              <p className="my-0 text-[24px] font-semibold">
                {dashboardData.data.employee_ration_this_month}
              </p>
              <p className="text-[12px] my-0">
                Employee Order Ration -{" "}
                <span className="text-[10px]"> This Month</span>
              </p>
            </div>
          </div>
          <div className="bg-[#fbaf2c] bg-opacity-10 rounded-[15px] xl:rounded-[20px] p-[10px] lg:p-[15px] xl:p-[20px]">
            <div className="w-[50px] h-[50px] bg-[#fff] rounded-[15px] flex items-center justify-center">
              <AddShoppingCart />
            </div>
            <div className="mt-[10px] pl-[5px]">
              <p className="my-0 text-[24px] font-semibold">
                {dashboardData.data.employee_cash_this_month}
              </p>
              <p className="text-[12px] my-0">
                Employee Take Cash -{" "}
                <span className="text-[10px]"> This Month</span>
              </p>
            </div>
          </div>
        </div>

        {/* Top Users and Month Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-[10px] lg:gap-[15px] xl:gap-[20px]">
          {/* Top Month */}
          <div className="bg-[#f9f9f9] rounded-[15px] xl:rounded-[20px] p-[10px] lg:p-[15px] xl:p-[20px]">
            <div className="pb-[10px] border-b-[1px]">
              <p className="my-0 text-[18px] font-semibold">Top Month</p>
              <p className="text-[12px] my-0">
                Month with the highest rashan amount.
              </p>
            </div>
            <div className="py-[10px] flex items-center justify-between gap-[10px]">
              <p className="text-[12px] my-0 opacity-60">Month</p>
              <p className="text-[12px] my-0 opacity-60">Amount</p>
            </div>
            {dashboardData.data.month_wise_ration
              .slice(0, 8)
              .map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between gap-[10px] py-[2px]"
                >
                  <p className="text-[14px] my-0">{item.month}</p>
                  <p className="text-[14px] my-0">
                    {typeof item.grand_total === 'string' 
                      ? parseFloat(item.grand_total).toFixed(2) 
                      : item.grand_total}{" "}
                    <span className="text-[10px]">Rs</span>
                  </p>
                </div>
              ))}
          </div>

          {/* Top Users */}
          <div className="bg-[#f9f9f9] rounded-[15px] xl:rounded-[20px] p-[10px] lg:p-[15px] xl:p-[20px]">
            <div className="pb-[10px] border-b-[1px]">
              <p className="my-0 text-[18px] font-semibold">Top Users</p>
              <p className="text-[12px] my-0">
                Employee with the highest rashan amount.
              </p>
            </div>
            <div className="py-[10px] flex items-center justify-between gap-[10px]">
              <p className="text-[12px] my-0 opacity-60">Employee Name</p>
              <p className="text-[12px] my-0 opacity-60">Amount</p>
            </div>
            {dashboardData.data.top_users.slice(0, 8).map((user, index) => (
              <div
                key={index}
                className="flex items-center justify-between gap-[10px] py-[2px]"
              >
                <p className="text-[14px] my-0">{user.employee_name}</p>
                <p className="text-[14px] my-0">
                  {user.grand_total.toFixed(2)}{" "}
                  <span className="text-[10px]">Rs</span>
                </p>
              </div>
            ))}
          </div>

          {/* Users Ration/Cash Chart */}
          <div className="bg-[#f9f9f9] rounded-[15px] xl:rounded-[20px] p-[10px] lg:p-[15px] xl:p-[20px] lg:col-span-2">
            <div className="pb-[10px] border-b-[1px]">
              <p className="my-0 text-[18px] font-semibold">Users Ration/Cash</p>
            </div>
            <div className="w-full h-[250px] mt-[20px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={prepareRationChartData()}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis className="text-xs" dataKey="name" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="Orders" stroke="#00aeef" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Ration Orders and Recent Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-[10px] lg:gap-[15px] xl:gap-[20px]">
          {/* Ration Orders Chart */}
          <div className="bg-[#f9f9f9] rounded-[15px] xl:rounded-[20px] p-[10px] lg:p-[15px] xl:p-[20px]">
            <div className="mb-[20px]">
              <p className="my-0 text-[24px] font-semibold">Ration Orders</p>
              <p className="text-[12px] my-0">
                Amount of rashan purchased per month.
              </p>
              <p className="text-[12px] my-0">No of rashan order per month.</p>
            </div>
            <div className="w-full h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  width={500}
                  height={300}
                  data={prepareRationChartData()}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis className="text-xs" dataKey="name" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Line type="monotone" dataKey="Orders" stroke="#82ca9d" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Orders Table */}
          <div className="bg-[#f9f9f9] rounded-[15px] xl:rounded-[20px] p-[10px] lg:p-[15px] xl:p-[20px] xl:col-span-2">
            <div className="mb-[20px]">
              <p className="my-0 text-[24px] font-semibold">Recent Order</p>
              <p className="text-[12px] my-0">
                Amount of rashan purchased per month.
              </p>
            </div>
            <div className="bg-[#fff] p-[10px] rounded-[15px] xl:rounded-[20px]">
              {prepareRecentOrders().length > 0 ? (
                <table className="w-full">
                  <thead className="uppercase">
                    <tr className="">
                      <th className="py-2 px-2 text-left rounded-l-xl bg-[#e0e0e0]">
                        <p className="text-xs font-semibold">Order No.</p>
                      </th>
                      <th className="py-2 px-2 text-left bg-[#e0e0e0]">
                        <p className="text-xs font-semibold">Name</p>
                      </th>
                      <th className="py-2 px-2 text-left bg-[#e0e0e0]">
                        <p className="text-xs font-semibold">
                          Employee Contribution
                        </p>
                      </th>
                      <th className="py-2 px-2 text-left bg-[#e0e0e0]">
                        <p className="text-xs font-semibold">
                          Company Contribution
                        </p>
                      </th>
                      <th className="py-2 px-2 text-left rounded-r-xl bg-[#e0e0e0]">
                        <p className="text-xs font-semibold">Status</p>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {prepareRecentOrders().map((order, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-2 px-5">
                          <p className="font-semibold text-sm">{order.order_no}</p>
                        </td>
                        <td className="py-2 px-2">
                          <p className="text-sm">{order.user_name}</p>
                        </td>
                        <td className="py-2 px-2">
                          <p className="text-sm">
                            {order.employeeContribution}{" "}
                            <span className="text-sm ml-[2px]">Rs</span>
                          </p>
                        </td>
                        <td className="py-2 px-2">
                          <p className="text-sm">
                            {order.discount}{" "}
                            <span className="text-sm ml-[2px]">Rs</span>
                          </p>
                        </td>
                        <td className="flex items-center mt-[6px] ml-[10px]">
                          <div className="px-4 py-1 text-xs bg-orange-100 rounded-[10px]">
                            <p className="my-0 text-orange-800 uppercase">
                              Pending
                            </p>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-4 text-center text-gray-500">
                  No recent orders available
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
  );
}