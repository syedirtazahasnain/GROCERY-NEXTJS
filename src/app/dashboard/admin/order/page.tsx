// app/orders/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Order } from "@/types";
import { toast } from "react-toastify";
import Header from "@/app/_components/adminheader/index";

import ErrorMessage from "@/app/_components/error/index";
import Loader from "@/app/_components/loader/index";
import Datepicker from "@/app/_components/datepicker/index";
import { DateRangePicker, Input } from "@heroui/react";

// import Header from "@/app/_components/Header";
import Sidebar from "@/app/_components/adminsidebar/index";
import Breadcrumb from "@/app/_components/ui/Breadcrumb";
import { Visibility, Search } from "@mui/icons-material";
interface PaginatedOrders {
  data: Order[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  emp_id: string;
  links: {
    url: string | null;
    label: string;
    active: boolean;
  }[];
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<PaginatedOrders | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = searchParams.get('page') || '1';

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/auth/login');
          return;
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/orders/all?page=${currentPage}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          toast.error('Failed to fetch orders');
        }

        const data = await response.json();
        setOrders(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load orders');
        if (err instanceof Error) {
          toast.error(err.message);
          setError(err.message);
        } else {
          toast.error("Failed to load orders");
          setError("Failed to load orders");
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
    <div>
      
      <div>
      
        <div className="px-6 py-6 bg-[#f9f9f9] rounded-[20px] xl:rounded-[25px] text-[#2b3990]">
          <h1 className="text-2xl font-bold my-0">All Orders Details</h1>
          <Breadcrumb
            items={[{ label: "Dashboard" }, { label: "All Orders" }]}
          />
        </div>

        <div className="overflow-x-auto mb-8">
          <div className="p-[25px] rounded-[20px] xl:rounded-[25px] bg-[#f9f9f9]">
            <div className='flex justify-between items-center mb-4'>
              <div>
                <p className='my-0 font-semibold text-lg'>Recent Orders</p>
              </div>
              <div className='flex items-center gap-2'>
                <Input type="text" placeholder="Search here ..."
                  className="max-w-xs"
                  classNames={{
                    inputWrapper: "bg-white border-2"
                  }} />
                <DateRangePicker
                  className="max-w-xs"
                  classNames={{
                    inputWrapper: "bg-white border-2"
                  }} visibleMonths={2} />
              </div>
            </div>
            <table className="min-w-full bg-white rounded-[15px] overflow-hidden">
              <thead className="bg-[#2b3990]">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-100">
                    Order #
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-100">
                    Emp Id
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-100">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-100">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-100">
                    Discount
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-100">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-100">
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
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {order.order_number}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {order.user.emp_id}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 capitalize">
                      {order.status}  
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {order.created_at}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-semibold">
                      ${order.discount}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-semibold">
                      ${order.grand_total}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <Link
                        href={
                          localStorage.getItem('userRole') === 'admin'
                            ? `/dashboard/admin/orders/${order.id}`
                            : `/dashboard/user/orders/${order.id}`
                        }
                        className="text-blue-300 hover:text-blue-800"
                      >
                        <Visibility className="w-5 h-5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div>
          {/* Pagination Controls */}
          <div className="flex justify-center gap-2">
            {orders.links.map((link, index) => {
              if (link.url === null) return null;

              const page = new URL(link.url).searchParams.get('page') || '1';
              const isActive = link.active;
              const isPrevious = link.label.includes('Previous');
              const isNext = link.label.includes('Next');

              return (
                <Link
                  key={index}
                  href={`/dashboard/admin/order?page=${page}`}
                  className={`px-4 py-2 rounded-lg border ${isActive
                    ? 'bg-[#2b3990] text-white border-blue-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    } ${(isPrevious || isNext) ? 'font-semibold' : ''
                    }`}
                >
                  {isPrevious ? '«' : isNext ? '»' : link.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}