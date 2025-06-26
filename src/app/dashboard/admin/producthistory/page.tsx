// "use client";

// import { useState, useEffect, useRef } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import Header from "@/app/_components/adminheader/index";
// import Sidebar from "@/app/_components/adminsidebar/index";
// import Breadcrumb from "@/app/_components/ui/Breadcrumb";
// import ErrorMessage from "@/app/_components/error/index";
// import Loader from "@/app/_components/loader/index";
// import { toast } from "react-toastify";

// import DatePicker from "react-datepicker";
// import { format } from "date-fns";
// import "react-datepicker/dist/react-datepicker.css";

// interface Product {
//   id: number;
//   name: string;
//   detail: string;
//   price: string;
//   measure: string;
//   type: string;
//   image: string | null;
//   changed_at: Date;
//   status: number; // 1 for active, 9 for inactive
// }

// interface PaginatedProducts {
//   current_page: number;
//   data: Product[];
//   first_page_url: string;
//   from: number;
//   last_page: number;
//   last_page_url: string;
//   links: {
//     url: string | null;
//     label: string;
//     active: boolean;
//   }[];
//   next_page_url: string | null;
//   path: string;
//   per_page: number;
//   prev_page_url: string | null;
//   to: number;
//   total: number;
// }

// interface SearchParams {
//   product_name: string;
// }

// interface SearchPayload {
//   product_name: string[];
// }

// export default function ProductsPage() {
//   const [products, setProducts] = useState<PaginatedProducts | null>(null);
//   const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const currentPage = searchParams.get("page") || "1";
//   const [searchMonth, setSearchMonth] = useState<string>("");

//   // Search related states
//   const [searchQuery, setSearchQuery] = useState("");
//   const [searchTerms, setSearchTerms] = useState<SearchParams>({
//     product_name: "",
//   });
//   const [nameList, setNameList] = useState<string[]>([]);
//   const [suggestions, setSuggestions] = useState<Product[]>([]);
//   const [showSuggestions, setShowSuggestions] = useState(false);
//   const searchRef = useRef<HTMLDivElement>(null);

//   const fetchProducts = async (searchPayload: SearchPayload | null = null) => {
//     try {
//       setLoading(true);

//       const token = localStorage.getItem("token");
//       if (!token) {
//         router.push("/auth/login");
//         return;
//       }

//       let url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/products/price-history?page=${currentPage}`;

//       if (searchPayload) {
//         // Convert array to JSON string and encode it
//         const encodedTerms = encodeURIComponent(JSON.stringify(searchTerms));
//         url += `&product_name=${encodedTerms}`;
//       }
//       if (searchMonth) {
//         url += `&month=${searchMonth}`;
//       }

//       const response = await fetch(url, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       const data = await response.json();

//       // Handle non-success responses from backend
//       if (!response.ok || !data.success) {
//         const errorMessage = data.message || "Failed to fetch products";
//         setFilteredProducts(data.messsage || []);

//         // Special handling for 403 (Forbidden)
//         if (data.status_code === 403) {
//           // You might want to handle this differently, like showing a warning
//           toast.warning(data.message || "Access denied");
//         } else {
//           toast.error(errorMessage);
//         }

//         throw new Error(errorMessage);
//       }

//       // Success case - set products data
//       setProducts(data.data);
//       setFilteredProducts(data.data?.data || []);

//       // Handle empty data case
//       if (!data.data || data.data.length === 0) {
//         toast.info("No price history records found");
//       }
//     } catch (err) {
//       const errorMessage =
//         err instanceof Error ? err.message : "Failed to load products";
//       setError(errorMessage);

//       // Don't show toast for 403 errors as we already handled them above
//       if (
//         !(
//           err instanceof Error &&
//           err.message.includes("No price history records found")
//         )
//       ) {
//         toast.error(errorMessage);
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchProducts();
//   }, [currentPage]);

//   // Handle click outside to close suggestions
//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (
//         searchRef.current &&
//         !searchRef.current.contains(event.target as Node)
//       ) {
//         setShowSuggestions(false);
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, []);

//   // Handle search input change
//   const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const query = e.target.value;
//     setSearchQuery(query);

//     if (query.length > 0 && products) {
//       const matched = products.data.filter(
//         (product) =>
//           product.name.toLowerCase().includes(query.toLowerCase()) &&
//           !searchTerms.includes(product.name)
//       );
//       setSuggestions(matched);
//       setShowSuggestions(true);
//     } else {
//       setSuggestions([]);
//       setShowSuggestions(false);
//     }
//   };

//   // Add search term to the array
//   const addSearchTerm = (term: string) => {
//     if (term && !searchTerms.includes(term)) {
//       setSearchTerms([...searchTerms, term]);
//     }
//     setSearchQuery("");
//     setShowSuggestions(false);
//   };

//   // Remove search term from the array
//   const removeSearchTerm = (term: string) => {
//     setSearchTerms(searchTerms.filter((t) => t !== term));
//   };

//   // Handle search submission (applies both name and month filters)
//   const handleSearch = () => {
//     fetchProducts();
//   };

//   // Handle suggestion click
//   const handleSuggestionClick = (product: Product) => {
//     addSearchTerm(product.name);
//   };

//   // Handle enter key press
//   const handleKeyDown = (e: React.KeyboardEvent) => {
//     if (e.key === "Enter" && searchQuery) {
//       addSearchTerm(searchQuery);
//     }
//   };

//   const clearSearch = () => {
//     setSearchTerms([]);
//     setSearchMonth("");
//     fetchProducts();
//   };

//   // Handle month input change (format: MM-YYYY)
//   const handleMonthChange = (date: Date | null) => {
//     if (date) {
//       const formatted = format(date, "MM-yyyy");
//       setSearchMonth(formatted);
//     }
//   };

//   if (loading) {
//     return <Loader />;
//   }

//   return (
//     <div className="min-h-screen flex gap-[20px] px-[20px] xl:px-[30px]">
//       <div className="w-[15%] relative">
//         <Sidebar />
//       </div>
//       <div className="w-full mx-auto space-y-4 p-4">
//         <div>
//           <Header />
//         </div>
//         <div className="px-6 py-6 bg-[#f9f9f9] rounded-[20px] xl:rounded-[25px] text-[#2b3990]">
//           <h1 className="text-2xl font-bold my-0">All Products</h1>
//           <Breadcrumb items={[{ label: "Dashboard" }, { label: "Products" }]} />
//         </div>

//         {/* Search and Filter Component */}
//         <div className="relative mb-6" ref={searchRef}>
//           <div className="flex gap-2 w-full">
//             {/* PRODUCT NAME SEARCH */}
//             <div className="flex items-center gap-2 w-1/2 my-4">
//               {/* SEARCH INPUT */}
//               <div className="flex-1">
//                 <div className="bg-white border-2 rounded-md flex flex-wrap items-center px-2 py-1 h-[32px] text-xs text-black focus-within:border-blue-500 transition-all">
//                   {searchTerms.map((term, index) => (
//                     <span
//                       key={index}
//                       className="text-xs px-[6px] py-[2px] bg-[#2b3990] rounded-[6px] text-white flex items-center gap-1 mb-[2px]"
//                     >
//                       {term}
//                       <button
//                         onClick={() => removeSearchTerm(term)}
//                         className="text-red-300 text-xs hover:text-white"
//                       >
//                         ×
//                       </button>
//                     </span>
//                   ))}
//                   <input
//                     type="text"
//                     value={searchQuery}
//                     onChange={handleSearchChange}
//                     onKeyDown={handleKeyDown}
//                     placeholder={
//                       searchTerms.length === 0 ? "Search products..." : ""
//                     }
//                     className="flex-grow outline-none bg-transparent px-1 text-xs h-[20px]"
//                   />
//                 </div>
//               </div>

