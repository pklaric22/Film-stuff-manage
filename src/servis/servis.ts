import cors from "cors";
import express, { Request, Response } from "express";
import { dajPortSevis } from "../zajednicko/esmPomocnik.js";
import { Konfiguracija } from "../zajednicko/konfiguracija.js";
import { JWTPomocnik } from "../zajednicko/jwtPomocnik.js";
import { DAO } from "./baza2DAO.js";
import { KorisnikREST } from "./korisnikREST.js";
import { OsobaREST } from "./osobaREST.js";
import { FilmREST } from "./filmREST.js";

const server = express();
const dao = new DAO("./podaci/RWA2024pklaric22_servis.sqlite");

let jwtPomocnik: JWTPomocnik;

server.use(express.urlencoded({ extended: true }));
server.use(express.json());

server.use(
    cors({
        origin: function (origin, povratniPoziv) {
            if (
                !origin ||
                origin.startsWith("http://spider.foi.hr:") ||
                origin.startsWith("http://localhost:")
            ) {
                povratniPoziv(null, true);
            } else {
                povratniPoziv(new Error("Nije dozvoljeno zbog CORS"));
            }
        },
        optionsSuccessStatus: 200,
    })
);

server.post("/servis/prijava", async (req: Request, res: Response) => {
    const { korisnickoIme } = req.body;

    if (!korisnickoIme) {
        res.status(400).json({ greska: "Nedostaje korisničko ime za prijavu" });
        return;
    }

    try {
        const korisnik = await dao.dohvatiKorisnikaPoImenu(korisnickoIme);
        if (!korisnik) {
            res.status(401).json({ greska: "Neispravno korisničko ime" });
            return;
        }

        const token = jwtPomocnik.generirajToken({
            korisnickoIme: korisnik.korime,
            tip: "obican",
        });

        res.status(200).json({ token });
    } catch (error) {
        res.status(500).json({ greska: "Greška na serveru" });
    }
});

let port = dajPortSevis("pklaric22");
if (process.argv[3] !== undefined) {
    port = parseInt(process.argv[3]);
}

const konf = new Konfiguracija();

konf
    .ucitajKonfiguraciju()
    .then(() => {
        jwtPomocnik = new JWTPomocnik(konf);
        const korisnikREST = new KorisnikREST(dao, jwtPomocnik);
        const osobaREST = new OsobaREST(dao, jwtPomocnik);
        const filmREST = new FilmREST(dao, jwtPomocnik);

        pripremiPutanje(server, korisnikREST, osobaREST, filmREST);

        server.listen(port, () => {
            console.log(`Server pokrenut na portu: ${port}`);
        });
    })
    .catch((error) => {
        console.error("Greška pri inicijalizaciji konfiguracije:", error.message);
    });


function pripremiPutanje(server: express.Express, korisnikREST: KorisnikREST, osobaREST: OsobaREST, filmREST: FilmREST) {


    server.post("/servis/korisnici", async (req: Request, res: Response) => {
        await korisnikREST.dodajKorisnika(req, res); 
    });
/*//Briše jednog korisnika
    server.delete("/servis/korisnici/:korime", async (req: Request, res: Response) => {
        await korisnikREST.obrisiKorisnika(req, res);
    });*/
    server.get("/servis/osoba", async (req: Request, res: Response) => {
        await osobaREST.dohvatiOsobe(req, res);
    });

    server.post("/servis/osoba", async (req: Request, res: Response) => {
        await osobaREST.dodajOsobu(req, res);
    });

    server.get("/servis/osoba/:id", async (req: Request, res: Response) => {
        await osobaREST.dohvatiOsobu(req, res);
    });

    server.delete("/servis/osoba/:id", async (req: Request, res: Response) => {
        await osobaREST.deleteOsoba(req, res);
    });

    server.get("/servis/film", async (req: Request, res: Response) => {
        await filmREST.dohvatiFilm(req, res);
    });
    server.post("/servis/film", async (req: Request, res: Response) => {
        await filmREST.dodajFilm(req, res); // Promijenjeno na dodajFilm
    });
//Vraća podatke traženog filma
    server.get("/servis/film/:id", async (req: Request, res: Response) => {
        await filmREST.dohvatiFilm(req, res);
    });

    server.delete("/servis/film/:id", async (req: Request, res: Response) => {
        await filmREST.deleteFilm(req, res);
    });

server.delete("/servis/osoba/:osobaId/filmovi", async (req: Request, res: Response) => {
    await osobaREST.obrisiVezeOsobaFilmovi(req, res);
});

server.get("/servis/filmovi", async (req: Request, res: Response) => {
    await filmREST.getFilmoviDatum(req, res);
});


    server.put("/servis/osoba/:osobaId/film", async (req: Request, res: Response) => {
        await osobaREST.poveziOsobuSaFilmom(req, res);
    });
    
    server.get("/servis/osoba/:osobaId/filmovi", async (req: Request, res: Response) => {
        await osobaREST.getFilmoviOsobe(req, res);
    });
}
