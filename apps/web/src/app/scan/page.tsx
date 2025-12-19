'use client';

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { CameraCapture } from "@/components/scan/CameraCapture";
import { Button } from "@culturelense/ui";
import { scanImage } from "@/actions/scan";

export default function ScanPage() {
  const router = useRouter();
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCapture = async (imageSrc: string) => {
    setIsScanning(true);
    setError(null);

    try {
      // Convert base64 to Blob/File
      const res = await fetch(imageSrc);
      const blob = await res.blob();
      const file = new File([blob], "scan.jpg", { type: "image/jpeg" });

      const formData = new FormData();
      formData.append("image", file);

      // Call Server Action
      const result = await scanImage(formData);

      if (result.success && result.data) {
        // Redirect to result page
        router.push(`/scan/result/${result.data.entity.slug}?confidence=${result.data.confidence}`);
      } else {
        setError(result.error || "Could not identify entity.");
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred.");
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-6">Scan Artifact</h1>
      
      {error && (
        <div className="bg-red-500/20 text-red-200 p-3 rounded mb-4 w-full text-center">
          {error}
        </div>
      )}

      {isScanning ? (
        <div className="flex flex-col items-center justify-center h-96">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-blue-300">Analyzing ancient patterns...</p>
        </div>
      ) : (
        <CameraCapture onCapture={handleCapture} />
      )}
      
      <div className="mt-8 text-sm text-gray-400">
        <p>Point at a deity or sculpture.</p>
      </div>
    </div>
  );
}