//               {/* DATE PICKER */}
//               <div className="w-[120px]">
//                 <DatePicker
//                   value={searchMonth}
//                   selected={searchMonth ? new Date() : null}
//                   onChange={handleMonthChange}
//                   dateFormat="MM-yyyy"
//                   showMonthYearPicker
//                   placeholderText="MM-YYYY"
//                   className="w-full bg-white border-2 rounded-md px-2 h-[32px] text-xs text-black focus:border-blue-500 transition-all"
//                 />
//               </div>

//               {/* ACTION BUTTONS */}
//               <div className="flex gap-2">
//                 <button
//                   onClick={handleSearch}
//                   className="h-[32px] px-3 text-xs uppercase border-2 border-[#2b3990] rounded-md bg-[#2b3990] text-white hover:bg-[#1a2666] hover:border-[#1a2666] transition-all"
//                 >
//                   Search
//                 </button>

//                 <button
//                   onClick={clearSearch}
//                   className="h-[32px] px-3 text-xs uppercase border-2 border-gray-400 rounded-md bg-white text-gray-700 hover:bg-gray-100 transition-all"
//                 >
//                   Clear
//                 </button>
//               </div>
//             </div>

//             {/* Suggestions dropdown */}
//             {suggestions && suggestions.length > 0 && showSuggestions && (
//               <div className="absolute z-10 mt-12 w-auto bg-white shadow-lg rounded-[15px] border border-gray-200 max-h-60 overflow-auto">
//                 {suggestions.map((product, index) => {
//                   const isSelected = searchTerms.includes(product.name);
//                   return (
//                     <div
//                       key={index}
//                       className={`px-4 py-2 flex items-center ${
//                         isSelected
//                           ? "bg-gray-100 text-gray-400 cursor-not-allowed"
//                           : "hover:bg-gray-100 cursor-pointer"
//                       }`}
//                       onClick={() =>
//                         !isSelected && handleSuggestionClick(product)
//                       }
//                     >
//                       <img
//                         src={`${process.env.NEXT_PUBLIC_BACKEND_URL_PUBLIC}${product.image}`}
//                         alt={product.name}
//                         className="w-8 h-8 object-cover mr-3 rounded"
//                         onError={(e) => {
//                           e.currentTarget.src =
//                             "/images/items/product-default.png";
//                         }}
//                       />
//                       <div>
//                         <p
//                           className={`font-medium ${
//                             isSelected ? "text-gray-400" : "text-[#2b3990]"
//                           }`}
//                         >
//                           {product.name}
//                           {isSelected && (
//                             <span className="ml-2 text-xs text-gray-500">
//                               (already selected)
//                             </span>
//                           )}
//                         </p>
//                         <p
//                           className={`text-sm ${
//                             isSelected ? "text-gray-400" : "text-gray-600"
//                           }`}
//                         >
//                           {product.type} • {product.price} Rs
//                         </p>
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>
//             )}
//           </div>

//           {/* Products Grid */}
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-[10px] xl:gap-[15px] mb-8">
//             {filteredProducts && filteredProducts.length > 0 ? (
//               filteredProducts.map((product, index) => (
//                 <div
//                   key={index}
//                   className="bg-white rounded-[20px] border-[1px] border-[#2b3990] border-opacity-40 overflow-hidden relative"
//                 >
//                   <div className="flex flex-col h-full shadow-lg rounded-lg overflow-hidden transition-transform duration-300 ease-in-out hover:scale-105">
//                     <div className="bg-[#f9f9f9] overflow-hidden w-full">
//                       <img
//                         src={`${process.env.NEXT_PUBLIC_BACKEND_URL_PUBLIC}${product.image}`}
//                         alt={product.name}
//                         className="w-full h-48 object-cover"
//                         onError={(e) => {
//                           e.currentTarget.src =
//                             "/images/items/product-default.png";
//                         }}
//                       />
//                     </div>
//                     <div className="bg-white py-4 px-6">
//                       <div>
//                         <h2 className="text-lg font-semibold text-gray-800 capitalize">
//                           {product.name}
//                         </h2>
//                       </div>
//                       <div className="flex items-center justify-between mt-2">
//                         <p className="text-base text-green-600 font-medium">
//                           {product.price} Rs
//                         </p>
//                         <p className="text-xs text-gray-500">
//                           {new Intl.DateTimeFormat("en-US", {
//                             year: "numeric",
//                             month: "2-digit",
//                             day: "2-digit",
//                             hour: "2-digit",
//                             minute: "2-digit",
//                             second: "2-digit",
//                             hour12: true,
//                           }).format(new Date(product.changed_at))}
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               ))
//             ) : (
//               <div>no products </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// "use client";

// import { useState, useEffect, useRef, useCallback } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import Header from "@/app/_components/adminheader/index";
// import Sidebar from "@/app/_components/adminsidebar/index";
// import Breadcrumb from "@/app/_components/ui/Breadcrumb";
// import ErrorMessage from "@/app/_components/error/index";
// import Loader from "@/app/_components/loader/index";
// import { toast } from "react-toastify";
// import DatePicker from "react-datepicker";
// import { format } from "date-fns";
// import "react-datepicker/dist/react-datepicker.css";

// interface Product {
//   id: number;
//   name: string;
//   detail: string;
//   price: string;
//   measure: string;
//   type: string;
//   image: string | null;
//   changed_at: Date;
//   status: number;
// }

// interface PaginatedProducts {
//   current_page: number;
//   data: Product[];
//   first_page_url: string;
//   from: number;
//   last_page: number;
//   last_page_url: string;
//   links: {
//     url: string | null;
//     label: string;
//     active: boolean;
//   }[];
//   next_page_url: string | null;
//   path: string;
//   per_page: number;
//   prev_page_url: string | null;
//   to: number;
//   total: number;
// }

// export default function ProductsPage() {
//   const [products, setProducts] = useState<PaginatedProducts | null>(null);
//   const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const currentPage = searchParams.get("page") || "1";
//   const [searchMonth, setSearchMonth] = useState<string>("");
//   const [searchQuery, setSearchQuery] = useState("");
//   const [searchTerms, setSearchTerms] = useState<string[]>([]);
//   const [suggestions, setSuggestions] = useState<Product[]>([]);
//   const [showSuggestions, setShowSuggestions] = useState(false);
//   const searchRef = useRef<HTMLDivElement>(null);

//   // Memoized fetch function to prevent unnecessary recreations
//   const fetchProducts = useCallback(async () => {
//     try {
//       setLoading(true);
//       setError("");

