
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Header from "@/app/_components/adminheader/index";
import Sidebar from "@/app/_components/adminsidebar/index";
import Breadcrumb from "@/app/_components/ui/Breadcrumb";
import { XMarkIcon } from '@heroicons/react/24/solid';
import {
  DriveFileRenameOutline,
  Create,
  Search,
  Close,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import { Dialog } from "@headlessui/react";
import ErrorMessage from "@/app/_components/error/index";
import Loader from "@/app/_components/loader/index";

interface Product {
  id: number;
  name: string;
  detail: string;
  price: string;
  measure: string;
  type: string;
  image: string | null;
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

export default function ProductsPage() {
  const [products, setProducts] = useState<PaginatedProducts | null>(null);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = searchParams.get("page") || "1";
  const [isOpen, setIsOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [price, setPrice] = useState("");
  const [orderUpdate, setOrderUpdate] = useState(false);

  // Search related states
  const [searchQuery, setSearchQuery] = useState("");
  const [searchTerms, setSearchTerms] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/auth/login");
          return;
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/products?page=${currentPage}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }

        const data = await response.json();
        setProducts(data.data);
        setFilteredProducts(data.data.data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load products"
        );
        toast.error(
          err instanceof Error ? err.message : "Failed to load products"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [currentPage, router]);


  const fetchProducts = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/auth/login");
          return;
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/products?page=${currentPage}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }

        const data = await response.json();
        setProducts(data.data);
        setFilteredProducts(data.data.data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load products"
        );
        toast.error(
          err instanceof Error ? err.message : "Failed to load products"
        );
      } finally {
        setLoading(false);
      }
    };

  // Handle click outside to close suggestions
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

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length > 0 && products) {
      const matched = products.data.filter(
        (product) =>
          product.name.toLowerCase().includes(query.toLowerCase()) &&
          !searchTerms.includes(product.name)
      );
      setSuggestions(matched);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Add search term to the array
  const addSearchTerm = (term: string) => {
    if (term && !searchTerms.includes(term)) {
      setSearchTerms([...searchTerms, term]);
    }
    setSearchQuery("");
    setShowSuggestions(false);
  };

  // Remove search term from the array
  const removeSearchTerm = (term: string) => {
    setSearchTerms(searchTerms.filter((t) => t !== term));
  };

  // Handle search submission
  const handleSearch = () => {
    if (!products) return;

    if (searchTerms.length === 0) {
      setFilteredProducts(products.data);
      return;
    }

    const filtered = products.data.filter((product) =>
      searchTerms.some((term) =>
        product.name.toLowerCase().includes(term.toLowerCase())
      )
    );
    setFilteredProducts(filtered);
  };

  // Handle suggestion click
  const handleSuggestionClick = (product: Product) => {
    addSearchTerm(product.name);
  };

  // Handle enter key press
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && searchQuery) {
      addSearchTerm(searchQuery);
    }
  };

  const toggleProductStatus = async (
    productId: number,
    currentStatus: number
  ) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/auth/login");
        return;
      }

      const newStatus = currentStatus === 1 ? 9 : 1;

      // First get the full product details
      const productResponse = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/products/${productId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!productResponse.ok) {
        throw new Error("Failed to fetch product details");
      }

      const productData = await productResponse.json();
      const product = productData.data;

      // Then update with all required fields
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/store-products`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            id: productId,
            name: product.name,
            detail: product.detail,
            price: product.price,
            measure: product.measure,
            type: product.type,
            status: newStatus,
            order_update: orderUpdate ? 1 : 0,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update product status");
      }

      // Update local state
      setProducts((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          data: prev.data.map((product) =>
            product.id === productId
              ? { ...product, status: newStatus }
              : product
          ),
        };
      });

      // Update filtered products if needed
      setFilteredProducts((prev) =>
        prev.map((product) =>
          product.id === productId ? { ...product, status: newStatus } : product
        )
      );

      toast.success("Product status updated successfully");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update status"
      );
    }
  };

  const clearSearch = ()=>{
    setSearchTerms([])
    fetchProducts();
  }

  const handlePriceUpdate = async () => {
    if (!currentProduct || !price) {
      toast.error("Please enter a valid price");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/auth/login");
        return;
      }

      // Include all required fields in the request
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/store-products`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            id: currentProduct.id,
            name: currentProduct.name,
            detail: currentProduct.detail,
            price: price,
            measure: currentProduct.measure,
            type: currentProduct.type,
            status: currentProduct.status,
            order_update: orderUpdate ? 1 : 0,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.errors) {
          // Handle validation errors
          const errorMessages = Object.values(errorData.errors)
            .flat()
            .join(", ");
          throw new Error(errorMessages);
        }
        throw new Error(errorData.message || "Failed to update product price");
      }

      // Update local state
      setProducts((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          data: prev.data.map((product) =>
            product.id === currentProduct.id ? { ...product, price } : product
          ),
        };
      });

      // Update filtered products
      setFilteredProducts((prev) =>
        prev.map((product) =>
          product.id === currentProduct.id ? { ...product, price } : product
        )
      );

      toast.success("Product price updated successfully");
      setIsOpen(false);
      setPrice("");
      setOrderUpdate(false);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update price"
      );
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <ErrorMessage error={error} />;
  }

  if (!products?.data?.length) {
    return <ErrorMessage error="No products found" />;
  }

  return (
    <div>
      <div className="sticky top-[60px] z-20 bg-white">
        <div className="px-6 py-6 bg-[#f9f9f9] rounded-[20px] xl:rounded-[25px] text-[#2b3990]">
          <h1 className="text-2xl font-bold my-0">All Products</h1>
          <Breadcrumb items={[{ label: "Dashboard" }, { label: "Products" }]} />
        </div>

        {/* Search Component */}
        <div className="relative mb-[10px] bg-white" ref={searchRef}>
          <div className="flex items-center gap-2">
            {/* SEARCH INPUT WITH TAGS */}
            <div className="max-w-xs">
             <div className="w-full h-[42px] overflow-auto flex flex-wrap items-center gap-2 px-3 py-2 border-2 border-[#2b3990] rounded-[10px] bg-gray-50 min-h-[42px] focus-within:ring-2 focus-within:ring-[#2b3990]/30 transition-all duration-200">
  {searchTerms.map((term, index) => (
    <span
      key={index}
      className="flex items-center gap-1 bg-[#2b3990] text-white text-xs font-medium px-3 py-1 rounded-full shadow-sm hover:bg-[#1f2c73] transition-all duration-200"
    >
      {term}
      <button
        onClick={() => removeSearchTerm(term)}
        className="flex items-center justify-center hover:opacity-80 transition-opacity"
      >
        <XMarkIcon className="h-3.5 w-3.5 text-white" />
      </button>
    </span>
  ))}

  <input
    type="text"
    value={searchQuery}
    onChange={handleSearchChange}
    onKeyDown={handleKeyDown}
    placeholder={searchTerms.length === 0 ? "Search products..." : ""}
    className="flex-1 min-w-[120px] bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
  />
</div>

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
            {searchTerms.length > 0 && (
              <div
                onClick={clearSearch}
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
              {suggestions.map((product) => {
                const isSelected = searchTerms.includes(product.name);
                return (
                  <div
                    key={product.id}
                    className={`px-4 py-2 flex items-center ${
                      isSelected
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
                      className={`w-8 h-8 object-cover mr-3 rounded ${
                        isSelected ? "opacity-50" : ""
                      }`}
                      onError={(e) => {
                        e.currentTarget.src =
                          "/images/items/product-default.png";
                      }}
                    />
                    <div>
                      <p
                        className={`font-medium ${
                          isSelected ? "text-gray-400" : "text-[#2b3990]"
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
                        className={`text-sm ${
                          isSelected ? "text-gray-400" : "text-gray-600"
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
</div>
        <div className="mt-[10px] z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-[10px] xl:gap-[15px] mb-8">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-[20px] border-[1px] border-[#2b3990] border-opacity-40 overflow-hidden relative"
            >
              <div className="flex flex-col h-full">
                <div className="bg-[#f9f9f9] overflow-hidden w-full">
                  <img
                    src={
                      product.image
                        ? `${process.env.NEXT_PUBLIC_BACKEND_URL_PUBLIC}${product.image}`
                        : "/images/items/product-default.png"
                    }
                    alt=""
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/images/items/product-default.png";
                    }}
                  />
                </div>
                <div className="py-2 px-3">
                  <div className="">
                    <h2 className="text-sm font-semibold my-0 capitalize">
                      {product.name}
                    </h2>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="my-0 text-xs">{product.type}</p>
                    <p className="my-0 text-sm font-semibold">
                      {product.measure}
                    </p>
                  </div>
                  <div className="relative flex items-center gap-[10px]">
                    <p className="text-xl font-semibold">
                      {product.price}{" "}
                      <span className="pl-[2px] text-sm font-normal">Rs</span>
                    </p>
                    <button
                      className="text-xs relative group"
                      onClick={() => {
                        setCurrentProduct(product);
                        setPrice(product.price);
                        setIsOpen(true);
                      }}
                    >
                      <Create sx={{ fontSize: 15 }} />
                      <span className="absolute top-[-20px] left-[0px] my-0 px-[5px] py-[2px] text-[10px] text-white bg-[#c00] rounded opacity-0 group-hover:opacity-100 transition text-nowrap">
                        Edit Price
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="absolute top-[10px] right-0 mr-[15px]">
                <Link
                  href={`/dashboard/admin/products/edit/${product.id}`}
                  className="text-[#2b3990] hover:text-[#00aeef] relative group"
                >
                  <p className="my-0 px-[10px] bg-[#00aeef] text-[#fff] rounded text-xs uppercase">
                    Edit
                  </p>
                </Link>
              </div>
              <div className="absolute bottom-[10px] right-[10px] group">
                <button
                  onClick={() =>
                    toggleProductStatus(product.id, product.status)
                  }
                  className={`w-[30px] h-4 flex items-center rounded-full p-1 transition duration-300 ease-in-out ${
                    product.status === 1 ? "bg-[#2b3990]" : "bg-gray-300"
                  }`}
                >
                  <div
                    className={`bg-white w-2.5 h-2.5 rounded-full shadow-md transform duration-300 ease-in-out ${
                      product.status === 1
                        ? "translate-x-[13px]"
                        : "translate-x-0"
                    }`}
                  />
                </button>
                <span className="absolute top-[-20px] right-[0px] my-0 px-[5px] py-[2px] text-[10px] text-white bg-[#c00] rounded opacity-0 group-hover:opacity-100 transition text-nowrap">
                  {product.status === 1 ? "Disable Product" : "Enable Product"}
                </span>
              </div>
            </div>
          ))}
        </div>

        <Dialog
          open={isOpen}
          onClose={() => setIsOpen(false)}
          className="relative z-50"
        >
          <div
            className="fixed inset-0 bg-black bg-opacity-40"
            aria-hidden="true"
          ></div>
          <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
            <Dialog.Panel className="bg-white rounded-xl max-w-sm w-full p-6 space-y-4">
              <Dialog.Title className="text-lg font-semibold text-[#2b3990]">
                Update Price for {currentProduct?.name}
              </Dialog.Title>
              <input
                type="number"
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="Enter new price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                min="0"
                step="0.01"
              />
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="orderEffect"
                  checked={orderUpdate}
                  onChange={(e) => setOrderUpdate(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-[#2b3990] focus:ring-[#2b3990]"
                />
                <label
                  htmlFor="orderEffect"
                  className="ml-2 text-sm text-gray-700"
                >
                  Order Effect
                </label>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setOrderUpdate(false); // Reset checkbox when closing
                  }}
                  className="px-4 py-2 text-sm rounded-[10px] hover:text-[#fff] bg-gray-200 hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePriceUpdate}
                  className="px-4 py-2 text-sm rounded-[10px] bg-[#2b3990] text-white hover:bg-[#00aeef]"
                >
                  Update Price
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>

        {/* Pagination Controls */}
        <div className="flex justify-center gap-2 ">
          {products.links.map((link, index) => {
            if (link.url === null) return null;

            const page = new URL(link.url).searchParams.get("page") || "1";
            const isActive = link.active;
            const label = link.label
              .replace("&laquo; Previous", "«")
              .replace("Next &raquo;", "»");

            return (
              <Link
                key={index}
                href={`/dashboard/admin/products?page=${page}`}
                className={`px-4 py-2 rounded-lg border ${
                  isActive
                    ? "bg-[#2b3990] text-white border-blue-500"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </div>
      </div>
  );
}
