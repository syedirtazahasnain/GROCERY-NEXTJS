// src/app/_components/ui/LoadingSpinner.tsx
"use client";
import { useState, useEffect } from "react";

export default function LoadingScreen() {
  const [loading, setLoading] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // Start fade-out slightly before navigation
    const fadeTimer = setTimeout(() => setFading(true), 4800);
    const navTimer = setTimeout(() => {
      setLoading(false);
      window.location.href = "/next-page";
    }, 5400);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(navTimer);
    };
  }, []);

  if (!loading) return null;

  return (
    <div
      className={`fixed inset-0 flex flex-col items-center justify-center bg-white transition-opacity duration-700 ease-in-out z-[9999] ${
        fading ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Loader images */}
      <div className="relative w-[270px] h-[270px] flex items-center justify-center">
        {/* Background image (static) */}
        <img
          src="/images/imageleft.png"
          alt="Background"
          className="absolute inset-0 w-full h-full object-contain"
        />

        {/* Rotating image */}
        <img
          src="/images/imageright.png"
          alt="Rotating Element"
          className="absolute inset-0 w-full h-full object-contain animate-spin-smooth"
        />
      </div>

      {/* Text */}
      <p className="mt-10 text-lg font-semibold tracking-widest text-[#2B3990] animate-pulse">
        Loading ...
      </p>

      <style jsx>{`
        @keyframes spinSmooth {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .animate-spin-smooth {
          animation: spinSmooth 2.5s linear infinite;
        }
      `}</style>
    </div>
  );
}










// import React from 'react';

// export default function LoadingSpinner() {
//   return (
//     <div className="flex flex-col justify-center items-center h-screen bg-white z-50 space-y-4 absolute top-0 left-0 w-full">
//       <div className="relative">
//         <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
//         <div className="absolute inset-0 rounded-full blur-[2px] border-4 border-blue-300 border-t-transparent opacity-50 animate-spin-slow" />
//       </div>
//       <p className="text-sm text-blue-600 font-medium tracking-wide animate-pulse">
//         Loading, please wait...
//       </p>
//     </div>
//   );
// }