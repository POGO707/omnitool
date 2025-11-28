import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, MapPin } from 'lucide-react';

export default function CameraTool() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    startCamera();
    getLocation();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setError("Camera access denied or not available.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.error("Geo error", err)
      );
    }
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const vid = videoRef.current;
      const cvs = canvasRef.current;
      cvs.width = vid.videoWidth;
      cvs.height = vid.videoHeight;
      const ctx = cvs.getContext('2d');
      if (ctx) {
        // Draw video
        ctx.drawImage(vid, 0, 0);
        
        // Overlay GPS
        if (location) {
          ctx.fillStyle = 'rgba(0,0,0,0.5)';
          ctx.fillRect(10, cvs.height - 60, cvs.width - 20, 50);
          ctx.fillStyle = 'white';
          ctx.font = '20px Arial';
          ctx.fillText(`Lat: ${location.lat.toFixed(5)}, Lng: ${location.lng.toFixed(5)}`, 20, cvs.height - 28);
        } else {
             ctx.fillStyle = 'rgba(0,0,0,0.5)';
             ctx.fillRect(10, cvs.height - 40, 200, 30);
             ctx.fillStyle = 'white';
             ctx.font = '16px Arial';
             ctx.fillText(`No GPS Data`, 20, cvs.height - 20);
        }

        setPhoto(cvs.toDataURL('image/png'));
      }
    }
  };

  const retake = () => {
    setPhoto(null);
  };

  return (
    <div className="max-w-xl mx-auto h-[calc(100vh-6rem)] flex flex-col">
      <div className="bg-white p-3 md:p-4 rounded-xl shadow-sm border mb-4 flex justify-between items-center shrink-0">
        <h2 className="font-bold text-lg flex items-center gap-2"><Camera size={20}/> GPS Camera</h2>
        {location ? (
            <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded flex items-center gap-1">
                <MapPin size={12}/> {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
            </span>
        ) : (
            <span className="text-xs text-orange-500 animate-pulse">Locating...</span>
        )}
      </div>

      <div className="flex-1 bg-black rounded-xl overflow-hidden relative shadow-lg min-h-0">
        {error ? (
          <div className="text-white flex items-center justify-center h-full text-center p-4">{error}</div>
        ) : photo ? (
          <img src={photo} alt="Captured" className="w-full h-full object-contain" />
        ) : (
          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      <div className="mt-4 md:mt-6 flex justify-center pb-4 shrink-0">
        {photo ? (
          <div className="flex gap-4">
             <button onClick={retake} className="px-6 py-3 bg-slate-200 rounded-full font-bold text-slate-800 hover:bg-slate-300 transition-colors">Retake</button>
             <a href={photo} download="gps_photo.png" className="px-6 py-3 bg-blue-600 rounded-full font-bold text-white hover:bg-blue-700 transition-colors">Download</a>
          </div>
        ) : (
          <button 
            onClick={takePhoto} 
            className="w-16 h-16 rounded-full border-4 border-white outline outline-2 outline-slate-300 bg-red-500 hover:bg-red-600 transition-colors shadow-lg active:scale-95"
          ></button>
        )}
      </div>
    </div>
  );
}
