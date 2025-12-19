'use client';

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { CameraCapture } from "@/components/scan/CameraCapture";
// import { scanImage } from "@/actions/scan"; // Keeping commented or removing. I will remove it.
import axios from "axios";

export default function ScanPage() {
  const router = useRouter();
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const abortControllerRef = React.useRef<AbortController | null>(null);

  const cleanupImage = () => {
    if (imageSrc && imageSrc.startsWith('blob:')) {
      URL.revokeObjectURL(imageSrc);
    }
    setImageSrc(null);
  };

  const handleRetake = () => {
    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsScanning(false);
    setError(null);
    cleanupImage();
  };

  const runScan = async (file: File) => {
    setIsScanning(true);
    setError(null);

    // Create new abort controller
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SPATIAL_URL}/predict`, // Corrected URL syntax
        formData,
        {
          signal: controller.signal,
          headers: {
            'Content-Type': 'multipart/form-data', // Axios handles boundary automatically but explicit header is sometimes nice, usually better to let browser handle it. I'll omit custom headers for FormData as is best practice.
          }
        }
      );

      console.log("Result:", response.data);

      if (response.data) {
        const data = response.data;
        console.log("Scan Data:", data);

        if (data.prediction) {
          // Ensure slug format
          const slug = data.prediction.toLowerCase().trim().replace(/\s+/g, '-');

          // Calculate normalized confidence (Softmax proxy) if top_3 is available
          let confidence = data.confidence || 0;
          if (data.top_3 && Array.isArray(data.top_3) && data.top_3.length > 0) {
            try {
              const exps = data.top_3.map((item: any) => Math.exp(item.confidence));
              const sum = exps.reduce((a: number, b: number) => a + b, 0);
              // Use finding the matching confidence from top_3 or just use main confidence (assuming it matches one)
              // The main confidence is 5.84, which matches top_3[0].
              confidence = Math.exp(data.confidence) / sum;
            } catch (e) {
              // Fallback to raw value if calc fails
              console.warn("Softmax calc failed", e);
            }
          }

          const params = new URLSearchParams();
          params.set('confidence', confidence.toString());
          params.set('data', JSON.stringify(data));

          router.push(`/scan/result/${slug}?${params.toString()}`);
        } else {
          if (!data.entity) throw new Error("No entity identified");
        }
      }

    } catch (err: any) {
      if (axios.isCancel(err)) {
        console.log('Request canceled');
      } else {
        console.error("Scan failed:", err);
        setError(err.message || "Failed to scan image.");
        setIsScanning(false); 
      }
    } finally {
      // Don't set isScanning(false) if successful redirect happens? 
      // Actually usually better to keep loading state until unmount.
      // If error, we stopped above.
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
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

  // Cleanup abort controller on unmount
  React.useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

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
