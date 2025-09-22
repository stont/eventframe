import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, orderBy, onSnapshot, Timestamp, limit } from "firebase/firestore";
import { db } from '../firebase';
import './AttendingHome.css';
import AttendingCreateModal from '../components/AttendingCreateModal';

interface Photo {
  id: string;
  url: string;
  createdAt: Timestamp;
}

const AttendingHome: React.FC = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Fetch last 20 images
    const q = query(
        collection(db, "photos"), 
        where("type", "==", "attending"), 
        orderBy("createdAt", "desc"),
        limit(20)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const photosData: Photo[] = [];
      querySnapshot.forEach((doc) => {
        photosData.push({ id: doc.id, ...doc.data() } as Photo);
      });
      setPhotos(photosData);
    });

    return () => unsubscribe();
  }, []);

  // Auto-slide functionality
  useEffect(() => {
    if (photos.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % photos.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [photos.length]);

  
  const getVisibleSlides = () => {
    if (photos.length === 0) return [];
    
    const visibleSlides = [];
    const totalSlides = 5; 
    
    for (let i = 0; i < totalSlides; i++) {
      const index = (currentIndex - 2 + i + photos.length) % photos.length;
      visibleSlides.push({
        ...photos[index],
        position: i - 2,
        isCenter: i === 2
      });
    }
    
    return visibleSlides;
  };

  const visibleSlides = getVisibleSlides();

  return (
    <div className="attending-home-container">
      <div className="hero-content-attending">
        <h1>Join the Fun! with <span className="hashtag">#GlobalEntrepreneurshipFestival</span></h1>
        
        {photos.length > 0 && (
          <div className="carousel-container">
            <div className="carousel-track">
              {visibleSlides.map((slide, index) => (
                <div
                  key={`${slide.id}-${index}`}
                  className={`carousel-slide ${slide.isCenter ? 'center-slide' : ''}`}
                  style={{
                    filter: slide.isCenter ? 'blur(0px)' : 'blur(2px)',
                    zIndex: slide.isCenter ? 10 : Math.abs(slide.position)
                  }}
                >
                  <img 
                    src={slide.url} 
                    alt="I will be seen" 
                    className="carousel-image"
                  />
                  {slide.isCenter && (
                    <div className="slide-overlay">
                  
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="description-text">
          <p>Generate your personalized "I will be Seen" at</p>
          <p><strong>#GlobalEntrepreneurshipFestival</strong></p>
          <p>Post on social media and tag <strong>@globalentrepreneurshipfestival</strong> and use any of the hashtags <strong>#GlobalEntrepreneurshipWeek, #GEF, GEF2025, GEFGhana</strong></p>
        </div>

        <div className="action-buttons">
          <button onClick={() => setIsModalOpen(true)} className="action-button primary">
            Create a Frame
          </button>
          
          <Link to="/attending/gallery" className="action-button secondary">
            View Gallery
          </Link>
        </div>
        
        {isModalOpen && <AttendingCreateModal onClose={() => setIsModalOpen(false)} />}
      </div>
    </div>
  );
};

export default AttendingHome;