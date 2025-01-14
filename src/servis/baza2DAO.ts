import Database from "better-sqlite3";
import { KorisnikServis } from "../servisI/korisniciI.js";


export class DAO {
  private db: Database.Database;

  constructor(databasePath: string) {
    this.db = new Database(databasePath, { verbose: console.log });
  }


  dodajFilm(naslov: string, originalniNaslov: string, opis: string, popularnost: number, slikaPlakata: string, jezik: string, datumIzdavanja: string) {
    const query = `
      INSERT INTO film (naslov, originalni_naslov, opis, popularnost, slika_plakata, jezik, datum_izdavanja)
      VALUES (?, ?, ?, ?, ?, ?, ?);
    `;
    const stmt = this.db.prepare(query);
    return stmt.run(naslov, originalniNaslov, opis, popularnost, slikaPlakata, jezik, datumIzdavanja);
  }

  dohvatiFilmove(page: number, perPage: number) {
    const offset = (page - 1) * perPage;
    const query = `
      SELECT * FROM film
      ORDER BY datum_izdavanja DESC
      LIMIT ? OFFSET ?;
    `;
    const stmt = this.db.prepare(query);
    return stmt.all(perPage, offset);
  }


  obrisiFilm(id: number) {
    const query = `
      DELETE FROM film WHERE id = ?;
    `;
    const stmt = this.db.prepare(query);
    return stmt.run(id);
  }


  dodajOsobu(imePrezime: string, poznatPoOdjelu: string, popularnost: string, profilnaSlika: string) {
    const query = `
      INSERT INTO osoba (ime_prezime, poznat_po_odjelu, popularnost, profilna_slika)
      VALUES (?, ?, ?, ?);
    `;
    const stmt = this.db.prepare(query);
    return stmt.run(imePrezime, poznatPoOdjelu, popularnost, profilnaSlika);
  }


  dodajOsobe(page: number, perPage: number) {
    const offset = (page - 1) * perPage;
    const query = `
      SELECT * FROM osoba
      ORDER BY ime_prezime ASC
      LIMIT ? OFFSET ?;
    `;
    const stmt = this.db.prepare(query);
    return stmt.all(perPage, offset);
  }


  dodajGaleriju(osobaId: number, putanja: string) {
    const query = `
      INSERT INTO galerija (osoba_id, putanja)
      VALUES (?, ?);
    `;
    const stmt = this.db.prepare(query);
    return stmt.run(osobaId, putanja);
  }


  dohvatiGalerijuPremaId(osobaId: number) {
    const query = `
      SELECT * FROM galerija
      WHERE osoba_id = ?;
    `;
    const stmt = this.db.prepare(query);
    return stmt.all(osobaId);
  }

  dohvatiKorisnikaPoImenu(korisnickoIme: string): KorisnikServis | null {
    const query = `
        SELECT * FROM korisnik_servis
        WHERE korime = ?;
    `;
    const korisnik = this.db.prepare(query).get(korisnickoIme) as KorisnikServis | null;
    return korisnik;
}

dodajKorisnika(korisnickoIme: string ) {
    const query = `
        INSERT INTO korisnik_servis (korime)
        VALUES (?);
    `;
    const stmt = this.db.prepare(query);
    return stmt.run(korisnickoIme);
}

dodajOsobuPremaId(id: number) {
    const query = `
        SELECT * FROM osoba
        WHERE id = ?;
    `;
    const stmt = this.db.prepare(query);
    return stmt.get(id);
}


obrisiOsobu(id: number) {
    const query = `
        DELETE FROM osoba WHERE id = ?;
    `;
    const stmt = this.db.prepare(query);
    return stmt.run(id);
}

dodajUlogu(osobaId: number, filmId: number, lik: string) {
    const query = `
        INSERT INTO uloga (osoba_id, film_id, lik)
        VALUES (?, ?, ?);
    `;
    const stmt = this.db.prepare(query);
    return stmt.run(osobaId, filmId, lik);
}

dohvatiFilmovePremaOsobaId(osobaId: number, stranica: number, perPage: number) {
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

obrisiUlogu(osobaId: number, filmId: number) {
    const query = `
        DELETE FROM uloga 
        WHERE osoba_id = ? AND film_id = ?;
    `;
    const stmt = this.db.prepare(query);
    return stmt.run(osobaId, filmId);
}

dohvatiFilmoveSaFilterom(page: number, perPage: number, datumOd?: number, datumDo?: number) {
    const offset = (page - 1) * perPage;
    let query = `
        SELECT * FROM film
        WHERE 1=1
    `;


    const params: any[] = [];

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

provjeriVezeFilma(filmId: number): boolean {
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
