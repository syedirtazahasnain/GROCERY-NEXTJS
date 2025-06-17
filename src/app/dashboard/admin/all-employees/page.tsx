"use client";

import { useState, useEffect, useCallback, useContext } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/app/_components/adminsidebar/index";
import Header from "@/app/_components/adminheader/index";
import Breadcrumb from "@/app/_components/ui/Breadcrumb";
import { Dialog } from "@headlessui/react";
import { Input, DateRangePicker } from "@heroui/react";
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

interface EmployeeContextType {
  employees: PaginatedUsers | null;
  searchCache: Record<string, PaginatedUsers>;
  addToCache: (key: string, data: PaginatedUsers) => void;
  setEmployees: (data: PaginatedUsers) => void;
  searchSuggestions: User[];
  setSearchSuggestions: (users: User[]) => void;
}

const EmployeeContext = createContext<EmployeeContextType | undefined>(undefined);

export const EmployeeProvider = ({ children }: { children: ReactNode }) => {
  const [employees, setEmployees] = useState<PaginatedUsers | null>(null);
  const [searchCache, setSearchCache] = useState<Record<string, PaginatedUsers>>({});
  const [searchSuggestions, setSearchSuggestions] = useState<User[]>([]);

  const addToCache = (key: string, data: PaginatedUsers) => {
    setSearchCache(prev => ({ ...prev, [key]: data }));
  };

  return (
    <EmployeeContext.Provider value={{ 
      employees, 
      searchCache, 
      addToCache, 
      setEmployees,
      searchSuggestions,
      setSearchSuggestions
    }}>
      {children}
    </EmployeeContext.Provider>
  );
};

export const useEmployeeContext = () => {
  const context = useContext(EmployeeContext);
  if (context === undefined) {
    throw new Error('useEmployeeContext must be used within an EmployeeProvider');
  }
  return context;
};

