export class FilmREST {
    dao;
    jwtPomocnik;
    constructor(dao, jwtPomocnik) {
        this.dao = dao;
        this.jwtPomocnik = jwtPomocnik;
    }
    async dohvatiFilm(req, res) {
        const authHeader = req.headers.authorization;
        if (!this.provjeriJWT(authHeader, res))
            return;
        const id = parseInt(req.params['id'] || '');
        if (isNaN(id)) {
            return res.status(400).json({ greska: "Neispravan ID filma" });
        }
        try {
            const film = await this.dao.dohvatiFilmove(1, id);
            return res.status(200).json(film);
        }
        catch (err) {
            return res.status(500).json({ greska: "Greška pri dohvaćanju filma" });
        }
    }
    async postFilm(req, res) {
        const authHeader = req.headers.authorization;
        if (!this.provjeriJWT(authHeader, res))
            return;
        const { naslov, originalniNaslov, opis, popularnost, slikaPlakata, jezik, datumIzdavanja } = req.body;
        if (!naslov || !originalniNaslov || !opis || !popularnost || !slikaPlakata || !jezik || !datumIzdavanja) {
            return res.status(400).json({ greska: "Nedostaju podaci za film" });
        }
        try {
            this.dao.dodajFilm(naslov, originalniNaslov, opis, popularnost, slikaPlakata, jezik, datumIzdavanja);
            return res.status(201).json({ poruka: "Film uspješno dodan" });
        }
        catch (err) {
            return res.status(500).json({ greska: "Greška pri dodavanju filma" });
        }
    }
    async dodajFilm(req, res) {
        const authHeader = req.headers.authorization;
        if (!this.provjeriJWT(authHeader, res))
            return;
        const { naslov, originalniNaslov, opis, popularnost, slikaPlakata, jezik, datumIzdavanja } = req.body;
        if (!naslov || !originalniNaslov || !opis || !popularnost || !slikaPlakata || !jezik || !datumIzdavanja) {
            return res.status(400).json({ greska: "Nedostaju podaci za film" });
        }
        try {
            await this.dao.dodajFilm(naslov, originalniNaslov, opis, popularnost, slikaPlakata, jezik, datumIzdavanja);
            return res.status(201).json({ poruka: "Film uspješno dodan" });
        }
        catch (err) {
            return res.status(500).json({ greska: "Greška pri dodavanju filma" });
        }
    }
    async deleteFilm(req, res) {
        const authHeader = req.headers.authorization;
        if (!this.provjeriJWT(authHeader, res))
            return;
        const id = parseInt(req.params['id'] || '');
        if (isNaN(id)) {
            return res.status(400).json({ greska: "Neispravan ID filma" });
        }
        try {
            const imaVeze = this.dao.provjeriVezeFilma(id);
            if (imaVeze) {
                return res.status(400).json({ greska: "Film se ne može obrisati jer postoje povezane veze" });
            }
            await this.dao.obrisiFilm(id);
            return res.status(200).json({ poruka: "Film uspješno obrisan" });
        }
        catch (err) {
            return res.status(500).json({ greska: "Greška pri brisanju filma" });
        }
    }
    async getFilmoviDatum(req, res) {
        const authHeader = req.headers.authorization;
        if (!this.provjeriJWT(authHeader, res))
            return;
        const stranica = parseInt(req.query['stranica']) || 1;
        const datumOd = req.query['datumOd'] ? parseInt(req.query['datumOd']) : undefined;
        const datumDo = req.query['datumDo'] ? parseInt(req.query['datumDo']) : undefined;
        const perPage = 20;
        try {
            const filmovi = await this.dao.dohvatiFilmoveSaFilterom(stranica, perPage, datumOd, datumDo);
            return res.status(200).json(filmovi);
        }
        catch (err) {
            return res.status(500).json({ greska: "Greška pri dohvaćanju filmova" });
        }
    }
    provjeriJWT(authHeader, res) {
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
        }
        catch (err) {
            res.status(406).json({ greska: "JWT nije valjan" });
            return false;
        }
    }
}
