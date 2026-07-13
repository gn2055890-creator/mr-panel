import type { Request, Response, NextFunction } from "express";
import { verifyMasterToken } from "../lib/jwt";

export function requireJwt(req: Request, res: Response, next: NextFunction): void {
  const auth = req.headers["authorization"];
  if (!auth || !auth.startsWith("Bearer ")) {
    res.status(401).json({ error: "Authorization header missing or invalid" });
    return;
  }
  const token = auth.slice(7);
  try {
    const payload = verifyMasterToken(token);
    if (payload.role !== "master") {
      res.status(403).json({ error: "Forbidden: insufficient role" });
      return;
    }
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}