//       const token = localStorage.getItem("token");
//       if (!token) {
//         router.push("/auth/login");
//         return;
//       }

//       let url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/products/price-history?page=${currentPage}`;

//       if (searchTerms.length > 0) {
//         const encodedTerms = encodeURIComponent(JSON.stringify(searchTerms));
//         url += `&product_name=${encodedTerms}`;
//       }
//       if (searchMonth) {
//         url += `&month=${searchMonth}`;
//       }

//       const response = await fetch(url, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//         cache: "no-store", // Ensure fresh data
//       });

//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }

//       const data = await response.json();

//       if (!data.success) {
//         throw new Error(data.message || "Failed to fetch products");
//       }

//       setProducts(data.data);
//       setFilteredProducts(data.data?.data || []);

//       if (!data.data || data.data.length === 0) {
//         toast.info("No price history records found");
//       }
//     } catch (err) {
//       const errorMessage =
//         err instanceof Error ? err.message : "Failed to load products";
//       setError(errorMessage);

//       if (!errorMessage.includes("No price history records found")) {
//         toast.error(errorMessage);
//       }
//     } finally {
//       setLoading(false);
//     }
//   }, [currentPage, searchTerms, searchMonth, router]);

//   // Fetch products when dependencies change
//   useEffect(() => {
//     fetchProducts();
//   }, [fetchProducts]);

