import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import crypto from "crypto";

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "No account found with this email" },
        { status: 404 }
      );
    }

    // Generate secure token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Save token to DB
    await prisma.passwordResetToken.create({
      data: {
        email,
        token,
        expiresAt,
      },
    });

    const resetLink = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;

    if (!resend) {
      console.warn("RESEND_API_KEY is missing; skipping reset email.");
      return NextResponse.json({
        message: "Password reset created, but email was not sent (missing API key).",
      });
    }

    // Send the email
    await resend.emails.send({
      from: "Acme <onboarding@resend.dev>",
      to: email,
      subject: "Reset Your Password",
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>Password Reset Request</h2>
          <p>Click the button below to reset your password.</p>
          <a href="${resetLink}" 
             style="display:inline-block;padding:10px 18px;background:#3b82f6;color:white;border-radius:8px;text-decoration:none;">
             Reset Password
          </a>
          <p style="margin-top:10px;font-size:14px;color:#555;">
            This link expires in 15 minutes.
          </p>
        </div>
      `,
    });

    return NextResponse.json({ message: "Reset email sent" });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
