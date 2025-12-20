'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  value?: string;
  onChange?: (value: string) => void;
  onFileChange: (file: File | null) => void;
  disabled?: boolean;
}

export function ImageUpload({ value, onChange, onFileChange, disabled }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      toast.error('Invalid file type. Please upload an image (JPEG, PNG, WebP, or GIF).');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('File size too large. Maximum size is 5MB.');
      return;
    }

    onFileChange(file);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemove = () => {
    if (onChange) onChange('');
    onFileChange(null);
  };

  return (
    <div className="space-y-4 w-full flex flex-col items-center justify-center">
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileSelect}
        disabled={disabled}
      />

      {value ? (
        <div className="relative w-full aspect-square md:aspect-[5/4] rounded-lg overflow-hidden border border-border shadow-sm group">
          <Image
            src={value}
            alt="Product image"
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
          <div className="absolute top-2 right-2">
            <Button
              type="button"
              onClick={handleRemove}
              variant="destructive"
              size="icon"
              className="h-8 w-8 rounded-full opacity-90 hover:opacity-100 transition-opacity"
              disabled={disabled}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            'w-full aspect-video max-h-[300px] rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors flex flex-col items-center justify-center cursor-pointer bg-muted/5 gap-2',
            disabled && 'opacity-50 cursor-not-allowed hover:border-muted-foreground/25',
          )}
        >
          <div className="p-4 rounded-full bg-primary/10 text-primary mb-2">
            <Upload className="h-6 w-6" />
          </div>
          <div className="text-center px-4">
            <p className="text-sm font-medium">Click to upload image</p>
            <p className="text-xs text-muted-foreground mt-1">SVG, PNG, JPG or GIF (max. 5MB)</p>
          </div>
        </div>
      )}
    </div>
  );
}
