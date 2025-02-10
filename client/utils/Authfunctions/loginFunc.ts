import { FormValues } from "@/app/login/page";
import axios from "axios";

export const loginFunc = async (data: FormValues): Promise<{ status: number; token?: string }> => {
  try {
    const response = await axios.post("https://metaverse-connect-production-48d4.up.railway.app/api/v1/users/login", data);
    localStorage.setItem("jwt", response.data.token);
    return { status: response.status, token: response.data.token };
  } catch (error: any) {
    console.error("Login error:", error.response?.data || error.message);
    return { status: error.response?.status || 500 }; 
  }
};
