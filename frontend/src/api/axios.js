import axios from "axios";
import { supabase } from "./supabase";

const API = axios.create({
  baseURL: "/api", // Use relative path for Vercel functions
});

API.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

export default API;
