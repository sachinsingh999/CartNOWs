import React from "react";

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50 px-6 py-20">

      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="text-center mb-16">
          <p className="text-sm font-medium uppercase tracking-wide text-gray-500">
            About CartNOW
          </p>
          <h1 className="mt-3 text-5xl font-extrabold text-gray-950">
            Built for simple, confident shopping.
          </h1>

          <p className="text-gray-600 mt-4 max-w-3xl mx-auto text-lg leading-8">
            Your one-stop destination for quality products, fast delivery 
            and secure shopping experience.
          </p>
        </div>

        {/* FEATURES */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm hover:shadow-lg transition text-center">
            <h3 className="text-xl font-semibold mb-2">Quality Products</h3>
            <p className="text-gray-600 text-sm">
              Carefully selected products with premium quality standards.
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm hover:shadow-lg transition text-center">
            <h3 className="text-xl font-semibold mb-2">Fast Delivery</h3>
            <p className="text-gray-600 text-sm">
              Quick and reliable shipping across multiple locations.
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm hover:shadow-lg transition text-center">
            <h3 className="text-xl font-semibold mb-2">Secure Payments</h3>
            <p className="text-gray-600 text-sm">
              100% safe checkout with trusted payment gateways.
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm hover:shadow-lg transition text-center">
            <h3 className="text-xl font-semibold mb-2">Easy Returns</h3>
            <p className="text-gray-600 text-sm">
              Hassle-free return & refund policy for customers.
            </p>
          </div>

        </div>

        {/* TRUST SECTION */}
        <div className="mt-20 bg-black text-white rounded-lg p-12 text-center">

          <h2 className="text-3xl font-bold mb-4">
            Why Shop With Us?
          </h2>

          <p className="text-gray-300 max-w-3xl mx-auto">
            Thousands of customers trust us for authentic products,
            affordable pricing and excellent service.
          </p>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 mt-8">
            <div>
              <h3 className="text-3xl font-bold">10K+</h3>
              <p className="text-gray-400 text-sm">Orders Delivered</p>
            </div>

            <div>
              <h3 className="text-3xl font-bold">5K+</h3>
              <p className="text-gray-400 text-sm">Happy Customers</p>
            </div>

            <div>
              <h3 className="text-3xl font-bold">4.8★</h3>
              <p className="text-gray-400 text-sm">Customer Rating</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default About;
