import jwt from "jsonwebtoken";
import { Konfiguracija } from "../zajednicko/konfiguracija.js";

export class JWTPomocnik {
    private tajniKljuc: string;
    private valjanost: string;

    constructor(konf: Konfiguracija) {
        const konfiguracija = konf.dajKonf();
        this.tajniKljuc = konfiguracija.jwtTajniKljuc;
        this.valjanost = konfiguracija.jwtValjanost;
    }

    generirajToken(podaci: { korisnickoIme: string; tip: string }): string {
        return jwt.sign(
            { korisnickoIme: podaci.korisnickoIme, tip: podaci.tip },
            this.tajniKljuc,
            { expiresIn: `${this.valjanost}s` }
        );
    }

    provjeriToken(token: string): any {
        try {
            return jwt.verify(token, this.tajniKljuc);
        } catch (err) {
            throw new Error("JWT nije valjan");
        }
    }
}
