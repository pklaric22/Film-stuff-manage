import { Request, Response, NextFunction } from "express";
import { JWTPomocnik } from "./jwtPomocnik.js";

export function provjeriJWT(jwtPomocnik: JWTPomocnik) {
    return (req: Request, res: Response, next: NextFunction) => {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(406).json({ greska: "JWT nije prihvaćen" });
        }

        const token = authHeader.split(" ")[1];
        if (!token) {
            return res.status(406).json({ greska: "JWT nije valjan" });
        }

        try {
            const decoded = jwtPomocnik.provjeriToken(token);
            (req as any).korisnik = decoded;
            return next();
        } catch (err) {
            return res.status(406).json({ greska: "JWT nije valjan" });
        }
    };
}
