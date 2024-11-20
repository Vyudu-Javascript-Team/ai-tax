import axios from 'axios';
import { toast } from "@/components/ui/use-toast";

const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || "An unexpected error occurred";
    toast({
      title: "Error",
      description: message,
      variant: "destructive",
    });
    return Promise.reject(error);
  }
);

export default apiClient;