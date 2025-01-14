import jwt from "jsonwebtoken";
export class JWTPomocnik {
    tajniKljuc;
    valjanost;
    constructor(konf) {
        const konfiguracija = konf.dajKonf();
        this.tajniKljuc = konfiguracija.jwtTajniKljuc;
        this.valjanost = konfiguracija.jwtValjanost;
    }
    generirajToken(podaci) {
        return jwt.sign({ korisnickoIme: podaci.korisnickoIme, tip: podaci.tip }, this.tajniKljuc, { expiresIn: `${this.valjanost}s` });
    }
    provjeriToken(token) {
        try {
            return jwt.verify(token, this.tajniKljuc);
        }
        catch (err) {
            throw new Error("JWT nije valjan");
        }
    }
}
