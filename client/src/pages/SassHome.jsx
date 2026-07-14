import React from "react";
import SassHero from "../components/Sass/SassHero";
import SassFeatures from "../components/Sass/SassFeatures";
import SassStats from "../components/Sass/SassStats";
import SassShowcase from "../components/Sass/SassShowcase";
import SassTestimonials from "../components/Sass/SassTestimonials";
import SassCTA from "../components/Sass/SassCTA";

const SassHome = () => {
  return (
    <div className="bg-[#030712] text-slate-100 min-h-screen font-sans selection:bg-indigo-500/30 selection:text-indigo-200 overflow-hidden antialiased">
      <SassHero />
      <SassFeatures />
      <SassStats />
      <SassShowcase />
      <SassTestimonials />
      <SassCTA />
    </div>
  );
};

export default SassHome;
