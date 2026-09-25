import { useEffect, useState } from "react";
 import axios from "axios";
import api from "./api";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import AdminEmployees from "./pages/AdminEmployees";
import EditEmployee from "./pages/EditEmployee";

// function PublicDirectory() {
//   return (
function PublicDirectory() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("employeeName");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [errorDetails, setErrorDetails] = useState([]);

  const itemsPerPage = 10;

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/employees`,
          {
            params: {
              search: searchTerm,
              sortBy: sortBy,
              sortOrder: sortOrder,
              page: currentPage,
              limit: itemsPerPage,
            },
          }
        );

        setEmployees(response.data?.data || []);
        setTotalPages(response.data?.totalPages || 1);
        setTotalEmployees(response.data?.totalEmployees || 0);
        setErrorDetails([]);

      } catch (error) {
        console.error("Failed to fetch employees:", error);
        setError("Unable to load employee directory.");
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchEmployees();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, sortBy, sortOrder, currentPage]);

  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleSort = (field) => {
    setCurrentPage(1);

    if (sortBy === field) {
      setSortOrder((currentOrder) =>
        currentOrder === "asc" ? "desc" : "asc"
      );
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <h1 className="text-2xl font-bold text-gray-800">
            GSPL Employee Directory
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Gujarat State Petronet Limited
          </p>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Title */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            Employee Directory
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Search and find employee contact information
          </p>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow-sm border p-5 mb-6">
          <div className="max-w-xl">
            <label
              htmlFor="search"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Search Employees
            </label>

            <input
              id="search"
              type="text"
              placeholder="Search by name, department, designation..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-5 py-4 font-semibold text-gray-700">
                    Sr. No.
                  </th>

                  <th className="px-5 py-4 font-semibold text-gray-700">
                    <button
                      type="button"
                      onClick={() => handleSort("employeeName")}
                      className="flex items-center gap-2 hover:text-blue-600"
                    >
                      Employee Name
                      {sortBy === "employeeName" && (
                        <span>
                          {sortOrder === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </button>
                  </th>

                  <th className="px-5 py-4 font-semibold text-gray-700">
                    <button
                      type="button"
                      onClick={() => handleSort("designation")}
                      className="flex items-center gap-2 hover:text-blue-600"
                    >
                      Designation
                      {sortBy === "designation" && (
                        <span>
                          {sortOrder === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </button>
                  </th>

                  <th className="px-5 py-4 font-semibold text-gray-700">
                    <button
                      type="button"
                      onClick={() => handleSort("department")}
                      className="flex items-center gap-2 hover:text-blue-600"
                    >
                      Department
                      {sortBy === "department" && (
                        <span>
                          {sortOrder === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </button>
                  </th>

                  <th className="px-5 py-4 font-semibold text-gray-700">
                    <button
                      type="button"
                      onClick={() => handleSort("company")}
                      className="flex items-center gap-2 hover:text-blue-600"
                    >
                      Company
                      {sortBy === "company" && (
                        <span>
                          {sortOrder === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </button>
                  </th>

                  <th className="px-5 py-4 font-semibold text-gray-700">
                    Extension
                  </th>

                  <th className="px-5 py-4 font-semibold text-gray-700">
                    Mobile No.
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-5 py-12 text-center text-gray-500"
                    >
                      Loading employees...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-5 py-12 text-center text-red-500"
                    >
                      {error}
                    </td>
                  </tr>
                ) : employees.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-5 py-12 text-center text-gray-500"
                    >
                      No employees found
                    </td>
                  </tr>
                ) : (
                  employees.map((employee, index) => (
                    <tr
                      key={employee._id}
                      className="border-b last:border-b-0 hover:bg-gray-50"
                    >
                      <td className="px-5 py-4">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </td>

                      <td className="px-5 py-4 font-medium text-gray-800">
                        {employee.employeeName}
                      </td>

                      <td className="px-5 py-4">
                        {employee.designation}
                      </td>

                      <td className="px-5 py-4">
                        {employee.department}
                      </td>

                      <td className="px-5 py-4">
                        {employee.company}
                      </td>

                      <td className="px-5 py-4">
                        {employee.extension}
                      </td>

                      <td className="px-5 py-4">
                        {employee.mobileNo}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && !error && totalEmployees > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t px-5 py-4">
              <p className="text-sm text-gray-500">
                Showing{" "}
                <span className="font-medium text-gray-700">
                  {(currentPage - 1) * itemsPerPage + 1}
                </span>{" "}
                to{" "}
                <span className="font-medium text-gray-700">
                  {Math.min(
                    currentPage * itemsPerPage,
                    totalEmployees
                  )}
                </span>{" "}
                of{" "}
                <span className="font-medium text-gray-700">
                  {totalEmployees}
                </span>{" "}
                employees
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() =>
                    setCurrentPage((page) => page - 1)
                  }
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>

                <span className="px-3 text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() =>
                    setCurrentPage((page) => page + 1)
                  }
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function AdminLogin() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");

    if (!username.trim() || !password) {
      setError("Username and password are required.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/login`,
        {
          username: username.trim(),
          password,
        }
      );

      if (response.data?.success) {
        localStorage.setItem("gspl_admin_token", response.data.token);

        localStorage.setItem(
          "gspl_admin_user",
          JSON.stringify(response.data.user)
        );

        navigate("/admin/dashboard");
      }
    } catch (error) {
      console.error("Login error:", error);

      setError(
        error.response?.data?.message ||
          "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            GSPL Employee Directory
          </h1>

          <p className="mt-2 text-gray-500">
            Super Admin Login
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-xl shadow-sm border p-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            Admin Login
          </h2>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Username */}
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Username
              </label>

              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                autoComplete="username"
                className="w-full rounded-md border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                autoComplete="current-password"
                className="w-full rounded-md border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-blue-600 px-4 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>

        {/* Back to Directory */}
        <div className="text-center mt-6">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            ← Back to Employee Directory
          </button>
        </div>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("gspl_admin_token");

  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}

function AdminDashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalDepartments: 0,
    totalCompanies: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("gspl_admin_token");

        if (!token) {
          navigate("/admin/login");
          return;
        }

        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/admin/stats`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setStats(response.data?.data || {});
      } catch (error) {
        console.error("Failed to fetch admin stats:", error);

        if (error.response?.status === 401) {
          localStorage.removeItem("gspl_admin_token");
          localStorage.removeItem("gspl_admin_user");
          navigate("/admin/login");
          return;
        }

        setError("Unable to load dashboard statistics.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("gspl_admin_token");
    localStorage.removeItem("gspl_admin_user");

    navigate("/admin/login");
  };

  const adminUser = JSON.parse(
    localStorage.getItem("gspl_admin_user") || "{}"
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              GSPL Employee Directory
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Super Admin Dashboard
            </p>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {adminUser.username || "Admin"}
            </span>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800">
            Dashboard
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Manage the GSPL employee directory.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {/* Employees */}
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Total Employees
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-800">
              {loading ? "..." : stats.totalEmployees}
            </p>
          </div>

          {/* Departments */}
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Departments
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-800">
              {loading ? "..." : stats.totalDepartments}
            </p>
          </div>

          {/* Companies */}
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Companies
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-800">
              {loading ? "..." : stats.totalCompanies}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 rounded-xl border bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800">
            Quick Actions
          </h3>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="rounded-md border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              View Directory
            </button>

            <button
              type="button"
              onClick={() => navigate("/admin/employees")}
              className="rounded-md bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
            >
              Manage Employees
            </button>

            <button
  type="button"
  onClick={() => navigate("/admin/import")}
  className="rounded-md bg-gray-800 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-900"
>
  Import Excel
</button>
          </div>
        </div>
      </main>
    </div>
  );
}

function AdminImport() {
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [previewColumns, setPreviewColumns] = useState([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [message, setMessage] = useState("");
const [error, setError] = useState("");
const [errorDetails, setErrorDetails] = useState([]);
const [importResult, setImportResult] = useState(null);

  const token = localStorage.getItem("gspl_admin_token");

  const handleLogout = () => {
    localStorage.removeItem("gspl_admin_token");
    localStorage.removeItem("gspl_admin_user");
    navigate("/admin/login");
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0];

    setFile(selectedFile || null);
    setPreviewData([]);
    setPreviewColumns([]);
    setImportResult(null);
    setMessage("");
    setError("");
    setErrorDetails([]);
  };

  const handlePreview = async () => {
  if (!file) {
    setError("Please select an Excel file first.");
    return;
  }

  setPreviewLoading(true);
  setMessage("");
  setError("");
  setErrorDetails([]);
  setImportResult(null);

  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post(
      "/import/preview",
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setPreviewData(response.data.data || []);
    setPreviewColumns(response.data.columns || []);
    setMessage(
      `Preview generated successfully. ${response.data.totalRows} row(s) found.`
    );
  } catch (error) {
    const responseData = error.response?.data;

    setError(
      responseData?.message ||
        "Failed to generate Excel preview."
    );

    setErrorDetails(responseData?.invalidRows || []);
  } finally {
    setPreviewLoading(false);
  }
};

  const handleImport = async () => {
  if (!file) {
    setError("Please select an Excel file first.");
    return;
  }

  const confirmed = window.confirm(
    "Are you sure you want to import this Excel file into the employee directory?"
  );

  if (!confirmed) {
    return;
  }

  setImportLoading(true);
  setMessage("");
  setError("");
  setErrorDetails([]);
  setImportResult(null);

  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post(
      "/import/import",
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setImportResult(response.data);

    setMessage("Excel import completed successfully.");

    setPreviewData([]);
    setPreviewColumns([]);
    setFile(null);

    document.getElementById("excel-file-input").value = "";
  } catch (error) {
    const responseData = error.response?.data;

    setError(
      responseData?.message ||
        "Failed to import Excel data."
    );

    setErrorDetails(responseData?.invalidRows || []);
  } finally {
    setImportLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Excel Import
            </h1>
            <p className="text-sm text-slate-500">
              Import employee records into the GSPL directory
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => navigate("/admin/dashboard")}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Dashboard
            </button>

            <button
              onClick={handleLogout}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Upload Employee Excel
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Required columns: Employee Name, Designation, Department,
            Company, Extension, Mobile No
          </p>

          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label
                htmlFor="excel-file-input"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Select Excel file
              </label>

              <input
                id="excel-file-input"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              />
            </div>

            <button
              onClick={handlePreview}
              disabled={!file || previewLoading}
              className="rounded-lg bg-slate-800 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {previewLoading ? "Previewing..." : "Preview Excel"}
            </button>
          </div>

          {file && (
            <div className="mt-4 rounded-lg bg-slate-50 p-4 text-sm text-slate-700">
              <span className="font-medium">Selected file:</span>{" "}
              {file.name}
            </div>
          )}

          {message && (
            <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
              {message}
            </div>
          )}

          {error && (
  <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
    <p className="font-semibold">{error}</p>

    {errorDetails?.length > 0 && (
      <div className="mt-3 space-y-2">
        {errorDetails.map((item, index) => (
          <div
            key={index}
            className="rounded-md border border-red-200 bg-white p-3"
          >
            <p className="font-medium text-red-800">
              Excel Row {item.row} — {item.employeeName}
            </p>

            {item.missingFields?.length > 0 && (
              <p className="mt-1 text-sm text-red-700">
                Missing: {item.missingFields.join(", ")}
              </p>
            )}

            {item.invalidFields?.length > 0 && (
              <ul className="mt-1 list-disc pl-5 text-sm text-red-700">
                {item.invalidFields.map((field, fieldIndex) => (
                  <li key={fieldIndex}>{field}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    )}
  </div>
)}
        </div>

        {previewData.length > 0 && (
          <div className="mt-6 rounded-xl bg-white p-6 shadow-sm">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Excel Preview
                </h2>

                <p className="text-sm text-slate-500">
                  Review the imported rows before confirming.
                </p>
              </div>

              <button
                onClick={handleImport}
                disabled={importLoading}
                className="rounded-lg bg-green-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {importLoading ? "Importing..." : "Confirm Import"}
              </button>
            </div>

            <div className="mt-5 overflow-x-auto rounded-lg border">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    {previewColumns.map((column) => (
                      <th
                        key={column}
                        className="whitespace-nowrap border-b px-4 py-3 font-semibold text-slate-700"
                      >
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {previewData.map((row, index) => (
                    <tr
                      key={index}
                      className="border-b last:border-b-0"
                    >
                      {previewColumns.map((column) => (
                        <td
                          key={column}
                          className="whitespace-nowrap px-4 py-3 text-slate-600"
                        >
                          {row[column]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="mt-3 text-xs text-slate-500">
              Showing the first 10 rows for preview.
            </p>
          </div>
        )}

        {importResult && (
          <div className="mt-6 rounded-xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              Import Result
            </h2>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg bg-green-50 p-4">
                <p className="text-sm text-green-700">
                  Imported
                </p>
                <p className="mt-1 text-2xl font-bold text-green-800">
                  {importResult.importedCount}
                </p>
              </div>

              <div className="rounded-lg bg-yellow-50 p-4">
                <p className="text-sm text-yellow-700">
                  Duplicates Skipped
                </p>
                <p className="mt-1 text-2xl font-bold text-yellow-800">
                  {importResult.duplicateCount}
                </p>
              </div>
            </div>

            {importResult.duplicates?.length > 0 && (
              <div className="mt-5">
                <h3 className="font-medium text-slate-800">
                  Duplicate Records
                </h3>

                <ul className="mt-2 list-disc pl-5 text-sm text-slate-600">
                  {importResult.duplicates.map((duplicate, index) => (
                    <li key={index}>
                      {duplicate.employeeName} —{" "}
                      {duplicate.company}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicDirectory />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<ProtectedRoute> <AdminDashboard /> </ProtectedRoute>}/>
        <Route path="/admin/import" element={<ProtectedRoute> <AdminImport /> </ProtectedRoute>}/>
        <Route path="/admin/employees" element={<ProtectedRoute> <AdminEmployees /> </ProtectedRoute>}/>
        <Route path="/admin/employees/edit/:id" element={<ProtectedRoute> <EditEmployee /> </ProtectedRoute>}/>
      
      </Routes>
    </BrowserRouter>
  );
}

export default App;