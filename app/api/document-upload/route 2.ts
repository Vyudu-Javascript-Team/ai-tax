import { NextResponse } from "next/server";
import { createWorker } from 'tesseract.js';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";
import { extractTaxInfo } from "@/lib/tax-document-parser";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await request.formData();
  const file: File | null = data.get('file') as unknown as File;

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  try {
    const buffer = await file.arrayBuffer();
    const worker = await createWorker('eng');
    const { data: { text } } = await worker.recognize(new Uint8Array(buffer));
    await worker.terminate();

    // Extract tax information from the OCR text
    const taxInfo = extractTaxInfo(text);

    // Save the document information to the database
    const document = await prisma.document.create({
      data: {
        fileName: file.name,
        fileType: file.type,
        fileUrl: "placeholder_url", // In a real scenario, you'd upload to cloud storage and store the URL
        taxReturn: {
          connect: {
            id: data.get('taxReturnId') as string,
          },
        },
        extractedInfo: taxInfo,
      },
    });

    return NextResponse.json({ text, documentId: document.id, extractedInfo: taxInfo });
  } catch (error) {
    console.error("Error processing document:", error);
    return NextResponse.json({ error: "Failed to process document" }, { status: 500 });
  }
}