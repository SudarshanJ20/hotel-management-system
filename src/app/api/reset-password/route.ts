import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    // Look for the reset token
    const record = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!record) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 400 }
      );
    }

    // Check expiry
    if (record.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Token expired" },
        { status: 400 }
      );
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Update user password
    await prisma.user.update({
      where: { email: record.email },
      data: { password: hashed },
    });

    // Delete token after use
    await prisma.passwordResetToken.delete({
      where: { token },
    });

    return NextResponse.json({ message: "Password updated" });
  } catch (error) {
    console.log("Reset password error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
