import  { useState, useRef } from 'react';
import QuestionInput from '../components/QuestionInput';
import CodeEditor from '../components/CodeEditor';
import ControlPanel from '../components/ControlPanel';
import StepPanel from '../components/StepPanel';
import VisualizerContainer from '../components/VisualizerContainer';

export default function VisualizePage() {
  const [question, setQuestion] = useState("");
  const [inputArray, setInputArray] = useState("");
  const [output, setOutput] = useState("");
  const [code, setCode] = useState("");
  const [speed, setSpeed] = useState(1500);
  const [isVisualized, setIsVisualized] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [stepsJson, setStepsJson] = useState(null);
  const visualizerRef = useRef(null);


  const handleVisualize = async () => {
  try {
    // Load the JSON file from the public directory
    const response = await fetch("./sample.json");
    const data = await response.json();

    if (data?.steps?.length > 0) {
      setStepsJson(data);
      setCurrentStep(0);
      setIsVisualized(true);
      setIsPlaying(true);
    } else {
      console.error("Invalid JSON structure: missing steps");
    }
  } catch (error) {
    console.error("Error loading sample.json:", error);
  }
};


  const handlePlayPause = () => {
    if (visualizerRef.current) {
      visualizerRef.current.togglePlay();
    }
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    if (visualizerRef.current) {
      visualizerRef.current.reset();
    }
    setIsPlaying(false);
    setCurrentStep(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white flex flex-col">
      <ControlPanel
        algorithmType={stepsJson?.meta?.title}
        isVisualized={isVisualized}
        onReset={handleReset}
        onPlayPause={handlePlayPause}
        isPlaying={isPlaying}
      />

      <div className="grid grid-cols-2 gap-4 p-4 flex-1">
        <div className="flex flex-col gap-4">
          <QuestionInput
            question={question}
            onQuestionChange={setQuestion}
            inputArray={inputArray}
            onInputChange={setInputArray}
            output={output}
            onOutputChange={setOutput}
          />

          <CodeEditor
            code={code}
            onChange={setCode}
            speed={speed}
            onSpeedChange={setSpeed}
            onVisualize={handleVisualize}
          />
        </div>

        <div className="flex flex-col gap-4">
          <VisualizerContainer
            ref={visualizerRef}
            stepsJson={stepsJson}
            isVisualized={isVisualized}
            speed={speed}
            currentStep={currentStep}
            setCurrentStep={setCurrentStep}
          />

          {isVisualized && stepsJson && (
            <StepPanel
              currentStep={currentStep + 1}
              totalSteps={stepsJson.steps?.length || 0}
              description={stepsJson.steps?.[currentStep]?.description || ""}
            />
          )}
        </div>
      </div>
    </div>
  );
}