//   // Close suggestions when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (
//         searchRef.current &&
//         !searchRef.current.contains(event.target as Node)
//       ) {
//         setShowSuggestions(false);
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   useEffect(() => {
//   if (filteredProducts.length > 0) {
//     const ids = filteredProducts.map(p => p.id);
//     const uniqueIds = new Set(ids);
//     if (ids.length !== uniqueIds.size) {
//       console.warn('Duplicate product IDs detected:', ids);
//     }
//   }
// }, [filteredProducts]);

//   // Update suggestions based on search query
//   useEffect(() => {
//     if (searchQuery.length > 0 && products?.data) {
//       const matched = products.data.filter(
//         (product) =>
//           product.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
//           !searchTerms.includes(product.name)
//       );
//       setSuggestions(matched);
//       setShowSuggestions(true);
//     } else {
//       setSuggestions([]);
//       setShowSuggestions(false);
//     }
//   }, [searchQuery, products, searchTerms]);

//   const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setSearchQuery(e.target.value);
//   };

//   const addSearchTerm = (term: string) => {
//     if (term && !searchTerms.includes(term)) {
//       setSearchTerms([...searchTerms, term]);
//     }
//     setSearchQuery("");
//     setShowSuggestions(false);
//   };

//   const removeSearchTerm = (term: string) => {
//     setSearchTerms(searchTerms.filter((t) => t !== term));
//   };

//   const handleSuggestionClick = (product: Product) => {
//     addSearchTerm(product.name);
//   };

//   const handleKeyDown = (e: React.KeyboardEvent) => {
//     if (e.key === "Enter" && searchQuery) {
//       addSearchTerm(searchQuery);
//     }
//   };

//   const clearSearch = () => {
//     setSearchTerms([]);
//     setSearchMonth("");
//     setSearchQuery("");
//   };

//   const handleMonthChange = (date: Date | null) => {
//     setSearchMonth(date ? format(date, "MM-yyyy") : "");
//   };

//   if (loading) {
//     return <Loader />;
//   }

//   if (error) {
//     return <ErrorMessage message={error} onRetry={fetchProducts} />;
//   }

//   return (
//     <div className="min-h-screen flex flex-col md:flex-row gap-4 px-4 xl:px-6">
//       <div className="w-full md:w-48 lg:w-64">
//         <Sidebar />
//       </div>

//       <div className="flex-1 space-y-4">
//         <Header />

//         <div className="p-4 bg-gray-50 rounded-xl text-primary">
//           <h1 className="text-2xl font-bold">All Products</h1>
//           <Breadcrumb items={[{ label: "Dashboard" }, { label: "Products" }]} />
//         </div>

//         {/* Search and Filter Section */}
//         <div className="relative mb-6" ref={searchRef}>
//           <div className="flex flex-col md:flex-row gap-4">
//             <div className="flex-1 flex flex-col md:flex-row gap-2">
//               {/* Search Input with Tags */}
//               <div className="flex-1">
//                 <div className="bg-white border rounded-md flex flex-wrap items-center px-2 py-1 min-h-10 text-sm focus-within:ring-2 focus-within:ring-blue-500 transition-all">
//                   {searchTerms.map((term) => (
//                     <span
//                       key={term}
//                       className="inline-flex items-center px-2 py-1 bg-primary rounded-md text-white text-xs mr-1 mb-1"
//                     >
//                       {term}
//                       <button
//                         onClick={() => removeSearchTerm(term)}
//                         className="ml-1 text-red-200 hover:text-white"
//                         aria-label={`Remove ${term}`}
//                       >
//                         ×
//                       </button>
//                     </span>
//                   ))}
//                   <input
//                     type="text"
//                     value={searchQuery}
//                     onChange={handleSearchChange}
//                     onKeyDown={handleKeyDown}
//                     onFocus={() => setShowSuggestions(true)}
//                     placeholder={
//                       searchTerms.length === 0 ? "Search products..." : ""
//                     }
//                     className="flex-grow outline-none bg-transparent px-1 text-sm min-w-[100px]"
//                   />
//                 </div>
//               </div>

//               {/* Date Picker */}
//               <div className="w-full md:w-40">
//                <DatePicker
//                   value={searchMonth}
//                   selected={searchMonth ? new Date() : null}
//                   onChange={handleMonthChange}
//                   dateFormat="MM-yyyy"
//                   showMonthYearPicker
//                   placeholderText="MM-YYYY"
//                   className="w-full bg-white border-2 rounded-md px-2 h-[32px] text-xs text-black focus:border-blue-500 transition-all"
//                 />
//               </div>
//             </div>

//             {/* Action Buttons */}
//             <div className="flex gap-2">
//               <button
//                 onClick={fetchProducts}
//                 className="px-4 py-1 text-sm uppercase rounded-md bg-primary text-white hover:bg-primary-dark transition-colors"
//                 disabled={loading}
//               >
//                 {loading ? "Searching..." : "Search"}
//               </button>
//               <button
//                 onClick={clearSearch}
//                 className="px-4 py-1 text-sm uppercase border rounded-md bg-white text-gray-700 hover:bg-gray-50 transition-colors"
//               >
//                 Clear
//               </button>
//             </div>
//           </div>

//           {/* Suggestions Dropdown */}
//           {showSuggestions && suggestions.length > 0 && (
//             <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-auto">
//               {suggestions.map((product) => (
//                 <div
//                   key={product.id}
//                   className="px-4 py-2 flex items-center hover:bg-gray-50 cursor-pointer"
//                   onClick={() => handleSuggestionClick(product)}
//                 >
//                   <img
//                     src={
//                       product.image
//                         ? `${process.env.NEXT_PUBLIC_BACKEND_URL_PUBLIC}${product.image}`
//                         : "/images/items/product-default.png"
//                     }
//                     alt={product.name}
//                     className="w-8 h-8 object-cover mr-3 rounded"
//                     loading="lazy"
//                   />
//                   <div>
//                     <p className="font-medium text-primary">{product.name}</p>
//                     <p className="text-sm text-gray-600">
//                       {product.type} • {product.price} Rs
//                     </p>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>

//         {/* Products Grid */}
//         {filteredProducts.length > 0 ? (
//           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
//             {filteredProducts.map((product) => (
//               <ProductCard
//                 key={`product-${product.id}-${new Date(
//                   product.changed_at
//                 ).getTime()}`}
//                 product={product}
//               />
//             ))}
//           </div>
//         ) : (
//           <div className="text-center py-8 text-gray-500">
//             No products found. Try adjusting your search criteria.
//           </div>
//         )}
//         {/* Pagination would go here */}
//       </div>
//     </div>
//   );
// }

// // Extracted Product Card Component for better readability
// function ProductCard({ product }: { product: Product }) {
//   return (
//     <div className="bg-white rounded-lg border border-gray-200 overflow-hidden transition-transform hover:scale-[1.02]">
//       <div className="bg-gray-100 h-48 overflow-hidden">
//         <img
//           src={
//             product.image
//               ? `${process.env.NEXT_PUBLIC_BACKEND_URL_PUBLIC}${product.image}`
//               : "/images/items/product-default.png"
//           }
//           alt={product.name}
//           className="w-full h-full object-cover"
//           loading="lazy"
//         />
//       </div>
//       <div className="p-4">
//         <h3 className="font-semibold text-gray-800 capitalize truncate">
//           {product.name}
//         </h3>
//         <div className="flex justify-between items-center mt-2">
//           <span className="text-green-600 font-medium">{product.price} Rs</span>
//           <span className="text-xs text-gray-500">
//             {new Date(product.changed_at).toLocaleDateString("en-US", {
//               year: "numeric",
//               month: "short",
//               day: "numeric",
//             })}
//           </span>
//         </div>
//       </div>
//     </div>
//   );
// }


















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

//  const fetchProducts = async () => {
//   try {
//     setLoading(true);
//     setError("");

//     const token = localStorage.getItem("token");
//     if (!token) {
//       router.push("/auth/login");
//       return;
//     }

//     // Create the payload
//     const bodyPayload = {
//       product_names: productNameList, // send array directly
//       month: searchMonth || null,     // optional
//     };

//     const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/products/price-history`;

//     const response = await fetch(url, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//       body: JSON.stringify(bodyPayload),
//     });

//     const data = await response.json();

//     if (!response.ok || !data.success) {
//       const errorMessage = data.message || "Failed to fetch products";
//       setError(errorMessage);

//       if (data.status_code === 403) {
//         toast.warning(data.message || "Access denied");
//       } else {
//         toast.error(errorMessage);
//       }

//       throw new Error(errorMessage);
//     }

//     setProducts(data.data);
//   } catch (err) {
//     const errorMessage =
//       err instanceof Error ? err.message : "Failed to load products";
//     setError(errorMessage);

//     if (
//       !(
//         err instanceof Error &&
//         err.message.includes("No price history records found")
//       )
//     ) {
//       toast.error(errorMessage);
//     }
//   } finally {
//     setLoading(false);
//   }
// };

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
        params.append("product_name[]", name);
      });

      // Add month filter if specified
      if (searchMonth) {
        params.append("month", searchMonth);
      }

      const url = `${
        process.env.NEXT_PUBLIC_BACKEND_URL
      }/api/admin/products/price-history?${params.toString()}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        const errorMessage = data.message || "Failed to fetch products";
        setError(errorMessage);

        if (data.status_code === 403) {
          toast.warning(data.message || "Access denied");
        } else {
          toast.error(errorMessage);
        }

        throw new Error(errorMessage);
      }

      setProducts(data.data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load products";
      setError(errorMessage);

      if (
        !(
          err instanceof Error &&
          err.message.includes("No price history records found")
        )
      ) {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [currentPage, router, searchMonth]);

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

  // Handle search submission
  const handleSearch = () => {
    const splitAndTrim = (input: string) =>
      input
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

    const payload = {
      product_name:
        productNameList.length > 0
          ? productNameList
          : splitAndTrim(searchParams.product_name),
    };

    fetchProducts();
  };

  // Handle clear search
  const handleClearSearch = () => {
    setSearchParams({
      product_name: "",
    });
    setProductNameList([]);
    setSearchMonth("");
    fetchProducts();
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

  // Handle month input change (format: MM-YYYY)
  const handleMonthChange = (date: Date | null) => {
    if (date) {
      const formatted = format(date, "MM-yyyy");
      setSearchMonth(formatted);
    } else {
      setSearchMonth(""); // Clear the month filter if date is null
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
          <div className="flex gap-2">
            {/* PRODUCT NAME INPUT (taggable) */}
            <div className="max-w-xs">
              <div className="bg-white border-2 rounded-md flex flex-wrap items-center px-2 py-1 min-h-[42px] text-xs text-black focus-within:border-blue-500 transition-all">
                {productNameList.map((name, index) => (
                  <span
                    key={index}
                    className="text-xs px-[10px] py-[4px] bg-[#2b3990] rounded-[10px] text-white flex items-center gap-1 mb-[2px]"
                  >
                    {name}
                    <button
                      onClick={() => removeProductName(name)}
                      className="text-red-300 text-xs"
                    >
                      ×
                    </button>
                  </span>
                ))}

                <input
                  type="text"
                  name="product_name"
                  value={searchParams.product_name}
                  onChange={handleSearchChange}
                  onKeyDown={handleKeyDown}
                  className="flex-grow outline-none bg-transparent py-1 px-1 text-xs md:w-[206px]"
                  placeholder={
                    productNameList.length === 0
                      ? "Search Product Name and press Enter"
                      : ""
                  }
                />
              </div>
            </div>

            {/* DATE PICKER */}
            <div className="w-[120px]">
              <DatePicker
                selected={selectedDate}
                onChange={handleMonthChange}
                dateFormat="MM-yyyy"
                showMonthYearPicker
                placeholderText="MM-YYYY"
                className="w-full bg-white border-2 rounded-md px-2 h-[42px] text-xs text-black focus:border-blue-500 transition-all"
              />
            </div>

            {/* SEARCH BUTTON */}
            <div
              onClick={handleSearch}
              className="shadow-sm border-[2px] rounded-[10px] flex items-center justify-center hover:bg-[#2b3990] hover:text-[#fff] transition-all duration-300 ease-in-out hover:border-[#2b3990] cursor-pointer"
            >
              <button className="text-xs uppercase px-4 rounded-[10px] flex items-center gap-2">
                Search
              </button>
            </div>

            {/* CLEAR BUTTON */}
            {(productNameList.length > 0 || searchMonth) && (
              <div
                onClick={handleClearSearch}
                className="shadow-sm border-[2px] rounded-[10px] flex items-center justify-center hover:bg-gray-500 hover:text-[#fff] transition-all duration-300 ease-in-out hover:border-gray-500 cursor-pointer"
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
                      className="w-8 h-8 object-cover mr-3 rounded"
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
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}
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

                  const page =
                    new URL(link.url).searchParams.get("page") || "1";
                  const isActive = link.active;
                  const isPrevious = link.label.includes("Previous");
                  const isNext = link.label.includes("Next");

                  return (
                    <Link
                      key={index}
                      href={`/dashboard/admin/products?page=${page}`}
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
          </>
        )}
      </div>
    </div>
  );
}



















// "use client";

// import { useState, useEffect, useRef } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import Header from "@/app/_components/adminheader/index";
// import Sidebar from "@/app/_components/adminsidebar/index";
// import Breadcrumb from "@/app/_components/ui/Breadcrumb";
// import Loader from "@/app/_components/loader/index";
// import { toast } from "react-toastify";
// import Link from "next/link";
// import DatePicker from "react-datepicker";
// import { format } from "date-fns";
// import "react-datepicker/dist/react-datepicker.css";

// interface Product {
//   id: number;
//   name: string;
//   detail: string;
//   price: string;
//   measure: string;
//   type: string;
//   image: string | null;
//   changed_at: Date;
//   status: number; // 1 for active, 9 for inactive
// }

// interface PaginatedProducts {
//   current_page: number;
//   data: Product[];
//   first_page_url: string;
//   from: number;
//   last_page: number;
//   last_page_url: string;
//   links: {
//     url: string | null;
//     label: string;
//     active: boolean;
//   }[];
//   next_page_url: string | null;
//   path: string;
//   per_page: number;
//   prev_page_url: string | null;
//   to: number;
//   total: number;
// }

// interface SearchParams {
//   product_name: string;
// }

// interface SearchPayload {
//   product_name: string[];
// }

// export default function ProductsPage() {
//   const [products, setProducts] = useState<PaginatedProducts | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const router = useRouter();
//   const urlSearchParams = useSearchParams();
//   const currentPage = urlSearchParams.get("page") || "1";
//   const [selectedDate, setSelectedDate] = useState<Date | null>(null);
//   const [searchMonth, setSearchMonth] = useState<string>("");

//   // Search related states
//   const [searchParams, setSearchParams] = useState<SearchParams>({
//     product_name: "",
//   });
//   const [productNameList, setProductNameList] = useState<string[]>([]);
//   const [suggestions, setSuggestions] = useState<Product[]>([]);
//   const [showSuggestions, setShowSuggestions] = useState(false);
//   const searchRef = useRef<HTMLDivElement>(null);

//   const fetchProducts = async (payload?: SearchPayload) => {
//     try {
//       setLoading(true);
//       setError("");

//       const token = localStorage.getItem("token");
//       if (!token) {
//         router.push("/auth/login");
//         return;
//       }

//       const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/products/price-history`;

