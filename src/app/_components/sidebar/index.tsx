
// Sidebar component
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { toast } from "react-toastify";
import {
  Dashboard,
  AccountCircle,
  Password,
  AddShoppingCart,
  Assessment,
  Policy,
  Category,
  ProductionQuantityLimits,
  ShoppingCartCheckout,
} from "@mui/icons-material";

export default function Index() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showProfile, setShowProfile] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);

  const pathname = usePathname();
  const isActive = (path: string) => pathname.startsWith(path);


  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/auth/login");
        return;
      }

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user-details`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUserData(data.data);
          setUserRole(data.data.my_role || data.data.role);
        }
      } catch (err) {
        console.error("Failed to fetch user data:", err);
      }
    };

    fetchUserData();

    // Add event listener for local storage changes
    const handleStorageChange = () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/auth/login");
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [router]);

  const handleLogout = async () => {
    setIsLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/auth/login");
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.message || "Logout failed");
      }

      localStorage.removeItem("token");
      localStorage.removeItem("user");
      router.refresh();
      router.push("/auth/login");
    } catch (err: any) {
      console.error("Logout error:", err);
      toast.error(err.message || "Failed to logout. Please try again.");
      setError(err.message || "Failed to logout. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToAdminRoute = (path: string) => {
    if (!userRole) {
      toast.error("User role not loaded yet");
      setError("User role not loaded yet");
      return;
    }

    if (userRole === "admin" || userRole === "super_admin") {
      router.push(`/dashboard/user/${path}`);
    } else {
      setError("You do not have permission to access this page");
    }
  };

  const fetchAllOrders = async () => {
    setIsLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/auth/login");
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/orders/all`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to fetch orders");
      }

      const data = await response.json();
      router.push(`/dashboard/user/order`);
    } catch (err: any) {
      console.error("Fetch orders error:", err);
      setError(err.message || "Failed to fetch orders. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <aside className={`z-20 hidden w-[15%] overflow-y-auto  md:block flex-shrink-0 scrollbar-hide h-screen fixed top-0 left-0`}>
      <div className="px-4 py-6">
        <div className="overflow-hidden flex items-center justify-center">
          <Image
            src="/images/logo/logo-dark.webp"
            alt="Company Logo"
            width={200}
            height={50}
            className=""
          />
        </div>
        {userData && (
          <ul className="mt-4">
            <li className="py-2">
              <p className="text-sm font-semibold transition-all">
                <span className="ml-3">Main</span>
              </p>
            </li>
            <li className="relative">
              <Link
                href="/dashboard/user"
                className={`inline-flex items-center w-full text-sm transition-all duration-300 px-6 ease-in-out 
   "}
  `}
              >
                <Dashboard className="w-5 h-5" />
                <span className="ml-4">Dashboard</span>
              </Link>
              <div className="py-2 mt-4">
                <p className="text-sm transition-all font-semibold">
                  <span className="ml-3">Orders & More</span>
                </p>
              </div>
              <Link
                href="/dashboard/user/orders"
                className={`inline-flex items-center w-full text-sm transition-all duration-300 px-6 ease-in-out 
    ${isActive("/dashboard/user/orders") ? "bg-[#2b399029] text-[#2b3990] rounded-lg p-[5px]" : "hover:ml-2 hover:text-[#2b3990]"}
  `}
              >
                <Assessment className="w-5 h-5" />
                <span className="ml-4">Orders</span>
              </Link>
              <Link
                href="/dashboard/user/product-list"
                className={`inline-flex items-center w-full text-sm transition-all duration-300 px-6 ease-in-out 
    ${isActive("/dashboard/user/product-list") ? "bg-[#2b399029] text-[#2b3990] rounded-lg p-[5px]" : "hover:ml-2 hover:text-[#2b3990]"}
  `}
              >
                <AddShoppingCart className="w-5 h-5" />
                <span className="ml-4">Order Now</span>
              </Link>
            </li>
            <li>
              <div className="py-2 mt-4">
                <p className="text-sm transition-all font-semibold">
                  <span className="ml-3">Profile & More</span>
                </p>
              </div>
              <Link
                href="/dashboard/user/profile"
                className={`inline-flex items-center w-full text-sm transition-all duration-300 px-6 ease-in-out 
    ${isActive("/dashboard/user/profile") ? "bg-[#2b399029] text-[#2b3990] rounded-lg p-[5px]" : "hover:ml-2 hover:text-[#2b3990]"}
  `}
              >
                <AccountCircle className="w-5 h-5" />
                <span className="ml-4">Profile</span>
              </Link>
              <Link
                href="/dashboard/user/update-password"
                className={`inline-flex items-center w-full text-sm transition-all duration-300 px-6 ease-in-out 
    ${isActive("/dashboard/user/update-password") ? "bg-[#2b399029] text-[#2b3990] rounded-lg p-[5px]" : "hover:ml-2 hover:text-[#2b3990]"}
  `}
              >
                <Password className="w-5 h-5" />
                <span className="ml-4">Change Password</span>
              </Link>
            </li>
            <li>
              <div className="py-2 mt-4">
                <p className="text-sm transition-all font-semibold">
                  <span className="ml-3">Policies & More</span>
                </p>
              </div>
              <Link
                href="/dashboard/user/rashan-policy"
                className={`inline-flex items-center w-full text-sm transition-all duration-300 px-6 ease-in-out 
    ${isActive("/dashboard/user/rashan-policy") ? "bg-[#2b399029] text-[#2b3990] rounded-lg p-[5px]" : "hover:ml-2 hover:text-[#2b3990]"}
  `}
              >
                <Policy className="w-5 h-5" />
                <span className="ml-4">Ration Policy</span>
              </Link>
            </li>
          </ul>
        )}
      </div>
    </aside>
  );
}   