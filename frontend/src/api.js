import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("gspl_admin_token");
      localStorage.removeItem("gspl_admin_user");

      window.location.href = "/admin/login";
    }

    return Promise.reject(error);
  }
);

export default api;