import { FormValues } from "@/app/login/page";
import axios from "axios";

export const loginFunc=async(data:FormValues)=>{
    try {
        const response = await axios.post("http://localhost:8000/api/v1/users/login",data)
        // console.log(response)
        // console.log(response.data.status);
        localStorage.setItem("jwt",response.data.token);
        return response.data;
    } catch (error) {
        console.log(error)
    }
}