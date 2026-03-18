import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

const requiredEnv = ["SMTP_HOST", "SMTP_USER", "SMTP_PASS", "CONTACT_TO_EMAIL"] as const;

function getEnv() {
  const env = {
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT || "587",
    SMTP_SECURE: process.env.SMTP_SECURE === "true",
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
    CONTACT_TO_EMAIL: process.env.CONTACT_TO_EMAIL,
  };
  const missing = requiredEnv.filter((k) => !env[k]);
  return { env, missing };
}

export async function POST(request: Request) {
  try {
    const { env, missing } = getEnv();
    if (missing.length > 0) {
      return NextResponse.json(
        { error: "Server email not configured. Missing: " + missing.join(", ") },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required." },
        { status: 400 }
      );
    }

    const port = parseInt(env.SMTP_PORT!, 10) || 587;
    const transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port,
      secure: env.SMTP_SECURE,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });

    await transporter.verify();

    const subjectLabel =
      { partnership: "Partnership", support: "Support", sales: "Sales", other: "Other" }[subject] || subject || "Other";

    await transporter.sendMail({
      from: env.SMTP_USER!,
      to: env.CONTACT_TO_EMAIL!,
      replyTo: email,
      subject: `[LinkHexa Contact] ${subjectLabel}: ${name}`,
      text: [
        `From: ${name} <${email}>`,
        `Subject: ${subjectLabel}`,
        "",
        message,
      ].join("\n"),
      html: [
        `<p><strong>From:</strong> ${name} &lt;${email}&gt;</p>`,
        `<p><strong>Topic:</strong> ${subjectLabel}</p>`,
        `<p><strong>Message:</strong></p>`,
        `<pre style="white-space:pre-wrap;font-family:inherit;">${message.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre>`,
      ].join(""),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const code = err && typeof err === "object" && "code" in err ? (err as { code: string }).code : "";
    console.error("Contact form send error:", message, code || "", err);

    if (code === "EAUTH" || message.toLowerCase().includes("invalid login") || message.toLowerCase().includes("authentication")) {
      return NextResponse.json(
        { error: "SMTP authentication failed. Check SMTP_USER and SMTP_PASS (e.g. use an app password for Gmail)." },
        { status: 500 }
      );
    }
    if (code === "ECONNECTION" || code === "ETIMEDOUT" || message.toLowerCase().includes("econnrefused")) {
      return NextResponse.json(
        { error: "Could not connect to SMTP server. Check SMTP_HOST, SMTP_PORT, and SMTP_SECURE." },
        { status: 500 }
      );
    }
    if (process.env.NODE_ENV === "development") {
      return NextResponse.json(
        { error: "Failed to send email.", detail: message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: "Failed to send message. Please try again or email us directly." },
      { status: 500 }
    );
  }
}
