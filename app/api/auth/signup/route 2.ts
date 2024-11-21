import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { name, companyName, phoneNumber, email, password, plan, referralCode } = await request.json();

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const trialEndDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

    let referrer = null;
    if (referralCode) {
      referrer = await prisma.user.findUnique({
        where: { referralCode },
      });
    }

    const user = await prisma.user.create({
      data: {
        name,
        companyName,
        phoneNumber,
        email,
        hashedPassword,
        plan,
        trialEndDate,
        referralCode: uuidv4(),
        referredBy: referrer ? referrer.id : null,
      },
    });

    if (referrer) {
      await prisma.user.update({
        where: { id: referrer.id },
        data: {
          referralCount: { increment: 1 },
          referralDiscount: { increment: 10 },
        },
      });
    }

    return NextResponse.json({ 
      user: { 
        id: user.id, 
        email: user.email, 
        referralCode: user.referralCode 
      } 
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "An error occurred during registration" }, { status: 500 });
  }
}