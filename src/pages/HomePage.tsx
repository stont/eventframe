import React, { useState } from 'react';
import PhotoSlider from '../components/PhotoSlider';
import PhotoGallery from '../components/PhotoGallery';
import UploadModal from '../components/UploadModal';
import './HomePage.css';

const HomePage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleUploadComplete = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="home-page">
      <PhotoSlider />
      <PhotoGallery />

      {/* Floating Action Button with text */}
      <button onClick={() => setIsModalOpen(true)} className="upload-fab">
        Upload
      </button>

      {isModalOpen && (
        <UploadModal 
          onClose={() => setIsModalOpen(false)} 
          onUploadComplete={handleUploadComplete} 
        />
      )}
    </div>
  );
};

export default HomePage;
