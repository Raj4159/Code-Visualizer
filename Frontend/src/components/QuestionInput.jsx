export default function QuestionInput({ question, onQuestionChange, inputArray, onInputChange, output, onOutputChange }) {
  return (
    <div className="flex flex-col gap-3 bg-slate-900/80 backdrop-blur-sm p-4 rounded-2xl border border-purple-500/30 h-1/2">
      <h2 className="text-xl font-semibold text-cyan-400">📝 Question Setup</h2>

      <textarea
        value={question}
        onChange={(e) => onQuestionChange(e.target.value)}
        placeholder="Enter the problem statement or goal..."
        className="bg-slate-800/80 p-3 rounded-lg text-white resize-none flex-1 border border-slate-700 focus:border-cyan-500 outline-none"
      />

      <div className="flex gap-3">
        <input
          type="text"
          value={inputArray}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder="Input: [2, 5, 3, 2, 4]"
          className="flex-1 bg-slate-800/80 p-2 rounded-lg text-white border border-slate-700 focus:border-cyan-500 outline-none"
        />
        <input
          type="text"
          value={output}
          onChange={(e) => onOutputChange(e.target.value)}
          placeholder="Expected Output: 2"
          className="flex-1 bg-slate-800/80 p-2 rounded-lg text-white border border-slate-700 focus:border-cyan-500 outline-none"
        />
      </div>
    </div>
  );
}