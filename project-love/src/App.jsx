// =============================
// File: src/App.tsx
// =============================
import React, { useState } from "react";
import TwoBodySoul from "./components/TwoBodySoul";

export default function App() {
  const [selected, setSelected] = useState("home");

  return (
    <div className="flex h-screen bg-black text-white">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 p-6 space-y-4">
        <h1 className="text-2xl font-bold">Love Menu</h1>
        <button
          className="block w-full text-left hover:text-pink-400"
          onClick={() => setSelected("home")}
        >
          Home
        </button>
        <button
          className="block w-full text-left hover:text-pink-400"
          onClick={() => setSelected("soul")}
        >
          2 Body Single Soul
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center">
        {selected === "home" && (
          <h1 className="text-4xl font-bold text-pink-400">
            A Special Universe For Us ❤️
          </h1>
        )}

        {selected === "soul" && <TwoBodySoul />}
      </div>
    </div>
  );
}


