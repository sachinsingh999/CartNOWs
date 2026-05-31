import React, { useEffect, useState } from 'react'
import NavBar from './components/NavBar'
import Sidebar from './components/Sidebar'
import { Route,Routes } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Add from './pages/Add'
import List from './pages/List'
import Orders from './pages/Orders'
import Returns from './pages/Returns'
import Deliverymen from './pages/Deliverymen'
import Support from './pages/Support'
import Sales from './pages/Sales'
import Coupons from './pages/Coupons'
import Login from './components/Login'
import { ToastContainer } from 'react-toastify';

const App = () => {

  const [token,setToken]=useState(localStorage.getItem('token')?localStorage.getItem('token'):'');
  useEffect(()=>{
    localStorage.setItem('token',token)

  },[token])

  return (
    <div className="bg-slate-50/50 min-h-screen flex flex-col antialiased">
      <ToastContainer />
      {token === "" ? (
        <Login setToken={setToken} />
      ) : (
        <>
          <NavBar setToken={setToken} />
          <div className="flex flex-1">
            <Sidebar />

            {/* MAIN CONTENT */}
            <main className="flex-1 bg-slate-50/20 p-8 md:p-10">
              <div className="mx-auto max-w-5xl">
                <Routes>
                  <Route path="/" element={<Dashboard token={token} />} />
                  <Route path="/add" element={<Add token={token} />} />
                  <Route path="/list" element={<List token={token} />} />
                  <Route path="/orders" element={<Orders token={token} />} />
                  <Route path="/returns" element={<Returns token={token} />} />
                  <Route path="/deliverymen" element={<Deliverymen token={token} />} />
                  <Route path="/support" element={<Support token={token} />} />
                  <Route path="/sales" element={<Sales token={token} />} />
                  <Route path="/coupons" element={<Coupons token={token} />} />
                </Routes>
              </div>
            </main>
          </div>
        </>
      )}
    </div>
  );
};

export default App;
