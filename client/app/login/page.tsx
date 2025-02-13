"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { motion } from "framer-motion";
import { Lock, User } from "lucide-react";
import Link from "next/link";
import formSchema from "@/utils/loginSchema";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { loginFunc } from "@/utils/Authfunctions/loginFunc";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "sonner"; // ✅ Import Sonner

type FormData = z.infer<typeof formSchema>;
export type FormValues = {
  username: string;
  password: string;
};

const PixelEffect = () => {
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    setDimensions({
      width: window.innerWidth,
      height: window.innerHeight,
    });

    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-emerald-400/20"
          initial={{
            x: Math.random() * dimensions.width,
            y: Math.random() * dimensions.height,
          }}
          animate={{
            x: [null, Math.random() * dimensions.width],
            y: [null, Math.random() * dimensions.height],
          }}
          transition={{
            duration: Math.random() * 3 + 2,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
};

export default function Login() {
  const router = useRouter();
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    console.log("Form submitted:", data);

    let {status, token} = await loginFunc(data);
    console.log(status, token)

    if (status === 201) {
      toast.success("Login successful! Redirecting..."); // ✅ Success toast
      router.push("/dashboard");
    } else {
      toast.error("Login failed. Please check your credentials."); // ❌ Error toast
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 to-blue-900 flex flex-col justify-center items-center p-4 relative overflow-hidden">
       <Toaster />
      <PixelEffect />

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative"
      >
        <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-lg rounded-2xl border border-gray-700" />

        <div className="relative p-8 space-y-6">
          <motion.div className="text-center space-y-2" initial={{ y: -20 }} animate={{ y: 0 }}>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
              Welcome Back
            </h1>
            <p className="text-gray-300">Continue your adventure</p>
          </motion.div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <motion.div initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-200">Username</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                          <Input
                            className="pl-10 bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-emerald-500"
                            placeholder="Enter your username"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </motion.div>

              <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-200">Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                          <Input
                            className="pl-10 bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-emerald-500"
                            type="password"
                            placeholder="Enter your password"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </motion.div>

              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="space-y-4">
                <div className="flex justify-between items-center">
                  <Link className="text-sm text-gray-400 hover:text-gray-300 transition-colors" href="/signup">
                    New player? Join now
                  </Link>
                  <Link className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors" href="/forgot-password">
                    Forgot password?
                  </Link>
                </div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button type="submit" className="w-full bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white py-6 rounded-lg font-medium">
                    Enter the World
                  </Button>
                </motion.div>
              </motion.div>
            </form>
          </Form>
        </div>
      </motion.div>
    </div>
  );
}
