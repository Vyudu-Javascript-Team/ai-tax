import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { SignupRequest, SignupResponse } from "@/types/api";

export async function POST(req: Request) {
  try {
    const data: SignupRequest = await req.json();

    const { email, password, firstName, lastName, companyName, plan } = data;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await hash(password, 10);

    // Create user with extended fields
    const user = await prisma.user.create({
      data: {
        email,
        hashedPassword,
        firstName,
        lastName,
        companyName,
        phoneNumber: data.phoneNumber,
        plan,
        role: "USER",
        subscriptionStatus: "TRIAL",
        trialEndDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days trial
        referralCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
      },
    });

    // Remove sensitive data before sending response
    const { hashedPassword: _, ...userWithoutPassword } = user;

    const response: SignupResponse = {
      user: {
        ...userWithoutPassword,
        role: userWithoutPassword.role as "USER" | "ADMIN" | "ACCOUNTANT",
      },
      message: "User created successfully",
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Error creating user" },
      { status: 500 }
    );
  }
}
