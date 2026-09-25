import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function AdminEmployees() {
  const navigate = useNavigate();

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("employeeName");
  const [sortOrder, setSortOrder] = useState("asc");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEmployees, setTotalEmployees] = useState(0);

  const itemsPerPage = 10;

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/employees`,
        {
          params: {
            search: searchTerm,
            sortBy,
            sortOrder,
            page: currentPage,
            limit: itemsPerPage,
          },
        }
      );

      setEmployees(response.data?.data || []);
      setTotalPages(response.data?.totalPages || 1);
      setTotalEmployees(response.data?.totalEmployees || 0);
    } catch (error) {
      console.error("Failed to fetch employees:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("gspl_admin_token");
        localStorage.removeItem("gspl_admin_user");
        navigate("/admin/login");
        return;
      }

      setError("Unable to load employees.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEmployees();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, sortBy, sortOrder, currentPage]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder((previousOrder) =>
        previousOrder === "asc" ? "desc" : "asc"
      );
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }

    setCurrentPage(1);
  };

  const getSortArrow = (field) => {
    if (sortBy !== field) {
      return "";
    }

    return sortOrder === "asc" ? " ↑" : " ↓";
  };

  const handleLogout = () => {
    localStorage.removeItem("gspl_admin_token");
    localStorage.removeItem("gspl_admin_user");
    navigate("/admin/login");
  };

  const handleBackToDashboard = () => {
    navigate("/admin/dashboard");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-slate-900 text-white shadow">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-xl font-bold">
              GSPL Employee Directory
            </h1>

            <p className="text-sm text-slate-300">
              Employee Management
            </p>
          </div>

          <button
  onClick={handleLogout}
  className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium hover:bg-red-600"
>
  Logout
</button>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Top section */}
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              Manage Employees
            </h2>

            <p className="mt-1 text-sm text-gray-600">
              View and manage employee directory records.
            </p>
          </div>

          <button
            onClick={handleBackToDashboard}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            ← Dashboard
          </button>
        </div>

        {/* Search */}
        <div className="mb-6 rounded-xl bg-white p-5 shadow-sm">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Search Employees
          </label>

          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search by name, designation, department, company, extension or mobile..."
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Employee count */}
        <div className="mb-4 text-sm text-gray-600">
          Total Employees:{" "}
          <span className="font-semibold text-slate-800">
            {totalEmployees}
          </span>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl bg-white shadow-sm">
          {loading ? (
            <div className="p-10 text-center text-gray-500">
              Loading employees...
            </div>
          ) : employees.length === 0 ? (
            <div className="p-10 text-center text-gray-500">
              No employees found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-800 text-white">
                  <tr>
                    <th className="px-4 py-3 text-left">Sr. No.</th>

                    <th
                      onClick={() => handleSort("employeeName")}
                      className="cursor-pointer whitespace-nowrap px-4 py-3 text-left hover:bg-slate-700"
                    >
                      Employee Name{getSortArrow("employeeName")}
                    </th>

                    <th
                      onClick={() => handleSort("designation")}
                      className="cursor-pointer whitespace-nowrap px-4 py-3 text-left hover:bg-slate-700"
                    >
                      Designation{getSortArrow("designation")}
                    </th>

                    <th
                      onClick={() => handleSort("department")}
                      className="cursor-pointer whitespace-nowrap px-4 py-3 text-left hover:bg-slate-700"
                    >
                      Department{getSortArrow("department")}
                    </th>

                    <th
                      onClick={() => handleSort("company")}
                      className="cursor-pointer whitespace-nowrap px-4 py-3 text-left hover:bg-slate-700"
                    >
                      Company{getSortArrow("company")}
                    </th>

                    <th className="whitespace-nowrap px-4 py-3 text-left">
                      Extension
                    </th>

                    <th className="whitespace-nowrap px-4 py-3 text-left">
                      Mobile No.
                    </th>

                    <th className="whitespace-nowrap px-4 py-3 text-center">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  {employees.map((employee, index) => (
                    <tr
                      key={employee._id}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-4 py-3">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </td>

                      <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-800">
                        {employee.employeeName}
                      </td>

                      <td className="px-4 py-3">
                        {employee.designation}
                      </td>

                      <td className="px-4 py-3">
                        {employee.department}
                      </td>

                      <td className="px-4 py-3">
                        {employee.company}
                      </td>

                      <td className="px-4 py-3">
                        {employee.extension}
                      </td>

                      <td className="px-4 py-3">
                        {employee.mobileNo}
                      </td>

                      <td className="px-4 py-3 text-center">
                        <button
  onClick={() => {
  navigate(`/admin/employees/edit/${employee._id}`);
}}
  className="rounded-lg bg-slate-800 px-3 py-2 text-xs font-medium text-white hover:bg-slate-700"
>
  Edit
</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {!loading && employees.length > 0 && (
          <div className="mt-5 flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="text-sm text-gray-600">
              Showing{" "}
              {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(
                currentPage * itemsPerPage,
                totalEmployees
              )}{" "}
              of {totalEmployees} employees
            </p>

            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() =>
                  setCurrentPage((page) => Math.max(page - 1, 1))
                }
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>

              <span className="px-3 text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>

              <button
                disabled={currentPage === totalPages}
                onClick={() =>
                  setCurrentPage((page) =>
                    Math.min(page + 1, totalPages)
                  )
                }
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default AdminEmployees;