// src/components/ApplicationsList.jsx
import React, { useState, useEffect } from "react";
import startupAPI from "../services/api";
import MultiStepForm from "./MultiStepForm";

export default function ApplicationsList() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedApp, setSelectedApp] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadApplications();
  }, [pagination.currentPage, searchTerm]);

  const loadApplications = async () => {
    setLoading(true);
    try {
      const response = await startupAPI.getAllApplications({
        page: pagination.currentPage,
        limit: pagination.limit,
        search: searchTerm,
      });

      if (response.success) {
        setApplications(response.data.applications);
        setPagination((prev) => ({
          ...prev,
          total: response.data.pagination.total,
          totalPages: response.data.pagination.totalPages,
        }));
      } else {
        throw new Error(response.message || "Failed to load applications");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, currentPage: newPage }));
  };

  const handleEditApp = (app) => {
    setSelectedApp(app);
  };

  const handleCloseEdit = (result) => {
    setSelectedApp(null);
    if (result && result.success) {
      // Refresh list after successful update
      loadApplications();
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Show edit form as overlay
  if (selectedApp) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
        <MultiStepForm
          mode="edit"
          applicationId={selectedApp.id}
          onClose={handleCloseEdit}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Search and Filters */}
        {/* <div className="bg-white rounded-2xl shadow-xl mb-8 p-6 border border-orange-100">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by video link..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center text-sm text-gray-600">
              Showing {applications.length} of {pagination.total} applications
            </div>
          </div>
        </div> */}

        {/* Applications List */}
        <div className="bg-white rounded-2xl shadow-xl border border-orange-100 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading applications...</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center">
              <div className="text-red-400 text-4xl mb-4">❌</div>
              <p className="text-red-600 font-medium">{error}</p>
              <button
                onClick={loadApplications}
                className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : applications.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-gray-400 text-4xl mb-4">📄</div>
              <p className="text-gray-600">No applications found</p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Table Header */}
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700">
                  <div className="col-span-1">ID</div>
                  <div className="col-span-4">Video Link</div>
                  <div className="col-span-2">MOA File</div>
                  <div className="col-span-2">Reconstruction</div>
                  <div className="col-span-2">Created</div>
                  <div className="col-span-1">Actions</div>
                </div>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-gray-200">
                {applications.map((app) => (
                  <div
                    key={app.id}
                    className="px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => handleEditApp(app)}
                  >
                    <div className="grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-1">
                        <span className="text-sm font-mono text-gray-600">
                          #{app.id}
                        </span>
                      </div>

                      <div className="col-span-4">
                        {app.startupVideoLink ? (
                          <a
                            href={app.startupVideoLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 truncate block max-w-full"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {app.startupVideoLink.length > 50
                              ? `${app.startupVideoLink.substring(0, 50)}...`
                              : app.startupVideoLink}
                          </a>
                        ) : (
                          <span className="text-gray-400 text-sm">
                            No video link
                          </span>
                        )}
                      </div>

                      <div className="col-span-2">
                        {app.moaFile ? (
                          <a
                            href={app.moaFile}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-sm text-green-600 hover:text-green-800"
                            onClick={(e) => e.stopPropagation()}
                          >
                            📄 View
                          </a>
                        ) : (
                          <span className="text-gray-400 text-sm">No file</span>
                        )}
                      </div>

                      <div className="col-span-2">
                        {app.reconstructionFile ? (
                          <a
                            href={app.reconstructionFile}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-sm text-green-600 hover:text-green-800"
                            onClick={(e) => e.stopPropagation()}
                          >
                            📄 View
                          </a>
                        ) : (
                          <span className="text-gray-400 text-sm">No file</span>
                        )}
                      </div>

                      <div className="col-span-2">
                        <span className="text-sm text-gray-600">
                          {formatDate(app.createdAt)}
                        </span>
                      </div>

                      <div className="col-span-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditApp(app);
                          }}
                          className="text-orange-600 hover:text-orange-800 text-sm font-medium"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Page {pagination.currentPage} of {pagination.totalPages}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          handlePageChange(pagination.currentPage - 1)
                        }
                        disabled={pagination.currentPage === 1}
                        className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() =>
                          handlePageChange(pagination.currentPage + 1)
                        }
                        disabled={
                          pagination.currentPage === pagination.totalPages
                        }
                        className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
