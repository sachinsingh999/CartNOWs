import React, { useState } from "react";
import axios from 'axios'
import { backendUrl } from "../config";
import { toast } from "react-toastify";

const Login = ({setToken}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  
  const onSubmitHandler = async (e) => {
   try{
    e.preventDefault();
   
    const response=await axios.post(backendUrl+'/api/user/admin',{email,password})
    if(response.data.success){
      setToken(response.data.token)

    }
    else{
      toast.error(response.data.message)
    }

   }catch(error){
    console.log(error);
    toast.error(error.message)
    

   }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-200">
      <form
        onSubmit={onSubmitHandler}
        className="bg-white p-6 rounded-md shadow-md w-80"
      >
        <h2 className="text-xl font-semibold text-center mb-4">
          Admin Login
        </h2>

        {/* Email */}
        <input
          type="email"
          placeholder="Email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-3 px-3 py-2 border rounded outline-none focus:ring-2 focus:ring-gray-400"
        />

        {/* Password */}
        <input
          type="password"
          placeholder="Password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 px-3 py-2 border rounded outline-none focus:ring-2 focus:ring-gray-400"
        />

        {/* Login Button */}
        <button
          type="submit"
          className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition"
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;
