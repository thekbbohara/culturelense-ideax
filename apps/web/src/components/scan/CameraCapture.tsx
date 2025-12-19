import React, { useRef, useCallback } from "react";
import Webcam from "react-webcam";
import { Button } from "@culturelense/ui";
import { Upload, X, Camera, RefreshCw, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { BackButton } from "../back-button";

interface CameraCaptureProps {
  onCapture: (fileOrSrc: string | File) => void;
  onRetake: () => void;
  imageSrc: string | null;
  isScanning: boolean;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({
  onCapture,
  onRetake,
  imageSrc,
  isScanning
}) => {
  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const capture = useCallback(() => {
    if (webcamRef.current) {
      const image = webcamRef.current.getScreenshot();
      if (image) onCapture(image);
    }
  }, [webcamRef, onCapture]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onCapture(e.target.files[0]);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto relative">
      <div className="relative w-full aspect-[3/4] bg-black rounded-lg overflow-hidden border border-gray-800 shadow-2xl">
        {imageSrc ? (
          <div className="relative w-full h-full">
            {/* Captured Image */}
            <img
              src={imageSrc}
              alt="captured"
              className="w-full h-full object-cover"
            />

            {/* Scanning Overlay */}
            {isScanning && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute inset-0 bg-blue-500/10 mix-blend-overlay" />
                <motion.div
                  initial={{ top: "-10%" }}
                  animate={{ top: "110%" }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                  className="absolute left-0 right-0 h-2 bg-gradient-to-b from-blue-400/0 via-blue-400/50 to-blue-400/0 w-full z-10 shadow-[0_0_20px_rgba(59,130,246,0.5)]"
                >
                  <div className="w-full h-[1px] bg-blue-400 shadow-[0_0_15px_#60a5fa]" />
                </motion.div>

                {/* Tech grid overlay effect */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06)_50%,rgba(0,0,0,0.25)_50%)] z-0 bg-[length:100%_4px,4px_100%] pointer-events-none" />
              </div>
            )}

            {/* Retake Button (Always visible when image is captured, even during scanning to allow cancel) */}
            <div className="absolute bottom-6 left-0 right-0 flex justify-center z-20">
              <Button
                onClick={onRetake}
                className="bg-red-500/80 hover:bg-red-600 text-white px-6 py-2 rounded-full backdrop-blur-sm flex items-center gap-2 transition-all"
              >
                <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
                {isScanning ? "Cancel Scan" : "Retake"}
              </Button>
            </div>
          </div>
        ) : (
          /* Webcam View */
          <div className="relative w-full h-full">
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="w-full h-full object-cover"
              videoConstraints={{ facingMode: "environment" }}
            />

            {/* Camera Controls */}
            <div className="absolute bottom-8 left-0 right-0 flex items-center justify-center gap-8 px-4">
              <BackButton href="/home" icon={<ArrowLeft />} direction="left" />
              {/* Capture Button */}
              <button
                onClick={capture}
                className="w-20 h-20 bg-transparent rounded-full border-4 border-white/80 flex items-center justify-center p-1 transition-transform active:scale-95"
                aria-label="Capture photo"
              >
                <div className="w-full h-full bg-white rounded-full border-2 border-black/50" />
              </button>

              {/* Upload Button */}
              <span
                onClick={triggerFileUpload}
                aria-label="Upload image"
              >
                {/* <Upload className="w-6 h-6" /> */}
                <BackButton href="/home" text="Upload" icon={<Upload />} direction="right" />

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
