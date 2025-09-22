import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore"; // Import 'where'
import { db } from '../firebase';
import { saveAs } from 'file-saver';
import './PhotoGallery.css';

interface Photo {
  id: string;
  url: string;
}

const LazyPhoto: React.FC<{ photo: Photo; onClick: () => void }> = ({ photo, onClick }) => {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const img = new Image();
        img.src = photo.url;
        img.onload = () => setIsLoaded(true);
    }, [photo.url]);

    return (
        <div className={`photo-item ${isLoaded ? 'loaded' : ''}`} onClick={onClick}>
            {isLoaded ? (
                <img src={photo.url} alt="Uploaded to gallery" />
            ) : (
                <div className="placeholder" />
            )}
        </div>
    );
};

const PhotoGallery: React.FC = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  useEffect(() => {
    // **WORKAROUND:** Filter for photos with type 'live'
    const q = query(
        collection(db, "photos"), 
        where("type", "==", "live"), 
        orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const photosData: Photo[] = [];
      querySnapshot.forEach((doc) => {
        const { url } = doc.data();
        photosData.push({ id: doc.id, url });
      });
      setPhotos(photosData);
    });

    return () => unsubscribe();
  }, []);

  const openModal = (url: string) => {
    setSelectedPhoto(url);
  };

  const closeModal = () => {
    setSelectedPhoto(null);
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedPhoto) {
      fetch(selectedPhoto)
        .then(response => response.blob())
        .then(blob => {
          saveAs(blob, `GEF-Mixer-${Date.now()}.jpg`);
        })
        .catch(err => console.error("Failed to download image:", err));
    }
  };

  return (
    <>
      <div className="photo-grid">
        {photos.map((photo) => (
          <LazyPhoto key={photo.id} photo={photo} onClick={() => openModal(photo.url)} />
        ))}
      </div>

      {selectedPhoto && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content">
            <img src={selectedPhoto} alt="Full-screen preview" />
            <button className="download-button" onClick={handleDownload}>
              Download
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default PhotoGallery;
