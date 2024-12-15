import { z } from "zod"

const formSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  email:z.string().email({
    message:"Invalid email address."
  }),
  password:z.string().min(8,{message: "Password must be at least 8 characters long."}),
  confirmPassword:z.string(),
})
.refine((data)=>data.password===data.confirmPassword,{
    message:"Passwords do not match",
    path:["confirmPassword"],
})

export default formSchema;