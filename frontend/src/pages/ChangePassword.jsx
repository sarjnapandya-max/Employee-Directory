import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function ChangePassword() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (
      !username ||
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      setError("Please fill in all fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New password and confirm password do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/auth/change-password`,
        {
          username,
          currentPassword,
          newPassword,
          confirmPassword,
        }
      );

      setSuccess(
        response.data?.message ||
          "Password changed successfully."
      );

      setUsername("");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Change password error:", error);

      setError(
        error.response?.data?.message ||
          "Failed to change password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="border-b border-slate-300 bg-white shadow-sm">
        <div className="h-1.5 bg-blue-800"></div>

        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              GTL Employee Directory
            </h1>

            <p className="mt-1 text-sm font-medium text-slate-500">
              Super Admin Dashboard
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/admin/login")}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            ← Back to Login
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-3xl px-6 py-10">
        <div className="mb-7">
          <p className="mb-1 text-xs font-bold uppercase tracking-widest text-blue-700">
            Account Security
          </p>

          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Change Password
          </h2>

          <p className="mt-1.5 text-sm text-slate-500">
            Update your SUPER_ADMIN account password.
          </p>
        </div>

        <div className="rounded-xl border border-slate-300 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-slate-50 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-100 text-blue-800">
                🔒
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Account Security
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Enter your username, current password, and choose a new password.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 p-6">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                <p className="text-sm font-semibold text-red-700">
                  {error}
                </p>
              </div>
            )}

            {success && (
              <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3">
                <p className="text-sm font-semibold text-green-700">
                  ✓ {success}
                </p>
              </div>
            )}

            {/* Username */}
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Username
              </label>

              <input
                type="text"
                value={username}
                onChange={(event) =>
                  setUsername(event.target.value)
                }
                placeholder="Enter your username"
                autoComplete="username"
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Current Password */}
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Current Password
              </label>

              <input
                type="password"
                value={currentPassword}
                onChange={(event) =>
                  setCurrentPassword(event.target.value)
                }
                placeholder="Enter current password"
                autoComplete="current-password"
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* New Password */}
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                New Password
              </label>

              <input
                type="password"
                value={newPassword}
                onChange={(event) =>
                  setNewPassword(event.target.value)
                }
                placeholder="Enter new password"
                autoComplete="new-password"
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Confirm New Password
              </label>

              <input
                type="password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(event.target.value)
                }
                placeholder="Confirm new password"
                autoComplete="new-password"
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => navigate("/admin/login")}
                className="rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-blue-800 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Changing Password..."
                  : "Change Password"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default ChangePassword;