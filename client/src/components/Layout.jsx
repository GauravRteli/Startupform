// src/components/Layout.jsx
import React from "react";
import Navbar from "./Navbar";

const Layout = ({ children, showBreadcrumb = true }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="flex-1">{children}</main>

      {/* Optional Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                © 2024 StartupHub. All rights reserved.
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <a
                href="#"
                className="text-sm text-gray-500 hover:text-orange-600"
              >
                Support
              </a>
              <a
                href="#"
                className="text-sm text-gray-500 hover:text-orange-600"
              >
                Documentation
              </a>
              <div className="text-sm text-gray-400">v1.0.0</div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
