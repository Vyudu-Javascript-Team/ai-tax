import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { firstName, lastName, companyName, phoneNumber, email, password, plan, referralCode } = await request.json();

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
        firstName,
        lastName,
        companyName,
        phoneNumber,
        email,
        hashedPassword,
        plan,
        trialEndDate,
        referralCode: uuidv4(),
        referredBy: referrer ? referrer.id : null,
        role: 'USER',
        subscriptionStatus: 'TRIAL',
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
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      companyName: user.companyName,
      plan: user.plan,
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: "Error creating user" },
      { status: 500 }
    );
  }
}
