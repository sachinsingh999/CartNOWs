import React, { useEffect, useState } from 'react'
import NavBar from './components/NavBar'
import Sidebar from './components/Sidebar'
import { Route,Routes } from 'react-router-dom'
import Add from './pages/Add'
import List from './pages/List'
import Orders from './pages/Orders'
import Returns from './pages/Returns'
import Support from './pages/Support'
import Login from './components/Login'
import { ToastContainer } from 'react-toastify';

const App = () => {

  const [token,setToken]=useState(localStorage.getItem('token')?localStorage.getItem('token'):'');
  useEffect(()=>{
    localStorage.setItem('token',token)

  },[token])

  return (
    <div className='bg-gray-400 min-h-screen'>
      <ToastContainer/>
      {token===''?
      <Login setToken={setToken}/>:
      <>
      <NavBar setToken={setToken}/>
      <hr />
      <div className="flex min-h-screen">
  <Sidebar />

  {/* MAIN CONTENT */}
  <div className="flex-1 bg-gray-300 p-6">
    <Routes>
      <Route path="/add" element={<Add token={token} />} />
      <Route path="/list" element={<List token={token} />} />
      <Route path="/orders" element={<Orders token={token} />} />
      <Route path="/returns" element={<Returns token={token} />} />
      <Route path="/support" element={<Support token={token} />} />
    </Routes>
  </div>
</div>

      </>
      }
      
    
    </div>
  )
}

export default App
