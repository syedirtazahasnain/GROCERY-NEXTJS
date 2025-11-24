// app/orders/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Order } from "@/types";
import Header from '@/app/_components/Header';
import { toast } from "react-toastify";
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

        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/orders?page=${currentPage}`, {
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
    <div >
      <h1 className="text-2xl font-bold mb-6">Your Orders</h1>
      <div className="space-y-4 mb-8">
        {orders.data.map((order) => (
          <div key={order.id} className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold">Order #{order.order_number}</h2>
                <p className="text-gray-600">
                  Status: <span className="capitalize">{order.status}</span>
                </p>
                <p className="text-gray-600">
                  Date: {order.created_at}
                </p>
                <p className="text-lg font-bold">Total: ${order.grand_total}</p>
              </div>
              <Link href={`/dashboard/user/orders/${order.id}`} className="bg-[#2b3990] text-white px-4 py-2 rounded-lg hover:bg-[#00aeef]"
              >
                View Details
              </Link>
            </div>
          </div>
        ))}
      </div>

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
              href={`/orders?page=${page}`}
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
  );
}