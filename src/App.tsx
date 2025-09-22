import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import Header from './components/Header';
import Footer from './components/Footer';
import AttendingHome from './pages/AttendingHome';
import AttendingGallery from './pages/AttendingGallery';
import AttendingShare from './pages/AttendingShare';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Header />
        <main>
          <Routes>
            {/* The "Attending" page is now the main home page */}
            <Route path="/" element={<AttendingHome />} />
            
            {/* The original live gallery is now at /gallery */}
            <Route path="/gallery" element={<HomePage />} />

            <Route path="/attending/gallery" element={<AttendingGallery />} />
            <Route path="/attending/share/:id" element={<AttendingShare />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
