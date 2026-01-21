import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CyberLandingPage from "./pages/CyberLandingPage";
// Keep your dashboard import if you want to link to it later, e.g. /dashboard
// import Home from "./pages/Home"; 

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CyberLandingPage />} />
        {/* You can move the old dashboard to a sub-route if you want */}
        {/* <Route path="/dashboard" element={<Home />} /> */}
      </Routes>
    </Router>
  );
}

export default App;