//       const response = await fetch(url, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify(payload || {}),
//       });

//       const data = await response.json();

//       if (!response.ok || !data.success) {
//         const errorMessage = data.message || "Failed to fetch products";
//         setError(errorMessage);

//         if (data.status_code === 403) {
//           toast.warning(data.message || "Access denied");
//         } else {
//           toast.error(errorMessage);
//         }

//         throw new Error(errorMessage);
//       }

//       setProducts(data.data);
//     } catch (err) {
//       const errorMessage =
//         err instanceof Error ? err.message : "Failed to load products";
//       setError(errorMessage);

//       if (
//         !(
//           err instanceof Error &&
//           err.message.includes("No price history records found")
//         )
//       ) {
//         toast.error(errorMessage);
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchProducts();
//   }, [currentPage, router, searchMonth]);

//   // Handle click outside to close suggestions
//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (
//         searchRef.current &&
//         !searchRef.current.contains(event.target as Node)
//       ) {
//         setShowSuggestions(false);
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, []);

//   // Handle search input change
//   const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setSearchParams((prev) => ({ ...prev, [name]: value }));

//     if (value.length > 0 && products) {
//       const matched = products.data.filter(
//         (product) =>
//           product.name.toLowerCase().includes(value.toLowerCase()) &&
//           !productNameList.includes(product.name)
//       );
//       setSuggestions(matched);
//       setShowSuggestions(true);
//     } else {
//       setSuggestions([]);
//       setShowSuggestions(false);
//     }
//   };

//   // Handle search submission
//   const handleSearch = () => {
//     const splitAndTrim = (input: string) =>
//       input
//         .split(",")
//         .map((s) => s.trim())
//         .filter(Boolean);

//     const payload = {
//       product_name:
//         productNameList.length > 0
//           ? productNameList
//           : splitAndTrim(searchParams.product_name),
//     };

//     if (searchMonth) {
//       payload["month"] = searchMonth;
//     }

//     fetchProducts(payload);
//   };

//   // Handle clear search
//   const handleClearSearch = () => {
//     setSearchParams({
//       product_name: "",
//     });
//     setProductNameList([]);
//     setSearchMonth("");
//     fetchProducts();
//   };

//   // Handle enter key press in search input
//   const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
//     if (e.key === "Enter" && searchParams.product_name.trim()) {
//       e.preventDefault();
//       const trimmed = searchParams.product_name.trim();
//       if (trimmed && !productNameList.includes(trimmed)) {
//         setProductNameList((prev) => [...prev, trimmed]);
//         setSearchParams((prev) => ({ ...prev, product_name: "" }));
//       }
//     }
//   };

//   // Handle suggestion click
//   const handleSuggestionClick = (product: Product) => {
//     if (!productNameList.includes(product.name)) {
//       setProductNameList((prev) => [...prev, product.name]);
//     }
//     setSearchParams((prev) => ({ ...prev, product_name: "" }));
//     setShowSuggestions(false);
//   };

//   // Remove product name from the list
//   const removeProductName = (name: string) => {
//     setProductNameList((prev) => prev.filter((n) => n !== name));
//   };

//   // Handle month input change (format: MM-YYYY)
//   const handleMonthChange = (date: Date | null) => {
//     if (date) {
//       const formatted = format(date, "MM-yyyy");
//       setSearchMonth(formatted);
//     } else {
//       setSearchMonth(""); // Clear the month filter if date is null
//     }
//   };

//   if (loading) {
//     return <Loader />;
//   }

//   return (
//     <div className="min-h-screen flex gap-[20px] px-[20px] xl:px-[30px]">
//       <div className="w-[15%] relative">
//         <Sidebar />
//       </div>
//       <div className="w-full mx-auto space-y-4 p-4">
//         <div>
//           <Header />
//         </div>
//         <div className="px-6 py-6 bg-[#f9f9f9] rounded-[20px] xl:rounded-[25px] text-[#2b3990]">
//           <h1 className="text-2xl font-bold my-0">All Products</h1>
//           <Breadcrumb items={[{ label: "Dashboard" }, { label: "Products" }]} />
//         </div>

