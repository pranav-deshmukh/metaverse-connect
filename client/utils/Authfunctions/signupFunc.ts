import { FormValues } from "@/app/login/page";
import axios from "axios";

export const signUpFunc=async(data:FormValues)=>{
    try {
        const response = await axios.post("https://metaverse-connect-production-48d4.up.railway.app/api/v1/users/signUp",data)
        console.log(response)
        localStorage.setItem("jwt",response.data.token);
        return response.data;
    } catch (error) {
        console.log(error)
    }
}