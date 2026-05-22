import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl } from "../config";
import { toast } from "react-toastify";

const Orders = ({ token }) => {
  const [orders, setOrders] = useState([]);

  const fetchAllOrder = async () => {
    if (!token) return;

    try {
      const res = await axios.post(
        `${backendUrl}/api/order/list`,
        {},
        { headers: { token } }
      );

      if (res.data.success) {
        setOrders(res.data.orders);
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const statusHandler=async(event,orderId)=>{
    try {
      const response=await axios.post(backendUrl+'/api/order/status',{orderId,status:event.target.value},{headers:{token}});
      if(response.data.success){
        await fetchAllOrder();
      }

    } catch (error) {
      console.log(error);
      toast.error(error.message)
      
    }

  }

  useEffect(() => {
    let active = true;

    if (!token) return undefined;

    axios.post(
      `${backendUrl}/api/order/list`,
      {},
      { headers: { token } }
    )
      .then((res) => {
        if (!active) return;

        if (res.data.success) {
          setOrders(res.data.orders);
        } else {
          toast.error(res.data.message);
        }
      })
      .catch((error) => {
        if (active) {
          toast.error(error.message);
        }
      });

    return () => {
      active = false;
    };
  }, [token]);

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-6">Order Page</h2>

      <div className="space-y-6">
        {orders.map((order) => (
          <div
            key={order._id}
            className="bg-white rounded-lg p-6 shadow-sm grid grid-cols-[80px_1fr_180px_120px_160px] gap-6 items-start"
          >
            {/* ICON */}
            <div className="flex justify-center">
              <div className="w-14 h-14 bg-gray-100 rounded flex items-center justify-center">
                📦
              </div>
            </div>

            {/* PRODUCTS + ADDRESS */}
            <div className="text-sm text-gray-700 space-y-1">
              {order.items.map((item, i) => (
                <p key={i}>
                  {item.name} x {item.qty} {item.size}
                </p>
              ))}

              <p className="mt-3 font-medium">{order.address.firstName}</p>
              <p>
                {order.address.street}, {order.address.city},{" "}
                {order.address.state}, {order.address.country},{" "}
                {order.address.phone}
              </p>
            </div>

            {/* META */}
            <div className="text-sm text-gray-600 space-y-1">
              <p>Items : {order.items.length}</p>
              <p>Method : {order.paymentMethod.toUpperCase()}</p>
              <p>Payment : {order.paymentStatus}</p>
              <p>
                Date :{" "}
                {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>

            {/* AMOUNT */}
            <div className="font-semibold text-gray-800">
              ₹{order.amount}
            </div>

            {/* STATUS */}
            <div>
              <select onChange={(event)=>statusHandler(event,order._id)}
                defaultValue={order.orderStatus}
                className="border rounded px-2 py-1 text-sm bg-white"
              >
                <option>Order Placed</option>
                <option>Packed</option>
                <option>Shipped</option>
                <option>Out for Delivery</option>
                <option>Delivered</option>
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;