//         {/* Search and Filter Component */}
//         <div className="relative mb-6" ref={searchRef}>
//           <div className="flex gap-2">
//             {/* PRODUCT NAME INPUT (taggable) */}
//             <div className="max-w-xs">
//               <div className="bg-white border-2 rounded-md flex flex-wrap items-center px-2 py-1 min-h-[42px] text-xs text-black focus-within:border-blue-500 transition-all">
//                 {productNameList.map((name, index) => (
//                   <span
//                     key={index}
//                     className="text-xs px-[10px] py-[4px] bg-[#2b3990] rounded-[10px] text-white flex items-center gap-1 mb-[2px]"
//                   >
//                     {name}
//                     <button
//                       onClick={() => removeProductName(name)}
//                       className="text-red-300 text-xs"
//                     >
//                       ×
//                     </button>
//                   </span>
//                 ))}

//                 <input
//                   type="text"
//                   name="product_name"
//                   value={searchParams.product_name}
//                   onChange={handleSearchChange}
//                   onKeyDown={handleKeyDown}
//                   className="flex-grow outline-none bg-transparent py-1 px-1 text-xs md:w-[206px]"
//                   placeholder={productNameList.length === 0 ? "Search Product Name and press Enter" : ""}
//                 />
//               </div>
//             </div>

//             {/* DATE PICKER */}
//             <div className="w-[120px]">
//               <DatePicker
//                 selected={selectedDate}
//                 onChange={handleMonthChange}
//                 dateFormat="MM-yyyy"
//                 showMonthYearPicker
//                 placeholderText="MM-YYYY"
//                 className="w-full bg-white border-2 rounded-md px-2 h-[42px] text-xs text-black focus:border-blue-500 transition-all"
//               />
//             </div>

//             {/* SEARCH BUTTON */}
//             <div
//               onClick={handleSearch}
//               className="shadow-sm border-[2px] rounded-[10px] flex items-center justify-center hover:bg-[#2b3990] hover:text-[#fff] transition-all duration-300 ease-in-out hover:border-[#2b3990] cursor-pointer"
//             >
//               <button className="text-xs uppercase px-4 rounded-[10px] flex items-center gap-2">
//                 Search
//               </button>
//             </div>

//             {/* CLEAR BUTTON */}
//             {(productNameList.length > 0 || searchMonth) && (
//               <div
//                 onClick={handleClearSearch}
//                 className="shadow-sm border-[2px] rounded-[10px] flex items-center justify-center hover:bg-gray-500 hover:text-[#fff] transition-all duration-300 ease-in-out hover:border-gray-500 cursor-pointer"
//               >
//                 <button className="text-xs uppercase px-4 rounded-[10px] flex items-center gap-2">
//                   Clear
//                 </button>
//               </div>
//             )}
//           </div>

//           {/* Suggestions dropdown */}
//           {showSuggestions && suggestions.length > 0 && (
//             <div className="absolute z-10 mt-1 w-auto bg-white shadow-lg rounded-[15px] border border-gray-200 max-h-60 overflow-auto">
//               {suggestions.map((product, index) => {
//                 const isSelected = productNameList.includes(product.name);
//                 return (
//                   <div
//                     key={index}
//                     className={`px-4 py-2 flex items-center ${
//                       isSelected
//                         ? "bg-gray-100 text-gray-400 cursor-not-allowed"
//                         : "hover:bg-gray-100 cursor-pointer"
//                     }`}
//                     onClick={() => !isSelected && handleSuggestionClick(product)}
//                   >
//                     <img
//                       src={
//                         product.image
//                           ? `${process.env.NEXT_PUBLIC_BACKEND_URL_PUBLIC}${product.image}`
//                           : "/images/items/product-default.png"
//                       }
//                       alt={product.name}
//                       className="w-8 h-8 object-cover mr-3 rounded"
//                       onError={(e) => {
//                         e.currentTarget.src = "/images/items/product-default.png";
//                       }}
//                     />
//                     <div>
//                       <p
//                         className={`font-medium ${
//                           isSelected ? "text-gray-400" : "text-[#2b3990]"
//                         }`}
//                       >
//                         {product.name}
//                         {isSelected && (
//                           <span className="ml-2 text-xs text-gray-500">
//                             (already selected)
//                           </span>
//                         )}
//                       </p>
//                       <p
//                         className={`text-sm ${
//                           isSelected ? "text-gray-400" : "text-gray-600"
//                         }`}
//                       >
//                         {product.type} • {product.price} Rs
//                       </p>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           )}
//         </div>
//         {error && (
//           <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
//             <strong className="font-bold">Error: </strong>
//             <span className="block sm:inline">{error}</span>
//           </div>
//         )}
//         {/* Products Grid */}
//         {products?.data.length === 0 ? (
//           <div className="text-center py-10">
//             <p className="text-gray-500">
//               No products found matching your search criteria.
//             </p>
//           </div>
//         ) : (
//           <>
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-[10px] xl:gap-[15px] mb-8">
//               {products?.data.map((product, index) => (
//                 <div
//                   key={index}
//                   className="bg-white rounded-[20px] border-[1px] border-[#2b3990] border-opacity-40 overflow-hidden relative"
//                 >
//                   <div className="flex flex-col h-full shadow-lg rounded-lg overflow-hidden transition-transform duration-300 ease-in-out hover:scale-105">
//                     <div className="bg-[#f9f9f9] overflow-hidden w-full">
//                       <img
//                         src={
//                           product.image
//                             ? `${process.env.NEXT_PUBLIC_BACKEND_URL_PUBLIC}${product.image}`
//                             : "/images/items/product-default.png"
//                         }
//                         alt={product.name}
//                         className="w-full h-48 object-cover"
//                         onError={(e) => {
//                           e.currentTarget.src = "/images/items/product-default.png";
//                         }}
//                       />
//                     </div>
//                     <div className="bg-white py-4 px-6">
//                       <div>
//                         <h2 className="text-lg font-semibold text-gray-800 capitalize">
//                           {product.name}
//                         </h2>
//                       </div>
//                       <div className="flex items-center justify-between mt-2">
//                         <p className="text-base text-green-600 font-medium">
//                           {product.price} Rs
//                         </p>
//                         <p className="text-xs text-gray-500">
//                           {new Intl.DateTimeFormat("en-US", {
//                             year: "numeric",
//                             month: "2-digit",
//                             day: "2-digit",
//                             hour: "2-digit",
//                             minute: "2-digit",
//                             second: "2-digit",
//                             hour12: true,
//                           }).format(new Date(product.changed_at))}
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>

//             {/* Pagination */}
//             {products && products.links.length > 0 && (
//               <div className="flex justify-center gap-2 mt-6">
//                 {products.links.map((link, index) => {
//                   if (link.url === null) return null;

//                   const page =
//                     new URL(link.url).searchParams.get("page") || "1";
//                   const isActive = link.active;
//                   const isPrevious = link.label.includes("Previous");
//                   const isNext = link.label.includes("Next");

//                   return (
//                     <Link
//                       key={index}
//                       href={`/dashboard/admin/products?page=${page}`}
//                       className={`px-4 py-2 rounded-lg border ${
//                         isActive
//                           ? "bg-[#2b3990] text-white border-blue-500"
//                           : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
//                       } ${isPrevious || isNext ? "font-semibold" : ""}`}
//                     >
//                       {isPrevious ? "«" : isNext ? "»" : link.label}
//                     </Link>
//                   );
//                 })}
//               </div>
//             )}
//           </>
//         )}
//       </div>
//     </div>
//   );
// }






















