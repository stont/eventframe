import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, orderBy, onSnapshot, Timestamp } from "firebase/firestore";
import { db } from '../firebase';
import './AttendingGallery.css';

interface Photo {
  id: string;
  url: string;
  createdAt: Timestamp; 
}

// Helper function to format the date
const formatDate = (timestamp: Timestamp) => {
    return timestamp.toDate().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
};

const AttendingGallery: React.FC = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);

  useEffect(() => {
    const q = query(
        collection(db, "photos"), 
        where("type", "==", "attending"), 
        orderBy("createdAt", "desc")
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

  return (
    <div className="attending-gallery">
      <h2>I will be seen at #GEFGhana2025</h2>
      <div className="photo-grid-attending">
        {photos.map((photo) => (
          <div key={photo.id} className="photo-item-attending">
            <img src={photo.url} alt="I will be seen" />
            <div className="photo-info">
              <p className="photo-date">{formatDate(photo.createdAt)}</p>
              <Link to={`/attending/share/${photo.id}`} className="share-icon">
                ➔
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AttendingGallery;
