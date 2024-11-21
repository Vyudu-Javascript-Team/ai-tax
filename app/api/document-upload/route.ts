import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";
import { DocumentWithMetadata } from "@/types/api";
import { extractDocumentMetadata } from "@/lib/services/DocumentProcessingService";

// Supported file types for OCR
const SUPPORTED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/tiff',
  'application/pdf',
];

export async function POST(req: Request) {
  try {
    const token = await getToken({ req });

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const taxReturnId = formData.get("taxReturnId") as string | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    if (!SUPPORTED_FILE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { 
          error: "Unsupported file type. Please upload a JPEG, PNG, TIFF, or PDF file." 
        }, { status: 400 });
    }

    // Process the file and extract metadata
    const metadata = await extractDocumentMetadata(file);

    // Store file in cloud storage (implementation depends on your storage solution)
    const fileUrl = await uploadFileToStorage(file);

    // Create document record in database
    const document = await prisma.document.create({
      data: {
        fileName: file.name,
        fileType: file.type,
        fileUrl,
        userId: token.id,
        taxReturnId,
        metadata: metadata || undefined,
      },
    });

    const response: DocumentWithMetadata = {
      ...document,
      metadata: metadata || null,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Document upload error:", error);
    return NextResponse.json(
      { error: "Error uploading document" },
      { status: 500 }
    );
  }
}

// Mock function - replace with your actual file storage implementation
async function uploadFileToStorage(file: File): Promise<string> {
  // This is where you would implement your file storage logic
  // For example, uploading to S3, Google Cloud Storage, etc.
  return `https://storage.example.com/${file.name}`;
}
