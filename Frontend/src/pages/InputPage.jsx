import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QuestionInput from '../components/QuestionInput';
import CodeEditor from '../components/CodeEditor';
import { Home } from 'lucide-react';

export default function InputPage() {
  const navigate = useNavigate();
  const [question, setQuestion] = useState("");
  const [inputArray, setInputArray] = useState("");
  const [output, setOutput] = useState("");
  const [code, setCode] = useState("");
  const [speed, setSpeed] = useState(1500);

  const handleVisualize = async () => {
    // TODO: Make API call to backend to convert code to JSON
    // const response = await fetch('/api/generate-json', {
    //   method: 'POST',
    //   body: JSON.stringify({ question, inputArray, output, code })
    // });
    // const jsonData = await response.json();
    
    // For now, navigate directly to visualization page
    // In production, pass the generated JSON via state or context
    navigate('/visualization', {
      state: {
        question,
        inputArray,
        output,
        code,
        speed
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white flex flex-col">
      {/* Header */}
      <div className="bg-slate-900/80 backdrop-blur-sm px-6 py-4 border-b border-purple-500/30 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Algorithm Input
          </h1>
          <p className="text-sm text-slate-400 mt-1">Enter your code and test cases</p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
        >
          <Home size={24} />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 grid grid-cols-2 gap-4">
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

        <div className="bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-purple-500/30 flex items-center justify-center">
          <div className="text-center text-slate-400">
            <div className="text-6xl mb-4">🚀</div>
            <p className="text-lg">Fill in your code and click Visualize</p>
            <p className="text-sm mt-2">to see the magic happen!</p>
          </div>
        </div>
      </div>
    </div>
  );
}