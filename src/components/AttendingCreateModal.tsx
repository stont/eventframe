import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactCrop, { Crop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc } from "firebase/firestore";
import { storage, db } from '../firebase';
import './AttendingCreateModal.css';

interface AttendingCreateModalProps {
    onClose: () => void;
}

// **CORRECTED:** Define the precise aspect ratio for the photo area
const aspect = 1050 / 1159;

function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number) {
    return centerCrop(
        makeAspectCrop({ unit: '%', width: 90 }, aspect, mediaWidth, mediaHeight),
        mediaWidth,
        mediaHeight
    );
}

const getCroppedImg = (image: HTMLImageElement, crop: Crop): Promise<Blob> => {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width * scaleX;
    canvas.height = crop.height * scaleY;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('No 2d context');
    ctx.drawImage(image, crop.x * scaleX, crop.y * scaleY, crop.width * scaleX, crop.height * scaleY, 0, 0, canvas.width, canvas.height);
    return new Promise(resolve => canvas.toBlob(blob => blob && resolve(blob), 'image/png'));
};


const AttendingCreateModal: React.FC<AttendingCreateModalProps> = ({ onClose }) => {
    const [upImg, setUpImg] = useState<string | null>(null);
    const [crop, setCrop] = useState<Crop>();
    const [completedCrop, setCompletedCrop] = useState<Crop | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const imgRef = useRef<HTMLImageElement | null>(null);
    const navigate = useNavigate();
    const galleryInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);

    function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
        const { width, height } = e.currentTarget;
        const centeredCrop = centerAspectCrop(width, height, aspect);
        setCrop(centeredCrop);
        setCompletedCrop(centeredCrop);
    }

    const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setError(null);
            const reader = new FileReader();
            reader.addEventListener('load', () => setUpImg(reader.result as string));
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!completedCrop || !imgRef.current) {
            setError("Please crop the image before generating.");
            return;
        }
        setIsUploading(true);
        setError(null);
        const croppedImageBlob = await getCroppedImg(imgRef.current, completedCrop);
        const frameImg = new Image();
        frameImg.src = '/frame-attending.png';
        frameImg.onload = () => {
            const canvas = document.createElement('canvas');
            // **CORRECTED:** Use the final frame dimensions
            canvas.width = 2000;
            canvas.height = 2000;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            const userCroppedImage = new Image();
            userCroppedImage.src = URL.createObjectURL(croppedImageBlob);
            userCroppedImage.onload = () => {
                // **CORRECTED:** Draw the user's photo in the precise position
                ctx.drawImage(userCroppedImage, 291, 421, 1050, 1159);
                // Draw the frame on top
                ctx.drawImage(frameImg, 0, 0);

                canvas.toBlob(async (finalBlob) => {
                    if (!finalBlob) return;
                    const finalFile = new File([finalBlob], `attending-${Date.now()}.png`, { type: 'image/png' });
                    const storageRef = ref(storage, `attending_photos/${finalFile.name}`);
                    try {
                        await uploadBytes(storageRef, finalFile);
                        const downloadURL = await getDownloadURL(storageRef);
                        const docRef = await addDoc(collection(db, "photos"), { url: downloadURL, createdAt: new Date(), type: 'attending' });
                        navigate(`/attending/share/${docRef.id}`);
                    } catch (err) {
                        setError("Upload failed. Please try again.");
                    } finally {
                        setIsUploading(false);
                    }
                });
            };
        };
        frameImg.onerror = () => {
            setIsUploading(false);
            setError("Error: The frame template 'frame-attending.png' is missing.");
        };
    };

    return (
        <div className="modal-overlay-attending" onClick={onClose}>
            <div className="modal-content-attending" onClick={(e) => e.stopPropagation()}>
                <button className="close-button-attending" onClick={onClose}>&times;</button>
                {!upImg ? (
                    <div className="upload-initial">
                        <h2>Create Your "I Will Be Seen" Photo</h2>
                        <div className="upload-options-attending">
                            <button onClick={() => cameraInputRef.current?.click()} className="upload-button-attending">Take Photo</button>
                            <button onClick={() => galleryInputRef.current?.click()} className="upload-button-attending">Choose from Gallery</button>
                        </div>
                        <input type="file" accept="image/*" capture="environment" ref={cameraInputRef} onChange={onSelectFile} style={{ display: 'none' }} />
                        <input type="file" accept="image/*" ref={galleryInputRef} onChange={onSelectFile} style={{ display: 'none' }} />
                    </div>
                ) : (
                    <div className="crop-container">
                        <h3>Crop Your Photo</h3>
                        <ReactCrop crop={crop} onChange={c => setCrop(c)} onComplete={c => setCompletedCrop(c)} aspect={aspect}>
                            <img ref={imgRef} src={upImg} alt="Crop preview" onLoad={onImageLoad} />
                        </ReactCrop>
                        <button onClick={handleUpload} disabled={isUploading} className="generate-button">
                            {isUploading ? 'Generating...' : 'Save & Generate Photo'}
                        </button>
                        <button onClick={() => setUpImg(null)} className="change-image-button">
                            Change Image
                        </button>
                    </div>
                )}
                {error && <p className="error-message">{error}</p>}
            </div>
        </div>
    );
};

export default AttendingCreateModal;
