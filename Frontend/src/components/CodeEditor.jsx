import { Play } from "lucide-react";

export default function CodeEditor({ code, onChange, speed, onSpeedChange, onVisualize }) {
  return (
    <div className="flex flex-col bg-slate-900/80 backdrop-blur-sm p-4 rounded-2xl border border-purple-500/30 h-1/2">
      <h2 className="text-xl font-semibold text-cyan-400 mb-2">💻 Code Editor</h2>

      <textarea
        value={code}
        onChange={(e) => onChange(e.target.value)}
        placeholder="// Your code here or paste algorithm..."
        className="flex-1 bg-slate-800/80 p-3 rounded-lg font-mono text-sm text-white resize-none border border-slate-700 focus:border-cyan-500 outline-none"
      />

      <div className="flex justify-between items-center mt-3">
        <div className="flex items-center gap-3">
          <label className="text-sm text-slate-400">Speed: {speed}ms</label>
          <input
            type="range"
            min="500"
            max="3000"
            step="100"
            value={speed}
            onChange={(e) => onSpeedChange(Number(e.target.value))}
            className="w-32"
          />
        </div>

        <button
          onClick={onVisualize}
          className="flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 px-6 py-2 rounded-xl transition-all shadow-lg shadow-purple-500/30"
        >
          <Play size={18} />
          Generate Visualization
        </button>
      </div>
    </div>
  );
}