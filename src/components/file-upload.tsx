"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Upload, X, FileImage } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FileUploadProps {
  value: (File | string)[];
  onChange: (files: (File | string)[]) => void;
}

export function FileUpload({ value = [], onChange }: FileUploadProps) {
  const [previews, setPreviews] = useState<(string | ArrayBuffer | null)[]>([]);

  useEffect(() => {
    const generatePreviews = async () => {
      const newPreviews = await Promise.all(
        value.map((file) => {
          if (typeof file === "string") {
            return Promise.resolve(file);
          }
          return new Promise<string | ArrayBuffer | null>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(file);
          });
        })
      );
      setPreviews(newPreviews);
    };
    generatePreviews();
  }, [value]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      onChange([...value, ...newFiles]);
    }
  };

  const handleRemove = (index: number) => {
    const updatedFiles = value.filter((_, i) => i !== index);
    onChange(updatedFiles);
  };

  return (
    <div>
      <div className="mb-4 p-6 border-2 border-dashed border-border rounded-lg text-center bg-card">
        <label
          htmlFor="file-upload"
          className="cursor-pointer flex flex-col items-center"
        >
          <Upload className="w-10 h-10 text-muted-foreground mb-2" />
          <span className="text-primary font-semibold">Click to upload</span>
          <span className="text-muted-foreground text-sm"> or drag and drop</span>
          <p className="text-xs text-muted-foreground mt-2">
            PNG, JPG, GIF up to 10MB
          </p>
          <input
            id="file-upload"
            type="file"
            multiple
            onChange={handleFileChange}
            className="hidden"
            accept="image/png, image/jpeg, image/gif"
          />
        </label>
      </div>
      {previews.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {previews.map((preview, index) => (
            <div key={index} className="relative group aspect-square">
              <div className="absolute inset-0 rounded-md overflow-hidden border">
                {preview ? (
                  <Image
                    src={preview as string}
                    alt={`Preview ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <FileImage className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}
              </div>
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2 h-7 w-7 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleRemove(index)}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Remove image</span>
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
