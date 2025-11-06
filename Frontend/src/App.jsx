// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import HomePage from "./pages/HomePage";
// // import VisualizePage from "./pages/visualize";
// // import VisualizePage from "./pages/VisualizePage.jsx";
// import VisualizePage from "./pages/VisualizePage"

// export default function App() {
//   return (
//     <Router>
//       <Routes>
//         <Route path="/" element={<HomePage />} />
//         <Route path="/visualize" element={<VisualizePage />} />
//       </Routes>
//     </Router>
//   );
// }


import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import InputPage from "./pages/InputPage";
import VisualizationPage from "./pages/VisualizationPage";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/input" element={<InputPage />} />
        <Route path="/visualization" element={<VisualizationPage />} />
      </Routes>
    </Router>
  );
}