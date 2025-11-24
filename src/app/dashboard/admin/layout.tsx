import ProtectedRoute from '@/app/_components/auth/ProtectedRoute';
// import AdminSidebar from '@/app/_components/dashboard/AdminSidebar';
import Header from "@/app/_components/adminheader/index";
import Sidebar from "@/app/_components/adminsidebar/index";


export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
     <div className="min-h-screen flex">
          <div className="w-[15%] relative">
            <Sidebar />
          </div>
    
          <div className="w-[85%] mx-auto ">
            <div className='bg-white sticky top-0 z-20'>
              <Header />
            </div>
    
            {/* Dashboard Stats */}
              <div className="flex-1 p-4 xl:px-8 "> {children}</div>
          </div>
        </div>
    </ProtectedRoute>
  );
}