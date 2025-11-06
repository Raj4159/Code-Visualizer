import { Play, Pause, RotateCcw } from "lucide-react";

export default function ControlPanel({ algorithmType, isVisualized, onReset, onPlayPause, isPlaying }) {
  return (
    <div className="flex justify-between items-center bg-slate-900/80 backdrop-blur-sm px-6 py-4 border-b border-purple-500/30">
      <div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
          Algorithm Visualizer
        </h1>
        {algorithmType && (
          <p className="text-sm text-slate-400 mt-1">{algorithmType}</p>
        )}
      </div>

      {isVisualized && (
        <div className="flex gap-3">
          <button
            onClick={onPlayPause}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg transition-all shadow-lg shadow-cyan-500/30"
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            {isPlaying ? 'Pause' : 'Play'}
          </button>
          <button
            onClick={onReset}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-all shadow-lg shadow-red-500/30"
          >
            <RotateCcw size={20} />
            Reset
          </button>
        </div>
      )}
    </div>
  );
}