import jwt from "jsonwebtoken";

function getSecret(): string {
  const s = process.env["JWT_SECRET"];
  if (!s) throw new Error("JWT_SECRET env var is not set");
  return s;
}

export interface MasterPayload {
  role: "master";
  iat?: number;
  exp?: number;
}

export function signMasterToken(expiresIn = "8h"): string {
  return jwt.sign({ role: "master" } as MasterPayload, getSecret(), { expiresIn } as jwt.SignOptions);
}

export function verifyMasterToken(token: string): MasterPayload {
  return jwt.verify(token, getSecret()) as MasterPayload;
}
