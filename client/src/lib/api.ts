import axios from "axios";
const CLIENT_URL = import.meta.env.VITE_CLIENT_URL;

const api = axios.create({
  baseURL: CLIENT_URL,
  withCredentials: true,
});

export default api;
