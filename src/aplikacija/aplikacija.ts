import express from "express";
import sesija from 'express-session';
import kolacici from 'cookie-parser';
import { __dirname, dajPort, dajPortSevis } from "../zajednicko/esmPomocnik.js";
import { Konfiguracija } from "../zajednicko/konfiguracija.js";
import { HtmlUpravitelj } from "../aplikacija/htmlUpravitelj.js";
import { RWASession } from "../aplikacija/htmlUpravitelj.js";
import { TMDBklijent } from "../aplikacija/klijentTMDB.js";

const server = express();
let konf = new Konfiguracija();
let port = dajPort("pklaric22");
if (process.argv[4] != undefined) {
  port = process.argv[4];
}

let portRest = dajPortSevis("pklaric22");
if (process.argv[3] != undefined) {
  portRest = process.argv[3];
}

konf
  .ucitajKonfiguraciju()
  .then(pokreniServer)
  .catch((greska: Error | any) => {
    if (process.argv.length == 2)
      console.error("Potrebno je dati naziv datoteke");
    else if (greska.path != undefined)
      console.error("Nije moguće otvoriti datoteku: " + greska.path);
    else console.log(greska.message);
    process.exit();
  });

function pokreniServer() {
  server.use(express.urlencoded({ extended: true }));
  server.use(express.json());
  server.use(kolacici());
  server.use(sesija({
     secret: konf.dajKonf().tajniKljucSesija,
     saveUninitialized: true,
     cookie: { maxAge: 1000 * 60 * 60 * 3 },
     resave: false
  }));
  server.use((req, res, next) => {
    res.locals["uloga"] = "Gost";
    if (req.session && (req.session as RWASession).korisnik) {
      res.locals["uloga"] = (req.session as RWASession).korisnik === "admin" ? "Admin" : "Registrirani korisnik";
    }
    next();
  });
  server.use("/js", express.static(__dirname() + "/jsk"));
  server.use("/css", express.static(__dirname() + "/css"));
  server.use('/dokumentacija', express.static(__dirname + '/../dokumentacija'));

  pripremiPutanje();

  server.use((zahtjev, odgovor) => {
    odgovor.status(404);
    var poruka = "<!DOCTYPE html><html lang=hr><head><title>ERROR</title><meta charset=UTF-8><head><body><h1>Stranica nije pronađena!</h1></body></html>";
    odgovor.send(poruka);
  });

  server.listen(port, () => {
    console.log(`Server pokrenut na portu: ${port}`);
  });
}

function pripremiPutanje() {
  let htmlUpravitelj = new HtmlUpravitelj(konf.dajKonf().jwtTajniKljuc, portRest);
  
  server.get("/", htmlUpravitelj.pocetna.bind(htmlUpravitelj));
  server.get("/registracija", htmlUpravitelj.registracija.bind(htmlUpravitelj));
  server.post("/registracija", htmlUpravitelj.registracija.bind(htmlUpravitelj));
  server.get("/odjava", htmlUpravitelj.odjava.bind(htmlUpravitelj));
  server.get("/prijava", htmlUpravitelj.prijava.bind(htmlUpravitelj));
  server.post("/prijava", htmlUpravitelj.prijava.bind(htmlUpravitelj));
  server.get("/api/korisnik", htmlUpravitelj.dohvatiKorisnika.bind(htmlUpravitelj));
  
  server.get("/dodavanje", htmlUpravitelj.dodavanje.bind(htmlUpravitelj));
  
  server.get("/api/pretragaOsoba", async (req, res) => {
    const upit = req.query['upit'] as string;
    const stranica = req.query['stranica'] ? parseInt(req.query['stranica'] as string) : 1;

    const tmdbKlijent = new TMDBklijent(konf.dajKonf().tmdbApiKeyV3);
    try {
        const podaci = await tmdbKlijent.pretraziOsobe(upit, stranica);
        res.json(podaci);
    } catch (error) {
        res.status(500).send("Greška prilikom pretrage osoba.");
    }
});


  server.get("/korisnici", htmlUpravitelj.popisKorisnika.bind(htmlUpravitelj));
  server.post("/admin/daj-pristup", htmlUpravitelj.dajPristup.bind(htmlUpravitelj));
  //server.delete("/admin/zabrani-pristup", htmlUpravitelj.zabraniPristup.bind(htmlUpravitelj));

  server.get("/dokumentacija", htmlUpravitelj.dokumentacija.bind(htmlUpravitelj));



}

