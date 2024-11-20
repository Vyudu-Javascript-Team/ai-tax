import * as OTPAuth from "otpauth";

export function generateTOTP(secret: string): string {
  const totp = new OTPAuth.TOTP({
    issuer: "AI Tax Prep",
    label: "User",
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromBase32(secret),
  });

  return totp.generate();
}

export function verifyTOTP(secret: string, token: string): boolean {
  const totp = new OTPAuth.TOTP({
    issuer: "AI Tax Prep",
    label: "User",
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromBase32(secret),
  });

  return totp.validate({ token }) !== null;
}

export function generateTOTPSecret(): string {
  return OTPAuth.Secret.generate();
}