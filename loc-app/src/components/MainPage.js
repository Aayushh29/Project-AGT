import React from "react";
import { UserCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function MainPage() {
  const navigate = useNavigate();

  return (
    
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-white font-sans">
      {/* Top Panel */}
      <div className="w-full bg-white shadow-lg p-6 flex justify-between items-center sticky top-0 z-50">
        <h1 className="text-4xl font-extrabold text-indigo-700 tracking-tight">Explore Navigator</h1>
        <UserCircle className="w-12 h-12 text-gray-600 cursor-pointer hover:text-indigo-500 transition-colors duration-200" />
      </div>

      {/* Center Buttons */}
      <div className="flex justify-center items-center h-[calc(100vh-96px)] px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 w-full max-w-6xl">
          <div className="p-8 bg-white rounded-3xl shadow-2xl hover:scale-105 transform transition duration-300 ease-in-out text-center">
            <button
              onClick={() => navigate('/map')}
              className="text-3xl font-semibold px-12 py-6 bg-blue-600 text-white rounded-xl hover:bg-blue-700 w-full transition duration-300"
            >
              Map
            </button>
          </div>
          <div className="p-8 bg-white rounded-3xl shadow-2xl hover:scale-105 transform transition duration-300 ease-in-out text-center">
            <button
              onClick={() => navigate('/dining')}
              className="text-3xl font-semibold px-12 py-6 bg-green-600 text-white rounded-xl hover:bg-green-700 w-full transition duration-300"
            >
              Dining
            </button>
          </div>
          <div className="p-8 bg-white rounded-3xl shadow-2xl hover:scale-105 transform transition duration-300 ease-in-out text-center">
            <button
              onClick={() => navigate('/historian')}
              className="text-3xl font-semibold px-12 py-6 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 w-full transition duration-300"
            >
              Historian
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
