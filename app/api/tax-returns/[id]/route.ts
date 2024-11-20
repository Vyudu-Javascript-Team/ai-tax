import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const taxReturn = await prisma.taxReturn.findUnique({
      where: { id: params.id },
    });

    if (!taxReturn) {
      return NextResponse.json({ error: "Tax return not found" }, { status: 404 });
    }

    if (taxReturn.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json(taxReturn);
  } catch (error) {
    console.error("Error fetching tax return:", error);
    return NextResponse.json({ error: "Failed to fetch tax return" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { status, income, deductions, taxCredits } = body;

    const updateData: any = {};
    if (status) updateData.status = status;
    if (income !== undefined) updateData.income = income;
    if (deductions !== undefined) updateData.deductions = deductions;
    if (taxCredits !== undefined) updateData.taxCredits = taxCredits;

    const taxReturn = await prisma.taxReturn.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json(taxReturn);
  } catch (error) {
    console.error("Error updating tax return:", error);
    return NextResponse.json({ error: "Failed to update tax return" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await prisma.taxReturn.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Tax return deleted successfully" });
  } catch (error) {
    console.error("Error deleting tax return:", error);
    return NextResponse.json({ error: "Failed to delete tax return" }, { status: 500 });
  }
}