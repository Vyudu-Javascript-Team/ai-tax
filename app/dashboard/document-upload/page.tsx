"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";

export default function DocumentUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/document-upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setExtractedText(data.text);
        toast({
          title: "Document Uploaded",
          description: "Your document has been successfully uploaded and processed.",
        });
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      console.error("Error uploading document:", error);
      toast({
        title: "Error",
        description: "Failed to upload and process the document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Upload Tax Document</h1>
      <Card>
        <CardHeader>
          <CardTitle>Document Upload</CardTitle>
        </CardHeader>
        <CardContent>
          <Input type="file" onChange={handleFileChange} className="mb-4" accept=".pdf,.jpg,.jpeg,.png" />
          <Button onClick={handleUpload} disabled={!file || uploading}>
            {uploading ? "Processing..." : "Upload and Process"}
          </Button>
          {extractedText && (
            <div className="mt-4">
              <h3 className="font-bold">Extracted Text:</h3>
              <pre className="bg-gray-100 p-4 rounded mt-2 whitespace-pre-wrap">
                {extractedText}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}