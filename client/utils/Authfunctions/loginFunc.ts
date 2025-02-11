import { FormValues } from "@/app/login/page";
import axios from "axios";

export const loginFunc = async (data: FormValues): Promise<{ status: number; token?: string }> => {
  try {
    console.log(process.env.PROD)
    const response = await axios.post(`${process.env.NEXT_PUBLIC_PROD}/api/v1/users/login`, data);
    localStorage.setItem("jwt", response.data.token);
    return { status: response.status, token: response.data.token };
  } catch (error: any) {
    console.error("Login error:", error.response?.data || error.message);
    return { status: error.response?.status || 500 }; 
  }
};
