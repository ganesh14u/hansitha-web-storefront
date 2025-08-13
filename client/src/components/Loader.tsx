// src/components/Loader.tsx
import React from "react";

const Loader: React.FC = () => {
  const text = "Hansitha Creations";

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-50">
      {/* Letter-by-letter gradient shimmer with fade-up */}
      <h1 className="text-4xl md:text-5xl font-extrabold tracking-wide mt-6 animate-fadeUp">
        {text.split("").map((char, i) => (
          <span
            key={i}
            className="bg-gradient-to-r from-blue-500 via-pink-500 to-blue-500 bg-clip-text text-transparent animate-shimmer"
            style={{
              animationDelay: `${i * 0.1}s`,
              display: "inline-block",
              backgroundSize: "200% auto",
            }}
          >
            {char === " " ? "\u00A0" : char}
          </span>
        ))}
      </h1>

      {/* Spinning gradient circle under text */}
      <div className="mt-6 w-14 h-14 border-4 border-t-transparent rounded-full animate-spin border-blue-500 border-r-pink-500 border-b-blue-500 border-l-pink-500"></div>
    </div>
  );
};

export default Loader;
