import { useParams, useLocation } from "react-router-dom";
import { backendUrl } from "../config";

const steps = [
  "Order Placed",
  "Packed",
  "Shipped",
  "Out for Delivery",
  "Delivered",
];

const Track = () => {
  const { id } = useParams();
  const location = useLocation();
  const item = location.state?.item;
  const statusMap = {
    "order placed": 0,
    packed: 1,
    shipped: 2,
    "out for delivery": 3,
    delivered: 4,
  };
  const currentStep = statusMap[item?.status?.toLowerCase()] ?? 0;

  if (!item) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Order not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-center px-4 py-12">
      <div className="bg-white border border-gray-200 shadow-lg rounded-lg p-8 w-full max-w-lg">

        {/* HEADER */}
        <h1 className="text-2xl font-bold text-center mb-2 text-gray-950">
          Track Your Order
        </h1>

        <p className="text-center text-xs text-gray-500 mb-6">
          Order ID: <span className="font-mono">{id}</span>
        </p>

        {/* PRODUCT */}
        <div className="flex items-center gap-4 mb-8 rounded-lg border border-gray-200 bg-gray-50 p-4">
          <img
            src={`${backendUrl}/${item.image}`}
            alt={item.name}
            className="h-20 w-20 object-cover rounded bg-gray-100"
          />

          <div>
            <p className="font-semibold">{item.name}</p>
            <p className="text-sm text-gray-500">
              Qty: {item.qty} • Size: {item.size}
            </p>
            <p className="font-bold mt-1">
              ₹{item.price * item.qty}
            </p>
          </div>
        </div>

        {/* PROGRESS */}
        <div className="relative mb-8">
          <div className="absolute top-4 left-0 right-0 h-1 bg-gray-200 rounded"></div>

          <div
            className="absolute top-4 left-0 h-1 bg-black rounded transition-all duration-700"
            style={{
              width: `${(currentStep / (steps.length - 1)) * 100}%`,
            }}
          ></div>

          <div className="flex justify-between relative">
            {steps.map((step, index) => {
              const completed = index < currentStep;
              const active = index === currentStep;

              return (
                <div key={index} className="flex flex-col items-center">
                  <div
                    className={`h-5 w-5 rounded-full flex items-center justify-center
                      ${
                        completed
                          ? "bg-black"
                          : active
                          ? "border-2 border-black bg-white"
                          : "bg-gray-300"
                      }`}
                  >
                    {completed && (
                      <span className="text-white text-xs">✓</span>
                    )}
                  </div>

                  <p
                    className={`text-xs mt-2 text-center
                      ${
                        completed || active
                          ? "text-gray-950 font-semibold"
                          : "text-gray-400"
                      }`}
                  >
                    {step}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* CURRENT STATUS */}
        <div className="text-center mb-6">
          <p className="text-sm text-gray-500">Current Status</p>
          <p className="font-bold text-lg text-gray-950">
            {steps[currentStep]}
          </p>
        </div>

        {/* BACK */}
        <button
          onClick={() => window.history.back()}
          className="w-full bg-black text-white py-2 rounded hover:bg-gray-800"
        >
          Go Back
        </button>
      </div>
    </div>
  );
};

export default Track;
