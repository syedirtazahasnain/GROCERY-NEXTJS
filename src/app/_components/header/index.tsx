"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AccountCircle, Password, Logout } from "@mui/icons-material";
import { toast } from "react-toastify";

export default function Index() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userDetails, setUserDetails] = useState({
    name: "User Name",
    role: "User Role",
    fullName: "Syed Irtaza Hasnain",
    email: "abc@gmail.com"
  });
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle clicks outside the dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch user details (you can replace this with actual API call)
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUserDetails(prev => ({
          ...prev,
          name: userData.name || prev.name,
          role: userData.role || prev.role,
          email: userData.email || prev.email
        }));
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/auth/login");
        return;
      }

      // Call logout API
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        toast.error("Logout failed");
      }

      // Clear local storage and redirect
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("userRole");
      router.refresh();
      router.push("/auth/login");
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to logout");
    }
  };

  return (
    <div className="h-[60px] border-b-[1px] flex items-center justify-between py-[10px] px-[20px]">
      <div>
        <h2 className="text-3xl font-semibold">
          TFSC<span className="text-xl font-normal"> - Ration Scheme </span>
        </h2>
      </div>

      <div className="flex items-center justify-center gap-[10px]" ref={dropdownRef}>
        {/* Avatar Button */}
        <div onClick={() => setIsMenuOpen((prev) => !prev)}>
          <div className="w-[45px] h-[45px] rounded-full border-2 border-[#2b3990] overflow-hidden flex items-center justify-center cursor-pointer">
            <img src="/avatar.svg" alt="User Avatar" />
          </div>
        </div>

        <div className="relative">
          <p className="my-0 text-[14px] leading-none">{userDetails.name}</p>
          <p className="my-0 text-[12px]">{userDetails.role}</p>

          {/* Dropdown Menu */}
          <div
            className={`absolute top-[40px] right-0 max-w-[500px] bg-[#f9f9f9] py-[15px] px-[20px] rounded-[15px] z-50 text-nowrap shadow-md ${
              isMenuOpen ? "" : "hidden"
            }`}
          >
            <div>
              <p className="my-0 text-[16px] leading-none">{userDetails.name}</p>
              <p className="my-0 text-[12px]">{userDetails.email}</p>
            </div>
            <div className="w-full h-[1px] bg-[#000] opacity-50 my-[15px]"></div>

            <div className="flex flex-col gap-[5px]">
              <Link
                href="/dashboard/user/profile"
                className="flex gap-[10px] items-center rounded-[10px] hover:bg-[#e0e0e0] px-[5px] py-[4px] transition-all cursor-pointer"
                onClick={() => setIsMenuOpen(false)}
              >
                <AccountCircle />
                <p className="my-0 text-[14px] leading-none">View Profile</p>
              </Link>

              <Link
                href="/dashboard/user/update-password"
                className="flex gap-[10px] items-center rounded-[10px] hover:bg-[#e0e0e0] px-[5px] py-[4px] transition-all cursor-pointer"
                onClick={() => setIsMenuOpen(false)}
              >
                <Password />
                <p className="my-0 text-[14px] leading-none">Change Password</p>
              </Link>

              <button
                onClick={handleLogout}
                className="flex gap-[10px] items-center rounded-[10px] hover:bg-[#e0e0e0] px-[5px] py-[4px] transition-all cursor-pointer w-full text-left"
              >
                <Logout className="rotate-[180deg]" />
                <p className="my-0 text-[14px] leading-none">Log Out</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}