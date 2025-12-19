'use client';

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { CameraCapture } from "@/components/scan/CameraCapture";
import { scanImage } from "@/actions/scan";

export default function ScanPage() {
  const router = useRouter();
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  const cleanupImage = () => {
    if (imageSrc && imageSrc.startsWith('blob:')) {
      URL.revokeObjectURL(imageSrc);
    }
    setImageSrc(null);
  };

  const handleRetake = () => {
    setIsScanning(false);
    setError(null);
    cleanupImage();
  };

  const runScan = async (file: File) => {
    setIsScanning(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const result = await scanImage(formData);

      if (result.success && result.data) {
        const { entity, confidence, top_3 } = result.data;

        // Ensure slug format
        const slug = entity?.slug.toLowerCase().trim().replace(/\s+/g, '-');

        let finalConfidence = confidence || 0;

        if (top_3 && Array.isArray(top_3) && top_3.length > 0) {
          try {
            const exps = top_3.map((item: any) => Math.exp(item.confidence));
            const sum = exps.reduce((a: number, b: number) => a + b, 0);
            finalConfidence = Math.exp(confidence) / sum;
          } catch (e) {
            console.warn("Softmax calc failed", e);
          }
        }

        const params = new URLSearchParams(); 
        params.set('confidence', finalConfidence.toString());

        const passedData = {
          prediction: entity?.slug,
          entity: entity,
          confidence: confidence,
          top_3: top_3
        };
        params.set('data', JSON.stringify(passedData));

        router.push(`/scan/result/${slug}?${params.toString()}`);
      } else {
        throw new Error(result.error || "Failed to identify object.");
      }

    } catch (err: any) {
      console.error("Scan failed:", err);
      setError(err.message || "Failed to scan image.");
      setIsScanning(false);
    }
  };

  const handleCapture = async (fileOrSrc: string | File) => {
    let file: File;
    let previewUrl: string;

    if (fileOrSrc instanceof File) {
      file = fileOrSrc;
      previewUrl = URL.createObjectURL(file);
    } else {
      // base64 string
      previewUrl = fileOrSrc;
      const res = await fetch(fileOrSrc);
      const blob = await res.blob();
      file = new File([blob], "capture.jpg", { type: "image/jpeg" });
    }

    setImageSrc(previewUrl);
    runScan(file);
  };

  // Cleanup object URL
  React.useEffect(() => {
    return () => {
      if (imageSrc && imageSrc.startsWith('blob:')) {
        URL.revokeObjectURL(imageSrc);
      }
    };
  }, [imageSrc]);

  return (
    <div className="min-h-screen bg-black text-white p-4 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-6">Scan Artifact</h1>

      {error && (
        <div className="bg-red-500/20 text-red-200 p-3 rounded mb-4 w-full text-center max-w-md">
          {error}
        </div>
      )}

      <CameraCapture
        onCapture={handleCapture}
        onRetake={handleRetake}
        imageSrc={imageSrc}
        isScanning={isScanning}
      />

      <div className="mt-8 text-sm text-gray-400 text-center">
        <p>Point at a deity or sculpture.</p>
        <p className="text-xs mt-2 text-gray-500">Supports JPG, PNG</p>
      </div>
    </div>
  );
}
