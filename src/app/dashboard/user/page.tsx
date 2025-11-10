"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/app/_components/header/index";
import Sidebar from "@/app/_components/sidebar/index";
import Breadcrumb from "@/app/_components/ui/Breadcrumb";
import "@/app/extra.css";
import { AddShoppingCart, Delete, HighlightOff, Close, ArrowForwardIos } from "@mui/icons-material";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import ErrorMessage from "@/app/_components/error/index";
import Loader from "@/app/_components/loader/index";

interface UserData {
  id: number;
  name: string;
  email: string;
  emp_id: string;
  my_role: string;
  role?: string;
  created_at: string;
  updated_at: string;
}

interface DashboardSummary {
  success: boolean;
  status_code: number;
  message: string;
  data: {
    total_ration_count: number;
    total_cash_count: number;
    total_months_count: number;
    current_month_status: string;
    last_two_months: Array<{
      sr_no: number;
      month: string;
      type: string;
      amount: string;
    }>;
  };
}

interface MonthlyData {
  name: string;
  Ration: number;
}

export default function UserDashboard({ my_role }: UserData) {
  const [user, setUser] = useState<UserData | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/auth/login");
          return;
        }

        // Fetch user details
        const userResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user-details`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        if (!userResponse.ok) {
          const data = await userResponse.json();
          throw new Error(data.message || "Failed to fetch user details");
        }

        const userData = await userResponse.json();
        setUser(userData.data);

        // Fetch dashboard summary
        const dashboardResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/dashboard-summary`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        if (!dashboardResponse.ok) {
          const data = await dashboardResponse.json();
          throw new Error(data.message || "Failed to fetch dashboard data");
        }

        const dashboardData = await dashboardResponse.json();
        setDashboardData(dashboardData);

      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  // Prepare chart data from last_two_months
  const prepareChartData = () => {
    if (!dashboardData?.data?.last_two_months) return [];

    return dashboardData.data.last_two_months.map(item => ({
      name: item.month.split(" ")[0], // Get just the month name
      Ration: item.type === "Ration" ? parseFloat(item.amount) : 0,
      Cash: item.type === "Cash" ? parseFloat(item.amount) : 0,
    })).reverse(); // Reverse to show latest month last
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <ErrorMessage error={error} />;
  }

  if (!user) {
    return <ErrorMessage error="No user data available" />;
  }

  return (
    <div className="min-h-screen flex gap-[20px] px-[20px] xl:px-[30px]">
      <div className="w-[15%] relative">
        <Sidebar />
      </div>

      <div className="w-full mx-auto space-y-4 p-4">
        <div><Header /></div>

        <div className="p-5 mb-6 bg-[#f9f9f9] rounded-2xl lg:p-6">
          <div>
            <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
              <div className="w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800">
                <img src="/avatar.svg" alt="user" />
              </div>
              <div className="order-3 xl:order-2">
                <h4 className="my-0 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
                  {user.name}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 my-0">
                  <b>Emp ID - </b> {user.emp_id}
                </p>
                <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {user.email}
                  </p>
                  <div className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 capitalize font-semibold">
                    {user.my_role}
                  </p>
                </div>
              </div>
              <div className="flex items-center order-2 gap-2 grow xl:order-3 xl:justify-end">
                {/* Social buttons remain the same */}
              </div>
            </div>
          </div>
        </div>
        
        {/* Dashboard Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[10px] lg:gap-[15px] xl:gap-[20px] hidden">
          <div className="bg-[#00aeef] bg-opacity-10 rounded-[15px] xl:rounded-[20px] p-[10px] lg:p-[15px] xl:p-[20px]">
            <div className="w-[50px] h-[50px] bg-[#fff] rounded-[15px] flex items-center justify-center">
              <AddShoppingCart />
            </div>
            <div className="mt-[10px] pl-[5px]">
              <p className="my-0 text-[24px] font-semibold">
                { dashboardData?.data ?.total_months_count || 0}
              </p>
              <p className="text-[12px] my-0">Total Months</p>
            </div>
          </div>
          <div className="bg-[#2b3990] bg-opacity-10 rounded-[15px] xl:rounded-[20px] p-[10px] lg:p-[15px] xl:p-[20px]">
            <div className="w-[50px] h-[50px] bg-[#fff] rounded-[15px] flex items-center justify-center">
              <AddShoppingCart />
            </div>
            <div className="mt-[10px] pl-[5px]">
              <p className="my-0 text-[24px] font-semibold">
                {/* {dashboardData?.data?.total_cash_count || 0} */}
              </p>
              <p className="text-[12px] my-0">Total Cash Count</p>
            </div>
          </div>
          <div className="bg-[#79f123] bg-opacity-10 rounded-[15px] xl:rounded-[20px] p-[10px] lg:p-[15px] xl:p-[20px]">
            <div className="w-[50px] h-[50px] bg-[#fff] rounded-[15px] flex items-center justify-center">
              <AddShoppingCart />
            </div>
            <div className="mt-[10px] pl-[5px]">
              <p className="my-0 text-[24px] font-semibold">
                {/* {dashboardData?.data?.total_ration_count || 0} */}
              </p>
              <p className="text-[12px] my-0">Total Ration Count</p>
            </div>
          </div>
          <div className="bg-[#fbaf2c] bg-opacity-10 rounded-[15px] xl:rounded-[20px] p-[10px] lg:p-[15px] xl:p-[20px]">
            <div className="w-[50px] h-[50px] bg-[#fff] rounded-[15px] flex items-center justify-center">
              <AddShoppingCart />
            </div>
            <div className="mt-[10px] pl-[5px]">
              <p className="my-0 text-[24px] font-semibold">
                {/* {dashboardData?.data?.current_month_status || "N/A"} */}
              </p>
              <p className="text-[12px] my-0">Current Month</p>
            </div>
          </div>
        </div>

        {/* Charts and Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-[10px] lg:gap-[15px] xl:gap-[20px] hidden">
          <div className="bg-[#f9f9f9] rounded-[15px] xl:rounded-[20px] p-[10px] lg:p-[15px] xl:p-[20px] hidden">
            <div className="mb-[20px]">
              <p className="my-0 text-[24px] font-semibold">
                Ration Details
              </p>
              <p className="text-[12px] my-0">Amount of rashan purchased per month.</p>
            </div>
            <div className="w-full h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  width={500}
                  height={300}
                  data={prepareChartData()}
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
                  <Line type="monotone" dataKey="Ration" stroke="#82ca9d" />
                  <Line type="monotone" dataKey="Cash" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="bg-[#f9f9f9] rounded-[15px] xl:rounded-[20px] p-[10px] lg:p-[15px] xl:p-[20px] xl:col-span-3">
            <div className="mb-[20px]">
              <p className="my-0 text-[24px] font-semibold">
                Latest Months
              </p>
              <p className="text-[12px] my-0">Amount of rashan purchased per month.</p>
            </div>
            <div className="bg-[#fff] p-[10px] rounded-[15px] xl:rounded-[20px]">
              {dashboardData?.data?.last_two_months?.length ? (
                <table className="w-full">
                  <thead className="">
                    <tr className="uppercase">
                      <th className="py-2 px-2 text-left rounded-l-xl bg-[#e0e0e0]">
                        <p className="text-xs font-semibold">Sr No.</p>
                      </th>
                      <th className="py-2 px-2 text-left bg-[#e0e0e0]">
                        <p className="text-xs font-semibold">Month</p>
                      </th>
                      <th className="py-2 px-2 text-left bg-[#e0e0e0]">
                        <p className="text-xs font-semibold">Type</p>
                      </th>
                      <th className="py-2 px-2 text-left bg-[#e0e0e0]">
                        <p className="text-xs font-semibold">Amount</p>
                      </th>
                      <th className="py-2 px-2 text-left rounded-r-xl bg-[#e0e0e0]">
                        <p className="text-xs font-semibold">Status</p>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.data.last_two_months.map((item, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-2 px-5">
                          <p className="font-semibold text-md">{item.sr_no}</p>
                        </td>
                        <td className="py-2 px-2">
                          <p className="text-md">{item.month}</p>
                        </td>
                        <td className="flex items-center mt-[5px] ml-[10px]">
                          <div className={`px-4 py-1 text-xs rounded-[10px] ${
                            item.type === "Ration" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                          }`}>
                            <p className="my-0 uppercase">{item.type}</p>
                          </div>
                        </td>
                        <td className="py-2 px-2">
                          <p className="text-md">
                            <span className="text-xs ml-[2px]">PKR</span> {item.amount}
                          </p>
                        </td>
                        <td className="flex items-center mt-[6px] ml-[10px]">
                          <div className="px-4 py-1 text-xs bg-green-100 rounded-[10px]">
                            <p className="my-0 text-green-800 uppercase">Received</p>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-4 text-center text-gray-500">
                  No data available for recent months
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}