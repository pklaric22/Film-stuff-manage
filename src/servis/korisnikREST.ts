import { Request, Response } from "express";
import { DAO } from "./baza2DAO.js";
import { JWTPomocnik } from "../zajednicko/jwtPomocnik.js";

export class KorisnikREST {
    private dao: DAO;
    private jwtPomocnik: JWTPomocnik;

    constructor(dao: DAO, jwtPomocnik: JWTPomocnik) {
        this.dao = dao;
        this.jwtPomocnik = jwtPomocnik;
    }

    /*async obrisiKorisnika(req: Request, res: Response) {
        // Provjera JWT tokena
        const authHeader = req.headers.authorization;
        if (!this.provjeriJWT(authHeader, res)) return;

        const korime = req.params['korime'];
        if (!korime) {
            return res.status(400).json({ greska: "Nedostaje korisničko ime" });
        }

        try {
            const rezultat = await this.dao.obrisiKorisnika(korime);
            return res.status(200).json({ poruka: "Korisnik uspješno obrisan", rezultat });
        } catch (err) {
            return res.status(500).json({ greska: "Greška pri brisanju korisnika" });
        }
    }*/

    async dodajKorisnika(req: Request, res: Response) {

        const authHeader = req.headers.authorization;
        if (!this.provjeriJWT(authHeader, res)) return;

        const { korisnickoIme } = req.body;
        if (!korisnickoIme) {
            res.status(400).json({ greska: "Nedostaju podaci za korisnika." });
            return;
        }

        try {
            await this.dao.dodajKorisnika(korisnickoIme);
            res.status(201).json({ poruka: "Korisnik dodan." });
        } catch (error) {
            res.status(500).json({ greska: "Greška pri dodavanju korisnika." });
        }
    }

    private provjeriJWT(authHeader: string | undefined, res: Response): boolean {
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(406).json({ greska: "JWT nije prihvaćen" });
            return false;
        }

        const token = authHeader.split(" ")[1];
        if (!token) {
            res.status(406).json({ greska: "JWT nije valjan" });
            return false;
        }

        try {
            this.jwtPomocnik.provjeriToken(token);
            return true;
        } catch (err) {
            res.status(406).json({ greska: "JWT nije valjan" });
            return false;
        }
    }
}