// "use client";

// import { useState, useEffect, useRef } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import Header from "@/app/_components/adminheader/index";
// import Sidebar from "@/app/_components/adminsidebar/index";
// import Breadcrumb from "@/app/_components/ui/Breadcrumb";
// import Loader from "@/app/_components/loader/index";
// import { toast } from "react-toastify";
// import Link from "next/link";
// import DatePicker from "react-datepicker";
// import { format, parse } from "date-fns";
// import "react-datepicker/dist/react-datepicker.css";

// interface Product {
//   id: number;
//   name: string;
//   detail: string;
//   price: string;
//   measure: string;
//   type: string;
//   image: string | null;
//   changed_at: Date;
//   status: number; // 1 for active, 9 for inactive
// }

// interface PaginatedProducts {
//   current_page: number;
//   data: Product[];
//   first_page_url: string;
//   from: number;
//   last_page: number;
//   last_page_url: string;
//   links: {
//     url: string | null;
//     label: string;
//     active: boolean;
//   }[];
//   next_page_url: string | null;
//   path: string;
//   per_page: number;
//   prev_page_url: string | null;
//   to: number;
//   total: number;
// }

// interface SearchParams {
//   product_name: string;
// }

// interface SearchPayload {
//   product_name: string[];
//   month?: string[];
// }

// export default function ProductsPage() {
//   const [products, setProducts] = useState<PaginatedProducts | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const router = useRouter();
//   const urlSearchParams = useSearchParams();
//   const currentPage = urlSearchParams.get("page") || "1";
//   const [selectedDate, setSelectedDate] = useState<Date | null>(null);
//   const [searchMonth, setSearchMonth] = useState<string>("");

//   // Search related states
//   const [searchParams, setSearchParams] = useState<SearchParams>({
//     product_name: "",
//   });
//   const [productNameList, setProductNameList] = useState<string[]>([]);
//   const [suggestions, setSuggestions] = useState<Product[]>([]);
//   const [showSuggestions, setShowSuggestions] = useState(false);
//   const searchRef = useRef<HTMLDivElement>(null);

//   const fetchProducts = async (payload?: SearchPayload) => {
//     try {
//       setLoading(true);
//       setError("");

//       const token = localStorage.getItem("token");
//       if (!token) {
//         router.push("/auth/login");
//         return;
//       }

//       const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/products/price-history`;

//       const response = await fetch(url, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify(payload || {}),
//       });

//       const data = await response.json();

//       if (!response.ok || !data.success) {
//         const errorMessage = data.message || "Failed to fetch products";
//         setError(errorMessage);

//         if (data.status_code === 403) {
//           toast.warning(data.message || "Access denied");
//         } else {
//           toast.error(errorMessage);
//         }

//         throw new Error(errorMessage);
//       }

//       setProducts(data.data);
//     } catch (err) {
//       const errorMessage =
//         err instanceof Error ? err.message : "Failed to load products";
//       setError(errorMessage);

//       if (
//         !(
//           err instanceof Error &&
//           err.message.includes("No price history records found")
//         )
//       ) {
//         toast.error(errorMessage);
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchProducts();
//   }, [currentPage, router, searchMonth]);

//   // Handle click outside to close suggestions
//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (
//         searchRef.current &&
//         !searchRef.current.contains(event.target as Node)
//       ) {
//         setShowSuggestions(false);
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, []);

//   // Handle search input change
//   const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setSearchParams((prev) => ({ ...prev, [name]: value }));

//     if (value.length > 0 && products) {
//       const matched = products.data.filter(
//         (product) =>
//           product.name.toLowerCase().includes(value.toLowerCase()) &&
//           !productNameList.includes(product.name)
//       );
//       setSuggestions(matched);
//       setShowSuggestions(true);
//     } else {
//       setSuggestions([]);
//       setShowSuggestions(false);
//     }
//   };

//   // Handle search submission
//   const handleSearch = (e: React.FormEvent) => {
//     e.preventDefault(); // Prevent form submission from reloading the page

//     const splitAndTrim = (input: string) =>
//       input
//         .split(",")
//         .map((s) => s.trim())
//         .filter(Boolean);

//     const payload: SearchPayload = {
//       product_name:
//         productNameList.length > 0
//           ? productNameList
//           : splitAndTrim(searchParams.product_name),
//     };

//     if (searchMonth) {
//       payload.month = [searchMonth];
//     }

//     fetchProducts(payload);
//   };

//   // Handle clear search
//   const handleClearSearch = () => {
//     setSearchParams({
//       product_name: "",
//     });
//     setProductNameList([]);
//     setSearchMonth("");
//     setSelectedDate(null); // Clear the selected date
//     fetchProducts();
//   };

//   // Handle enter key press in search input
//   const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
//     if (e.key === "Enter" && searchParams.product_name.trim()) {
//       e.preventDefault();
//       const trimmed = searchParams.product_name.trim();
//       if (trimmed && !productNameList.includes(trimmed)) {
//         setProductNameList((prev) => [...prev, trimmed]);
//         setSearchParams((prev) => ({ ...prev, product_name: "" }));
//       }
//     }
//   };

//   // Handle suggestion click
//   const handleSuggestionClick = (product: Product) => {
//     if (!productNameList.includes(product.name)) {
//       setProductNameList((prev) => [...prev, product.name]);
//     }
//     setSearchParams((prev) => ({ ...prev, product_name: "" }));
//     setShowSuggestions(false);
//   };

//   // Remove product name from the list
//   const removeProductName = (name: string) => {
//     setProductNameList((prev) => prev.filter((n) => n !== name));
//   };

//   // Handle month input change (format: MM-yyyy)
//   const handleMonthChange = (date: Date | null) => {
//     if (date) {
//       const formatted = format(date, "MM-yyyy");
//       setSearchMonth(formatted);
//       setSelectedDate(date); // Set the selected date to display in the input
//     } else {
//       setSearchMonth("");
//       setSelectedDate(null); // Clear the selected date
//     }
//   };

//   if (loading) {
//     return <Loader />;
//   }

//   return (
//     <div className="min-h-screen flex gap-[20px] px-[20px] xl:px-[30px]">
//       <div className="w-[15%] relative">
//         <Sidebar />
//       </div>
//       <div className="w-full mx-auto space-y-4 p-4">
//         <div>
//           <Header />
//         </div>
//         <div className="px-6 py-6 bg-[#f9f9f9] rounded-[20px] xl:rounded-[25px] text-[#2b3990]">
//           <h1 className="text-2xl font-bold my-0">All Products</h1>
//           <Breadcrumb items={[{ label: "Dashboard" }, { label: "Products" }]} />
//         </div>

//         {/* Search and Filter Component */}
//         <div className="relative mb-6" ref={searchRef}>
//           <form onSubmit={handleSearch}>
//             <div className="flex gap-2">
//               {/* PRODUCT NAME INPUT (taggable) */}
//               <div className="max-w-xs">
//                 <div className="bg-white border-2 rounded-md flex flex-wrap items-center px-2 py-1 min-h-[42px] text-xs text-black focus-within:border-blue-500 transition-all">
//                   {productNameList.map((name, index) => (
//                     <span
//                       key={index}
//                       className="text-xs px-[10px] py-[4px] bg-[#2b3990] rounded-[10px] text-white flex items-center gap-1 mb-[2px]"
//                     >
//                       {name}
//                       <button
//                         onClick={() => removeProductName(name)}
//                         className="text-red-300 text-xs"
//                       >
//                         ×
//                       </button>
//                     </span>
//                   ))}

