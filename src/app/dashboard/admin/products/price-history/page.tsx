"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/app/_components/adminheader/index";
import Sidebar from "@/app/_components/adminsidebar/index";
import Breadcrumb from "@/app/_components/ui/Breadcrumb";
import Loader from "@/app/_components/loader/index";
import { toast } from "react-toastify";
import Link from "next/link";
import DatePicker from "react-datepicker";
import { format } from "date-fns";
import "react-datepicker/dist/react-datepicker.css";
import { XMarkIcon } from "@heroicons/react/24/solid";

interface Product {
    id: number;
    name: string;
    detail: string;
    price: string;
    measure: string;
    type: string;
    image: string | null;
    changed_at: Date;
    status: number; // 1 for active, 9 for inactive
}

interface PaginatedProducts {
    current_page: number;
    data: Product[];
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
    product_name: string;
}

interface SearchPayload {
    product_name: string[];
}

export default function ProductsPage() {
    const [products, setProducts] = useState<PaginatedProducts | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const router = useRouter();
    const urlSearchParams = useSearchParams();
    const currentPage = urlSearchParams.get("page") || "1";
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [searchMonth, setSearchMonth] = useState<string>("");
    // Search related states
    const [searchParams, setSearchParams] = useState<SearchParams>({
        product_name: "",
    });
    const [productNameList, setProductNameList] = useState<string[]>([]);
    const [suggestions, setSuggestions] = useState<Product[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            setError("");

            const token = localStorage.getItem("token");
            if (!token) {
                router.push("/auth/login");
                return;
            }

            // Build URL with query parameters
            const params = new URLSearchParams();
            params.append("page", currentPage);

            // Add product names as array parameters
            productNameList.forEach((name) => {
                params.append("product_name[]", name); // Changed to array format
            });

            // Add month filter if specified
            if (searchMonth) {
                params.append("month", searchMonth);
            }

            const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/products/price-history?${params.toString()}`;

            const response = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 403) {
                    setProducts(null);
                    setError(data.message || "No price history records found");
                    return;
                }

                const errorMessage = data.message || "Failed to fetch products";
                setError(errorMessage);
                toast.error(errorMessage);
                throw new Error(errorMessage);
            }

            setProducts(data.data);
        } catch (err) {
            if (!(err instanceof Error && err.message.includes("No price history records found"))) {
                const errorMessage = err instanceof Error ? err.message : "Failed to load products";
                setError(errorMessage);
                toast.error(errorMessage);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [currentPage]);


    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                searchRef.current &&
                !searchRef.current.contains(event.target as Node)
            ) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSearchParams((prev) => ({ ...prev, [name]: value }));

        if (value.length > 0 && products) {
            const matched = products.data.filter(
                (product) =>
                    product.name.toLowerCase().includes(value.toLowerCase()) &&
                    !productNameList.includes(product.name)
            );
            setSuggestions(matched);
            setShowSuggestions(true);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    };

    const handleSearch = () => {
        const params = new URLSearchParams();
        params.set("page", "1");
        productNameList.forEach(name => {
            params.append("product_name[]", name);
        });
        if (searchMonth) {
            params.set("month", searchMonth);
        }
        window.history.pushState({}, '', `${window.location.pathname}?${params.toString()}`);
        fetchProducts();
    };

    // Handle clear search
    const handleClearSearch = () => {
        setSearchParams({
            product_name: "",
        });
        setProductNameList([]);
        setSearchMonth("");
        setSelectedDate(null);
        fetchProducts();
        router.push("/dashboard/admin/products/price-history");
    };

    // Handle enter key press in search input
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && searchParams.product_name.trim()) {
            e.preventDefault();
            const trimmed = searchParams.product_name.trim();
            if (trimmed && !productNameList.includes(trimmed)) {
                setProductNameList((prev) => [...prev, trimmed]);
                setSearchParams((prev) => ({ ...prev, product_name: "" }));
            }
        }
    };

    // Handle suggestion click
    const handleSuggestionClick = (product: Product) => {
        if (!productNameList.includes(product.name)) {
            setProductNameList((prev) => [...prev, product.name]);
        }
        setSearchParams((prev) => ({ ...prev, product_name: "" }));
        setShowSuggestions(false);
    };

    // Remove product name from the list
    const removeProductName = (name: string) => {
        setProductNameList((prev) => prev.filter((n) => n !== name));
    };
    const handleMonthChange = (date: Date | null) => {
        setSelectedDate(date);
        if (date) {
            const formatted = format(date, "MM-yyyy");
            setSearchMonth(formatted);
        } else {
            setSearchMonth("");
        }
    };
    if (loading) {
        return <Loader />;
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
                    <h1 className="text-2xl font-bold my-0">All Products</h1>
                    <Breadcrumb items={[{ label: "Dashboard" }, { label: "Products" }]} />
                </div>

                {/* Search and Filter Component */}
                <div className="relative mb-6" ref={searchRef}>
                    <div className="flex items-center gap-2">
                        {/* PRODUCT NAME INPUT (taggable) */}
                        <div className="max-w-xs">
                            <div className="w-full px-3 py-2 rounded-[10px] text-sm border-[#2b3990] border-[2px] bg-gray-100">
                                {productNameList.map((name, index) => (
                                    <span
                                        key={index}
                                        className="text-xs px-[10px] py-[4px] bg-[#2b3990] rounded-[10px] text-white flex justify-between items-center gap-1 mb-[2px]"
                                    >
                                        {name}
                                        <button
                                            onClick={() => removeProductName(name)}
                                            className="text-red-300 text-xs"
                                        >
                                            <XMarkIcon className="h-4 w-4 text-[#fff]" />
                                        </button>
                                    </span>
                                ))}

                                <input
                                    type="text"
                                    name="product_name"
                                    value={searchParams.product_name}
                                    onChange={handleSearchChange}
                                    onKeyDown={handleKeyDown}
                                    className="outline-none bg-transparent"
                                    placeholder={
                                        productNameList.length === 0
                                            ? "Search Product Name and press Enter"
                                            : ""
                                    }
                                />
                            </div>
                        </div>

                        {/* DATE PICKER */}
                        <div className="">
                            <DatePicker
                                selected={selectedDate}
                                onChange={(date) => {
                                    handleMonthChange(date);
                                    if (date) {
                                        fetchProducts();
                                    }
                                }}
                                dateFormat="MM-yyyy"
                                showMonthYearPicker
                                placeholderText="Select Month (MM-YYYY)"
                                className="w-full px-3 py-2 rounded-[10px] text-sm border-[#2b3990] border-[2px] bg-gray-100"
                            />
                        </div>

                        {/* SEARCH BUTTON */}
                        <div
                            onClick={handleSearch}
                            className="rounded-[10px] flex items-center justify-center bg-[#2b3990] hover:bg-[#00aeef] text-[#fff] transition-all duration-300 ease-in-out text-xs uppercase px-4 py-[10px] text-nowrap"
                        >
                            <button className="text-xs uppercase px-4 rounded-[10px] flex items-center gap-2">
                                Search
                            </button>
                        </div>

                        {/* CLEAR BUTTON */}
                        {(productNameList.length > 0 || searchMonth) && (
                            <div
                                onClick={handleClearSearch}
                                className="shadow-sm rounded-[10px] flex items-center justify-center bg-[#c00]/80 hover:bg-[#c00] text-[#fff] transition-all duration-300 ease-in-out border-none text-nowrap text-xs uppercase px-4 py-[10px]"
                            >
                                <button className="text-xs uppercase px-4 rounded-[10px] flex items-center gap-2">
                                    Clear
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Suggestions dropdown */}
                    {showSuggestions && suggestions.length > 0 && (
                        <div className="absolute z-10 mt-1 w-auto bg-white shadow-lg rounded-[15px] border border-gray-200 max-h-60 overflow-auto">
                            {suggestions.map((product, index) => {
                                const isSelected = productNameList.includes(product.name);
                                return (
                                    <div
                                        key={index}
                                        className={`px-4 py-2 flex items-center ${isSelected
                                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                            : "hover:bg-gray-100 cursor-pointer"
                                            }`}
                                        onClick={() =>
                                            !isSelected && handleSuggestionClick(product)
                                        }
                                    >
                                        <img
                                            src={
                                                product.image
                                                    ? `${process.env.NEXT_PUBLIC_BACKEND_URL_PUBLIC}${product.image}`
                                                    : "/images/items/product-default.png"
                                            }
                                            alt={product.name}
                                            className="w-8 h-8 object-cover mr-3 rounded"
                                            onError={(e) => {
                                                e.currentTarget.src =
                                                    "/images/items/product-default.png";
                                            }}
                                        />
                                        <div>
                                            <p
                                                className={`font-medium ${isSelected ? "text-gray-400" : "text-[#2b3990]"
                                                    }`}
                                            >
                                                {product.name}
                                                {isSelected && (
                                                    <span className="ml-2 text-xs text-gray-500">
                                                        (already selected)
                                                    </span>
                                                )}
                                            </p>
                                            <p
                                                className={`text-sm ${isSelected ? "text-gray-400" : "text-gray-600"
                                                    }`}
                                            >
                                                {product.type} • {product.price} Rs
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
                {/* Products Grid */}
                {products?.data.length === 0 ? (
                    <div className="text-center py-10">
                        <p className="text-gray-500">
                            No products found matching your search criteria.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-[10px] xl:gap-[15px] mb-8">
                            {products?.data.map((product, index) => (
                                <div
                                    key={index}
                                    className="bg-white rounded-[20px] border-[1px] border-[#2b3990] border-opacity-40 overflow-hidden relative"
                                >
                                    <div className="flex flex-col h-full shadow-lg rounded-lg overflow-hidden transition-transform duration-300 ease-in-out hover:scale-105">
                                        <div className="bg-[#f9f9f9] overflow-hidden w-full">
                                            <img
                                                src={
                                                    product.image
                                                        ? `${process.env.NEXT_PUBLIC_BACKEND_URL_PUBLIC}${product.image}`
                                                        : "/images/items/product-default.png"
                                                }
                                                alt={product.name}
                                                className="w-full h-48 object-cover"
                                                onError={(e) => {
                                                    e.currentTarget.src =
                                                        "/images/items/product-default.png";
                                                }}
                                            />
                                        </div>
                                        <div className="bg-white py-4 px-6">
                                            <div>
                                                <h2 className="text-lg font-semibold text-gray-800 capitalize">
                                                    {product.name}
                                                </h2>
                                            </div>
                                            <div className="flex items-center justify-between mt-2">
                                                <p className="text-base text-green-600 font-medium">
                                                    {product.price} Rs
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {new Intl.DateTimeFormat("en-US", {
                                                        year: "numeric",
                                                        month: "2-digit",
                                                        day: "2-digit",
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                        second: "2-digit",
                                                        hour12: true,
                                                    }).format(new Date(product.changed_at))}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {products && products.links.length > 0 && (
                            <div className="flex justify-center gap-2 mt-6">
                                {products.links.map((link, index) => {
                                    if (link.url === null) return null;

                                    const urlObj = new URL(link.url);
                                    const pageParam = urlObj.searchParams.get("page");

                                    // Preserve current filters in query string
                                    const searchParams = new URLSearchParams();
                                    if (pageParam) searchParams.append("page", pageParam);

                                    // Re-append product_name[] filters
                                    productNameList.forEach((name) =>
                                        searchParams.append("product_name", name)
                                    );

                                    // Add month if available
                                    if (searchMonth) {
                                        searchParams.append("month", searchMonth);
                                    }

                                    const isPrevious = link.label.includes("Previous");
                                    const isNext = link.label.includes("Next");
                                    const isActive = link.active;

                                    return (
                                        <Link
                                            key={index}
                                            href={`/dashboard/admin/products/price-history?${searchParams.toString()}`}
                                            className={`px-4 py-2 rounded-lg border ${isActive
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

                    </>
                )}
            </div>
        </div>
    );
}