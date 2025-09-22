import React, { useState, useRef } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { collection, addDoc } from "firebase/firestore";
import { storage, db } from '../firebase';
import './UploadModal.css';

interface UploadModalProps {
    onClose: () => void;
    onUploadComplete: () => void;
}

const processImage = (imageFile: File, addFrame: boolean): Promise<File> => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const userImage = new Image();
            userImage.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                if (!ctx) return resolve(imageFile);

                const MAX_WIDTH = 1920;
                const quality = 0.8;

                let { width, height } = userImage;
                if (width > MAX_WIDTH) {
                    height = (MAX_WIDTH / width) * height;
                    width = MAX_WIDTH;
                }

                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(userImage, 0, 0, width, height);

                const finalizeAndResolve = () => {
                    canvas.toBlob((blob) => {
                        if (blob) {
                            const newFileName = imageFile.name.replace(/\.[^/.]+$/, "") + ".jpeg";
                            const compressedFile = new File([blob], newFileName, { type: 'image/jpeg' });
                            resolve(compressedFile);
                        } else {
                            resolve(imageFile);
                        }
                    }, 'image/jpeg', quality);
                };

                if (addFrame) {
                    const frameOverlay = new Image();
                    frameOverlay.src = '/frame.png';
                    frameOverlay.onload = () => {
                        const imageAspect = width / height;
                        const frameAspect = frameOverlay.width / frameOverlay.height;
                        
                        let sx, sy, sWidth, sHeight;

                        if (imageAspect > frameAspect) {
                            sHeight = frameOverlay.height;
                            sWidth = sHeight * imageAspect;
                            sx = (frameOverlay.width - sWidth) / 2;
                            sy = 0;
                        } else {
                            sWidth = frameOverlay.width;
                            sHeight = sWidth / imageAspect;
                            sx = 0;
                            sy = frameOverlay.height - sHeight; 
                        }
                        
                        ctx.drawImage(frameOverlay, sx, sy, sWidth, sHeight, 0, 0, width, height);
                        finalizeAndResolve();
                    };
                    frameOverlay.onerror = () => {
                        finalizeAndResolve();
                    };
                } else {
                    finalizeAndResolve();
                }
            };
            userImage.src = event.target?.result as string;
        };
        reader.readAsDataURL(imageFile);
    });
};


const UploadModal: React.FC<UploadModalProps> = ({ onClose, onUploadComplete }) => {
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [addFrame, setAddFrame] = useState(true);

    const galleryInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            setPreviewUrl(URL.createObjectURL(selectedFile));
        }
        e.target.value = '';
    };

    const handleCancel = () => {
        setFile(null);
        setPreviewUrl(null);
    };

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);
        setProgress(0);
        const fileToUpload = await processImage(file, addFrame);
        const uniqueFileName = `${Date.now()}-${fileToUpload.name}`;
        const storageRef = ref(storage, `images/${uniqueFileName}`);
        const uploadTask = uploadBytesResumable(storageRef, fileToUpload);

        uploadTask.on('state_changed',
            (snapshot) => setProgress((snapshot.bytesTransferred / snapshot.totalBytes) * 100),
            (error) => {
                console.error("Upload failed:", error);
                setUploading(false);
            },
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
                    try {
                        // Add the 'type' field here as well
                        await addDoc(collection(db, "photos"), { 
                            url: downloadURL, 
                            createdAt: new Date(),
                            type: 'live', // Mark as a live photo
                        });
                        onUploadComplete();
                    } catch (e) {
                        console.error("Error adding document: ", e);
                    }
                    setUploading(false);
                });
            }
        );
    };

  return (
    <div className="modal-overlay" onClick={onClose}>
        <div className="upload-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={onClose}>&times;</button>
            {!previewUrl ? (
                <div className="upload-options">
                    <h2>Upload a Photo</h2>
                    <button onClick={() => cameraInputRef.current?.click()} className="upload-button">Take Photo</button>
                    <button onClick={() => galleryInputRef.current?.click()} className="upload-button">Choose from Gallery</button>
                    <input type="file" accept="image/*" capture="environment" ref={cameraInputRef} onChange={handleFileChange} style={{ display: 'none' }}/>
                    <input type="file" accept="image/*" ref={galleryInputRef} onChange={handleFileChange} style={{ display: 'none' }}/>
                </div>
            ) : (
                <div className="upload-preview">
                    <img src={previewUrl} alt="Preview" className="preview-image" />
                    <div className="frame-toggle">
                        <label>
                            <input type="checkbox" checked={addFrame} onChange={() => setAddFrame(!addFrame)} />
                            Apply #GEF Frame
                        </label>
                    </div>
                    {uploading ? (
                        <div className="progress-bar-container">
                            <div className="progress-bar" style={{ width: `${progress}%` }}></div>
                            <span>{progress.toFixed(0)}%</span>
                        </div>
                    ) : (
                        <div className="preview-actions">
                            <button onClick={handleUpload} className="upload-button primary">Upload</button>
                            <button onClick={handleCancel} className="upload-button secondary">Cancel</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    </div>
  );
};

export default UploadModal;
