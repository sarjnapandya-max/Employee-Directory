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

  const [selectedEmployees, setSelectedEmployees] = useState([]);

  const [deletingSelected, setDeletingSelected] = useState(false);



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



  const handleSelectEmployee = (employeeId) => {

    setSelectedEmployees((previousSelected) =>

      previousSelected.includes(employeeId)

        ? previousSelected.filter((id) => id !== employeeId)

        : [...previousSelected, employeeId]

    );

  };



  const handleSelectAll = () => {

    const currentPageIds = employees.map((employee) => employee._id);



    const allCurrentPageSelected = currentPageIds.every((id) =>

      selectedEmployees.includes(id)

    );



    if (allCurrentPageSelected) {

      setSelectedEmployees((previousSelected) =>

        previousSelected.filter((id) => !currentPageIds.includes(id))

      );

    } else {

      setSelectedEmployees((previousSelected) => [

        ...new Set([...previousSelected, ...currentPageIds]),

      ]);

    }

  };



  const handleDeleteSelected = async () => {

    const confirmed = window.confirm(

      `Are you sure you want to permanently delete ${selectedEmployees.length} selected employee${selectedEmployees.length > 1 ? "s" : ""

      }? This action cannot be undone.`

    );



    if (!confirmed) {

      return;

    }



    try {

      setDeletingSelected(true);

      setError("");



      const token = localStorage.getItem("gspl_admin_token");



      if (!token) {

        navigate("/admin/login");

        return;

      }



      const response = await axios.delete(

        `${import.meta.env.VITE_API_URL}/employees/bulk-delete`,

        {

          data: {

            ids: selectedEmployees,

          },

          headers: {

            Authorization: `Bearer ${token}`,

          },

        }

      );



      alert(

        response.data?.message ||

        "Selected employees deleted successfully."

      );



      setSelectedEmployees([]);



      if (

        employees.length > 0 &&

        selectedEmployees.length === employees.length &&

        currentPage > 1

      ) {

        setCurrentPage((page) => page - 1);

      } else {

        fetchEmployees();

      }



    } catch (error) {

      console.error("Failed to delete selected employees:", error);



      if (error.response?.status === 401) {

        localStorage.removeItem("gspl_admin_token");

        localStorage.removeItem("gspl_admin_user");

        navigate("/admin/login");

        return;

      }



      alert(

        error.response?.data?.message ||

        "Failed to delete selected employees."

      );

    } finally {

      setDeletingSelected(false);

    }

  };





  const isAllCurrentPageSelected =

    employees.length > 0 &&

    employees.every((employee) =>

      selectedEmployees.includes(employee._id)

    );



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

    <div className="min-h-screen bg-slate-100">

      {/* Header */}

      <header className="border-b border-slate-300 bg-white shadow-sm">

        <div className="h-1.5 bg-blue-800"></div>



        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-4">

          <div className="flex items-center gap-3">

            <button

              type="button"

              onClick={() => navigate("/admin/dashboard")}

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

                Employee Management

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



      {/* Main */}

      <main className="mx-auto max-w-[1600px] px-6 py-5">

        {/* Title + Actions */}

        <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

          <div>

            <h2 className="text-2xl font-bold tracking-tight text-slate-900">

              Manage Employees

            </h2>



            <p className="mt-0.5 text-xs text-slate-500">

              View and manage employee directory records.

            </p>

          </div>



          <div className="flex flex-wrap items-center gap-2">

            {/* Total Employees */}

            <div className="flex h-10 items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3">

              <div className="flex h-7 min-w-7 items-center justify-center rounded-md bg-blue-800 px-1.5 text-xs font-bold text-white">

                {totalEmployees}

              </div>



              <span className="text-xs font-bold text-blue-800">

                Total Employees

              </span>

            </div>



            {selectedEmployees.length > 0 && (

              <button

                type="button"

                onClick={handleDeleteSelected}

                disabled={deletingSelected}

                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"

              >

                {deletingSelected

                  ? "Deleting..."

                  : `🗑 Delete Selected (${selectedEmployees.length})`}

              </button>

            )}



            {/* Add Employee */}

            <button

              type="button"

              onClick={() => navigate("/admin/employees/add")}

              className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-800 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-blue-900"

            >

              <span className="text-lg leading-none">+</span>

              Add Employee

            </button>



            {/* Dashboard */}

            <button

              type="button"

              onClick={handleBackToDashboard}

              className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-800"

            >

              <span>←</span>

              Dashboard

            </button>

          </div>

        </div>



        {/* Compact Search */}

        <div className="mb-4 rounded-xl border border-slate-300 bg-white p-3 shadow-sm">

          <div className="relative">

            <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">

              <svg

                className="h-5 w-5"

                viewBox="0 0 24 24"

                fill="none"

                stroke="currentColor"

                strokeWidth="2"

              >

                <circle cx="11" cy="11" r="7"></circle>

                <path

                  strokeLinecap="round"

                  d="m20 20-4-4"

                ></path>

              </svg>

            </div>



            <input

              type="text"

              value={searchTerm}

              onChange={handleSearch}

              placeholder="Search by name, designation, department, company, extension, mobile or email..."

              className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"

            />

          </div>

        </div>



        {/* Error */}

        {error && (

          <div className="mb-4 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">

            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 text-xs font-bold text-red-600">

              !

            </div>



            <p className="text-sm font-semibold text-red-700">{error}</p>

          </div>

        )}



        {/* Employee Table */}

        <div className="overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm">

          {loading ? (

            <div className="flex min-h-[250px] flex-col items-center justify-center p-8 text-center">

              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-100 border-t-blue-800"></div>



              <p className="mt-3 text-sm font-semibold text-slate-600">

                Loading employees...

              </p>

            </div>

          ) : employees.length === 0 ? (

            <div className="flex min-h-[250px] flex-col items-center justify-center p-8 text-center">

              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-400">

                <svg

                  className="h-5 w-5"

                  viewBox="0 0 24 24"

                  fill="none"

                  stroke="currentColor"

                  strokeWidth="1.8"

                >

                  <circle cx="11" cy="11" r="7"></circle>

                  <path

                    strokeLinecap="round"

                    d="m20 20-4-4"

                  ></path>

                </svg>

              </div>



              <p className="mt-3 text-sm font-bold text-slate-700">

                No employees found

              </p>



              <p className="mt-1 text-xs text-slate-400">

                Try changing your search criteria.

              </p>

            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="min-w-full text-sm">

                <thead className="sticky top-0 z-10 bg-slate-700 text-white shadow-sm">

                  <tr>

                    <th className="border-r border-slate-600 px-3 py-3 text-center text-[11px] font-bold uppercase tracking-wide">

                      <input

                        type="checkbox"

                        checked={isAllCurrentPageSelected}

                        onChange={handleSelectAll}

                        className="h-4 w-4 cursor-pointer accent-blue-700"

                        title="Select all employees on this page"

                      />

                    </th>



                    <th className="border-r border-slate-600 px-3 py-3 text-left text-[11px] font-bold uppercase tracking-wide">

                      Sr. No.

                    </th>

                    <th

                      onClick={() => handleSort("employeeName")}

                      className={`cursor-pointer whitespace-nowrap border-r border-slate-600 px-3 py-3 text-left text-[11px] font-bold uppercase tracking-wide transition ${sortBy === "employeeName"

                        ? "bg-blue-800"

                        : "hover:bg-slate-600"

                        }`}

                    >

                      Employee Name{getSortArrow("employeeName")}

                    </th>



                    <th

                      onClick={() => handleSort("designation")}

                      className={`cursor-pointer whitespace-nowrap border-r border-slate-600 px-3 py-3 text-left text-[11px] font-bold uppercase tracking-wide transition ${sortBy === "designation"

                        ? "bg-blue-800"

                        : "hover:bg-slate-600"

                        }`}

                    >

                      Designation{getSortArrow("designation")}

                    </th>



                    <th

                      onClick={() => handleSort("department")}

                      className={`cursor-pointer whitespace-nowrap border-r border-slate-600 px-3 py-3 text-left text-[11px] font-bold uppercase tracking-wide transition ${sortBy === "department"

                        ? "bg-blue-800"

                        : "hover:bg-slate-600"

                        }`}

                    >

                      Department{getSortArrow("department")}

                    </th>



                    <th

                      onClick={() => handleSort("company")}

                      className={`cursor-pointer whitespace-nowrap border-r border-slate-600 px-3 py-3 text-left text-[11px] font-bold uppercase tracking-wide transition ${sortBy === "company"

                        ? "bg-blue-800"

                        : "hover:bg-slate-600"

                        }`}

                    >

                      Company{getSortArrow("company")}

                    </th>



                    <th className="border-r border-slate-600 px-3 py-3 text-left text-[11px] font-bold uppercase tracking-wide">

                      Extension

                    </th>



                    <th className="border-r border-slate-600 px-3 py-3 text-left text-[11px] font-bold uppercase tracking-wide">

                      Mobile No.

                    </th>



                    <th className="border-r border-slate-600 px-3 py-3 text-left text-[11px] font-bold uppercase tracking-wide">

                      Email

                    </th>



                    <th className="px-3 py-3 text-center text-[11px] font-bold uppercase tracking-wide">

                      Action

                    </th>

                  </tr>

                </thead>



                <tbody className="divide-y divide-slate-200">

                  {employees.map((employee, index) => (

                    <tr

                      key={employee._id}

                      className="transition hover:bg-blue-50/50"

                    >

                      <td className="border-r border-slate-200 px-3 py-2.5 text-center">

                        <input

                          type="checkbox"

                          checked={selectedEmployees.includes(employee._id)}

                          onChange={() => handleSelectEmployee(employee._id)}

                          className="h-4 w-4 cursor-pointer accent-blue-700"

                        />

                      </td>



                      <td className="border-r border-slate-200 px-3 py-2.5 text-xs font-medium text-slate-500">

                        {(currentPage - 1) * itemsPerPage + index + 1}

                      </td>



                      <td className="whitespace-nowrap border-r border-slate-200 px-3 py-2.5">

                        <span className="font-bold text-slate-900">

                          {employee.employeeName}

                        </span>

                      </td>



                      <td className="border-r border-slate-200 px-3 py-2.5 text-slate-700">

                        {employee.designation}

                      </td>



                      <td className="border-r border-slate-200 px-3 py-2.5 text-slate-700">

                        {employee.department}

                      </td>



                      <td className="border-r border-slate-200 px-3 py-2.5 text-slate-700">

                        {employee.company}

                      </td>



                      <td className="border-r border-slate-200 px-3 py-2.5 whitespace-nowrap">

                        <span className="inline-flex min-w-[55px] items-center justify-center rounded-md border border-blue-200 bg-blue-50 px-2 py-1 text-xs font-bold text-blue-800">

                          {employee.extension}

                        </span>

                      </td>



                      {/* Mobile No. */}

                      <td className="border-r border-slate-200 px-3 py-2.5 whitespace-nowrap">

                        <span className="font-medium text-slate-700">

                          {employee.mobileNo}

                        </span>

                      </td>



                      {/* Email */}

                      <td className="border-r border-slate-200 px-3 py-2.5 whitespace-nowrap">

                        <span className="font-medium text-slate-700">

                          {employee.email || "-"}

                        </span>

                      </td>



                      {/* Action */}

                      <td className="px-3 py-2.5 text-center">

                        <button

                          type="button"

                          onClick={() => {

                            navigate(

                              `/admin/employees/edit/${employee._id}`

                            );

                          }}

                          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-800 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-blue-900"

                        >

                          <svg

                            className="h-3.5 w-3.5"

                            viewBox="0 0 24 24"

                            fill="none"

                            stroke="currentColor"

                            strokeWidth="2"

                          >

                            <path

                              strokeLinecap="round"

                              strokeLinejoin="round"

                              d="M16.862 3.487a2.25 2.25 0 013.182 3.182L8.25 18.463 4.5 19.5l1.037-3.75L16.862 3.487z"

                            />

                          </svg>



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

          <div className="mt-4 flex flex-col items-center justify-between gap-3 rounded-xl border border-slate-300 bg-white px-4 py-3 shadow-sm sm:flex-row">

            <p className="text-xs font-medium text-slate-600">

              Showing{" "}

              <span className="font-bold text-slate-800">

                {(currentPage - 1) * itemsPerPage + 1}

              </span>{" "}

              to{" "}

              <span className="font-bold text-slate-800">

                {Math.min(currentPage * itemsPerPage, totalEmployees)}

              </span>{" "}

              of{" "}

              <span className="font-bold text-slate-800">

                {totalEmployees}

              </span>{" "}

              employees

            </p>



            <div className="flex items-center gap-2">

              <button

                disabled={currentPage === 1}

                onClick={() =>

                  setCurrentPage((page) => Math.max(page - 1, 1))

                }

                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"

              >

                ← Previous

              </button>



              <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-800">

                Page {currentPage} of {totalPages}

              </div>



              <button

                disabled={currentPage === totalPages}

                onClick={() =>

                  setCurrentPage((page) =>

                    Math.min(page + 1, totalPages)

                  )

                }

                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"

              >

                Next →

              </button>

            </div>

          </div>

        )}



        {/* Footer */}

        <div className="mt-5 border-t border-slate-300 pt-4 text-center">

          <p className="text-[11px] font-medium text-slate-400">

            Gujarat State Petronet Limited • Internal Administration Portal

          </p>

        </div>

      </main>

    </div>

  );

}



export default AdminEmployees;