import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

function EditEmployee() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    employeeName: "",
    designation: "",
    department: "",
    company: "",
    extension: "",
    mobileNo: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const token = localStorage.getItem("gspl_admin_token");

        if (!token) {
          navigate("/admin/login");
          return;
        }

        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/employees/${id}`
        );

        const employee = response.data?.data;

        if (!employee) {
          setError("Employee not found.");
          return;
        }

        setFormData({
          employeeName: employee.employeeName || "",
          designation: employee.designation || "",
          department: employee.department || "",
          company: employee.company || "",
          extension: employee.extension || "",
          mobileNo: employee.mobileNo || "",
        });
      } catch (error) {
        console.error("Failed to fetch employee:", error);

        if (error.response?.status === 401) {
          localStorage.removeItem("gspl_admin_token");
          localStorage.removeItem("gspl_admin_user");
          navigate("/admin/login");
          return;
        }

        setError(
          error.response?.data?.message ||
            "Unable to load employee details."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (
      !formData.employeeName.trim() ||
      !formData.designation.trim() ||
      !formData.department.trim() ||
      !formData.company.trim() ||
      !formData.extension.trim() ||
      !formData.mobileNo.trim()
    ) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      setSaving(true);

      const token = localStorage.getItem("gspl_admin_token");

      if (!token) {
        navigate("/admin/login");
        return;
      }

      await axios.put(
        `${import.meta.env.VITE_API_URL}/employees/${id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccess("Employee details updated successfully.");

      setTimeout(() => {
        navigate("/admin/employees");
      }, 1000);
    } catch (error) {
      console.error("Failed to update employee:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("gspl_admin_token");
        localStorage.removeItem("gspl_admin_user");
        navigate("/admin/login");
        return;
      }

      setError(
        error.response?.data?.message ||
          "Unable to update employee details."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this employee? This action cannot be undone."
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);

      const token = localStorage.getItem("gspl_admin_token");

      await axios.delete(
        `${import.meta.env.VITE_API_URL}/employees/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Employee deleted permanently.");

      navigate("/admin/employees");
    } catch (error) {
      console.error("Delete employee error:", error);

      alert(
        error.response?.data?.message ||
          "Failed to delete employee."
      );
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100">
        <header className="border-b border-slate-300 bg-white shadow-sm">
          <div className="h-1.5 bg-blue-800"></div>

          <div className="mx-auto flex max-w-[1600px] items-center px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-800 shadow-sm">
                <span className="text-lg font-extrabold text-white">
                  G
                </span>
              </div>

              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900">
                  GSPL Employee Directory
                </h1>

                <p className="mt-0.5 text-xs font-medium text-slate-500">
                  Employee Management
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="flex min-h-[calc(100vh-80px)] items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="h-9 w-9 animate-spin rounded-full border-4 border-blue-100 border-t-blue-800"></div>

            <p className="mt-4 text-sm font-semibold text-slate-600">
              Loading employee details...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {/* ================= HEADER ================= */}
      <header className="border-b border-slate-300 bg-white shadow-sm">
        <div className="h-1.5 bg-blue-800"></div>

        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-800 shadow-sm">
              <span className="text-lg font-extrabold text-white">
                G
              </span>
            </div>

            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                GSPL Employee Directory
              </h1>

              <p className="mt-0.5 text-xs font-medium text-slate-500">
                Employee Management
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              localStorage.removeItem("gspl_admin_token");
              localStorage.removeItem("gspl_admin_user");
              navigate("/admin/login");
            }}
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
      <main className="mx-auto max-w-[1100px] px-5 py-6 sm:px-6">
        {/* Back */}
        <div className="mb-4">
          <button
            type="button"
            onClick={() => navigate("/admin/employees")}
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 transition hover:text-blue-800"
          >
            <span className="text-lg">←</span>
            Back to Employees
          </button>
        </div>

        {/* Page Heading */}
        <div className="mb-5">
          <div className="mb-2 h-1 w-16 rounded-full bg-blue-700"></div>

          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Edit Employee
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Update the employee information below.
          </p>
        </div>

        {/* ================= FORM CARD ================= */}
        <div className="overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm">
          {/* Card Header */}
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
                    d="M16.862 3.487a2.25 2.25 0 013.182 3.182L8.25 18.463 4.5 19.5l1.037-3.75L16.862 3.487z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 15v4a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4"
                  />
                </svg>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  Employee Information
                </h3>

                <p className="text-xs text-slate-500">
                  Modify the employee's directory details
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-6">
            {/* Error */}
            {error && (
              <div className="mb-5 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 text-xs font-bold text-red-600">
                  !
                </div>

                <p className="text-sm font-semibold text-red-700">
                  {error}
                </p>
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="mb-5 flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-600">
                  ✓
                </div>

                <p className="text-sm font-semibold text-green-700">
                  {success}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2">
                {/* Employee Name */}
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-600">
                    Employee Name
                  </label>

                  <input
                    type="text"
                    name="employeeName"
                    value={formData.employeeName}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                    placeholder="Enter employee name"
                  />
                </div>

                {/* Designation */}
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-600">
                    Designation
                  </label>

                  <input
                    type="text"
                    name="designation"
                    value={formData.designation}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                    placeholder="Enter designation"
                  />
                </div>

                {/* Department */}
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-600">
                    Department
                  </label>

                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                    placeholder="Enter department"
                  />
                </div>

                {/* Company */}
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-600">
                    Company
                  </label>

                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                    placeholder="Enter company"
                  />
                </div>

                {/* Extension */}
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-600">
                    Extension
                  </label>

                  <input
                    type="text"
                    name="extension"
                    value={formData.extension}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                    placeholder="Enter extension"
                  />
                </div>

                {/* Mobile No */}
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-600">
                    Mobile No.
                  </label>

                  <input
                    type="text"
                    name="mobileNo"
                    value={formData.mobileNo}
                    onChange={(e) => {
                      const value = e.target.value;

                      if (/^\d{0,10}$/.test(value)) {
                        handleChange(e);
                      }
                    }}
                    maxLength={10}
                    inputMode="numeric"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                    placeholder="Enter 10-digit mobile number"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
                {/* Delete */}
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting || saving}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-700 transition hover:border-red-300 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {deleting ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-red-200 border-t-red-700"></span>
                      Deleting...
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
                          d="M3 6h18"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M8 6V4h8v2M19 6l-1 14H6L5 6"
                        />
                      </svg>

                      Delete Employee
                    </>
                  )}
                </button>

                {/* Save / Cancel */}
                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => navigate("/admin/employees")}
                    className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving || deleting}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-800 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-white"></span>
                        Saving...
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

                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

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

export default EditEmployee;