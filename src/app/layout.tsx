import "./globals.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const metadata = {
   title: "Twenty Four Seven Consultancy (SMC-PVT) LTD",
  description:
    "Twenty Four Seven Consultancy offers IT solutions: BPO, digital marketing, healthcare, medical billing, and web development support.",
      robots: "noindex, nofollow",
  alternates: {
    canonical: "https://ration.24-7consultancy.pk/",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
          {children}
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
      </body>
    </html>
  );
}
