import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { backendUrl } from "../config";
import { toast } from "react-toastify";

const Verify = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const success = searchParams.get("success");
  const orderId = searchParams.get("orderId");
  const method = searchParams.get("method") || "stripe";
  const isDemo = searchParams.get("demo") === "true";

  const [verifying, setVerifying] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setVerifying(false);
          setErrorMessage("Authentication session expired.");
          toast.error("Please login to verify your payment.");
          return;
        }

        // Call corresponding backend verification route based on method
        const endpoint = method === "razorpay" 
          ? `${backendUrl}/api/order/verifyRazorpay` 
          : `${backendUrl}/api/order/verifyStripe`;

        const res = await axios.post(
          endpoint,
          { orderId, success },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.data.success) {
          setIsSuccess(true);
          toast.success("Payment verified successfully!");
          
          // Clear cart on success just in case
          // The backend does it, but we can sync locally or let it route
          setTimeout(() => {
            navigate(`/order-confirmed/${orderId}`);
          }, 3000);
        } else {
          setIsSuccess(false);
          setErrorMessage(res.data.message || "Payment verification failed.");
          toast.error(res.data.message || "Payment verification failed.");
        }
      } catch (error) {
        console.log("PAYMENT VERIFICATION ERROR 👉", error);
        setIsSuccess(false);
        setErrorMessage(error.response?.data?.message || error.message);
      } finally {
        setVerifying(false);
      }
    };

    if (orderId) {
      verifyPayment();
    } else {
      setVerifying(false);
      setErrorMessage("Missing order parameter details.");
    }
  }, [orderId, success, method, navigate]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center px-4 py-12 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-8 shadow-lg dark:shadow-slate-950/20 text-center space-y-6">
        
        {verifying && (
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-16 w-16 text-slate-900 dark:text-slate-100 animate-spin" />
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">Verifying Payment</h1>
            <p className="text-sm font-semibold text-slate-400 dark:text-slate-500">Please do not close this window or refresh the page.</p>
          </div>
        )}

        {!verifying && isSuccess && (
          <div className="flex flex-col items-center space-y-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 scale-100 animate-bounce">
              <CheckCircle2 size={48} />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">Payment Successful</h1>
            <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 px-3 py-1 rounded-full inline-block">
              {isDemo ? "Simulated Sandboxed Sandbox Success" : "Transaction Cleared"}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium max-w-xs mx-auto leading-relaxed">
              Thank you for your purchase! Your payment has been secured and your order is registered.
            </p>
            <div className="border-t border-slate-100 dark:border-slate-800 pt-6 w-full">
              <button
                onClick={() => navigate(`/order-confirmed/${orderId}`)}
                className="w-full rounded-2xl bg-slate-950 dark:bg-orange-600 py-3.5 text-sm font-bold text-slate-100 dark:text-white transition hover:bg-slate-800 dark:hover:bg-orange-500 cursor-pointer"
              >
                View Order Receipt
              </button>
            </div>
          </div>
        )}

        {!verifying && !isSuccess && (
          <div className="flex flex-col items-center space-y-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400">
              <XCircle size={48} />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">Payment Verification Failed</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium max-w-xs mx-auto leading-relaxed">
              {errorMessage || "We could not complete payment validation. Your order has been cancelled."}
            </p>
            <div className="border-t border-slate-100 dark:border-slate-800 pt-6 w-full flex flex-col gap-2">
              <button
                onClick={() => navigate("/placeorder")}
                className="w-full rounded-2xl bg-slate-950 dark:bg-orange-700 py-3.5 text-sm font-bold text-slate-100 dark:text-white transition hover:bg-slate-800 dark:hover:bg-orange-500 cursor-pointer"
              >
                Try Again
              </button>
              <button
                onClick={() => navigate("/product")}
                className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-3.5 text-sm font-bold text-slate-700 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Verify;
