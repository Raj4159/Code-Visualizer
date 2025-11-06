import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-gray-900 via-indigo-800 to-purple-700 text-white text-center px-6">
      {/* Heading */}
      <h1 className="text-4xl md:text-5xl font-extrabold mb-4 drop-shadow-lg">
        Welcome to <span className="text-indigo-400">Code Visualizer</span>
      </h1>

      {/* Subheading */}
      <p className="text-lg md:text-xl max-w-xl mb-8 opacity-90">
        Let’s see what kind of code magic you’ve written 👨‍💻 — 
        we’ll turn it into a living, breathing visualization.
      </p>

      {/* Button */}
      <button
        onClick={() => navigate("/input")}
        className="px-8 py-3 bg-white text-indigo-700 font-semibold rounded-2xl shadow-xl hover:scale-105 hover:bg-gray-100 transition-transform duration-200"
      >
        🚀 Start Visualizing
      </button>

      {/* Small footer hint */}
      <p className="mt-10 text-sm text-gray-300 italic">
        “Because seeing your logic in motion is the best debugger.”
      </p>
    </div>
  );
}
