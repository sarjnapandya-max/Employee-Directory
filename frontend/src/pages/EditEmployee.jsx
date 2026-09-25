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
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-gray-600">
          Loading employee details...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-slate-900 text-white shadow">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-xl font-bold">
              GSPL Employee Directory
            </h1>

            <p className="text-sm text-slate-300">
              Edit Employee
            </p>
          </div>

          <button
            onClick={() => {
              localStorage.removeItem("gspl_admin_token");
              localStorage.removeItem("gspl_admin_user");
              navigate("/admin/login");
            }}
            className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Form */}
      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-6">
          <button
            onClick={() => navigate("/admin/employees")}
            className="text-sm font-medium text-slate-700 hover:text-slate-900"
          >
            ← Back to Employees
          </button>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm md:p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-800">
              Edit Employee Details
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Update the employee information below.
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {/* Employee Name */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Employee Name
                </label>

                <input
                  type="text"
                  name="employeeName"
                  value={formData.employeeName}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  placeholder="Enter employee name"
                />
              </div>

              {/* Designation */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Designation
                </label>

                <input
                  type="text"
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  placeholder="Enter designation"
                />
              </div>

              {/* Department */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Department
                </label>

                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  placeholder="Enter department"
                />
              </div>

              {/* Company */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Company
                </label>

                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  placeholder="Enter company"
                />
              </div>

              {/* Extension */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Extension
                </label>

                <input
                  type="text"
                  name="extension"
                  value={formData.extension}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  placeholder="Enter extension"
                />
              </div>

              {/* Mobile No */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Mobile No."
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
  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
  placeholder="Enter 10-digit mobile number"
/>
              </div>
            </div>

            {/* Buttons */}
            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => navigate("/admin/employees")}
                className="rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>

              <div className="flex flex-wrap gap-3">
  <button
    type="submit"
    disabled={saving || deleting}
    className="rounded-lg bg-slate-800 px-5 py-3 text-sm font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
  >
    {saving ? "Saving..." : "Save Changes"}
  </button>

  <button
    type="button"
    onClick={handleDelete}
    disabled={deleting}
    className="rounded-lg bg-red-600 px-5 py-3 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
  >
    {deleting ? "Deleting..." : "Delete Employee"}
  </button>
</div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default EditEmployee;