//                   <input
//                     type="text"
//                     name="product_name"
//                     value={searchParams.product_name}
//                     onChange={handleSearchChange}
//                     onKeyDown={handleKeyDown}
//                     className="flex-grow outline-none bg-transparent py-1 px-1 text-xs md:w-[206px]"
//                     placeholder={productNameList.length === 0 ? "Search Product Name and press Enter" : ""}
//                   />
//                 </div>
//               </div>

//               {/* DATE PICKER */}
//               <div className="w-[120px]">
//                 <DatePicker
//                   selected={selectedDate}
//                   onChange={handleMonthChange}
//                   dateFormat="MM-yyyy"
//                   showMonthYearPicker
//                   placeholderText="MM-YYYY"
//                   className="w-full bg-white border-2 rounded-md px-2 h-[42px] text-xs text-black focus:border-blue-500 transition-all"
//                 />
//               </div>

//               {/* SEARCH BUTTON */}
//               <div
//                 className="shadow-sm border-[2px] rounded-[10px] flex items-center justify-center hover:bg-[#2b3990] hover:text-[#fff] transition-all duration-300 ease-in-out hover:border-[#2b3990] cursor-pointer"
//               >
//                 <button type="submit" className="text-xs uppercase px-4 rounded-[10px] flex items-center gap-2">
//                   Search
//                 </button>
//               </div>

//               {/* CLEAR BUTTON */}
//               {(productNameList.length > 0 || searchMonth) && (
//                 <div
//                   onClick={handleClearSearch}
//                   className="shadow-sm border-[2px] rounded-[10px] flex items-center justify-center hover:bg-gray-500 hover:text-[#fff] transition-all duration-300 ease-in-out hover:border-gray-500 cursor-pointer"
//                 >
//                   <button className="text-xs uppercase px-4 rounded-[10px] flex items-center gap-2">
//                     Clear
//                   </button>
//                 </div>
//               )}
//             </div>
//           </form>

//           {/* Suggestions dropdown */}
//           {showSuggestions && suggestions.length > 0 && (
//             <div className="absolute z-10 mt-1 w-auto bg-white shadow-lg rounded-[15px] border border-gray-200 max-h-60 overflow-auto">
//               {suggestions.map((product, index) => {
//                 const isSelected = productNameList.includes(product.name);
//                 return (
//                   <div
//                     key={index}
//                     className={`px-4 py-2 flex items-center ${
//                       isSelected
//                         ? "bg-gray-100 text-gray-400 cursor-not-allowed"
//                         : "hover:bg-gray-100 cursor-pointer"
//                     }`}
//                     onClick={() => !isSelected && handleSuggestionClick(product)}
//                   >
//                     <img
//                       src={
//                         product.image
//                           ? `${process.env.NEXT_PUBLIC_BACKEND_URL_PUBLIC}${product.image}`
//                           : "/images/items/product-default.png"
//                       }
//                       alt={product.name}
//                       className="w-8 h-8 object-cover mr-3 rounded"
//                       onError={(e) => {
//                         e.currentTarget.src = "/images/items/product-default.png";
//                       }}
//                     />
//                     <div>
//                       <p
//                         className={`font-medium ${
//                           isSelected ? "text-gray-400" : "text-[#2b3990]"
//                         }`}
//                       >
//                         {product.name}
//                         {isSelected && (
//                           <span className="ml-2 text-xs text-gray-500">
//                             (already selected)
//                           </span>
//                         )}
//                       </p>
//                       <p
//                         className={`text-sm ${
//                           isSelected ? "text-gray-400" : "text-gray-600"
//                         }`}
//                       >
//                         {product.type} • {product.price} Rs
//                       </p>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           )}
//         </div>
//         {error && (
//           <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
//             <strong className="font-bold">Error: </strong>
//             <span className="block sm:inline">{error}</span>
//           </div>
//         )}
//         {/* Products Grid */}
//         {products?.data.length === 0 ? (
//           <div className="text-center py-10">
//             <p className="text-gray-500">
//               No products found matching your search criteria.
//             </p>
//           </div>
//         ) : (
//           <>
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-[10px] xl:gap-[15px] mb-8">
//               {products?.data.map((product, index) => (
//                 <div
//                   key={index}
//                   className="bg-white rounded-[20px] border-[1px] border-[#2b3990] border-opacity-40 overflow-hidden relative"
//                 >
//                   <div className="flex flex-col h-full shadow-lg rounded-lg overflow-hidden transition-transform duration-300 ease-in-out hover:scale-105">
//                     <div className="bg-[#f9f9f9] overflow-hidden w-full">
//                       <img
//                         src={
//                           product.image
//                             ? `${process.env.NEXT_PUBLIC_BACKEND_URL_PUBLIC}${product.image}`
//                             : "/images/items/product-default.png"
//                         }
//                         alt={product.name}
//                         className="w-full h-48 object-cover"
//                         onError={(e) => {
//                           e.currentTarget.src = "/images/items/product-default.png";
//                         }}
//                       />
//                     </div>
//                     <div className="bg-white py-4 px-6">
//                       <div>
//                         <h2 className="text-lg font-semibold text-gray-800 capitalize">
//                           {product.name}
//                         </h2>
//                       </div>
//                       <div className="flex items-center justify-between mt-2">
//                         <p className="text-base text-green-600 font-medium">
//                           {product.price} Rs
//                         </p>
//                         <p className="text-xs text-gray-500">
//                           {new Intl.DateTimeFormat("en-US", {
//                             year: "numeric",
//                             month: "2-digit",
//                             day: "2-digit",
//                             hour: "2-digit",
//                             minute: "2-digit",
//                             second: "2-digit",
//                             hour12: true,
//                           }).format(new Date(product.changed_at))}
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>

//             {/* Pagination */}
//             {products && products.links.length > 0 && (
//               <div className="flex justify-center gap-2 mt-6">
//                 {products.links.map((link, index) => {
//                   if (link.url === null) return null;

//                   const page =
//                     new URL(link.url).searchParams.get("page") || "1";
//                   const isActive = link.active;
//                   const isPrevious = link.label.includes("Previous");
//                   const isNext = link.label.includes("Next");

//                   return (
//                     <Link
//                       key={index}
//                       href={`/dashboard/admin/products?page=${page}`}
//                       className={`px-4 py-2 rounded-lg border ${
//                         isActive
//                           ? "bg-[#2b3990] text-white border-blue-500"
//                           : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
//                       } ${isPrevious || isNext ? "font-semibold" : ""}`}
//                     >
//                       {isPrevious ? "«" : isNext ? "»" : link.label}
//                     </Link>
//                   );
//                 })}
//               </div>
//             )}
//           </>
//         )}
//       </div>
//     </div>
//   );
// }