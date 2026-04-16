import axios from "axios";
import { QueryClient } from "react-query";
import "react-toastify/dist/ReactToastify.css";

const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || "";

// Tạo instance Axios
const apiClient = axios.create({
  baseURL: apiBaseUrl,
});

const queryClient = new QueryClient();

export { apiClient, queryClient };
