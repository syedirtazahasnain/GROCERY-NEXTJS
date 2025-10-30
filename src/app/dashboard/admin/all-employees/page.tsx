"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/app/_components/adminsidebar/index";
import Header from "@/app/_components/adminheader/index";
import Breadcrumb from "@/app/_components/ui/Breadcrumb";
import { Dialog } from "@headlessui/react";
import ConfirmDialog from "@/app/_components/ConfirmDialog";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { toast } from "react-toastify";
import Loader from "@/app/_components/loader/index";

interface User {
  id: number;
  name: string;
  email: string;
  emp_id: string | null;
  d_o_j: string | null;
  location: string | null;
  status: string;
  role: string;
  eligible: any;
}

interface PaginatedUsers {
  current_page: number;
  data: User[];
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

interface SearchParams {
  emp_id: string;
  name: string;
}

interface SearchPayload {
  emp_id: string[];
  name: string[];
}

export default function Page() {
  const [showConfirm, setShowConfirm] = useState(false);
  const [userToReset, setUserToReset] = useState<User | null>(null);
  const [users, setUsers] = useState<PaginatedUsers | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    status: "",
    eligible: 0,
  });
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string[]>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchParams, setSearchParams] = useState<SearchParams>({
    emp_id: "",
    name: "",
  });
  const [empIdList, setEmpIdList] = useState<string[]>([]);
  const [nameList, setNameList] = useState<string[]>([]);

  const router = useRouter();
  const urlSearchParams = useSearchParams();
  const currentPage = urlSearchParams.get("page") || "1";

  const fetchUsers = async (searchPayload: SearchPayload | null = null) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/auth/login");
        return;
      }

      let url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/users/all?page=${currentPage}`;
      if (searchPayload) {
        url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/users/all`;
      }
      const response = await fetch(url, {
        method: searchPayload ? "POST" : "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: searchPayload ? JSON.stringify(searchPayload) : null,
      });

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();
      setUsers(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
      toast.error(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, router]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSearchParams((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = () => {
    // setLoading(true);
    const splitAndTrim = (input: string) =>
      input
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

    const payload = {
      emp_id:
        empIdList.length > 0 ? empIdList : splitAndTrim(searchParams.emp_id),
      name: nameList.length > 0 ? nameList : splitAndTrim(searchParams.name),
    };

    fetchUsers(payload);
  };

  const handleClearSearch = () => {
    setSearchParams({
      emp_id: "",
      name: "",
    });
    setEmpIdList([]);
    setNameList([]);

    fetchUsers();
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // Convert 'eligible' value from string to number
    const updatedValue = name === "eligible" ? Number(value) : value;

    setFormData((prev) => ({
      ...prev,
      [name]: updatedValue,
    }));

    // Clear validation error when user types/selects
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      status: user.status,
      eligible: user.eligible,
    });
    setValidationErrors({});
    setIsOpen(true);
  };

  const resetPassword = async (user: User) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/auth/login");
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/password-reset`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ email: user.email }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to send password reset email");
      }

      toast.success(data.message || "Password reset email sent successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  const handleSave = async () => {
    try {
      if (!selectedUser) return;

      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/auth/login");
        return;
      }

      setIsSubmitting(true);
      setValidationErrors({});

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/users-update/${selectedUser.id}`,
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
        if (response.status === 403 && data.errors) {
          setValidationErrors(data.errors);
          toast.error("Please fix the validation errors");
          return;
        }
        throw new Error(data.message || "Failed to update user");
      }

      toast.success(data.message || "User updated successfully");
      setIsOpen(false);

      // Refresh the user list
      const updatedResponse = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/users/all?page=${currentPage}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const updatedData = await updatedResponse.json();
      setUsers(updatedData.data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update user");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex gap-[20px] px-[20px] xl:px-[30px]">
        <div className="w-[15%] relative">
          <Sidebar />
        </div>
        <div className="w-full mx-auto space-y-4 p-4">
          <div>
            <Header />
          </div>
          <div className="px-6 py-6 bg-[#f9f9f9] rounded-[20px] xl:rounded-[25px] text-[#2b3990]">
            <h1 className="text-2xl font-bold my-0">All Employees</h1>
            <Breadcrumb
              items={[{ label: "Dashboard" }, { label: "Employees" }]}
            />
          </div>
          <div className="text-red-500 p-4">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex gap-[20px] px-[20px] xl:px-[30px]">
      <div className="w-[15%] relative">
        <Sidebar />
      </div>
      <div className="w-full mx-auto space-y-4 p-4">
        <div>
          <Header />
        </div>
        <div className="px-6 py-6 bg-[#f9f9f9] rounded-[20px] xl:rounded-[25px] text-[#2b3990]">
          <h1 className="text-2xl font-bold my-0">All Employees</h1>
          <Breadcrumb
            items={[{ label: "Dashboard" }, { label: "Employees" }]}
          />
        </div>

        <div className="relative mb-6">
          <div className="flex items-center gap-2">
            {/* EMPLOYEE ID INPUT (taggable) */}
            <div className="max-w-xs">
              <div className="w-full px-3 py-2 rounded-[10px] text-sm border-[#2b3990] border-[2px] bg-gray-100">
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

                <input
                  type="text"
                  name="emp_id"
                  value={searchParams.emp_id}
                  onChange={handleSearchChange}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const trimmed = searchParams.emp_id.trim();
                      if (trimmed && !empIdList.includes(trimmed)) {
                        setEmpIdList((prev) => [...prev, trimmed]);
                        setSearchParams((prev) => ({ ...prev, emp_id: "" }));
                      }
                    }
                  }}
                  className="outline-none bg-transparent"
                  placeholder={
                    empIdList.length === 0
                      ? "Search Employee ID and press Enter"
                      : ""
                  }
                />
              </div>
            </div>

            {/* EMPLOYEE NAME INPUT (taggable same as emp_id) */}
            <div className="max-w-xs">
              <div className="w-full px-3 py-2 rounded-[10px] text-sm border-[#2b3990] border-[2px] bg-gray-100">
                {nameList.map((name, index) => (
                  <span
                    key={index}
                    className="text-xs px-[10px] py-[4px] bg-[#2b3990] rounded-[10px] text-white flex justify-between items-center gap-1 mb-[2px]"
                  >
                    {name}
                    <button
                      onClick={() =>
                        setNameList((prev) =>
                          prev.filter((_, i) => i !== index)
                        )
                      }
                      className="text-red-300 text-xs"
                    >
                      <XMarkIcon className="h-4 w-4 text-[#fff]" />
                    </button>
                  </span>
                ))}

                <input
                  type="text"
                  name="name"
                  value={searchParams.name}
                  onChange={handleSearchChange}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const trimmed = searchParams.name.trim();
                      if (trimmed && !nameList.includes(trimmed)) {
                        setNameList((prev) => [...prev, trimmed]);
                        setSearchParams((prev) => ({ ...prev, name: "" }));
                      }
                    }
                  }}
                  className="outline-none bg-transparent"
                  placeholder={
                    nameList.length === 0
                      ? "Search Employee Name and press Enter"
                      : ""
                  }
                />
              </div>
            </div>

            {/* SEARCH BUTTON */}
            <div
              onClick={handleSearch}
              className="rounded-[10px] flex items-center justify-center bg-[#2b3990] hover:bg-[#00aeef] text-[#fff] transition-all duration-300 ease-in-out text-xs uppercase px-4 py-[10px] text-nowrap"
            >
              <button className="uppercase flex items-center gap-2">
                Search
              </button>
            </div>

            {/* CLEAR BUTTON */}
            {(empIdList.length > 0 || nameList.length > 0) && (
              <div
                onClick={handleClearSearch}
                className="shadow-sm rounded-[10px] flex items-center justify-center bg-[#c00]/80 hover:bg-[#c00] text-[#fff] transition-all duration-300 ease-in-out border-none text-nowrap text-xs uppercase px-4 py-[10px]"
              >
                <button className="uppercase flex items-center gap-2">
                  Clear
                </button>
              </div>
            )}
          </div>

          {/* Suggestions dropdown could be added here if needed */}
        </div>
        {users?.data.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500">
              No employees found matching your search criteria.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[10px] xl:gap-[15px]">
            {users?.data.map((user) => (
              <div
                key={user.id}
                className="rounded-[20px] overflow-hidden bg-[#f9f9f9] p-[10px] md:p-[15px] xl:p-[20px] relative"
              >
                <div className="flex gap-[10px] xl:gap-[20px]">
                  <div>
                    <div className="w-[60px] h-[60px] rounded-full flex justify-center items-center overflow-hidden bg-gray-200">
                      <img
                        src="/avatar.svg"
                        alt="User Avatar"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <div>
                    <p className="text-[14px] my-0 leading-none px-[10px] bg-[#2b3990] rounded-[10px] inline text-[#fff]">
                      {user.emp_id || String(user.id).padStart(4, "0")}
                    </p>
                    <p className="capitalize font-semibold text-[18px] my-1 leading-none">
                      {user.name}
                    </p>
                    <p className="text-[14px] my-0">{user.email}</p>
                    <p className="text-[12px] my-0 capitalize">
                      Status: {user.status.toLowerCase()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleEdit(user)}
                    className="absolute top-[10px] right-[10px] text-gray-700 hover:text-[#00aeef]"
                  >
                    <p className="my-0 px-[10px] bg-[#00aeef] text-[#fff] rounded text-xs uppercase">
                      Edit
                    </p>
                  </button>
                  <button
                    onClick={() => {
                      setUserToReset(user);
                      setShowConfirm(true);
                    }}
                    className="absolute bottom-[7px] right-[7px] text-gray-700 hover:text-[#00aeef]"
                  >
                    <img
                      src="/icon.svg"
                      alt="Reset Password"
                      className="w-[30px] h-[30px] object-contain rounded cursor-pointer hover:bg-[#2b3990]/10 transition-colors duration-300"
                    />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        {users && users.links.length > 0 && (
          <div className="flex justify-center gap-2 mt-6">
            {users.links.map((link, index) => {
              if (link.url === null) return null;

              const page = new URL(link.url).searchParams.get("page") || "1";
              const isActive = link.active;
              const isPrevious = link.label.includes("Previous");
              const isNext = link.label.includes("Next");

              return (
                <Link
                  key={index}
                  href={`/dashboard/admin/all-employees?page=${page}`}
                  className={`px-4 py-2 rounded-lg border ${
                    isActive
                      ? "bg-[#2b3990] text-white border-blue-500"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  } ${isPrevious || isNext ? "font-semibold" : ""}`}
                >
                  {isPrevious ? "«" : isNext ? "»" : link.label}
                </Link>
              );
            })}
          </div>
        )}
        {showConfirm && userToReset && (
          <ConfirmDialog
            message={`Are you sure you want to reset the password for ${userToReset.name}?`}
            onConfirm={async () => {
              await resetPassword(userToReset);
              setShowConfirm(false);
              setUserToReset(null);
            }}
            onCancel={() => {
              toast.info("Password remains the same");
              setShowConfirm(false);
              setUserToReset(null);
            }}
          />
        )}
      </div>

      <Dialog
        open={isOpen}
        onClose={() => {
          setIsOpen(false);
          setValidationErrors({});
        }}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-md bg-white rounded-lg p-6 shadow-lg">
            <Dialog.Title className="text-xl font-semibold mb-4">
              Edit Employee Info
            </Dialog.Title>

            <div className="space-y-4">
              <div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Full Name"
                  className={`w-full border rounded px-3 py-2 ${
                    validationErrors.name ? "border-red-500" : ""
                  }`}
                />
                {validationErrors.name && (
                  <p className="mt-1 text-sm text-red-500">
                    {validationErrors.name[0]}
                  </p>
                )}
              </div>

              <div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email"
                  className={`w-full border rounded px-3 py-2 ${
                    validationErrors.email ? "border-red-500" : ""
                  }`}
                />
                {validationErrors.email && (
                  <p className="mt-1 text-sm text-red-500">
                    {validationErrors.email[0]}
                  </p>
                )}
              </div>

              <div>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className={`w-full border rounded px-3 py-2 ${
                    validationErrors.status ? "border-red-500" : ""
                  }`}
                >
                  <option value="">Select Status</option>
                  <option value="Permanent">Permanent</option>
                  <option value="Probation">Probation</option>
                  <option value="Contract">Contract</option>

                  <option value="Internship">Internship</option>
                </select>
                {validationErrors.status && (
                  <p className="mt-1 text-sm text-red-500">
                    {validationErrors.status[0]}
                  </p>
                )}
              </div>
              <div>
                <select
                  name="eligible"
                  value={formData.eligible?.toString() || ""}
                  onChange={handleChange}
                  className={`w-full border rounded px-3 py-2 ${
                    validationErrors.eligible ? "border-red-500" : ""
                  }`}
                >
                  <option value="">Select Eligibility</option>
                  <option value="1">Rashan Eligible</option>
                  <option value="0">Not Eligible</option>
                </select>
                {validationErrors.eligible && (
                  <p className="mt-1 text-sm text-red-500">
                    {validationErrors.eligible[0]}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => {
                  setIsOpen(false);
                  setValidationErrors({});
                }}
                className="px-4 py-2 text-sm rounded-[10px] hover:text-[#fff] bg-gray-200 hover:bg-gray-800"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 text-sm rounded-[10px] bg-[#2b3990] text-white hover:bg-[#00aeef] flex items-center justify-center gap-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader />
                  </>
                ) : (
                  "Save"
                )}
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}
