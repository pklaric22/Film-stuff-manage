import { Request, Response } from "express";
import { DAO } from "./baza2DAO.js";
import { JWTPomocnik } from "../zajednicko/jwtPomocnik.js";

export class OsobaREST {
    private dao: DAO;
    private jwtPomocnik: JWTPomocnik;

    constructor(dao: DAO, jwtPomocnik: JWTPomocnik) {
        this.dao = dao;
        this.jwtPomocnik = jwtPomocnik;
    }

    async dohvatiOsobe(req: Request, res: Response) {

        const authHeader = req.headers.authorization;
        if (!this.provjeriJWT(authHeader, res)) return;

        const stranica = parseInt(req.query['stranica'] as string) || 1;
        const perPage = 20;

        try {
            const osobe = await this.dao.dodajOsobe(stranica, perPage);
            return res.status(200).json(osobe);
        } catch (err) {
            return res.status(500).json({ greska: "Greška pri dohvaćanju osoba" });
        }
    }

    async dodajOsobu(req: Request, res: Response) {
        // Provjera JWT tokena
        const authHeader = req.headers.authorization;
        if (!this.provjeriJWT(authHeader, res)) return;

        const { imePrezime, poznatPoOdjelu, popularnost, profilnaSlika } = req.body;
        if (!imePrezime || !poznatPoOdjelu || !popularnost || !profilnaSlika) {
            return res.status(400).json({ greska: "Nedostaju podaci za osobu" });
        }

        try {
            await this.dao.dodajOsobu(imePrezime, poznatPoOdjelu, popularnost, profilnaSlika);
            return res.status(201).json({ poruka: "Osoba uspješno dodana" });
        } catch (err) {
            return res.status(500).json({ greska: "Greška pri dodavanju osobe" });
        }
    }

    async dohvatiOsobu(req: Request, res: Response) {

        const authHeader = req.headers.authorization;
        if (!this.provjeriJWT(authHeader, res)) return;

        const id = parseInt(req.params['id'] || '');
        if (isNaN(id)) {
            return res.status(400).json({ greska: "Neispravan ID osobe" });
        }

        try {
            const osoba = await this.dao.dodajOsobuPremaId(id);
            if (!osoba) {
                return res.status(404).json({ greska: "Osoba nije pronađena" });
            }
            return res.status(200).json(osoba);
        } catch (err) {
            return res.status(500).json({ greska: "Greška pri dohvaćanju osobe" });
        }
    }

    async deleteOsoba(req: Request, res: Response) {
  
        const authHeader = req.headers.authorization;
        if (!this.provjeriJWT(authHeader, res)) return;

        const id = parseInt(req.params['id'] || '');
        if (isNaN(id)) {
            return res.status(400).json({ greska: "Neispravan ID osobe" });
        }

        try {
            await this.dao.obrisiOsobu(id);
            return res.status(200).json({ poruka: "Osoba uspješno obrisana" });
        } catch (err) {
            return res.status(500).json({ greska: "Greška pri brisanju osobe" });
        }
    }

    async poveziOsobuSaFilmom(req: Request, res: Response) {

        const authHeader = req.headers.authorization;
        if (!this.provjeriJWT(authHeader, res)) return;

        const osobaId = parseInt(req.params['osobaId'] || '');
        const { filmovi, lik } = req.body;

        if (isNaN(osobaId) || !Array.isArray(filmovi) || filmovi.length === 0 || !lik) {
            return res.status(400).json({ greska: "Neispravni podaci za povezivanje osobe s filmom" });
        }

        try {
            for (const filmId of filmovi) {
                const filmIdInt = parseInt(filmId);
                if (!isNaN(filmIdInt)) {
                    console.log(`Povezivanje osobe ${osobaId} s filmom ${filmIdInt} i likom ${lik}`);
                    await this.dao.dodajUlogu(osobaId, filmIdInt, lik);
                } else {
                    console.log(`Neispravan filmId: ${filmId}`);
                }
            }
            return res.status(200).json({ poruka: "Osoba uspješno povezana s filmovima" });
        } catch (err) {
            console.error("Greška:", err);
            return res.status(500).json({ greska: "Greška pri povezivanju osobe s filmovima" });
        }
    }

    async getFilmoviOsobe(req: Request, res: Response) {

        const authHeader = req.headers.authorization;
        if (!this.provjeriJWT(authHeader, res)) return;

        const osobaId = parseInt(req.params['osobaId'] || '');
        const stranica = parseInt(req.query['stranica'] as string) || 1;
        const perPage = 20;

        if (isNaN(osobaId) || osobaId <= 0) {
            return res.status(400).json({ greska: "Neispravan ID osobe" });
        }

        try {
            const filmovi = await this.dao.dohvatiFilmovePremaOsobaId(osobaId, stranica, perPage);
            return res.status(200).json(filmovi);
        } catch (err) {
            return res.status(500).json({ greska: "Greška pri dohvaćanju filmova osobe" });
        }
    }

    async obrisiVezeOsobaFilmovi(req: Request, res: Response) {

        const authHeader = req.headers.authorization;
        if (!this.provjeriJWT(authHeader, res)) return;

        const osobaId = parseInt(req.params['osobaId'] || '');
        const { filmovi } = req.body;

        if (isNaN(osobaId) || !Array.isArray(filmovi) || filmovi.length === 0) {
            return res.status(400).json({ greska: "Neispravni podaci za brisanje veza osoba-filmovi" });
        }

        try {
            for (const filmId of filmovi) {
                if (!isNaN(filmId)) {
                    await this.dao.obrisiUlogu(osobaId, filmId);
                }
            }
            return res.status(200).json({ poruka: "Veze između osobe i filmova su uspješno obrisane" });
        } catch (err) {
            return res.status(500).json({ greska: "Greška pri brisanju veza između osobe i filmova" });
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
