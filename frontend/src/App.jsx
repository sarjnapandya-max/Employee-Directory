import { useEffect, useRef, useState } from "react";
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
import AddEmployee from "./pages/AddEmployee";
import ChangePassword from "./pages/ChangePassword";
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
  const [errorDetails, setErrorDetails] = useState([]);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(25);

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
  }, [searchTerm, sortBy, sortOrder, currentPage, itemsPerPage]);

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
    <div className="min-h-screen bg-slate-100">
      {/* ================= HEADER ================= */}
      <header className="border-b border-slate-300 bg-white shadow-sm">
        <div className="h-1.5 bg-blue-800"></div>

        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                window.location.href = "/admin/dashboard";
              }}
              aria-label="Go to Admin Dashboard"
              className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg bg-blue-800 shadow-sm transition hover:bg-blue-900"
            >
              <span className="text-lg font-extrabold text-white">G</span>
            </button>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                GTL Employee Directory
              </h1>

              <p className="mt-0.5 text-xs font-medium text-slate-500">
                Gujarat State Petronet Limited
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-bold text-blue-800"
            >
              Normal User
            </button>

            <button
              type="button"
              onClick={() => {
                window.location.href = "/admin/login";
              }}
              className="rounded-lg bg-blue-800 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-blue-900"
            >
              Admin
            </button>
          </div>
        </div>
      </header>

      {/* ================= MAIN ================= */}
      <main className="min-h-screen bg-slate-100 px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1600px]">

          {/* ================= TITLE + TOP CONTROLS ================= */}
          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-2 h-1 w-16 rounded-full bg-blue-700"></div>

              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                GTL Employee Directory
              </h2>

              <p className="mt-1 text-sm text-slate-600">
                Employee Contact & Extension Directory
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Total Employees */}
              {!loading && !error && (
                <div className="flex h-10 items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3">
                  <div className="flex h-7 min-w-7 items-center justify-center rounded-md bg-blue-800 px-1.5 text-xs font-bold text-white">
                    {totalEmployees}
                  </div>

                  <span className="text-xs font-bold text-blue-800">
                    Total Employees
                  </span>
                </div>
              )}

              {/* Show Entries */}
              <div className="flex h-10 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3">
                <span className="text-xs font-bold text-slate-500">
                  Show
                </span>

                <select
                  id="entriesPerPage"
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-700 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>

                <span className="text-xs font-medium text-slate-500">
                  entries
                </span>
              </div>
            </div>
          </div>

          {/* ================= COMPACT SEARCH ================= */}
          <div className="mb-4 rounded-xl border border-slate-300 bg-white p-3 shadow-sm">
            <div className="relative">
              {/* Search Icon */}
              <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"

                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m21 21-4.35-4.35m2.1-5.4a7.5 7.5 0 1 1-15 0Z"
                  />
                </svg>
              </div>

              <input
                id="search"
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search by name, designation, department, company, extension, mobile or email..."
                className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-11 pr-24 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />

              {/* Clear Button */}
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    setCurrentPage(1);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md px-2.5 py-1 text-xs font-bold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* ================= DIRECTORY TABLE ================= */}
          <section className="overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm">


            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1200px] text-left text-sm">
                <thead className="sticky top-0 z-10 bg-slate-700 text-white shadow-sm">
                  <tr>
                    <th className="border-r border-slate-600 px-4 py-3 text-xs font-bold uppercase tracking-wide whitespace-nowrap">
                      Sr. No.
                    </th>

                    <th
                      className={`border-r border-slate-600 px-4 py-3 text-xs font-bold uppercase tracking-wide whitespace-nowrap ${sortBy === "employeeName"
                        ? "bg-blue-800"
                        : ""
                        }`}
                    >
                      <button
                        type="button"
                        onClick={() => handleSort("employeeName")}
                        className="flex items-center gap-2 transition hover:text-blue-200"
                      >
                        Employee Name

                        {sortBy === "employeeName" && (
                          <span className="text-base leading-none text-blue-200">
                            {sortOrder === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </button>
                    </th>

                    <th
                      className={`border-r border-slate-600 px-4 py-3 text-xs font-bold uppercase tracking-wide whitespace-nowrap ${sortBy === "designation"
                        ? "bg-blue-800"
                        : ""
                        }`}
                    >
                      <button
                        type="button"
                        onClick={() => handleSort("designation")}
                        className="flex items-center gap-2 transition hover:text-blue-200"
                      >
                        Designation

                        {sortBy === "designation" && (
                          <span className="text-base leading-none text-blue-200">
                            {sortOrder === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </button>
                    </th>

                    <th
                      className={`border-r border-slate-600 px-4 py-3 text-xs font-bold uppercase tracking-wide whitespace-nowrap ${sortBy === "department"
                        ? "bg-blue-800"
                        : ""
                        }`}
                    >
                      <button
                        type="button"
                        onClick={() => handleSort("department")}
                        className="flex items-center gap-2 transition hover:text-blue-200"
                      >
                        Department

                        {sortBy === "department" && (
                          <span className="text-base leading-none text-blue-200">
                            {sortOrder === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </button>
                    </th>

                    <th
                      className={`border-r border-slate-600 px-4 py-3 text-xs font-bold uppercase tracking-wide whitespace-nowrap ${sortBy === "company"
                        ? "bg-blue-800"
                        : ""
                        }`}
                    >
                      <button
                        type="button"
                        onClick={() => handleSort("company")}
                        className="flex items-center gap-2 transition hover:text-blue-200"
                      >
                        Company

                        {sortBy === "company" && (
                          <span className="text-base leading-none text-blue-200">
                            {sortOrder === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </button>
                    </th>

                    <th className="border-r border-slate-600 px-4 py-3 text-xs font-bold uppercase tracking-wide whitespace-nowrap">
                      Extension
                    </th>

                    <th className="border-r border-slate-600 px-4 py-3 text-xs font-bold uppercase tracking-wide whitespace-nowrap">
                      Mobile No.
                    </th>

                    <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide whitespace-nowrap">
                      Email
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan="8"

                        className="px-5 py-14 text-center text-slate-500"
                      >
                        <div className="flex flex-col items-center justify-center gap-3">
                          <div className="h-7 w-7 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>

                          <span className="text-sm font-medium">
                            Loading employees...
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td
                        colSpan="8"
                        className="px-5 py-14 text-center"
                      >
                        <p className="text-sm font-semibold text-red-600">
                          {error}
                        </p>
                      </td>
                    </tr>
                  ) : employees.length === 0 ? (
                    <tr>
                      <td
                        colSpan="8"
                        className="px-5 py-14 text-center text-slate-500"
                      >
                        <p className="text-sm font-semibold">
                          No employees found
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          Try changing your search.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    employees.map((employee, index) => {
                      const search = searchTerm.trim().toLowerCase();

                      const isMatch =
                        search &&
                        (
                          employee.employeeName
                            ?.toLowerCase()
                            .includes(search) ||
                          employee.designation
                            ?.toLowerCase()
                            .includes(search) ||
                          employee.department
                            ?.toLowerCase()
                            .includes(search) ||
                          employee.company
                            ?.toLowerCase()
                            .includes(search) ||
                          employee.extension
                            ?.toLowerCase()
                            .includes(search) ||
                          employee.mobileNo
                            ?.toLowerCase()
                            .includes(search) ||
                          employee.email
                            ?.toLowerCase()
                            .includes(search)
                        );

                      return (
                        <tr
                          key={employee._id}
                          className={`border-b border-slate-200 transition-colors ${isMatch
                            ? "!bg-blue-100 border-l-4 border-l-blue-600 font-semibold"
                            : index % 2 === 0
                              ? "bg-white hover:bg-blue-50"
                              : "bg-slate-50 hover:bg-blue-50"
                            }`}
                        >
                          <td className="border-r border-slate-200 px-4 py-3 text-slate-600 font-medium whitespace-nowrap">
                            {(currentPage - 1) * itemsPerPage + index + 1}
                          </td>

                          <td className="border-r border-slate-200 px-4 py-3 whitespace-nowrap">
                            <span className="font-bold text-slate-900">
                              {employee.employeeName}
                            </span>
                          </td>

                          <td className="border-r border-slate-200 px-4 py-3 text-slate-700">
                            {employee.designation}
                          </td>

                          <td className="border-r border-slate-200 px-4 py-3 text-slate-700">
                            {employee.department}
                          </td>

                          <td className="border-r border-slate-200 px-4 py-3 text-slate-700">
                            {employee.company}
                          </td>

                          <td className="border-r border-slate-200 px-4 py-3 whitespace-nowrap">
                            <span className="inline-flex min-w-[58px] items-center justify-center rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-800">
                              {employee.extension}
                            </span>
                          </td>

                          <td className="border-r border-slate-200 px-4 py-3 whitespace-nowrap">
                            <span className="font-medium text-slate-700">
                              {employee.mobileNo}
                            </span>
                          </td>

                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="font-medium text-slate-700">
                              {employee.email || "-"}
                            </span>
                          </td>
                        </tr>
                      );
                    })

                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {!loading && !error && totalEmployees > 0 && (
              <div className="flex flex-col gap-4 border-t border-slate-300 bg-slate-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

                <p className="text-sm text-slate-600">
                  Showing{" "}
                  <span className="font-bold text-slate-800">
                    {(currentPage - 1) * itemsPerPage + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-bold text-slate-800">
                    {Math.min(
                      currentPage * itemsPerPage,
                      totalEmployees
                    )}
                  </span>{" "}
                  of{" "}
                  <span className="font-bold text-slate-800">
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
                    className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Previous
                  </button>

                  <span className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700">
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() =>
                      setCurrentPage((page) => page + 1)
                    }
                    className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* ================= FOOTER ================= */}
          <div className="mt-5 text-center">
            <p className="text-xs font-medium text-slate-400">
              Gujarat State Petronet Limited • GTL Employee Directory
            </p>
          </div>

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
    <div className="min-h-screen bg-slate-100">

      {/* Top Accent */}
      <div className="h-1.5 bg-blue-800"></div>

      <div className="flex min-h-[calc(100vh-6px)] items-center justify-center px-4 py-10">

        <div className="w-full max-w-md">

          {/* ================= BRANDING ================= */}
          <div className="mb-7 text-center">

            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-800 shadow-md">
              <span className="text-2xl font-extrabold text-white">
                G
              </span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              GTL Employee Directory
            </h1>

            <p className="mt-2 text-sm font-medium text-slate-500">
              Gujarat State Petronet Limited
            </p>

          </div>

          {/* ================= LOGIN CARD ================= */}
          <div className="overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-lg">

            {/* Card Header */}
            <div className="border-b border-slate-200 bg-slate-50 px-7 py-5">
              <h2 className="text-xl font-bold text-slate-900">
                Admin Login
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Sign in using your existing GSPL credentials.
              </p>
            </div>

            {/* Form */}
            <div className="px-7 py-7">

              <form onSubmit={handleLogin} className="space-y-5">

                {/* Username */}
                <div>
                  <label
                    htmlFor="username"
                    className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-600"
                  >
                    Username
                  </label>

                  <div className="relative">

                    <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15.75 6.75a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.5 20.25a7.5 7.5 0 0 1 15 0"
                        />
                      </svg>
                    </div>

                    <input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter username"
                      autoComplete="username"
                      className="w-full rounded-lg border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                    />

                  </div>
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-600"
                  >
                    Password
                  </label>

                  <div className="relative">

                    <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M16.5 10.5V8.25a4.5 4.5 0 0 0-9 0v2.25m-.75 0h10.5A1.5 1.5 0 0 1 18.75 12v7.5A1.5 1.5 0 0 1 17.25 21h-10.5a1.5 1.5 0 0 1-1.5-1.5V12a1.5 1.5 0 0 1 1.5-1.5Z"
                        />
                      </svg>
                    </div>

                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      autoComplete="current-password"
                      className="w-full rounded-lg border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                    />

                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">

                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 text-xs font-bold text-red-600">
                      !
                    </div>

                    <p className="text-sm font-medium text-red-700">
                      {error}
                    </p>

                  </div>
                )}

                {/* Login Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center rounded-lg bg-blue-800 px-4 py-3 font-bold text-white shadow-sm transition hover:bg-blue-900 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"></span>
                      Signing in...
                    </span>
                  ) : (
                    "Sign In"
                  )}
                </button>



              </form>

            </div>
          </div>

          {/* ================= BACK TO DIRECTORY ================= */}
          <div className="mt-6 text-center">

            <button
              type="button"
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50 hover:text-blue-900"
            >
              <span>←</span>
              Back to Employee Directory
            </button>

          </div>

          {/* Footer */}
          <p className="mt-5 text-center text-xs font-medium text-slate-400">
            Gujarat State Petronet Limited • Internal Portal
          </p>

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
    employees: [],
    departments: [],
    companies: [],
  });

  const [selectedSection, setSelectedSection] = useState(null);

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

        setStats(
          response.data?.data || {
            totalEmployees: 0,
            totalDepartments: 0,
            totalCompanies: 0,
            employees: [],
            departments: [],
            companies: [],
          }
        );
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

  const handleSectionClick = (section) => {
    setSelectedSection((currentSection) =>
      currentSection === section ? null : section
    );
  };

  const adminUser = JSON.parse(
    localStorage.getItem("gspl_admin_user") || "{}"
  );

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="border-b border-slate-300 bg-white shadow-sm">
        <div className="h-1.5 bg-blue-800"></div>

        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-5">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => {
                const adminToken = localStorage.getItem("gspl_admin_token");

                if (adminToken) {
                  navigate("/admin/dashboard");
                } else {
                  navigate("/");
                }
              }}
              aria-label="Go to Dashboard"
              className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg bg-blue-800 shadow-sm transition hover:bg-blue-900"
            >
              <span className="text-lg font-extrabold text-white">G</span>
            </button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                GTL Employee Directory
              </h1>

              <p className="mt-1 text-sm font-medium text-slate-500">
                Super Admin Dashboard
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-3 sm:flex">
              <div className="h-9 w-px bg-slate-200"></div>

              <div className="text-right">
                <p className="text-sm font-bold text-slate-800">
                  {adminUser.username || "Admin"}
                </p>

                <p className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-blue-700">
                  Super Admin
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M18 8.25L21.75 12 18 15.75M21.75 12H9"
                />
              </svg>

              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-[1600px] px-6 py-8">
        {/* Page Heading */}
        <div className="mb-7">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-1 text-xs font-bold uppercase tracking-widest text-blue-700">
                Administration
              </p>

              <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                Dashboard
              </h2>

              <p className="mt-1.5 text-sm text-slate-500">
                Manage and monitor the GTL employee directory.
              </p>
            </div>

            <div className="hidden rounded-lg border border-slate-300 bg-white px-4 py-2.5 shadow-sm sm:block">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Access Level
              </p>

              <p className="mt-0.5 text-sm font-bold text-blue-800">
                SUPER ADMIN
              </p>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3.5 shadow-sm">
            <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 text-xs font-bold text-red-600">
              !
            </div>

            <p className="text-sm font-semibold text-red-700">{error}</p>
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {/* Total Employees */}
          <button
            type="button"
            onClick={() => handleSectionClick("employees")}
            className={`rounded-xl border p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${selectedSection === "employees"
              ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100"
              : "border-slate-300 bg-white hover:border-blue-300"
              }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Total Employees
                </p>

                <p className="mt-3 text-4xl font-bold tracking-tight text-slate-900">
                  {loading ? "..." : stats.totalEmployees}
                </p>

                <p className="mt-2 text-xs font-medium text-slate-500">
                  {selectedSection === "employees"
                    ? "Click to hide employee data"
                    : "Click to view employee data"}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-800">
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 19.128a9.38 9.38 0 003.75.872A9.75 9.75 0 0021 19.5M15 19.128v-1.5a3.75 3.75 0 00-3.75-3.75h-4.5A3.75 3.75 0 003 17.628v1.5m12-10.128a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
                  />
                </svg>
              </div>
            </div>
          </button>

          {/* Departments */}
          <button
            type="button"
            onClick={() => handleSectionClick("departments")}
            className={`rounded-xl border p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${selectedSection === "departments"
              ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100"
              : "border-slate-300 bg-white hover:border-blue-300"
              }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Departments
                </p>

                <p className="mt-3 text-4xl font-bold tracking-tight text-slate-900">
                  {loading ? "..." : stats.totalDepartments}
                </p>

                <p className="mt-2 text-xs font-medium text-slate-500">
                  {selectedSection === "departments"
                    ? "Click to hide department data"
                    : "Click to view department data"}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-800">
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 21h18M5.25 21V8.25h13.5V21M8.25 8.25V5.25h7.5v3M9 12h1.5M13.5 12H15M9 15.75h1.5M13.5 15.75H15"
                  />
                </svg>
              </div>
            </div>
          </button>

          {/* Companies */}
          <button
            type="button"
            onClick={() => handleSectionClick("companies")}
            className={`rounded-xl border p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${selectedSection === "companies"
              ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100"
              : "border-slate-300 bg-white hover:border-blue-300"
              }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Companies
                </p>

                <p className="mt-3 text-4xl font-bold tracking-tight text-slate-900">
                  {loading ? "..." : stats.totalCompanies}
                </p>

                <p className="mt-2 text-xs font-medium text-slate-500">
                  {selectedSection === "companies"
                    ? "Click to hide company data"
                    : "Click to view company data"}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-800">
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 21V5.25A2.25 2.25 0 016.75 3h10.5a2.25 2.25 0 012.25 2.25V21M3 21h18M8.25 7.5h1.5M14.25 7.5h1.5M8.25 11.25h1.5M14.25 11.25h1.5M8.25 15h1.5M14.25 15h1.5"
                  />
                </svg>
              </div>
            </div>
          </button>
        </div>

        {/* Employee Data */}
        {selectedSection === "employees" && (
          <div className="mt-6 overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm">
            <div className="border-b border-slate-200 bg-slate-50 px-6 py-5">
              <h3 className="text-lg font-bold text-slate-900">
                Employee Directory
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                All employees currently available in the directory.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-600">
                      Sr. No.
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-600">
                      Employee Name
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-600">
                      Designation
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-600">
                      Department
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-600">
                      Company
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-600">
                      Extension
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-600">
                      Mobile No.
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200 bg-white">
                  {stats.employees?.length > 0 ? (
                    stats.employees.map((employee, index) => (
                      <tr
                        key={employee._id || index}
                        className="hover:bg-slate-50"
                      >
                        <td className="whitespace-nowrap px-5 py-3 text-sm font-semibold text-slate-500">
                          {index + 1}
                        </td>

                        <td className="whitespace-nowrap px-5 py-3 text-sm font-semibold text-slate-900">
                          {employee.employeeName || "-"}
                        </td>

                        <td className="px-5 py-3 text-sm text-slate-700">
                          {employee.designation || "-"}
                        </td>

                        <td className="px-5 py-3 text-sm text-slate-700">
                          {employee.department || "-"}
                        </td>

                        <td className="px-5 py-3 text-sm text-slate-700">
                          {employee.company || "-"}
                        </td>

                        <td className="whitespace-nowrap px-5 py-3 text-sm text-slate-700">
                          {employee.extension || "-"}
                        </td>

                        <td className="whitespace-nowrap px-5 py-3 text-sm text-slate-700">
                          {employee.mobileNo || "-"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="8"
                        className="px-5 py-10 text-center text-sm font-medium text-slate-500"
                      >
                        No employee data available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Department Data */}
        {selectedSection === "departments" && (
          <div className="mt-6 overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm">
            <div className="border-b border-slate-200 bg-slate-50 px-6 py-5">
              <h3 className="text-lg font-bold text-slate-900">
                Departments
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Departments represented in the employee directory.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-600">
                      Sr. No.
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-600">
                      Department
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-600">
                      Employees
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200 bg-white">
                  {stats.departments?.length > 0 ? (
                    stats.departments.map((department, index) => (
                      <tr
                        key={`${department.name}-${index}`}
                        className="hover:bg-slate-50"
                      >
                        <td className="px-6 py-3 text-sm font-semibold text-slate-500">
                          {index + 1}
                        </td>

                        <td className="px-6 py-3 text-sm font-semibold text-slate-900">
                          {department.name || "-"}
                        </td>

                        <td className="px-6 py-3 text-sm font-semibold text-blue-800">
                          {department.employeeCount ?? 0}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="3"
                        className="px-6 py-10 text-center text-sm font-medium text-slate-500"
                      >
                        No department data available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Company Data */}
        {selectedSection === "companies" && (
          <div className="mt-6 overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm">
            <div className="border-b border-slate-200 bg-slate-50 px-6 py-5">
              <h3 className="text-lg font-bold text-slate-900">
                Companies
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Companies represented in the employee directory.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-600">
                      Sr. No.
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-600">
                      Company
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-600">
                      Employees
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200 bg-white">
                  {stats.companies?.length > 0 ? (
                    stats.companies.map((company, index) => (
                      <tr
                        key={`${company.name}-${index}`}
                        className="hover:bg-slate-50"
                      >
                        <td className="px-6 py-3 text-sm font-semibold text-slate-500">
                          {index + 1}
                        </td>

                        <td className="px-6 py-3 text-sm font-semibold text-slate-900">
                          {company.name || "-"}
                        </td>

                        <td className="px-6 py-3 text-sm font-semibold text-blue-800">
                          {company.employeeCount ?? 0}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="3"
                        className="px-6 py-10 text-center text-sm font-medium text-slate-500"
                      >
                        No company data available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-8 overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-slate-50 px-6 py-5">
            <h3 className="text-lg font-bold text-slate-900">
              Quick Actions
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Access commonly used employee directory management functions.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-3">
            {/* View Directory */}
            <button
              type="button"
              onClick={() => navigate("/")}
              className="group flex items-center justify-between rounded-xl border border-slate-300 bg-white p-5 text-left shadow-sm transition hover:border-blue-300 hover:bg-blue-50/40 hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-100 text-slate-700 transition group-hover:bg-blue-100 group-hover:text-blue-800">
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 12s3.5-6.75 9.75-6.75S21.75 12 21.75 12 18.25 18.75 12 18.75 2.25 12 2.25 12z"
                    />
                    <circle cx="12" cy="12" r="2.75" />
                  </svg>
                </div>

                <div>
                  <p className="text-sm font-bold text-slate-900">
                    View Directory
                  </p>

                  <p className="mt-1 text-xs font-medium text-slate-500">
                    Browse the public employee directory
                  </p>
                </div>
              </div>

              <span className="text-lg text-slate-400 transition group-hover:translate-x-1 group-hover:text-blue-700">
                →
              </span>
            </button>

            {/* Manage Employees */}
            <button
              type="button"
              onClick={() => navigate("/admin/employees")}
              className="group flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50/60 p-5 text-left shadow-sm transition hover:border-blue-400 hover:bg-blue-50 hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-800 text-white shadow-sm">
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 19.128a9.38 9.38 0 003.75.872A9.75 9.75 0 0021 19.5M15 19.128v-1.5a3.75 3.75 0 00-3.75-3.75h-4.5A3.75 3.75 0 003 17.628v1.5m12-10.128a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
                    />
                  </svg>
                </div>

                <div>
                  <p className="text-sm font-bold text-slate-900">
                    Manage Employees
                  </p>

                  <p className="mt-1 text-xs font-medium text-slate-500">
                    Add, edit and manage employee records
                  </p>
                </div>
              </div>

              <span className="text-lg text-blue-500 transition group-hover:translate-x-1 group-hover:text-blue-800">
                →
              </span>
            </button>

            {/* Import Excel */}
            <button
              type="button"
              onClick={() => navigate("/admin/import")}
              className="group flex items-center justify-between rounded-xl border border-slate-300 bg-white p-5 text-left shadow-sm transition hover:border-slate-400 hover:bg-slate-50 hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-800 text-white shadow-sm">
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 16.5V3.75M12 3.75L7.5 8.25M12 3.75l4.5 4.5M4.5 14.25v3A2.25 2.25 0 006.75 19.5h10.5a2.25 2.25 0 002.25-2.25v-3"
                    />
                  </svg>
                </div>

                <div>
                  <p className="text-sm font-bold text-slate-900">
                    Import Excel
                  </p>

                  <p className="mt-1 text-xs font-medium text-slate-500">
                    Upload and import employee data
                  </p>
                </div>
              </div>

              <span className="text-lg text-slate-400 transition group-hover:translate-x-1 group-hover:text-slate-700">
                →
              </span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 border-t border-slate-300 pt-5 text-center">
          <p className="text-xs font-medium text-slate-400">
            Gujarat State Petronet Limited • Internal Administration Portal
          </p>
        </div>
      </main>
    </div>
  );
}


function AdminImport() {
  const navigate = useNavigate();
  const editingInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [previewColumns, setPreviewColumns] = useState([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [errorDetails, setErrorDetails] = useState([]);
  const [importResult, setImportResult] = useState(null);
  const [duplicates, setDuplicates] = useState([]);
  const [editingRowIndex, setEditingRowIndex] = useState(null);
  const [editingRowData, setEditingRowData] = useState({});
  const [revalidating, setRevalidating] = useState(false);

  // Intentional duplicate import
  const [selectedDuplicateRows, setSelectedDuplicateRows] = useState([]);
  const [duplicateImportLoading, setDuplicateImportLoading] = useState(false);
  const [replaceTargets, setReplaceTargets] = useState({});

  const token = localStorage.getItem("gspl_admin_token");

  const handleLogout = () => {
    localStorage.removeItem("gspl_admin_token");
    localStorage.removeItem("gspl_admin_user");
    navigate("/admin/login");
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0] || null;

    setFile(selectedFile);
    setPreviewData([]);
    setPreviewColumns([]);
    setImportResult(null);
    setMessage("");
    setError("");
    setErrorDetails([]);

    // Reset duplicate/editing state
    setDuplicates([]);
    setEditingRowIndex(null);
    setEditingRowData({});
    setRevalidating(false);
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

    setDuplicates([]);
    setEditingRowIndex(null);
    setEditingRowData({});
    setRevalidating(false);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const token = localStorage.getItem("gspl_admin_token");

      if (!token) {
        navigate("/admin/login");
        return;
      }

      const response = await api.post(
        "/import/preview",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );


      const responseData = response.data || {};

      setPreviewData(responseData.data || []);
      setPreviewColumns(responseData.columns || []);
      setDuplicates(responseData.duplicates || []);
      setErrorDetails(responseData.invalidRows || []);
      setEditingRowIndex(null);
      setEditingRowData({});

      if ((responseData.duplicates || []).length > 0) {
        setMessage(
          "Preview loaded, but duplicate records were found. Please correct them before importing."
        );
      } else if ((responseData.invalidRows || []).length > 0) {
        setMessage(
          "Preview loaded, but some rows contain validation errors. Please correct them before importing."
        );
      } else {
        setMessage(
          responseData.message || "Excel file preview generated successfully."
        );
      }
    } catch (err) {
      const responseData = err.response?.data || {};

      // Keep preview data even when backend returns 400
      // because duplicate/validation errors should still be visible.
      setPreviewData(responseData.data || []);
      setPreviewColumns(responseData.columns || []);
      setDuplicates(responseData.duplicates || []);
      setErrorDetails(responseData.invalidRows || []);
      setEditingRowIndex(null);
      setEditingRowData({});

      setError(
        responseData.message ||
        err.message ||
        "Failed to preview Excel file."
      );

      setMessage("");
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleStartEdit = (rowIndex) => {
    if (rowIndex < 0 || rowIndex >= previewData.length) {
      return;
    }

    setEditingRowIndex(rowIndex);
    setEditingRowData({ ...previewData[rowIndex] });

    setMessage("");
    setError("");
  };

  useEffect(() => {
    if (editingRowIndex === null) return;

    const rowElement = document.querySelector(
      `[data-preview-row-index="${editingRowIndex}"]`
    );

    rowElement?.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "center",
    });

    editingInputRef.current?.focus({ preventScroll: true });
  }, [editingRowIndex]);

  const handleEditChange = (column, value) => {
    setEditingRowData((previousData) => ({
      ...previousData,
      [column]: value,
    }));
  };

  const handleCancelEdit = () => {
    setEditingRowIndex(null);
    setEditingRowData({});
  };

  const handleRevalidate = async (rowsToValidate) => {
    setRevalidating(true);
    setMessage("");
    setError("");
    setErrorDetails([]);

    try {
      const token = localStorage.getItem("gspl_admin_token");

      if (!token) {
        navigate("/admin/login");
        return false;
      }

      const response = await api.post(
        "/import/validate-corrected",
        {
          rows: rowsToValidate,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );



      const responseData = response.data || {};

      setPreviewData(responseData.data || rowsToValidate);
      setPreviewColumns(responseData.columns || previewColumns);
      setDuplicates(responseData.duplicates || []);
      setErrorDetails(responseData.invalidRows || []);

      if ((responseData.duplicates || []).length > 0) {
        setMessage(
          "Duplicate records still exist. Please correct them before importing."
        );
        return false;
      }

      if ((responseData.invalidRows || []).length > 0) {
        setMessage(
          "Some rows still contain validation errors. Please correct them before importing."
        );
        return false;
      }

      setMessage(
        responseData.message ||
        "Data corrected and revalidated successfully. You can now import."
      );

      return true;
    } catch (err) {
      const responseData = err.response?.data || {};

      setPreviewData(responseData.data || rowsToValidate);
      setPreviewColumns(responseData.columns || previewColumns);
      setDuplicates(responseData.duplicates || []);
      setErrorDetails(responseData.invalidRows || []);

      setError(
        responseData.message ||
        err.message ||
        "Failed to revalidate corrected data."
      );

      return false;
    } finally {
      setRevalidating(false);
    }
  };

  const handleSaveCorrection = async () => {
    if (editingRowIndex === null) {
      return;
    }

    const updatedRows = [...previewData];

    updatedRows[editingRowIndex] = {
      ...editingRowData,
    };

    setPreviewData(updatedRows);

    setEditingRowIndex(null);
    setEditingRowData({});

    await handleRevalidate(updatedRows);
  };

  const handleImport = async () => {
    if (!previewData || previewData.length === 0) {
      setError("Please preview an Excel file before importing.");
      return;
    }

    if (duplicates.length > 0) {
      setError(
        "Import is blocked because duplicate records still exist. Please correct all duplicates first."
      );
      return;
    }

    if (errorDetails.length > 0) {
      setError(
        "Import is blocked because some rows still contain validation errors. Please correct them first."
      );
      return;
    }

    if (editingRowIndex !== null) {
      setError("Please save or cancel the current row edit before importing.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to import the corrected employee data?"
    );

    if (!confirmed) {
      return;
    }

    setImportLoading(true);
    setMessage("");
    setError("");
    setImportResult(null);

    try {
      const token = localStorage.getItem("gspl_admin_token");

      if (!token) {
        navigate("/admin/login");
        return;
      }

      const response = await api.post(
        "/import/import-corrected",
        {
          rows: previewData,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const responseData = response.data || {};

      setImportResult(responseData);

      setMessage(
        responseData.message || "Employee data imported successfully."
      );

      // Clear the current upload after successful import
      setFile(null);
      setPreviewData([]);
      setPreviewColumns([]);
      setDuplicates([]);
      setErrorDetails([]);
      setEditingRowIndex(null);
      setEditingRowData({});

      const fileInput = document.getElementById("excel-file");

      if (fileInput) {
        fileInput.value = "";
      }
    } catch (err) {
      const responseData = err.response?.data || {};

      // Keep corrected data visible if backend blocks the import
      setPreviewData(responseData.data || previewData);
      setPreviewColumns(responseData.columns || previewColumns);
      setDuplicates(responseData.duplicates || []);
      setErrorDetails(responseData.invalidRows || []);

      setError(
        responseData.message ||
        err.message ||
        "Failed to import employee data."
      );
    } finally {
      setImportLoading(false);
    }
  };

  const getDuplicateRowIndexes = () => {
    const indexes = new Set();

    duplicates.forEach((duplicate) => {
      if (Array.isArray(duplicate.rows)) {
        duplicate.rows.forEach((rowNumber) => {
          const rowIndex = Number(rowNumber) - 2;

          if (rowIndex >= 0 && rowIndex < previewData.length) {
            indexes.add(rowIndex);
          }
        });
      }

      if (duplicate.row !== undefined && duplicate.row !== null) {
        const rowIndex = Number(duplicate.row) - 2;

        if (rowIndex >= 0 && rowIndex < previewData.length) {
          indexes.add(rowIndex);
        }
      }
    });

    return indexes;
  };

  const duplicateRowIndexes = getDuplicateRowIndexes();

  // ================= INTENTIONAL DUPLICATE SELECTION =================

  const toggleDuplicateRow = (rowIndex) => {
    setSelectedDuplicateRows((previousRows) => {
      if (previousRows.includes(rowIndex)) {
        return previousRows.filter((index) => index !== rowIndex);
      }

      return [...previousRows, rowIndex];
    });
  };

  const toggleSelectAllDuplicates = () => {
    const allDuplicateIndexes = Array.from(duplicateRowIndexes);

    if (
      allDuplicateIndexes.length > 0 &&
      selectedDuplicateRows.length === allDuplicateIndexes.length
    ) {
      setSelectedDuplicateRows([]);
    } else {
      setSelectedDuplicateRows(allDuplicateIndexes);
    }
  };

  const handleReplaceSelectedDuplicates = async (selectedDuplicateIndexes) => {
    if (!Array.isArray(selectedDuplicateIndexes) || selectedDuplicateIndexes.length === 0) {
      setError("Select at least one duplicate row to replace.");
      return;
    }
    const selectedIndexes = new Set(selectedDuplicateIndexes.filter((index) => duplicateRowIndexes.has(index)));
    if (!selectedIndexes.size) {
      setError("Select at least one duplicate row to replace.");
      return;
    }
    const replaceMappings = {};
    for (const index of selectedIndexes) {
      const targetId = replaceTargets[index];
      if (!targetId) {
        setError(`Select the existing employee to replace for Excel row ${index + 2}. Rows that only duplicate other Excel rows must be corrected or imported using the intentional duplicate option.`);
        return;
      }
      replaceMappings[String(index + 2)] = targetId;
    }

    const rowsToImport = previewData.filter((_, index) => !duplicateRowIndexes.has(index) || selectedIndexes.has(index));
    const rowNumbers = previewData.map((_, index) => index + 2).filter((_, index) => !duplicateRowIndexes.has(index) || selectedIndexes.has(index));
    const confirmed = window.confirm(
      `Process ${rowsToImport.length} row(s)?\n\n` +
      `${previewData.length - duplicateRowIndexes.size} non-duplicate row(s) will be imported, and ${selectedIndexes.size} selected existing employee record(s) will be replaced.\n\nThis overwrites the selected employee details, including clearing email if the Excel email is blank. Continue?`
    );
    if (!confirmed) return;

    setDuplicateImportLoading(true);
    setMessage("");
    setError("");
    setImportResult(null);
    try {
      const token = localStorage.getItem("gspl_admin_token");
      if (!token) {
        navigate("/admin/login");
        return;
      }
      const response = await api.post("/import/import-duplicates", {
        rows: rowsToImport,
        rowNumbers,
        replaceMappings,
        forceDuplicateImport: true,
      }, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      const responseData = response.data || {};
      setImportResult(responseData);
      setMessage(responseData.message || "Excel processing completed.");
      setPreviewData([]);
      setPreviewColumns([]);
      setDuplicates([]);
      setSelectedDuplicateRows([]);
      setReplaceTargets({});
      setFile(null);
    } catch (err) {
      const responseData = err.response?.data || {};
      setDuplicates(responseData.duplicates || duplicates);
      setError(responseData.message || err.message || "Failed to replace duplicate employee records.");
    } finally {
      setDuplicateImportLoading(false);
    }
  };

  const handleImportSelectedDuplicates = async (
    selectedDuplicateIndexes
  ) => {
    if (
      !Array.isArray(selectedDuplicateIndexes) ||
      selectedDuplicateIndexes.length === 0
    ) {
      setError("Please select at least one duplicate row to upload.");
      return;
    }

    const selectedIndexes = new Set(
      selectedDuplicateIndexes.filter((index) =>
        duplicateRowIndexes.has(index)
      )
    );

    if (selectedIndexes.size === 0) {
      setError("Please select at least one duplicate row to upload.");
      return;
    }

    // Import all non-duplicate rows plus only the selected duplicate rows.
    const rowsToImport = previewData.filter(
      (_, index) =>
        !duplicateRowIndexes.has(index) || selectedIndexes.has(index)
    );

    const nonDuplicateCount =
      previewData.length - duplicateRowIndexes.size;
    const selectedCount = selectedIndexes.size;

    const confirmed = window.confirm(
      `You are about to import ${rowsToImport.length} employee record(s).\n\n` +
      `Intentional duplicates selected: ${selectedCount}\n` +
      `Non-duplicate records included: ${nonDuplicateCount}\n\n` +
      `Selected duplicates will be saved as separate employee records. ` +
      `All non-duplicate rows will also be imported.\n\nContinue?`
    );

    if (!confirmed) return;

    setDuplicateImportLoading(true);
    setMessage("");
    setError("");
    setImportResult(null);

    try {
      const token = localStorage.getItem("gspl_admin_token");

      if (!token) {
        navigate("/admin/login");
        return;
      }

      const response = await api.post(
        "/import/import-duplicates",
        {
          rows: rowsToImport,
          forceDuplicateImport: true,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const responseData = response.data || {};

      setImportResult({
        ...responseData,
        duplicateCount: 0,
        duplicates: [],
      });

      setMessage(
        `Import successful: ${responseData.importedCount} record(s) imported, ` +
        `including ${selectedCount} intentionally selected duplicate(s) ` +
        `and ${nonDuplicateCount} non-duplicate record(s).`
      );

      // Clear the completed upload to reduce accidental repeat imports.
      setFile(null);
      setPreviewData([]);
      setPreviewColumns([]);
      setDuplicates([]);
      setErrorDetails([]);
      setSelectedDuplicateRows([]);
      setEditingRowIndex(null);
      setEditingRowData({});

      const fileInput = document.getElementById("excel-file-input");
      if (fileInput) fileInput.value = "";
    } catch (err) {
      const responseData = err.response?.data || {};

      setError(
        responseData.message ||
        err.message ||
        "Failed to import employee records."
      );

      setPreviewData(responseData.data || previewData);
      setDuplicates(responseData.duplicates || duplicates);
      setErrorDetails(responseData.invalidRows || errorDetails);
    } finally {
      setDuplicateImportLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      {/* ================= HEADER ================= */}
      <header className="border-b border-slate-300 bg-white shadow-sm">
        <div className="h-1.5 bg-blue-800"></div>

        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                const adminToken = localStorage.getItem("gspl_admin_token");

                if (adminToken) {
                  navigate("/admin/dashboard");
                } else {
                  navigate("/");
                }
              }}
              aria-label="Go to Dashboard"
              className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg bg-blue-800 shadow-sm transition hover:bg-blue-900"
            >
              <span className="text-lg font-extrabold text-white">G</span>
            </button>

            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                GTL Employee Directory
              </h1>

              <p className="mt-0.5 text-xs font-medium text-slate-500">
                Excel Employee Import
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M18 8.25L21.75 12 18 15.75M21.75 12H9"
              />
            </svg>

            Logout
          </button>
        </div>
      </header>

      {/* ================= MAIN ================= */}
      <main className="mx-auto max-w-[1400px] px-5 py-6 sm:px-6">
        {/* Top navigation */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => navigate("/admin/dashboard")}
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 transition hover:text-blue-800"
          >
            <span className="text-lg">←</span>
            Dashboard
          </button>

          <span className="text-slate-300">/</span>

          <button
            type="button"
            onClick={() => navigate("/admin/employees")}
            className="text-sm font-bold text-slate-600 transition hover:text-blue-800"
          >
            Employees
          </button>

          <span className="text-slate-300">/</span>

          <span className="text-sm font-semibold text-blue-800">
            Import Excel
          </span>
        </div>

        {/* Page heading */}
        <div className="mb-5">
          <div className="mb-2 h-1 w-16 rounded-full bg-blue-700"></div>

          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Import Employee Data
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Upload an Excel file, review the data, and import employee
            records into the directory.
          </p>
        </div>

        {/* ================= UPLOAD CARD ================= */}
        <section className="overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-slate-50 px-5 py-4 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-800">
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 16V4m0 0L8 8m4-4 4 4"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 14v4a2 2 0 002 2h10a2 2 0 002-2v-4"
                  />
                </svg>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  Upload Excel File
                </h3>

                <p className="text-xs text-slate-500">
                  Select an .xlsx or .xls employee data file
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-6">
            {/* Required columns */}
            <div className="mb-5 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
              <p className="text-xs font-bold uppercase tracking-wide text-blue-800">
                Required Excel Columns
              </p>

              <p className="mt-1 text-sm font-medium text-blue-700">
                Employee Name, Designation, Department, Company,
                Extension, Mobile No
              </p>

              <p className="mt-1 text-xs font-medium text-blue-600">
                Email is optional.
              </p>
            </div>

            <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
              {/* File input */}
              <div className="flex-1">
                <label
                  htmlFor="excel-file-input"
                  className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-600"
                >
                  Select Excel File
                </label>

                <input
                  id="excel-file-input"
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  className="block w-full cursor-pointer rounded-lg border border-slate-300 bg-white text-sm text-slate-700 file:mr-4 file:border-0 file:border-r file:border-slate-300 file:bg-slate-50 file:px-4 file:py-2.5 file:text-sm file:font-bold file:text-slate-700 hover:file:bg-slate-100"
                />
              </div>

              {/* Preview button */}
              <button
                type="button"
                onClick={handlePreview}
                disabled={!file || previewLoading}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-800 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {previewLoading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-white"></span>
                    Generating Preview...
                  </>
                ) : (
                  <>
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.25 12s3.75-6.75 9.75-6.75S21.75 12 21.75 12 18 18.75 12 18.75 2.25 12 2.25 12z"
                      />
                      <circle cx="12" cy="12" r="2.5" />
                    </svg>

                    Preview Excel
                  </>
                )}
              </button>
            </div>

            {/* Selected file */}
            {file && (
              <div className="mt-4 flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-700">
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M14 2v6h6M8 13h8M8 17h6"
                    />
                  </svg>
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Selected File
                  </p>

                  <p className="truncate text-sm font-semibold text-slate-800">
                    {file.name}
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ================= MESSAGES ================= */}
        {message && (
          <div className="mt-4 flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3">
            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-700">
              ✓
            </div>

            <p className="text-sm font-semibold text-green-700">
              {message}
            </p>
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-4">
            <div className="flex items-start gap-3">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 text-xs font-bold text-red-700">
                !
              </div>

              <div>
                <p className="text-sm font-semibold text-red-700">
                  {error}
                </p>
              </div>
            </div>

            {errorDetails?.length > 0 && (
              <div className="mt-3 space-y-2 border-t border-red-200 pt-3">
                <p className="text-xs font-bold uppercase tracking-wide text-red-700">
                  Validation Details
                </p>

                {errorDetails.map((item, index) => (
                  <div
                    key={index}
                    className="rounded-lg border border-red-200 bg-white p-3"
                  >
                    <p className="text-sm font-bold text-red-800">
                      Excel Row {item.row}
                      {item.employeeName
                        ? ` — ${item.employeeName}`
                        : ""}
                    </p>

                    {item.missingFields?.length > 0 && (
                      <p className="mt-1 text-sm text-red-700">
                        Missing:{" "}
                        {item.missingFields.join(", ")}
                      </p>
                    )}

                    {item.invalidFields?.length > 0 && (
                      <ul className="mt-1 list-disc pl-5 text-sm text-red-700">
                        {item.invalidFields.map(
                          (field, fieldIndex) => (
                            <li key={fieldIndex}>
                              {field}
                            </li>
                          )
                        )}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= PREVIEW ================= */}
        {previewData.length > 0 && (
          <section className="mt-5 overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"></div>


            {duplicates.length > 0 && (
              <div className="border-b border-red-200 bg-red-50 p-5">
                <div className="mb-4">

                  <h3 className="text-lg font-semibold text-red-800">
                    Duplicate Records Found
                  </h3>

                  <p className="mt-1 text-sm text-red-700">
                    Review duplicate records. You can correct them or explicitly
                    choose to import selected duplicates as separate employee records.
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-700">
                      <input
                        type="checkbox"
                        checked={
                          duplicateRowIndexes.size > 0 &&
                          selectedDuplicateRows.length === duplicateRowIndexes.size
                        }
                        onChange={toggleSelectAllDuplicates}
                        disabled={
                          duplicateImportLoading ||
                          importLoading ||
                          revalidating ||
                          duplicateRowIndexes.size === 0
                        }
                        className="h-4 w-4 rounded border-slate-300"
                      />
                      Select All Duplicates ({duplicateRowIndexes.size})
                    </label>

                    <button
                      type="button"
                      onClick={() => handleReplaceSelectedDuplicates(selectedDuplicateRows)}
                      disabled={selectedDuplicateRows.length === 0 || duplicateImportLoading || importLoading || revalidating || editingRowIndex !== null}
                      className="rounded-lg bg-blue-800 px-4 py-2 text-sm font-bold text-white hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Replace Selected Existing Records
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleImportSelectedDuplicates(selectedDuplicateRows)
                      }
                      disabled={
                        selectedDuplicateRows.length === 0 ||
                        duplicateImportLoading ||
                        importLoading ||
                        revalidating ||
                        editingRowIndex !== null
                      }
                      className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-bold text-white hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {duplicateImportLoading
                        ? "Uploading Duplicates..."
                        : `Upload Selected Duplicates (${selectedDuplicateRows.length})`}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleImportSelectedDuplicates(
                          Array.from(duplicateRowIndexes)
                        )
                      }
                      disabled={
                        duplicateRowIndexes.size === 0 ||
                        duplicateImportLoading ||
                        importLoading ||
                        revalidating ||
                        editingRowIndex !== null
                      }
                      className="rounded-lg bg-red-700 px-4 py-2 text-sm font-bold text-white hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Upload All Duplicates ({duplicateRowIndexes.size})
                    </button>
                  </div>

                </div>

                <div className="space-y-3">
                  {duplicates.map((duplicate, index) => {
                    const duplicateRows = Array.isArray(duplicate.rows)
                      ? duplicate.rows
                      : duplicate.row !== undefined
                        ? [duplicate.row]
                        : [];

                    return (
                      <div
                        key={`${duplicate.field || "duplicate"}-${duplicate.value || ""}-${index}`}
                        className="rounded-lg border border-red-200 bg-white p-4"
                      >
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                          <div>
                            <p className="font-semibold text-slate-800">
                              {duplicate.message ||
                                `Duplicate ${duplicate.field || "value"} found`}
                            </p>

                            {duplicate.field && (
                              <p className="mt-1 text-sm text-slate-600">
                                <span className="font-medium">Field:</span>{" "}
                                {duplicate.field}
                              </p>
                            )}

                            {duplicate.value !== undefined &&
                              duplicate.value !== null &&
                              duplicate.value !== "" && (
                                <p className="text-sm text-slate-600">
                                  <span className="font-medium">Value:</span>{" "}
                                  {String(duplicate.value)}
                                </p>
                              )}

                            {duplicateRows.length > 0 && (
                              <p className="text-sm text-slate-600">
                                <span className="font-medium">Excel row(s):</span>{" "}
                                {duplicateRows.join(", ")}
                              </p>
                            )}

                            {duplicate.existingEmployee && (
                              <p className="mt-1 text-sm text-slate-600">
                                <span className="font-medium">Existing employee:</span>{" "}
                                {duplicate.existingEmployee.employeeName || duplicate.existingEmployee.name || "Already exists in database"}
                              </p>
                            )}
                            {duplicate.type === "database" && Array.isArray(duplicate.matchingEmployees) && duplicate.matchingEmployees.length > 0 && duplicate.row !== undefined && (
                              <div className="mt-3 max-w-xl">
                                <label htmlFor={`replace-target-${duplicate.row}`} className="mb-1 block text-xs font-bold text-slate-700">Existing employee to replace for row {duplicate.row}</label>
                                <select
                                  id={`replace-target-${duplicate.row}`}
                                  value={replaceTargets[Number(duplicate.row) - 2] || ""}
                                  onChange={(event) => setReplaceTargets((previous) => ({ ...previous, [Number(duplicate.row) - 2]: event.target.value }))}
                                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
                                >
                                  <option value="">Choose matching employee...</option>
                                  {duplicate.matchingEmployees.map((employee) => (
                                    <option key={employee._id} value={employee._id}>{employee.employeeName} — {employee.company || "No company"} — Ext. {employee.extension || "—"} — {employee.mobileNo || "—"}</option>
                                  ))}
                                </select>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {duplicateRows.map((rowNumber) => {
                              const rowIndex = Number(rowNumber) - 2;

                              if (
                                rowIndex < 0 ||
                                rowIndex >= previewData.length
                              ) {
                                return null;
                              }

                              return (
                                <button
                                  key={`edit-${rowNumber}`}
                                  type="button"
                                  onClick={() => handleStartEdit(rowIndex)}
                                  disabled={
                                    editingRowIndex !== null ||
                                    revalidating ||
                                    importLoading
                                  }
                                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  Edit Row {rowNumber}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
                  <p className="text-sm font-medium text-amber-800">
                    Import is blocked until all duplicate records are corrected
                    and successfully revalidated.
                  </p>
                </div>
              </div>
            )}
            <div className="flex flex-col gap-4 border-b border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div>
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-800">
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 5h18M3 12h18M3 19h18"
                      />
                    </svg>
                  </div>

                  <h3 className="text-sm font-bold text-slate-800">
                    Excel Preview
                  </h3>
                </div>

                <p className="mt-1 text-xs text-slate-500">
                  Review the imported rows before confirming.
                </p>
              </div>

              <button
                type="button"
                onClick={handleImport}
                disabled={
                  importLoading ||
                  revalidating ||
                  editingRowIndex !== null ||
                  duplicates.length > 0 ||
                  errorDetails.length > 0
                }
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-green-700 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {importLoading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-green-300 border-t-white"></span>
                    Importing...
                  </>
                ) : (
                  <>
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 12.5 9.5 17 19 7"
                      />
                    </svg>

                    Confirm Import
                  </>
                )}
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-700 text-white">
                  <tr>
                    <th className="whitespace-nowrap px-4 py-3 text-xs font-bold uppercase tracking-wide">
                      Select Duplicate
                    </th>
                    {previewColumns.map((column) => (
                      <th
                        key={column}
                        className="whitespace-nowrap border-r border-slate-600 px-4 py-3 text-xs font-bold uppercase tracking-wide last:border-r-0"
                      >
                        {column}
                      </th>
                    ))}
                    <th className="whitespace-nowrap px-4 py-3 text-xs font-bold uppercase tracking-wide">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200">
                  {previewData.map((row, index) => {
                    const isEditing = editingRowIndex === index;
                    const isDuplicate = duplicateRowIndexes.has(index);

                    return (
                      <tr
                        key={index}
                        data-preview-row-index={index}
                        className={
                          isEditing
                            ? "bg-blue-100 ring-2 ring-inset ring-blue-500"
                            : isDuplicate
                              ? "bg-red-50"
                              : index % 2 === 0
                                ? "bg-white"
                                : "bg-slate-50"
                        }
                      >


                        <td className="whitespace-nowrap border-r border-slate-200 px-4 py-3">
                          {isDuplicate ? (
                            <input
                              type="checkbox"
                              checked={selectedDuplicateRows.includes(index)}
                              onChange={() => toggleDuplicateRow(index)}
                              disabled={
                                duplicateImportLoading ||
                                importLoading ||
                                revalidating ||
                                editingRowIndex !== null
                              }
                              aria-label={`Select duplicate employee row ${index + 2}`}
                              className="h-4 w-4 rounded border-slate-300"
                            />
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>


                        {previewColumns.map((column, columnIndex) => (
                          <td
                            key={column}
                            className="whitespace-nowrap border-r border-slate-200 px-4 py-3 text-slate-700 last:border-r-0"
                          >
                            {isEditing ? (
                              <input
                                ref={columnIndex === 0 ? editingInputRef : null}
                                type="text"
                                value={
                                  editingRowData[column] !== undefined
                                    ? String(editingRowData[column])
                                    : ""
                                }
                                onChange={(event) =>
                                  handleEditChange(column, event.target.value)
                                }
                                className="w-full min-w-[160px] rounded-md border border-blue-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                              />
                            ) : (
                              <span>{row[column] ?? ""}</span>
                            )}
                          </td>
                        ))}

                        <td className="whitespace-nowrap px-4 py-3">
                          {isEditing ? (
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={handleSaveCorrection}
                                disabled={revalidating}
                                className="rounded-md bg-green-600 px-3 py-2 text-xs font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {revalidating ? "Saving..." : "Save"}
                              </button>

                              <button
                                type="button"
                                onClick={handleCancelEdit}
                                disabled={revalidating}
                                className="rounded-md bg-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : isDuplicate ? (
                            <button
                              type="button"
                              onClick={() => handleStartEdit(index)}
                              disabled={
                                editingRowIndex !== null ||
                                revalidating ||
                                importLoading
                              }
                              className="rounded-md bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Edit
                            </button>
                          ) : (
                            <span className="text-xs text-slate-400">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="border-t border-slate-200 bg-slate-50 px-5 py-3">
              <p className="text-xs font-medium text-slate-500">
                Showing all {previewData.length} rows from the Excel file.
              </p>
            </div>
          </section>
        )}

        {/* ================= IMPORT RESULT ================= */}
        {importResult && (
          <section className="mt-5 overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm">
            <div className="border-b border-slate-200 bg-slate-50 px-5 py-4 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-100 text-green-700">
                  ✓
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-800">
                    Import Result
                  </h3>

                  <p className="text-xs text-slate-500">
                    Summary of the completed Excel import.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-green-700">
                    Imported
                  </p>

                  <p className="mt-1 text-3xl font-extrabold text-green-800">
                    {importResult.importedCount}
                  </p>
                </div>

                <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-yellow-700">
                    Duplicates Skipped
                  </p>

                  <p className="mt-1 text-3xl font-extrabold text-yellow-800">
                    {importResult.duplicateCount}
                  </p>
                </div>
              </div>

              {importResult.duplicates?.length > 0 && (
                <div className="mt-5">
                  <h4 className="text-sm font-bold text-slate-800">
                    Duplicate Records
                  </h4>

                  <div className="mt-2 overflow-hidden rounded-lg border border-slate-200">
                    <ul className="divide-y divide-slate-200">
                      {importResult.duplicates.map(
                        (duplicate, index) => (
                          <li
                            key={index}
                            className="px-4 py-3 text-sm text-slate-700"
                          >
                            <span className="font-semibold">
                              {duplicate.employeeName}
                            </span>

                            <span className="mx-2 text-slate-300">
                              •
                            </span>

                            <span className="text-slate-500">
                              {duplicate.company}
                            </span>
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Footer */}
        <div className="mt-6 border-t border-slate-300 pt-4 text-center">
          <p className="text-[11px] font-medium text-slate-400">
            Gujarat State Petronet Limited • Internal Administration Portal
          </p>
        </div>
      </main>
    </div>
  );
}
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicDirectory />} />

        <Route
          path="/admin/login"
          element={<AdminLogin />}
        />

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/import"
          element={
            <ProtectedRoute>
              <AdminImport />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/employees"
          element={
            <ProtectedRoute>
              <AdminEmployees />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/employees/add"
          element={
            <ProtectedRoute>
              <AddEmployee />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/employees/edit/:id"
          element={
            <ProtectedRoute>
              <EditEmployee />
            </ProtectedRoute>
          } />

        <Route
          path="/admin/change-password"
          element={
            <ProtectedRoute>
              <ChangePassword />
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
