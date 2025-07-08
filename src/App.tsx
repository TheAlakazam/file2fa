import { useEffect, useState } from "react"
import { HashRouter as Router, Routes, Route } from "react-router-dom"
import { Navbar } from "@/components/Navbar"
import { Footer } from "./components/Footer";
import HomePage from "./pages/Home";
import UploadPage from "./pages/UploadPage";
import ResultsPage from "./pages/ResultsPage";

function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return (
    <Router>
      <Navbar theme={theme} setTheme={setTheme} />
      <main className="px-4 py-8 max-w-5xl mx-auto">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/about" element={<div>About Page</div>} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="*" element={<div>404 Not Found</div>} />
        </Routes>
      </main>
      <Footer version={__APP_VERSION__} />
    </Router>
  )
}

export default App
