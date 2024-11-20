import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { year } = await request.json();
    const taxReturn = await prisma.taxReturn.create({
      data: {
        year,
        userId: session.user.id,
      },
    });
    return NextResponse.json(taxReturn);
  } catch (error) {
    console.error("Error creating tax return:", error);
    return NextResponse.json({ error: "Failed to create tax return" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const taxReturns = await prisma.taxReturn.findMany({
      where: { userId: session.user.id },
    });
    return NextResponse.json(taxReturns);
  } catch (error) {
    console.error("Error fetching tax returns:", error);
    return NextResponse.json({ error: "Failed to fetch tax returns" }, { status: 500 });
  }
}