type ConfirmDialogProps = {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({ message, onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <div className="fixed inset-0 flex justify-center items-center bg-[#2b3990]/20 z-50 px-4">
      <div className="relative max-w-md w-full bg-white border border-blue-200 shadow-lg rounded-xl p-6 flex flex-col items-center text-center">

        <button
          onClick={onCancel}
          className="absolute top-3 right-3 text-gray-500 hover:text-[#c00] transition-colors"
          aria-label="Close"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Icon */}
        <div className="bg-blue-100 text-blue-600 rounded-full p-3 mb-4 mt-2">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        {/* Text */}
        <h2 className="text-lg font-semibold text-gray-800 mb-3">
          Are you sure?
        </h2>
        <p className="text-sm text-gray-600 mb-5">{message}</p>

        {/* Buttons */}
        <div className="flex items-center justify-center gap-[10px]">
          <button
            onClick={onConfirm}
            className="rounded-[10px] flex items-center justify-center bg-[#2b3990] hover:bg-[#00aeef] text-[#fff] transition-all duration-300 ease-in-out text-xs uppercase px-4 py-[10px] text-nowrap"
          >
            Yes
          </button>
          <button
            onClick={onCancel}
            className="shadow-sm rounded-[10px] flex items-center justify-center bg-[#c00]/80 hover:bg-[#c00] text-[#fff] transition-all duration-300 ease-in-out border-none text-nowrap text-xs uppercase px-4 py-[10px]"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
