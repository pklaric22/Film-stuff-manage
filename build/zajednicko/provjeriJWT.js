export function provjeriJWT(jwtPomocnik) {
    return (req, res, next) => {
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
            req.korisnik = decoded;
            return next();
        }
        catch (err) {
            return res.status(406).json({ greska: "JWT nije valjan" });
        }
    };
}
