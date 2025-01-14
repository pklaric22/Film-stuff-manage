import SQLite from 'better-sqlite3';
import { KorisnikI } from "../servisI/korisniciI.js";
import * as kodovi from "../zajednicko/kodovi.js";

export class ServisKlijent {
    private db: any;

    constructor(dbPath: string) {
        this.db = new SQLite(dbPath);
    }

    dodajKorisnika(korisnik: { ime: string, prezime: string, lozinka: string, korime: string, email: string }) {
        try {
            const hashiranaLozinka = kodovi.kreirajSHA256(korisnik.lozinka, "moja sol");
            const sql = `INSERT INTO korisnik (ime, prezime, lozinka, korime, email, tip_korisnika_id) VALUES (?, ?, ?, ?, ?, (SELECT id FROM tip_korisnika WHERE naziv = 'registrirani korisnik'))`;
            this.db.prepare(sql).run(korisnik.ime, korisnik.prezime, hashiranaLozinka, korisnik.korime, korisnik.email);
            console.log("Korisnik ubačen u bazu");
            return true;
        } catch (error) {
            console.error("Greška prilikom dodavanja korisnika: ", error);
            return false;
        }
    }

    prijaviKorisnika(korime: string, lozinka: string): KorisnikI | false {
        try {
          const hashiranaLozinka = kodovi.kreirajSHA256(lozinka, "moja sol");
          const sql = `SELECT korisnik.*, tip_korisnika.naziv as tipKorisnika
                       FROM korisnik
                       JOIN tip_korisnika ON korisnik.tip_korisnika_id = tip_korisnika.id
                       WHERE korime = ? AND lozinka = ?`;
          const korisnik = this.db.prepare(sql).get(korime, hashiranaLozinka);
      
          if (korisnik) {
            return korisnik as KorisnikI;
          } else {
            console.log("Korisnik nije pronađen ili lozinka nije ispravna");
            return false;
          }
        } catch (error) {
          console.error("Greška prilikom prijave korisnika: ", error);
          return false;
        }
      }

      dohvatiKorisnika(korime: string): KorisnikI | null {
        try {
          const sql = `SELECT korisnik.*, tip_korisnika.naziv as tipKorisnika
                       FROM korisnik
                       JOIN tip_korisnika ON korisnik.tip_korisnika_id = tip_korisnika.id
                       WHERE korime = ?`;
          const korisnik = this.db.prepare(sql).get(korime);
      
          if (korisnik) {
            return korisnik as KorisnikI;
          } else {
            console.log("Korisnik nije pronađen.");
            return null;
          }
        } catch (error) {
          console.error("Greška prilikom dohvaćanja korisnika: ", error);
          return null;
        }
      }
      
      async dohvatiSveKorisnike(): Promise<any[]> {
        try {
            const sql = `SELECT ime, prezime, korime, email FROM korisnik`;
            const korisnici = this.db.prepare(sql).all();
            return korisnici;
        } catch (error) {
            console.error("Greška pri dohvaćanju korisnika iz baze 1: ", error);
            return [];
        }
    }
      
}