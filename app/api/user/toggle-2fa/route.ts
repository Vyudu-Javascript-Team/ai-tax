import { NextResponse } from 'next/server';
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { generateTOTPSecret } from "@/lib/totp";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { enable } = await request.json();
    const userId = session.user.id;

    if (enable) {
      const totpSecret = generateTOTPSecret();
      await prisma.user.update({
        where: { id: userId },
        data: {
          twoFactorEnabled: true,
          totpSecret,
        },
      });
      return NextResponse.json({ message: "2FA enabled", totpSecret });
    } else {
      await prisma.user.update({
        where: { id: userId },
        data: {
          twoFactorEnabled: false,
          totpSecret: null,
        },
      });
      return NextResponse.json({ message: "2FA disabled" });
    }
  } catch (error) {
    console.error('Error toggling 2FA:', error);
    return NextResponse.json({ error: 'Failed to toggle 2FA' }, { status: 500 });
  }
}