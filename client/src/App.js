import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useParams,
} from "react-router-dom";
import "./App.css";
import MultiStepForm from "./components/MultiStepForm";
import ApplicationsList from "./components/ApplicationsList";
import Navbar from "./components/Navbar"; // Import the navbar

function App() {
  return (
    <Router>
      <div className="App min-h-screen bg-gray-50">
        {/* Add the Navbar */}
        <Navbar />

        {/* Main Content */}
        <main>
          <Routes>
            {/* Default route - redirect to applications list */}
            <Route path="/" element={<Navigate to="/applications" replace />} />

            {/* Applications list route */}
            <Route path="/applications" element={<ApplicationsList />} />

            {/* Create new application route */}
            <Route
              path="/applications/create"
              element={<MultiStepForm mode="create" />}
            />

            {/* Edit existing application route */}
            <Route
              path="/applications/edit/:id"
              element={<EditApplication />}
            />

            {/* Catch-all route for 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

// Edit Application Component
function EditApplication() {
  const { id } = useParams();

  return <MultiStepForm mode="edit" applicationId={parseInt(id)} />;
}

// Enhanced 404 Not Found Component
function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-orange-100 text-center">
          <div className="text-gray-400 text-6xl mb-4">🔍</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Page Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            The page you're looking for doesn't exist.
          </p>
          <div className="space-x-4">
            <button
              onClick={() => (window.location.href = "/applications")}
              className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors shadow-lg hover:shadow-xl"
            >
              Go to Applications
            </button>
            <button
              onClick={() => (window.location.href = "/applications/create")}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Create New
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