export default function Page() {
  const { 
    employees, 
    searchCache, 
    addToCache, 
    setEmployees,
    searchSuggestions,
    setSearchSuggestions
  } = useEmployeeContext();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    status: "",
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchParams, setSearchParams] = useState({
    emp_id: "",
    name: ""
  });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const router = useRouter();
  const urlSearchParams = useSearchParams();
  const currentPage = urlSearchParams.get('page') || '1';

  const generateCacheKey = useCallback((payload: any) => {
    return JSON.stringify(payload);
  }, []);

  const fetchUsers = useCallback(async (searchPayload = null) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      // Generate cache key
      const cacheKey = searchPayload ? generateCacheKey(searchPayload) : 'default';

      // Check cache first
      if (searchCache[cacheKey]) {
        setEmployees(searchCache[cacheKey]);
        setLoading(false);
        return;
      }

      let url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/users/all?page=${currentPage}`;
      if (searchPayload) {
        url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/users/all`;
      }
      
      const response = await fetch(url, {
        method: searchPayload ? 'POST' : 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: searchPayload ? JSON.stringify(searchPayload) : null,
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setEmployees(data.data);
      
      // Add to cache if it's a search
      if (searchPayload) {
        addToCache(cacheKey, data.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
      toast.error(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [currentPage, router, generateCacheKey, searchCache, addToCache, setEmployees]);

  // Debounced search for suggestions
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchParams.name.length > 2) {
        const token = localStorage.getItem('token');
        if (!token) return;

        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/users/all`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: [searchParams.name]
          }),
        })
        .then(response => response.json())
        .then(data => {
          setSearchSuggestions(data.data.data || []);
          setShowSuggestions(true);
        })
        .catch(console.error);
      } else {
        setSearchSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchParams.name]);

  useEffect(() => {
    fetchUsers();
  }, [currentPage, router, fetchUsers]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = () => {
    setLoading(true);
    const splitAndTrim = (input: string) =>
      input
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
    const payload = {
      emp_id: searchParams.emp_id ? splitAndTrim(searchParams.emp_id) : [],
      name: searchParams.name ? splitAndTrim(searchParams.name) : []
    };
  
    fetchUsers(payload);
    setShowSuggestions(false);
  };

  const handleClearSearch = () => {
    setSearchParams({
      emp_id: "",
      name: ""
    });
    setLoading(true);
    fetchUsers();
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (user: User) => {
    setSearchParams(prev => ({
      ...prev,
      name: user.name
    }));
    setShowSuggestions(false);
    
    // Trigger search with this user
    const payload = {
      name: [user.name]
    };
    setLoading(true);
    fetchUsers(payload);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear validation error when user types
    if (validationErrors[name]) {
      setValidationErrors(prev => {
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
    });
    setValidationErrors({});
    setIsOpen(true);
  };

  const handleSave = async () => {
    try {
      if (!selectedUser) return;

      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      setIsSubmitting(true);
      setValidationErrors({});

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/users-update/${selectedUser.id}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
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
        throw new Error(data.message || 'Failed to update user');
      }

      toast.success(data.message || 'User updated successfully');
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
      setEmployees(updatedData.data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update user');
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
            <Breadcrumb items={[{ label: "Dashboard" }, { label: "Employees" }]} />
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

        <div>
          <div className='flex gap-2 relative'>
            <Input 
              type="text"
              name="emp_id"
              value={searchParams.emp_id}
              onChange={handleSearchChange}
              className="max-w-xs"
              label="Search Employee ID"
              classNames={{
                inputWrapper: "bg-white border-2 text-xs"
              }} 
            />
            <div className="relative max-w-xs">
              <Input 
                type="text"
                name="name"
                value={searchParams.name}
                onChange={handleSearchChange}
                onFocus={() => searchParams.name.length > 2 && setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                className="max-w-xs"
                label="Search Employee Name"
                classNames={{
                  inputWrapper: "bg-white border-2 text-xs"
                }} 
              />
              {showSuggestions && searchSuggestions.length > 0 && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                  {searchSuggestions.map(user => (
                    <div
                      key={user.id}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleSuggestionClick(user)}
                    >
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-gray-600">{user.emp_id || String(user.id).padStart(4, "0")}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div 
              onClick={handleSearch}
              className='shadow-sm border-[2px] rounded-[10px] flex items-center justify-center hover:bg-[#2b3990] hover:text-[#fff] transition-all duration-300 ease-in-out hover:border-[#2b3990] cursor-pointer'
            >
              <button className="text-xs uppercase px-4 rounded-[10px] flex items-center gap-2">
                Search
              </button>
            </div>
            {(searchParams.emp_id || searchParams.name) && (
              <div 
                onClick={handleClearSearch}
                className='shadow-sm border-[2px] rounded-[10px] flex items-center justify-center hover:bg-gray-500 hover:text-[#fff] transition-all duration-300 ease-in-out hover:border-gray-500 cursor-pointer'
              >
                <button className="text-xs uppercase px-4 rounded-[10px] flex items-center gap-2">
                  Clear
                </button>
              </div>
            )}
          </div>
        </div>

        {employees?.data.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500">No employees found matching your search criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[10px] xl:gap-[15px]">
            {employees?.data.map((user) => (
              <div
                key={user.id}
                className="rounded-[20px] overflow-hidden bg-[#f9f9f9] p-[10px] md:p-[15px] xl:p-[20px] relative"
              >
                <div className="flex gap-[10px] xl:gap-[20px]">
                  <div>
                    <div className="w-[60px] h-[60px] rounded-full flex justify-center items-center overflow-hidden bg-gray-200">
                      <img
                        src="/images/logo/irtaza.webp"
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
                    <p className='my-0 px-[10px] bg-[#00aeef] text-[#fff] rounded text-xs uppercase'>Edit</p>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {employees && employees.links.length > 0 && (
          <div className="flex justify-center gap-2 mt-6">
            {employees.links.map((link, index) => {
              if (link.url === null) return null;

              const page = new URL(link.url).searchParams.get('page') || '1';
              const isActive = link.active;
              const isPrevious = link.label.includes('Previous');
              const isNext = link.label.includes('Next');

              return (
                <Link
                  key={index}
                  href={`/dashboard/admin/all-employees?page=${page}`}
                  className={`px-4 py-2 rounded-lg border ${isActive
                    ? 'bg-[#2b3990] text-white border-blue-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    } ${(isPrevious || isNext) ? 'font-semibold' : ''}`}
                >
                  {isPrevious ? '«' : isNext ? '»' : link.label}
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={isOpen} onClose={() => {
        setIsOpen(false);
        setValidationErrors({});
      }} className="relative z-50">
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
                  className={`w-full border rounded px-3 py-2 ${validationErrors.name ? 'border-red-500' : ''
                    }`}
                />
                {validationErrors.name && (
                  <p className="mt-1 text-sm text-red-500">{validationErrors.name[0]}</p>
                )}
              </div>

              <div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email"
                  className={`w-full border rounded px-3 py-2 ${validationErrors.email ? 'border-red-500' : ''
                    }`}
                />
                {validationErrors.email && (
                  <p className="mt-1 text-sm text-red-500">{validationErrors.email[0]}</p>
                )}
              </div>

              <div>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className={`w-full border rounded px-3 py-2 ${validationErrors.status ? 'border-red-500' : ''
                    }`}
                >
                  <option value="">Select Status</option>
                  <option value="Permanent">Permanent</option>
                  <option value="Probation">Probation</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                </select>
                {validationErrors.status && (
                  <p className="mt-1 text-sm text-red-500">{validationErrors.status[0]}</p>
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