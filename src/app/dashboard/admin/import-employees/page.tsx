
"use client";

import { useState } from "react";
import Sidebar from "@/app/_components/adminsidebar/index";
import Header from "@/app/_components/adminheader/index";
import Breadcrumb from "@/app/_components/ui/Breadcrumb";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import { toast } from "react-toastify";
import Loader from "@/app/_components/loader/index";
import * as XLSX from "xlsx";

// Define the path to your Excel file in the public folder
const EXCEL_FILE_PATH = "/uploads/TFSC_EMP.xlsx"; // Update this path

export default function Page() {
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [excelPreview, setExcelPreview] = useState<any[][] | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      setError("Please select a file to upload");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("excel_file", selectedFile);

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/product/import`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          const errorMessages = Object.values(data.errors).flat().join(", ");
          toast.error(errorMessages);
        }
        toast.error(data.message || "Failed to upload file");
      } else {
        toast.success(data.message || "File uploaded successfully");
        setSelectedFile(null);
        setExcelPreview(null);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to upload file";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
      "application/vnd.ms-excel", // .xls
      "text/csv", // .csv
    ];

    if (!allowedTypes.includes(file.type)) {
      setSelectedFile(null);
      setExcelPreview(null);
      toast.error("Only Excel or CSV files are allowed.");
      return;
    }

    setSelectedFile(file);
    setError(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = evt.target?.result;
      const workbook = XLSX.read(data, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      setExcelPreview(json as any[][]);
    };
    reader.readAsBinaryString(file);
  };
  // Function to preview the Excel file
  const handlePreview = async () => {
    // alert('dadsa');
    // setIsLoadingPreview(true);
    try {
      console.log('workbook');
      // Fetch the Excel file from the public folder
      const response = await fetch(EXCEL_FILE_PATH);
      const arrayBuffer = await response.arrayBuffer();
      const data = new Uint8Array(arrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      
      // Get the first sheet
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      console.log('workbook',workbook,'jsonData',jsonData);

      setExcelPreview(jsonData as any[][]);
    } catch (error) {
      console.log('workbook2');
      toast.error("Failed to load the Excel file.");
      console.error("Error loading Excel:", error);
    } finally {
      console.log('workbook3');
      // setIsLoadingPreview(false);
    }
  };

  return (
    <div className="min-h-screen flex gap-[20px] px-[20px] xl:px-[30px]">
      <div className="w-[15%] relative">
        <Sidebar />
      </div>
      <div className="w-full mx-auto space-y-4 p-4">
        <Header />
        <div className="px-6 py-6 bg-[#f9f9f9] rounded-[20px] xl:rounded-[25px] text-[#2b3990]">
          <h1 className="text-2xl font-bold my-0">Import Employee</h1>
          <Breadcrumb
            items={[{ label: "Dashboard" }, { label: "Excel Viewer" }]}
          />
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4 xl:w-1/2">
            <label
              htmlFor="file_upload"
              className="block text-sm font-medium mb-2"
            >
              Upload File
            </label>
            <input
              type="file"
              id="file_upload"
              name="file_upload"
              accept=".csv, .xlsx, .xls"
              onChange={handleFileChange}
              className="w-full px-3 py-2 border rounded-lg"
              disabled={isSubmitting}
            />
          </div>

          {selectedFile && (
            <>
              <div className="xl:w-1/2 my-4 flex items-center gap-3 p-3 bg-gray-100 border rounded-lg">
                <span className="text-[#2b3990]">
                  <InsertDriveFileIcon fontSize="large" />
                </span>
                <div>
                  <p className="font-medium text-[#2b3990] text-sm my-0">
                    {selectedFile.name}
                  </p>
                  <p className="text-gray-600 text-[12px] my-0">
                    {selectedFile.type || "Unknown type"} -{" "}
                    {(selectedFile.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>

              {excelPreview && (
                <div className="overflow-auto max-h-[300px] border rounded-lg my-2">
                  <table className="w-full text-sm text-left text-gray-700 border-collapse">
                    <thead className="bg-[#2b3990] text-white sticky top-0">
                      <tr>
                        {excelPreview[0]?.map((cell, index) => (
                          <th key={index} className="px-3 py-2 border">
                            {typeof cell === "string"
                              ? cell
                              : `Col ${index + 1}`}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {excelPreview.slice(1).map((row, rowIndex) => (
                        <tr key={rowIndex} className="bg-white even:bg-gray-50">
                          {row.map((cell, cellIndex) => (
                            <td key={cellIndex} className="px-3 py-2 border">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              className="w-[200px] bg-[#2b3990] text-white py-2 rounded-lg hover:bg-[#00aeef] transition flex justify-center items-center gap-2 mt-[20px]"
              disabled={isSubmitting || !selectedFile}
            >
              {isSubmitting ? (
                <>
                  <Loader />
                  <span>Processing...</span>
                </>
              ) : (
                "Import"
              )}
            </button>
          </div>
        </form>
        <div className="flex w-full bg-[#f9f9f9] rounded-[20px] xl:rounded-[25px]">
          <div className="w-full rounded-[20px] p-[10px] md:p-[20px] xl:p-[30px]">
            {/* Preview & Download Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handlePreview}
                // disabled={isLoadingPreview}
                className="px-4 py-2 bg-[#2b3990] text-white rounded hover:bg-blue-600 transition"
              >
                {/* {isLoadingPreview ? "Loading..." : "Preview Template"} */}
                Preview
              </button>
              <a
                href={EXCEL_FILE_PATH}
                download
                className="px-4 py-2 bg-[#00aeef] text-white rounded hover:bg-green-600 transition"
              >
                Download Template
              </a>
            </div>

            {/* Excel Preview Table */}
            {excelPreview && (
              <div className="overflow-auto max-h-[300px] border rounded-lg my-2">
                <table className="w-full text-sm text-left text-gray-700 border-collapse">
                  <thead className="bg-[#2b3990] text-white sticky top-0">
                    <tr>
                      {excelPreview[0]?.map((cell, index) => (
                        <th key={index} className="px-3 py-2 border">
                          {typeof cell === "string" ? cell : `Col ${index + 1}`}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {excelPreview.slice(1).map((row, rowIndex) => (
                      <tr key={rowIndex} className="bg-white even:bg-gray-50">
                        {row.map((cell, cellIndex) => (
                          <td key={cellIndex} className="px-3 py-2 border">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
