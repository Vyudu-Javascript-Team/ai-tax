import { NextResponse } from "next/server";
import { createWorker } from 'tesseract.js';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";
import { extractTaxInfo } from "@/lib/tax-document-parser";

const prisma = new PrismaClient();

// Supported file types for OCR
const SUPPORTED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/tiff',
  'application/pdf',
];

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await request.formData();
  const file: File | null = data.get('file') as unknown as File;
  const taxReturnId = data.get('taxReturnId') as string;

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  if (!SUPPORTED_FILE_TYPES.includes(file.type)) {
    return NextResponse.json({ 
      error: "Unsupported file type. Please upload a JPEG, PNG, TIFF, or PDF file." 
    }, { status: 400 });
  }

  try {
    const buffer = await file.arrayBuffer();
    const base64Data = Buffer.from(buffer).toString('base64');
    const mimeType = file.type;
    const dataUrl = `data:${mimeType};base64,${base64Data}`;

    const worker = await createWorker('eng');
    const { data: { text } } = await worker.recognize(dataUrl);
    await worker.terminate();

    // Extract tax information from the OCR text
    const taxInfo = extractTaxInfo(text);

    // Save the document information to the database
    const document = await prisma.document.create({
      data: {
        fileName: file.name,
        fileType: file.type,
        fileUrl: "placeholder_url", // In a real scenario, you'd upload to cloud storage and store the URL
        userId: session.user.id,
        ...(taxReturnId ? { taxReturnId } : {}),
        metadata: {
          extractedText: text,
          taxInfo,
          processedAt: new Date().toISOString(),
          fileSize: buffer.byteLength,
          processingStatus: 'completed'
        },
      },
    });

    return NextResponse.json({ 
      success: true,
      documentId: document.id, 
      extractedInfo: taxInfo,
      text: text.substring(0, 200) + (text.length > 200 ? '...' : ''), // Preview of extracted text
    });
  } catch (error) {
    console.error("Error processing document:", error);
    return NextResponse.json({ 
      error: "Failed to process document",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
