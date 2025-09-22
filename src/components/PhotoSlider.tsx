import React, { useState, useEffect } from 'react';
import Slider from 'react-slick';
import { collection, query, where, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from '../firebase';
import './PhotoSlider.css';

import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";

interface Photo {
  id: string;
  url: string;
}

const PhotoSlider: React.FC = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, "photos"), 
      where("type", "==", "live"),
      orderBy("createdAt", "desc"), 
      limit(5)
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

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    fade: true,
    cssEase: 'linear'
  };

  if (photos.length === 0) {
    return null;
  }

  return (
    <div className="photo-slider-container">
      <Slider {...settings}>
        {photos.map((photo) => (
          <div key={photo.id} className="slider-item">
            <img src={photo.url} alt="Latest from the event" />
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default PhotoSlider;
