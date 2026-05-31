import React from "react";

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 px-6 py-20 text-gray-900 dark:text-slate-100 transition-colors duration-200">

      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="text-center mb-16">
          <p className="text-sm font-medium uppercase tracking-wide text-gray-500 dark:text-slate-400 font-semibold">
            About CartNOW
          </p>
          <h1 className="mt-3 text-5xl font-extrabold text-gray-955 dark:text-slate-50">
            Built for simple, confident shopping.
          </h1>

          <p className="text-gray-600 dark:text-slate-400 mt-4 max-w-3xl mx-auto text-lg leading-8">
            Your one-stop destination for quality products, fast delivery 
            and secure shopping experience.
          </p>
        </div>

        {/* FEATURES */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          <div className="bg-white dark:bg-slate-900/50 p-8 rounded-lg border border-gray-200 dark:border-slate-800 shadow-sm hover:shadow-lg dark:shadow-slate-950/20 transition text-center">
            <h3 className="text-xl font-semibold mb-2 text-gray-955 dark:text-slate-100">Quality Products</h3>
            <p className="text-gray-600 dark:text-slate-400 text-sm">
              Carefully selected products with premium quality standards.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900/50 p-8 rounded-lg border border-gray-200 dark:border-slate-800 shadow-sm hover:shadow-lg dark:shadow-slate-950/20 transition text-center">
            <h3 className="text-xl font-semibold mb-2 text-gray-955 dark:text-slate-100">Fast Delivery</h3>
            <p className="text-gray-600 dark:text-slate-400 text-sm">
              Quick and reliable shipping across multiple locations.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900/50 p-8 rounded-lg border border-gray-200 dark:border-slate-800 shadow-sm hover:shadow-lg dark:shadow-slate-950/20 transition text-center">
            <h3 className="text-xl font-semibold mb-2 text-gray-955 dark:text-slate-100">Secure Payments</h3>
            <p className="text-gray-600 dark:text-slate-400 text-sm">
              100% safe checkout with trusted payment gateways.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900/50 p-8 rounded-lg border border-gray-200 dark:border-slate-800 shadow-sm hover:shadow-lg dark:shadow-slate-950/20 transition text-center">
            <h3 className="text-xl font-semibold mb-2 text-gray-955 dark:text-slate-100">Easy Returns</h3>
            <p className="text-gray-600 dark:text-slate-400 text-sm">
              Hassle-free return & refund policy for customers.
            </p>
          </div>

        </div>

        {/* TRUST SECTION */}
        <div className="mt-20 bg-black dark:bg-slate-900 border border-transparent dark:border-slate-800 text-white rounded-lg p-12 text-center shadow-lg dark:shadow-slate-950/30">

          <h2 className="text-3xl font-bold mb-4">
            Why Shop With Us?
          </h2>

          <p className="text-gray-300 dark:text-slate-300 max-w-3xl mx-auto leading-7">
            Thousands of customers trust us for authentic products,
            affordable pricing and excellent service.
          </p>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 mt-8">
            <div>
              <h3 className="text-3xl font-bold text-orange-500 dark:text-orange-400">10K+</h3>
              <p className="text-gray-400 dark:text-slate-400 text-sm mt-1">Orders Delivered</p>
            </div>

            <div>
              <h3 className="text-3xl font-bold text-orange-500 dark:text-orange-400">5K+</h3>
              <p className="text-gray-400 dark:text-slate-400 text-sm mt-1">Happy Customers</p>
            </div>

            <div>
              <h3 className="text-3xl font-bold text-orange-500 dark:text-orange-400">4.8★</h3>
              <p className="text-gray-400 dark:text-slate-400 text-sm mt-1">Customer Rating</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default About;
