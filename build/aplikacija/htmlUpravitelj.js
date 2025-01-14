import { __dirname } from "../zajednicko/esmPomocnik.js";
import ds from "fs/promises";
import { ServisKlijent } from "./korisnikDAO.js";
export class HtmlUpravitelj {
    tajniKljucJWT;
    servisKlijent;
    portRest;
    constructor(tajniKljucJWT, portRest) {
        this.tajniKljucJWT = tajniKljucJWT;
        console.log(this.tajniKljucJWT);
        this.servisKlijent = new ServisKlijent("podaci/RWA2024pklaric22_web.sqlite");
        this.portRest = portRest;
    }
    async pocetna(zahtjev, odgovor) {
        let sesija = zahtjev.session;
        if (!sesija.korisnik) {
            odgovor.redirect("/prijava");
            return;
        }
        let pocetna = await this.ucitajStranicu("pocetna", zahtjev);
        if (pocetna === "") {
            odgovor.status(500).send("Greška: Stranica nije pronađena ili je prazna.");
            return;
        }
        odgovor.cookie("portRest", this.portRest, { httpOnly: false });
        odgovor.send(pocetna);
    }
    async registracija(zahtjev, odgovor) {
        console.log(zahtjev.body);
        let greska = "";
        if (zahtjev.method == "POST") {
            const { lozinka, korime, email } = zahtjev.body;
            if (!email || !korime || !lozinka) {
                greska = "Obavezna polja nisu popunjena!";
            }
            else {
                let uspjeh = this.servisKlijent.dodajKorisnika(zahtjev.body);
                if (uspjeh) {
                    odgovor.redirect("/prijava");
                    return;
                }
                else {
                    greska = "Dodavanje nije uspjelo, provjerite podatke!";
                }
            }
        }
        let stranica = await this.ucitajStranicu("registracija", zahtjev, greska);
        if (stranica === "") {
            odgovor.status(500).send("Greška: Stranica nije pronađena ili je prazna.");
            return;
        }
        odgovor.send(stranica);
    }
    async odjava(zahtjev, odgovor) {
        let sesija = zahtjev.session;
        sesija.korisnik = null;
        zahtjev.session.destroy((err) => {
            console.log("Sesija uništena!");
        });
        odgovor.redirect("/");
    }
    async prijava(zahtjev, odgovor) {
        let greska = "";
        if (zahtjev.method == "POST") {
            var korime = zahtjev.body.korime;
            var lozinka = zahtjev.body.lozinka;
            var korisnik = this.servisKlijent.prijaviKorisnika(korime, lozinka);
            if (korisnik) {
                let sesija = zahtjev.session;
                sesija.korisnik = korisnik.ime + " " + korisnik.prezime;
                sesija.korime = korisnik.korime;
                sesija.tipKorisnika = korisnik.tip_korisnika_id === 1 ? "registrirani korisnik" : "administrator";
                odgovor.cookie("uloga", sesija.tipKorisnika, { httpOnly: false });
                odgovor.redirect("/");
                return;
            }
            else {
                greska = "Netocni podaci!";
            }
        }
        let stranica = await this.ucitajStranicu("prijava", zahtjev, greska);
        if (stranica === "") {
            odgovor.status(500).send("Greška: Stranica nije pronađena ili je prazna.");
            return;
        }
        odgovor.send(stranica);
    }
    async ucitajStranicu(nazivStranice, zahtjev, poruka = "") {
        try {
            let stranice = [
                this.ucitajHTML(nazivStranice),
                this.ucitajHTML("navigacija"),
            ];
            let [stranica, nav] = await Promise.all(stranice);
            if (stranica != undefined && nav != undefined) {
                stranica = stranica.replace("#navigacija#", nav);
                stranica = stranica.replace("#poruka#", poruka);
                let sesija = zahtjev.session;
                let uloga = "Gost";
                if (sesija && sesija.tipKorisnika) {
                    uloga = sesija.tipKorisnika === "administrator" ? "Admin" : "Registrirani korisnik";
                }
                stranica = stranica.replace("#uloga#", uloga);
                return stranica;
            }
            return "";
        }
        catch (error) {
            console.error("Greška prilikom učitavanja stranice: ", error);
            return "";
        }
    }
    async dokumentacija(zahtjev, odgovor) {
        let stranica = await this.ucitajStranicu("dokumentacija", zahtjev);
        if (stranica === "") {
            odgovor.status(500).send("Greška: Stranica nije pronađena ili je prazna.");
            return;
        }
        odgovor.send(stranica);
    }
    async dohvatiKorisnika(zahtjev, odgovor) {
        let sesija = zahtjev.session;
        if (!sesija || !sesija.korime) {
            odgovor.status(401).send("Korisnik nije prijavljen.");
            return;
        }
        try {
            const korisnik = await this.servisKlijent.dohvatiKorisnika(sesija.korime);
            if (korisnik) {
                odgovor.json(korisnik);
            }
            else {
                odgovor.status(404).send("Korisnik nije pronađen.");
            }
        }
        catch (error) {
            odgovor.status(500).send("Greška prilikom dohvaćanja podataka korisnika.");
        }
    }
    async dodavanje(zahtjev, odgovor) {
        let sesija = zahtjev.session;
        if (!sesija.korisnik || sesija.tipKorisnika !== "administrator") {
            odgovor.status(403).send("Nemate pristup ovoj stranici. Potrebne su administratorske ovlasti.");
            return;
        }
        let stranica = await this.ucitajStranicu("dodavanje", zahtjev);
        if (stranica === "") {
            odgovor.status(500).send("Greška: Stranica nije pronađena ili je prazna.");
            return;
        }
        odgovor.send(stranica);
    }
    async popisKorisnika(zahtjev, odgovor) {
        const sesija = zahtjev.session;
        if (!sesija.korisnik || sesija.tipKorisnika !== "administrator") {
            odgovor.status(403).send("Nemate pristup ovoj stranici. Potrebne su administratorske ovlasti!");
            return;
        }
        try {
            const korisnici = await this.servisKlijent.dohvatiSveKorisnike();
            let stranica = await this.ucitajStranicu("korisnici", zahtjev);
            if (stranica) {
                let htmlKorisnici = korisnici.map(k => `
              <tr>
                  <td>${k.ime}</td>
                  <td>${k.korime}</td>
                  <td>${k.email}</td>
                  <td>
                      <button data-korime="${k.korime}" class="daj-pristup">Daj pristup</button>
                      <button data-korime="${k.korime}" class="zabrani-pristup">Zabrani pristup</button>
                  </td>
              </tr>
          `).join("");
                stranica = stranica.replace("#korisnici#", htmlKorisnici);
                odgovor.send(stranica);
            }
            else {
                odgovor.status(500).send("Greška: Stranica nije pronađena.");
            }
        }
        catch (error) {
            odgovor.status(500).send("Greška pri dohvaćanju korisnika.");
        }
    }
    async dajPristup(zahtjev, odgovor) {
        const { korime } = zahtjev.body;
        if (!korime) {
            odgovor.status(400).send("Nedostaje korisničko ime.");
            return;
        }
        try {
            const korisnik = await this.servisKlijent.dohvatiKorisnika(korime);
            if (!korisnik) {
                odgovor.status(404).send("Korisnik nije pronađen.");
                return;
            }
            const response = await fetch("http://localhost:12222/servis/korisnici", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    korisnickoIme: korisnik.korime,
                }),
            });
            if (response.ok) {
                odgovor.status(200).send("Korisnik uspješno dodan u bazu 2.");
            }
            else {
                const error = await response.json();
                odgovor.status(500).send(error.greska || "Greška pri dodavanju korisnika.");
            }
        }
        catch (error) {
            odgovor.status(500).send("Greška na poslužitelju.");
        }
    }
    ucitajHTML(htmlStranica) {
        return ds.readFile(__dirname() + "/html/" + htmlStranica + ".html", "utf-8");
    }
}
