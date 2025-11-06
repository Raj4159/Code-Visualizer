import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Play, Pause, RotateCcw, SkipBack, SkipForward, ChevronRight, Home, ArrowLeft } from 'lucide-react';
import ArrayVisualizer from '../components/ArrayVisualizer';

export default function VisualizationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [jsonData, setJsonData] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(location.state?.speed || 1500);
  const intervalRef = useRef(null);

  // Load JSON data
  useEffect(() => {
    // In production, this would come from the API response
    // For now, load from bubble-sort.json
    // fetch('/bubble-sort.json')
    // fetch('/Pointers.json')
    fetch('/sliding_window.json')
    // fetch('/reverse_array.json')
    // fetch('/gemini_output.json')
      .then(res => res.json())
      .then(data => setJsonData(data))
      .catch(err => console.error('Error loading JSON:', err));
  }, []);

  // Auto-play functionality
  useEffect(() => {
    if (isPlaying && jsonData?.steps) {
      intervalRef.current = setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= jsonData.steps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, speed);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, speed, jsonData]);

  const handlePlayPause = () => setIsPlaying(!isPlaying);
  const handleReset = () => {
    setCurrentStep(0);
    setIsPlaying(false);
  };
  const handlePrev = () => setCurrentStep(Math.max(0, currentStep - 1));
  const handleNext = () => setCurrentStep(Math.min((jsonData?.steps?.length || 1) - 1, currentStep + 1));

  if (!jsonData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  const currentStepData = jsonData.steps[currentStep];
  const meta = jsonData.meta;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-black/30 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <Home className="w-5 h-5 text-white" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">{meta?.title || 'Algorithm Visualization'}</h1>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-sm text-purple-300">Type: {meta?.type || 'N/A'}</span>
                  <span className="text-sm text-green-300">Time: {meta?.complexity?.time || 'N/A'}</span>
                  <span className="text-sm text-blue-300">Space: {meta?.complexity?.space || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Visualization Area */}
        <div className="bg-black/20 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden mb-6">
          <ArrayVisualizer step={currentStepData} />
        </div>

        {/* Controls */}
        <div className="bg-black/30 backdrop-blur-sm rounded-xl border border-white/10 p-6">
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-white/70 mb-2">
              <span>Step {currentStep + 1} of {jsonData.steps.length}</span>
              <span>{Math.round((currentStep / (jsonData.steps.length - 1)) * 100)}%</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
                style={{ width: `${((currentStep + 1) / jsonData.steps.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Playback Controls */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <button
              onClick={handleReset}
              className="p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              title="Reset"
            >
              <RotateCcw className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Previous Step"
            >
              <SkipBack className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={handlePlayPause}
              className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-lg transition-colors"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 text-white" />
              ) : (
                <Play className="w-6 h-6 text-white" />
              )}
            </button>
            <button
              onClick={handleNext}
              disabled={currentStep === jsonData.steps.length - 1}
              className="p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Next Step"
            >
              <SkipForward className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Speed Control */}
          <div className="flex items-center justify-center gap-4">
            <span className="text-white/70 text-sm">Speed:</span>
            <input
              type="range"
              min="500"
              max="3000"
              step="100"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="w-48"
            />
            <span className="text-white text-sm w-16">{(speed / 1000).toFixed(1)}s</span>
          </div>
        </div>

        {/* Step Description */}
        <div className="mt-6 bg-black/30 backdrop-blur-sm rounded-xl border border-white/10 p-6">
          <h3 className="text-lg font-semibold text-white mb-2">Current Step:</h3>
          <p className="text-white/80">{currentStepData?.description || 'No description available'}</p>
        </div>
      </div>
    </div>
  );
}