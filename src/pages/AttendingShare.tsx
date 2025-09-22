import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import './AttendingShare.css';

interface Photo {
    url: string;
    createdAt: Date;
}

const AttendingShare: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [photo, setPhoto] = useState<Photo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isPreparingShare, setIsPreparingShare] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    
    const pageTitle = "I Will Be Seen At #GEF Ghana 2025!";
    const pageDescription = "I've created my personalized photo for the Global Entrepreneurship Festival. Create yours and join the movement!";

    useEffect(() => {
        const fetchPhoto = async () => {
            if (!id) return;
            try {
                const docRef = doc(db, 'photos', id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) setPhoto(docSnap.data() as Photo);
                else setError("Photo not found.");
            } catch (err) { setError("Failed to load photo."); } 
            finally { setLoading(false); }
        };
        fetchPhoto();
    }, [id]);

    const handleDownload = async () => {
        if (!photo) return;
        
        setIsDownloading(true);
        try {
            // Method 1: Try direct download with CORS mode
            try {
                const response = await fetch(photo.url, {
                    mode: 'cors',
                    headers: {
                        'Origin': window.location.origin
                    }
                });
                
                if (response.ok) {
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `gef-selfie-${id || 'photo'}.jpg`;
                    document.body.appendChild(link);
                    link.click();
                    
                    document.body.removeChild(link);
                    window.URL.revokeObjectURL(url);
                    return;
                }
            } catch (corsError) {
                console.log('CORS fetch failed, trying alternative method');
            }
            
            // Method 2: Try with no-cors mode (fallback)
            try {
                const response = await fetch(photo.url, { mode: 'no-cors' });
                const blob = await response.blob();
                
                if (blob.size > 0) {
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `gef-selfie-${id || 'photo'}.jpg`;
                    document.body.appendChild(link);
                    link.click();
                    
                    document.body.removeChild(link);
                    window.URL.revokeObjectURL(url);
                    return;
                }
            } catch (noCorsError) {
                console.log('No-cors fetch failed, trying direct link method');
            }
            
            // Method 3: Direct link download (opens in new tab/downloads directly)
            const link = document.createElement('a');
            link.href = photo.url;
            link.download = `gef-selfie-${id || 'photo'}.jpg`;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
        } catch (error) {
            console.error('Error downloading image:', error);
            
            // Final fallback: Open image in new tab with download suggestion
            const newWindow = window.open(photo.url, '_blank');
            if (newWindow) {
                // Show user instruction
                alert('Please right-click on the image and select "Save image as..." to download.');
            } else {
                alert('Download blocked by browser. Please allow popups and try again, or right-click the image above and select "Save image as..."');
            }
        } finally {
            setIsDownloading(false);
        }
    };

    const handleShare = async (platform: 'twitter' | 'facebook' | 'linkedin' | 'native') => {
        const shareUrl = window.location.href;
        const text = "I will be Seen at #GEF Ghana 2025! Create your own photo and join me at the Global Entrepreneurship Festival. #GEFGhana2025 #GlobalEntrepreneurshipFestival";

        if (platform === 'native' && navigator.share && photo) {
            setIsPreparingShare(true);
            try {
                // First, try to share both image and text together
                const response = await fetch(photo.url);
                const blob = await response.blob();
                const file = new File([blob], 'gef-selfie.jpg', { type: 'image/jpeg' });
                
                // Check if we can share files
                if (navigator.canShare && navigator.canShare({ files: [file] })) {
                    // Try sharing with files, text, and URL together
                    try {
                        await navigator.share({ 
                            files: [file],
                            text: `${text}\n\n${shareUrl}`,
                            title: pageTitle
                        });
                    } catch (fileShareError) {
                        // If that fails, try sharing file only first, then prompt for text
                        await navigator.share({ files: [file] });
                        // Small delay then share the text
                        setTimeout(async () => {
                            try {
                                await navigator.share({ 
                                    text: `${text}\n\n${shareUrl}`,
                                    title: pageTitle
                                });
                            } catch (textError) {
                                console.log('Text share after image failed:', textError);
                            }
                        }, 1000);
                    }
                } else {
                    // Fallback: share text and URL only
                    await navigator.share({ 
                        title: pageTitle, 
                        text: `${text}\n\n${shareUrl}`
                    });
                }
            } catch (error) {
                console.error('Error sharing:', error);
                try {
                    // Final fallback: text only
                    await navigator.share({ 
                        title: pageTitle, 
                        text: `${text}\n\n${shareUrl}`
                    });
                } catch (fallbackError) {
                    // Ultimate fallback: copy to clipboard
                    navigator.clipboard.writeText(`${text}\n\n${shareUrl}`);
                    alert('Content copied to clipboard!');
                }
            } finally {
                setIsPreparingShare(false);
            }
        } else if (platform === 'twitter') {
            const twitterText = `${text} ${shareUrl}`;
            const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterText)}`;
            window.open(twitterUrl, '_blank');
        } else if (platform === 'facebook') {
            const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(text)}`;
            window.open(facebookUrl, '_blank');
        } else if (platform === 'linkedin') {
            const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(pageTitle)}&summary=${encodeURIComponent(text)}`;
            window.open(linkedInUrl, '_blank');
        }
    };

    if (loading) return (
        <div className="share-page-container">
            <div className="loading-card">
                <p>Loading Photo...</p>
            </div>
        </div>
    );
    
    if (error) return (
        <div className="share-page-container">
            <div className="error-card">
                <p className="error-message">{error}</p>
                <Link to="/attending" className="cta-button">
                    Create My #GEF Photo
                </Link>
            </div>
        </div>
    );

    return (
        <HelmetProvider>
            <Helmet>
                <title>{pageTitle}</title>
                <meta name="description" content={pageDescription} />
                <meta property="og:title" content={pageTitle} />
                <meta property="og:description" content={pageDescription} />
                <meta property="og:image" content={photo?.url} />
                <meta property="og:url" content={window.location.href} />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={pageTitle} />
                <meta name="twitter:description" content={pageDescription} />
                <meta name="twitter:image" content={photo?.url} />
            </Helmet>
            <div className="share-page-container">
                {photo && (
                    <div className="share-card">
                        <div className="photo-container">
                            <img src={photo.url} alt="I will be Seen at GEF" className="shared-photo" />
                        </div>
                        <div className="share-content">
                            <h2>I've created my #GEF selfie!</h2>
                            <p>Join me in building the excitement for the Global Entrepreneurship Festival in Ghana, 2025.</p>
                            
                            <div className="share-buttons">
                                {/* Download Button - First in order */}
                                <button 
                                    onClick={handleDownload} 
                                    className="share-button download" 
                                    disabled={isDownloading}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
                                    </svg>
                                    {isDownloading ? 'Downloading...' : 'Download'}
                                </button>

                                {/* Native Share Button */}
                                <button 
                                    onClick={() => handleShare('native')} 
                                    className="share-button native" 
                                    disabled={isPreparingShare}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/>
                                    </svg>
                                    {isPreparingShare ? 'Preparing...' : 'Share'}
                                </button>
                                
                                {/* Social Media Share Buttons */}
                                <button onClick={() => handleShare('twitter')} className="share-button twitter">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                                    </svg>
                                    Share on Twitter
                                </button>
                                
                                <button onClick={() => handleShare('facebook')} className="share-button facebook">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                    </svg>
                                    Share on Facebook
                                </button>
                                
                                <button onClick={() => handleShare('linkedin')} className="share-button linkedin">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                                    </svg>
                                    Share on LinkedIn
                                </button>
                            </div>
                            
                            <div className="cta-section">
                                <h3>Want to create your own?</h3>
                                <Link to="/attending" className="cta-button">
                                    Create My #GEF Photo
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </HelmetProvider>
    );
};

export default AttendingShare;