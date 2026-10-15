import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function AddEmployee() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    employeeName: "",
    designation: "",
    department: "",
    company: "",
    extension: "",
    mobileNo: "",
    email: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);
  const [duplicateDetails, setDuplicateDetails] = useState([]);
  const [matchingEmployees, setMatchingEmployees] = useState([]);
  const [selectedReplaceId, setSelectedReplaceId] = useState("");
  const [replacementLoading, setReplacementLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));

    setDuplicateDetails([]);
    setMatchingEmployees([]);
    setSelectedReplaceId("");
  };

  const handleAddEmployee = async (allowDuplicate = false) => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");
      setDuplicateDetails([]);
      setMatchingEmployees([]);
      setSelectedReplaceId("");

      const token = localStorage.getItem("gspl_admin_token");

      if (!token) {
        localStorage.removeItem("gspl_admin_user");
        navigate("/admin/login");
        return;
      }

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/employees`,
        {
          ...formData,
          allowDuplicate,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccess(
        response.data?.message || "Employee added successfully."
      );

      setFormData({
        employeeName: "",
        designation: "",
        department: "",
        company: "",
        extension: "",
        mobileNo: "",
        email: "",
      });
    } catch (err) {
      console.error("Failed to add employee:", err);

      if (
        err.response?.status === 409 &&
        err.response?.data?.duplicateDetected
      ) {
        const details = err.response.data.duplicates || [];

        const matches =
          err.response.data.matchingEmployees ||
          [
            ...new Map(
              details
                .map((item) => item.existingEmployee)
                .filter((employee) => employee?._id)
                .map((employee) => [
                  String(employee._id),
                  employee,
                ])
            ).values(),
          ];

        setDuplicateDetails(details);
        setMatchingEmployees(matches);

        setSelectedReplaceId(
          matches.length === 1 ? String(matches[0]._id) : ""
        );

        setError("");
        return;
      }

      setError(
        err.response?.data?.message || "Failed to add employee."
      );

      if (err.response?.status === 401) {
        localStorage.removeItem("gspl_admin_token");
        localStorage.removeItem("gspl_admin_user");
        navigate("/admin/login");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleReplaceExisting = async () => {
    if (!selectedReplaceId) {
      setError("Please select the employee you want to replace.");
      return;
    }

    try {
      setReplacementLoading(true);
      setError("");
      setSuccess("");

      const token = localStorage.getItem("gspl_admin_token");

      if (!token) {
        localStorage.removeItem("gspl_admin_user");
        navigate("/admin/login");
        return;
      }

      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/employees/${selectedReplaceId}`,
        {
          ...formData,
          email: formData.email?.trim() || "",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccess(
        response.data?.message ||
          "Existing employee updated successfully."
      );

      setDuplicateDetails([]);
      setMatchingEmployees([]);
      setSelectedReplaceId("");

      setFormData({
        employeeName: "",
        designation: "",
        department: "",
        company: "",
        extension: "",
        mobileNo: "",
        email: "",
      });
    } catch (err) {
      console.error("Failed to replace employee:", err);

      if (err.response?.status === 401) {
        localStorage.removeItem("gspl_admin_token");
        localStorage.removeItem("gspl_admin_user");
        navigate("/admin/login");
        return;
      }

      setError(
        err.response?.data?.message ||
          "Unable to replace the employee. Please try again."
      );
    } finally {
      setReplacementLoading(false);
    }
  };

  const closeDuplicateModal = () => {
    setDuplicateDetails([]);
    setMatchingEmployees([]);
    setSelectedReplaceId("");
    setError("");
  };

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
                window.location.href = "/admin/dashboard";
              }}
              aria-label="Go to Admin Dashboard"
              className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg bg-blue-800 shadow-sm transition hover:bg-blue-900"
            >
              <span className="text-lg font-extrabold text-white">
                G
              </span>
            </button>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                GTL Employee Directory
              </h1>

              <p className="mt-1 text-sm font-medium text-slate-500">
                Add Employee
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate("/admin/employees")}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-800"
          >
            <span className="text-base">←</span>
            Back to Employees
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-5xl px-6 py-8">
        {/* Page Heading */}
        <div className="mb-7">
          <p className="mb-1 text-xs font-bold uppercase tracking-widest text-blue-700">
            Employee Management
          </p>

          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Add New Employee
          </h2>

          <p className="mt-1.5 text-sm text-slate-500">
            Enter the employee details below to add a new record to the GTL
            employee directory.
          </p>
        </div>

        {/* Form Card */}
        <div className="overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm">
          {/* Card Header */}
          <div className="border-b border-slate-200 bg-slate-50 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-800 text-white shadow-sm">
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
                <h3 className="text-lg font-bold text-slate-900">
                  Employee Information
                </h3>

                <p className="mt-0.5 text-xs font-medium text-slate-500">
                  Complete all employee details before saving.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Error */}
            {error && (
              <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3.5 shadow-sm">
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 text-xs font-bold text-red-600">
                  !
                </div>

                <p className="text-sm font-semibold text-red-700">
                  {error}
                </p>
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="mb-6 flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3.5 shadow-sm">
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-700">
                  ✓
                </div>

                <p className="text-sm font-semibold text-green-700">
                  {success}
                </p>
              </div>
            )}

            {/* Fields */}
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
              {/* Employee Name */}
              <div>
                <label
                  htmlFor="employeeName"
                  className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-600"
                >
                  Employee Name
                </label>

                <input
                  id="employeeName"
                  type="text"
                  placeholder="Enter employee name"
                  name="employeeName"
                  value={formData.employeeName}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Designation */}
              <div>
                <label
                  htmlFor="designation"
                  className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-600"
                >
                  Designation
                </label>

                <input
                  id="designation"
                  type="text"
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  placeholder="Enter designation"
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Department */}
              <div>
                <label
                  htmlFor="department"
                  className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-600"
                >
                  Department
                </label>

                <input
                  id="department"
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  placeholder="Enter department"
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Company */}
              <div>
                <label
                  htmlFor="company"
                  className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-600"
                >
                  Company
                </label>

                <input
                  id="company"
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  placeholder="Enter company"
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Extension */}
              <div>
                <label
                  htmlFor="extension"
                  className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-600"
                >
                  Extension
                </label>

                <input
                  id="extension"
                  type="text"
                  name="extension"
                  value={formData.extension}
                  onChange={handleChange}
                  placeholder="Enter extension"
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Mobile */}
              <div>
                <label
                  htmlFor="mobileNo"
                  className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-600"
                >
                  Mobile No.
                </label>

                <input
                  id="mobileNo"
                  type="text"
                  name="mobileNo"
                  value={formData.mobileNo}
                  onChange={handleChange}
                  placeholder="Enter mobile number"
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-600"
                >
                  Email{" "}
                  <span className="font-medium normal-case text-slate-400">
                    (Optional)
                  </span>
                </label>

                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email address"
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => navigate("/admin/employees")}
                className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => handleAddEmployee(false)}
                disabled={saving || replacementLoading}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-800 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-900 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"></span>
                    Adding...
                  </>
                ) : (
                  <>
                    <span className="text-base">+</span>
                    Add Employee
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Compact Duplicate Modal */}
        {duplicateDetails.length > 0 && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-3 sm:p-5"
            role="dialog"
            aria-modal="true"
            aria-labelledby="duplicate-title"
          >
            <div className="flex max-h-[80vh] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl">
              {/* Header */}
              <div className="flex shrink-0 items-start gap-3 border-b border-amber-200 bg-amber-50 px-4 py-4 sm:px-5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-lg font-bold text-amber-700">
                  !
                </div>

                <div className="min-w-0 flex-1">
                  <h3
                    id="duplicate-title"
                    className="text-base font-bold text-slate-900"
                  >
                    Duplicate employee detected
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-slate-600 sm:text-sm">
                    Review the matching records and choose how to continue.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeDuplicateModal}
                  aria-label="Close duplicate warning"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xl text-slate-500 hover:bg-white hover:text-slate-800"
                >
                  &times;
                </button>
              </div>

              {/* Scrollable Matching Details */}
              <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3 sm:px-5">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-600">
                    Matching details
                  </p>

                  <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">
                    {duplicateDetails.length}{" "}
                    {duplicateDetails.length === 1 ? "match" : "matches"}
                  </span>
                </div>

                <div className="space-y-2">
                  {duplicateDetails.map((duplicate, index) => (
                    <div
                      key={`${duplicate.field}-${index}`}
                      className="rounded-lg border border-slate-200 bg-white p-3 transition-colors hover:border-amber-300"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-xs font-bold text-amber-800">
                          Matching field: {duplicate.field}
                        </p>

                        <p className="break-all text-xs text-slate-500">
                          Value:{" "}
                          <span className="font-semibold text-slate-700">
                            {duplicate.value}
                          </span>
                        </p>
                      </div>

                      {duplicate.existingEmployee && (
                        <div className="mt-2 rounded-md bg-slate-50 px-3 py-2">
                          <p className="break-words text-sm font-semibold text-slate-900">
                            {duplicate.existingEmployee.employeeName || "—"}
                          </p>

                          <div className="mt-1.5 grid grid-cols-1 gap-x-4 gap-y-1 text-xs text-slate-600 sm:grid-cols-2">
                            <p>
                              <span className="text-slate-400">Company:</span>{" "}
                              {duplicate.existingEmployee.company || "—"}
                            </p>

                            <p>
                              <span className="text-slate-400">Extension:</span>{" "}
                              {duplicate.existingEmployee.extension || "—"}
                            </p>

                            <p>
                              <span className="text-slate-400">Mobile:</span>{" "}
                              {duplicate.existingEmployee.mobileNo || "—"}
                            </p>

                            {duplicate.existingEmployee.email && (
                              <p className="break-all">
                                <span className="text-slate-400">Email:</span>{" "}
                                {duplicate.existingEmployee.email}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Employee Selection */}
              <div className="shrink-0 border-t border-slate-200 px-4 py-3">
                <label
                  htmlFor="replacement-employee"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >
                  Select the existing employee to replace
                </label>

                <select
                  id="replacement-employee"
                  value={selectedReplaceId}
                  onChange={(e) => {
                    setSelectedReplaceId(e.target.value);
                    setError("");
                  }}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Choose an employee...</option>

                  {matchingEmployees.map((employee) => (
                    <option
                      key={employee._id}
                      value={String(employee._id)}
                    >
                      {employee.employeeName || "Unknown employee"} —{" "}
                      {employee.company || "No company"} — Ext.{" "}
                      {employee.extension || "—"} — Mobile{" "}
                      {employee.mobileNo || "—"}
                    </option>
                  ))}
                </select>

                {matchingEmployees.length === 0 && (
                  <p className="mt-2 text-xs text-amber-700">
                    The server did not return employee IDs for these matches.
                    Replacement is unavailable until the backend returns the
                    matching employees with their IDs.
                  </p>
                )}
              </div>

              {/* Fixed Action Buttons */}
              <div className="flex shrink-0 flex-col gap-2 border-t border-slate-200 bg-white px-4 py-3 sm:flex-row sm:flex-wrap sm:justify-end sm:px-5">
                <button
                  type="button"
                  onClick={closeDuplicateModal}
                  disabled={saving || replacementLoading}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                  Return to Form
                </button>

                <button
                  type="button"
                  disabled={saving || replacementLoading}
                  onClick={() => handleAddEmployee(true)}
                  className="w-full rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  {saving ? "Adding..." : "Add Employee Anyway"}
                </button>

                <button
                  type="button"
                  disabled={
                    !selectedReplaceId || replacementLoading || saving
                  }
                  onClick={handleReplaceExisting}
                  className="w-full rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                  {replacementLoading ? "Replacing..." : "Replace Existing"}
                </button>
              </div>
            </div>
          </div>
        )}

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

export default AddEmployee;