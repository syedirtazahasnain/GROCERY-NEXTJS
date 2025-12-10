export default function index() {
    return (
        <div className="flex flex-col justify-center items-center h-screen bg-white z-50 space-y-4 absolute top-0 left-0 w-full">
            <div className="relative">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <div className="absolute inset-0 rounded-full blur-[2px] border-4 border-blue-300 border-t-transparent opacity-50 animate-spin-slow" />
            </div>
            <p className="text-sm text-blue-600 font-medium tracking-wide animate-pulse">
                Loading, please wait...
            </p>
        </div>
    );
}
