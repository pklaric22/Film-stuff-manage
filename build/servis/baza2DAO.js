import Database from "better-sqlite3";
export class DAO {
    db;
    constructor(databasePath) {
        this.db = new Database(databasePath, { verbose: console.log });
    }
    dodajFilm(naslov, originalniNaslov, opis, popularnost, slikaPlakata, jezik, datumIzdavanja) {
        const query = `
      INSERT INTO film (naslov, originalni_naslov, opis, popularnost, slika_plakata, jezik, datum_izdavanja)
      VALUES (?, ?, ?, ?, ?, ?, ?);
    `;
        const stmt = this.db.prepare(query);
        return stmt.run(naslov, originalniNaslov, opis, popularnost, slikaPlakata, jezik, datumIzdavanja);
    }
    dohvatiFilmove(page, perPage) {
        const offset = (page - 1) * perPage;
        const query = `
      SELECT * FROM film
      ORDER BY datum_izdavanja DESC
      LIMIT ? OFFSET ?;
    `;
        const stmt = this.db.prepare(query);
        return stmt.all(perPage, offset);
    }
    obrisiFilm(id) {
        const query = `
      DELETE FROM film WHERE id = ?;
    `;
        const stmt = this.db.prepare(query);
        return stmt.run(id);
    }
    dodajOsobu(imePrezime, poznatPoOdjelu, popularnost, profilnaSlika) {
        const query = `
      INSERT INTO osoba (ime_prezime, poznat_po_odjelu, popularnost, profilna_slika)
      VALUES (?, ?, ?, ?);
    `;
        const stmt = this.db.prepare(query);
        return stmt.run(imePrezime, poznatPoOdjelu, popularnost, profilnaSlika);
    }
    dodajOsobe(page, perPage) {
        const offset = (page - 1) * perPage;
        const query = `
      SELECT * FROM osoba
      ORDER BY ime_prezime ASC
      LIMIT ? OFFSET ?;
    `;
        const stmt = this.db.prepare(query);
        return stmt.all(perPage, offset);
    }
    dodajGaleriju(osobaId, putanja) {
        const query = `
      INSERT INTO galerija (osoba_id, putanja)
      VALUES (?, ?);
    `;
        const stmt = this.db.prepare(query);
        return stmt.run(osobaId, putanja);
    }
    dohvatiGalerijuPremaId(osobaId) {
        const query = `
      SELECT * FROM galerija
      WHERE osoba_id = ?;
    `;
        const stmt = this.db.prepare(query);
        return stmt.all(osobaId);
    }
    dohvatiKorisnikaPoImenu(korisnickoIme) {
        const query = `
        SELECT * FROM korisnik_servis
        WHERE korime = ?;
    `;
        const korisnik = this.db.prepare(query).get(korisnickoIme);
        return korisnik;
    }
    dodajKorisnika(korisnickoIme) {
        const query = `
        INSERT INTO korisnik_servis (korime)
        VALUES (?);
    `;
        const stmt = this.db.prepare(query);
        return stmt.run(korisnickoIme);
    }
    dodajOsobuPremaId(id) {
        const query = `
        SELECT * FROM osoba
        WHERE id = ?;
    `;
        const stmt = this.db.prepare(query);
        return stmt.get(id);
    }
    obrisiOsobu(id) {
        const query = `
        DELETE FROM osoba WHERE id = ?;
    `;
        const stmt = this.db.prepare(query);
        return stmt.run(id);
    }
    dodajUlogu(osobaId, filmId, lik) {
        const query = `
        INSERT INTO uloga (osoba_id, film_id, lik)
        VALUES (?, ?, ?);
    `;
        const stmt = this.db.prepare(query);
        return stmt.run(osobaId, filmId, lik);
    }
    dohvatiFilmovePremaOsobaId(osobaId, stranica, perPage) {
        const offset = (stranica - 1) * perPage;
        const query = `
        SELECT f.* FROM film f
        JOIN uloga u ON f.id = u.film_id
        WHERE u.osoba_id = ?
        LIMIT ? OFFSET ?;
    `;
        const stmt = this.db.prepare(query);
        return stmt.all(osobaId, perPage, offset);
    }
    obrisiUlogu(osobaId, filmId) {
        const query = `
        DELETE FROM uloga 
        WHERE osoba_id = ? AND film_id = ?;
    `;
        const stmt = this.db.prepare(query);
        return stmt.run(osobaId, filmId);
    }
    dohvatiFilmoveSaFilterom(page, perPage, datumOd, datumDo) {
        const offset = (page - 1) * perPage;
        let query = `
        SELECT * FROM film
        WHERE 1=1
    `;
        const params = [];
        if (datumOd) {
            const datumOdStr = new Date(datumOd).toISOString().split('T')[0];
            query += ` AND datum_izdavanja >= ?`;
            params.push(datumOdStr);
        }
        if (datumDo) {
            const datumDoStr = new Date(datumDo).toISOString().split('T')[0];
            query += ` AND datum_izdavanja <= ?`;
            params.push(datumDoStr);
        }
        query += `
        ORDER BY datum_izdavanja DESC
        LIMIT ? OFFSET ?;
    `;
        params.push(perPage, offset);
        const stmt = this.db.prepare(query);
        return stmt.all(...params);
    }
    provjeriVezeFilma(filmId) {
        const query = `
        SELECT 1
        FROM uloga
        WHERE film_id = ?
        LIMIT 1;
    `;
        const stmt = this.db.prepare(query);
        const result = stmt.get(filmId);
        return result !== undefined;
    }
    close() {
        this.db.close();
    }
}
