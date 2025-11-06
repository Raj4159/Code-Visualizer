import  { forwardRef, useRef, useImperativeHandle } from 'react';
import ArrayVisualizer from './ArrayVisualizer';

const VisualizerContainer = forwardRef(({ stepsJson, isVisualized, speed, currentStep, setCurrentStep }, ref) => {
  const visualizerRef = useRef(null);

  useImperativeHandle(ref, () => ({
    reset: () => visualizerRef.current?.reset(),
    togglePlay: () => visualizerRef.current?.togglePlay(),
  }));

  return (
    <div className="bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-purple-500/30 flex-1 overflow-hidden flex flex-col min-h-0">
      <div className="p-4 border-b border-purple-500/30 flex-shrink-0">
        <h2 className="text-xl font-semibold text-cyan-400">🎬 3D Visualization</h2>
      </div>
      
      <div className="flex-1 min-h-0">
        {!isVisualized || !stepsJson ? (
          <div className="flex items-center justify-center h-full text-slate-400">
            <div className="text-center">
              <div className="text-6xl mb-4">🚀</div>
              <p className="text-lg">Click Visualize to see the magic!</p>
            </div>
          </div>
        ) : (
          <ArrayVisualizer
            ref={visualizerRef}
            stepsJson={stepsJson}
            isVisualized={isVisualized}
            speed={speed}
            currentStep={currentStep}
            setCurrentStep={setCurrentStep}
          />
        )}
      </div>
    </div>
  );
});

VisualizerContainer.displayName = 'VisualizerContainer';

export default VisualizerContainer;