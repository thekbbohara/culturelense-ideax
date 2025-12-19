import React, { useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";
import { Button } from "@culturelense/ui";

interface CameraCaptureProps {
  onCapture: (imageSrc: string) => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture }) => {
  const webcamRef = useRef<Webcam>(null);
  const [imgSrc, setImgSrc] = useState<string | null>(null);

  const capture = useCallback(() => {
    if (webcamRef.current) {
      const image = webcamRef.current.getScreenshot();
      setImgSrc(image);
      if (image) onCapture(image);
    }
  }, [webcamRef, onCapture]);

  const retake = () => {
    setImgSrc(null);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto">
      {imgSrc ? (
        <div className="relative">
          <img src={imgSrc} alt="captured" className="rounded-lg shadow-lg" />
          <Button onClick={retake} className="mt-4 bg-gray-600 text-white px-6 py-2 rounded-full absolute bottom-4 left-1/2 transform -translate-x-1/2">
            Retake
          </Button>
        </div>
      ) : (
        <div className="relative w-full aspect-[3/4] bg-black rounded-lg overflow-hidden">
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            className="w-full h-full object-cover"
            videoConstraints={{ facingMode: "environment" }}
          />
          <Button
            onClick={capture}
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-white rounded-full border-4 border-gray-300 shadow-xl flex items-center justify-center"
            aria-label="Capture photo"
          >
            <div className="w-12 h-12 bg-red-500 rounded-full"></div>
          </Button>
        </div>
      )}
    </div>
  );
};
