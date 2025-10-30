"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/_components/sidebar/index";
import Breadcrumb from "@/app/_components/ui/Breadcrumb";
import Image from "next/image";
import Header from "@/app/_components/header/index";
import { toast } from "react-toastify";
import ErrorMessage from "@/app/_components/error/index";
import Loader from "@/app/_components/loader/index";

interface UserData {
  id: number;
  name: string;
  email: string;
  my_role: string;
  emp_id: string;
  role?: string;
  created_at: string;
  doj: string;
  location: string;
  updated_at: string;
}

function PasswordUpdateForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    current_password: "",
    new_password: "",
    new_password_confirmation: "",
  });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});
    setSuccessMessage("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/auth/login");
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/password-update`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          toast.error(data.errors);
          setErrors(data.errors);
        } else {
          toast.error(data.message || "Failed to update password");
          setErrors({ general: [data.message || "Failed to update password"] });
        }
        return;
      }

      // Success case
      setSuccessMessage(data.message);
      localStorage.setItem("token", data.data.token);
      setFormData({
        current_password: "",
        new_password: "",
        new_password_confirmation: "",
      });

      // Optionally redirect or refresh user data
      router.refresh();
    } catch (error) {
      setErrors({ general: ["Network error. Please try again."] });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-8 max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Update Password</h2>

      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {successMessage}
        </div>
      )}

      {errors.general && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {errors.general[0]}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            htmlFor="current_password"
            className="block text-sm font-medium mb-2"
          >
            Current Password
          </label>
          <input
            type="password"
            id="current_password"
            name="current_password"
            value={formData.current_password}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg ${errors.current_password ? "border-red-500" : "border-gray-300"
              }`}
          />
          {errors.current_password && (
            <div className="text-red-500 text-sm mt-1">
              {errors.current_password.map((msg, i) => (
                <p key={i}>{msg}</p>
              ))}
            </div>
          )}
        </div>

        <div className="mb-4">
          <label
            htmlFor="new_password"
            className="block text-sm font-medium mb-2"
          >
            New Password
          </label>
          <input
            type="password"
            id="new_password"
            name="new_password"
            value={formData.new_password}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg ${errors.new_password ? "border-red-500" : "border-gray-300"
              }`}
          />
          {errors.new_password && (
            <div className="text-red-500 text-sm mt-1">
              {errors.new_password.map((msg, i) => (
                <p key={i}>{msg}</p>
              ))}
            </div>
          )}
        </div>

        <div className="mb-6">
          <label
            htmlFor="new_password_confirmation"
            className="block text-sm font-medium mb-2"
          >
            Confirm New Password
          </label>
          <input
            type="password"
            id="new_password_confirmation"
            name="new_password_confirmation"
            value={formData.new_password_confirmation}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg ${errors.new_password ? "border-red-500" : "border-gray-300"
              }`}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full bg-[#2b3990] text-white py-2 rounded-lg hover:bg-[#00aeef] transition ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""
            }`}
        >
          {isSubmitting ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  );
}

// export default function UserProfile() {
export default function page({ my_role }: UserData) {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/auth/login");
          return;
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user-details`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          const data = await response.json();
          toast.error(data.message || "Failed to fetch user details");
        }

        const data = await response.json();
        setUser(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [router]);

  if (loading) {
    return (
      <Loader />
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  if (!user) {
    return <div className="text-gray-500">No user data available</div>;
  }

  return (
    <div className="min-h-screen flex gap-[20px] px-[20px] xl:px-[30px]">
      <div className="w-[15%] relative">
        <Sidebar />
      </div>
      <div className="w-full mx-auto space-y-4 p-4">
        <div><Header /></div>
        <div className="px-6 py-6 bg-[#f9f9f9] rounded-[20px] xl:rounded-[25px] text-[#2b3990]">
          <h1 className="text-2xl font-bold my-0">User Profile</h1>
          <Breadcrumb
            items={[{ label: "Dashboard" }, { label: "User Profile" }]}
          />
        </div>
        <div className="bg-[#f9f9f9] p-[10px] md:p-[20px] xl:p-[30px] rounded-[20px]">
          <div className="p-5 mb-6 rounded-[20px] xl:rounded-[25px] lg:p-6 bg-[#fff]">
            <div>
              <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
                <div className="w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800">
                  <img
                    src={user.image ? `${process.env.NEXT_PUBLIC_BACKEND_URL_PUBLIC}${user.image}` : "/avatar.svg"}
                    onError={(e) => {
                      e.currentTarget.src = "/avatar.svg";
                    }}
                    alt="user" />
                </div>
                <div className="order-3 xl:order-2">
                  <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
                    {user.name}
                  </h4>
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
                  <button className="flex h-11 w-11 items-center justify-center gap-2 rounded-full border border-gray-300 bg-white text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200">
                    <svg
                      className="fill-current"
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M11.6666 11.2503H13.7499L14.5833 7.91699H11.6666V6.25033C11.6666 5.39251 11.6666 4.58366 13.3333 4.58366H14.5833V1.78374C14.3118 1.7477 13.2858 1.66699 12.2023 1.66699C9.94025 1.66699 8.33325 3.04771 8.33325 5.58342V7.91699H5.83325V11.2503H8.33325V18.3337H11.6666V11.2503Z"
                        fill=""
                      />
                    </svg>
                  </button>

                  <button className="flex h-11 w-11 items-center justify-center gap-2 rounded-full border border-gray-300 bg-white text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200">
                    <svg
                      className="fill-current"
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M15.1708 1.875H17.9274L11.9049 8.75833L18.9899 18.125H13.4424L9.09742 12.4442L4.12578 18.125H1.36745L7.80912 10.7625L1.01245 1.875H6.70078L10.6283 7.0675L15.1708 1.875ZM14.2033 16.475H15.7308L5.87078 3.43833H4.23162L14.2033 16.475Z"
                        fill=""
                      />
                    </svg>
                  </button>

                  <button className="flex h-11 w-11 items-center justify-center gap-2 rounded-full border border-gray-300 bg-white text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200">
                    <svg
                      className="fill-current"
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M5.78381 4.16645C5.78351 4.84504 5.37181 5.45569 4.74286 5.71045C4.11391 5.96521 3.39331 5.81321 2.92083 5.32613C2.44836 4.83904 2.31837 4.11413 2.59216 3.49323C2.86596 2.87233 3.48886 2.47942 4.16715 2.49978C5.06804 2.52682 5.78422 3.26515 5.78381 4.16645ZM5.83381 7.06645H2.50048V17.4998H5.83381V7.06645ZM11.1005 7.06645H7.78381V17.4998H11.0672V12.0248C11.0672 8.97475 15.0422 8.69142 15.0422 12.0248V17.4998H18.3338V10.8914C18.3338 5.74978 12.4505 5.94145 11.0672 8.46642L11.1005 7.06645Z"
                        fill=""
                      />
                    </svg>
                  </button>

                  <button className="flex h-11 w-11 items-center justify-center gap-2 rounded-full border border-gray-300 bg-white text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200">
                    <svg
                      className="fill-current"
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M10.8567 1.66699C11.7946 1.66854 12.2698 1.67351 12.6805 1.68573L12.8422 1.69102C13.0291 1.69766 13.2134 1.70599 13.4357 1.71641C14.3224 1.75738 14.9273 1.89766 15.4586 2.10391C16.0078 2.31572 16.4717 2.60183 16.9349 3.06503C17.3974 3.52822 17.6836 3.99349 17.8961 4.54141C18.1016 5.07197 18.2419 5.67753 18.2836 6.56433C18.2935 6.78655 18.3015 6.97088 18.3081 7.15775L18.3133 7.31949C18.3255 7.73011 18.3311 8.20543 18.3328 9.1433L18.3335 9.76463C18.3336 9.84055 18.3336 9.91888 18.3336 9.99972L18.3335 10.2348L18.333 10.8562C18.3314 11.794 18.3265 12.2694 18.3142 12.68L18.3089 12.8417C18.3023 13.0286 18.294 13.213 18.2836 13.4351C18.2426 14.322 18.1016 14.9268 17.8961 15.458C17.6842 16.0074 17.3974 16.4713 16.9349 16.9345C16.4717 17.397 16.0057 17.6831 15.4586 17.8955C14.9273 18.1011 14.3224 18.2414 13.4357 18.2831C13.2134 18.293 13.0291 18.3011 12.8422 18.3076L12.6805 18.3128C12.2698 18.3251 11.7946 18.3306 10.8567 18.3324L10.2353 18.333C10.1594 18.333 10.0811 18.333 10.0002 18.333H9.76516L9.14375 18.3325C8.20591 18.331 7.7306 18.326 7.31997 18.3137L7.15824 18.3085C6.97136 18.3018 6.78703 18.2935 6.56481 18.2831C5.67801 18.2421 5.07384 18.1011 4.5419 17.8955C3.99328 17.6838 3.5287 17.397 3.06551 16.9345C2.60231 16.4713 2.3169 16.0053 2.1044 15.458C1.89815 14.9268 1.75856 14.322 1.7169 13.4351C1.707 13.213 1.69892 13.0286 1.69238 12.8417L1.68714 12.68C1.67495 12.2694 1.66939 11.794 1.66759 10.8562L1.66748 9.1433C1.66903 8.20543 1.67399 7.73011 1.68621 7.31949L1.69151 7.15775C1.69815 6.97088 1.70648 6.78655 1.7169 6.56433C1.75786 5.67683 1.89815 5.07266 2.1044 4.54141C2.3162 3.9928 2.60231 3.52822 3.06551 3.06503C3.5287 2.60183 3.99398 2.31641 4.5419 2.10391C5.07315 1.89766 5.67731 1.75808 6.56481 1.71641C6.78703 1.70652 6.97136 1.69844 7.15824 1.6919L7.31997 1.68666C7.7306 1.67446 8.20591 1.6689 9.14375 1.6671L10.8567 1.66699ZM10.0002 5.83308C7.69781 5.83308 5.83356 7.69935 5.83356 9.99972C5.83356 12.3021 7.69984 14.1664 10.0002 14.1664C12.3027 14.1664 14.1669 12.3001 14.1669 9.99972C14.1669 7.69732 12.3006 5.83308 10.0002 5.83308ZM10.0002 7.49974C11.381 7.49974 12.5002 8.61863 12.5002 9.99972C12.5002 11.3805 11.3813 12.4997 10.0002 12.4997C8.6195 12.4997 7.50023 11.3809 7.50023 9.99972C7.50023 8.61897 8.61908 7.49974 10.0002 7.49974ZM14.3752 4.58308C13.8008 4.58308 13.3336 5.04967 13.3336 5.62403C13.3336 6.19841 13.8002 6.66572 14.3752 6.66572C14.9496 6.66572 15.4169 6.19913 15.4169 5.62403C15.4169 5.04967 14.9488 4.58236 14.3752 4.58308Z"
                        fill=""
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="p-5 mb-6 rounded-[20px] xl:rounded-[25px] lg:p-6 bg-[#fff]">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
                  Personal Information
                </h4>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
                  <div>
                    <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                      Name
                    </p>
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                      {user.name}
                    </p>
                  </div>

                  <div>
                    <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                      Location
                    </p>
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                      {user.location}
                    </p>
                  </div>

                  <div>
                    <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                      Email address
                    </p>
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                      {user.email}
                    </p>
                  </div>

                  <div>
                    <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                      Phone
                    </p>
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                      +92 123 456 78
                    </p>
                  </div>

                  <div>
                    <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                      Employee Id
                    </p>
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                      {user.emp_id}
                    </p>
                  </div>
                  <div>
                    <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                      Member Since
                    </p>
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                      {user.doj}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
