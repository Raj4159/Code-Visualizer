import { ChevronRight } from "lucide-react";

export default function StepPanel({ currentStep, totalSteps, description }) {
  return (
    <div className="bg-slate-900/80 backdrop-blur-sm p-4 rounded-2xl border border-purple-500/30">
      <div className="flex justify-between items-center mb-3">
        <span className="text-cyan-400 font-semibold">
          Step {currentStep} / {totalSteps}
        </span>
        <div className="flex gap-2">
          <div className="px-3 py-1 bg-cyan-500/20 rounded-full text-cyan-400 text-xs">
            🔵 Normal
          </div>
          <div className="px-3 py-1 bg-amber-500/20 rounded-full text-amber-400 text-xs">
            🟡 Active
          </div>
        </div>
      </div>
      
      <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
        <p className="text-white flex items-start gap-2">
          <ChevronRight className="text-cyan-400 mt-1 flex-shrink-0" size={20} />
          <span>{description}</span>
        </p>
      </div>
      
      <div className="mt-3 h-2 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 transition-all duration-300"
          style={{ width: `${totalSteps ? (currentStep / totalSteps) * 100 : 0}%` }}
        />
      </div>
    </div>
  );
}