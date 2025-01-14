import fsPromise from "fs/promises";

type tipKonf = {
    jwtValjanost: string,
    jwtTajniKljuc: string,
    tajniKljucSesija: string,
    tmdbApiKeyV3: string,
    tmdbApiKeyV4: string
};

export class Konfiguracija {
    private konf: tipKonf;

    constructor() {
        this.konf = this.initKonf();
    }

    private initKonf() {
        return {
            jwtTajniKljuc: "",
            jwtValjanost: "",
            tajniKljucSesija: "",
            tmdbApiKeyV3: "",
            tmdbApiKeyV4: ""
        };
    }

    dajKonf() {
        return this.konf;
    }

    public async ucitajKonfiguraciju() {
        try {

            const putanja = "podaci/" + process.argv[2];
            if (!putanja) {
                throw new Error("Putanja do konfiguracijske datoteke nije zadana!");
            }

            const podaci = await fsPromise.readFile(putanja, "utf-8");

            this.pretvoriJSONkonfig(podaci);
            this.provjeriPodatkeKonfiguracije();

            console.log("Putanja do konfiguracije:", putanja);
            console.log("Konfiguracija:", this.konf);
            console.log(process.argv);
        } catch (err) {
            console.error("Greška pri učitavanju konfiguracijske datoteke:", err);
            console.log(process.argv);

            throw err;
        }
    }
    
    private pretvoriJSONkonfig(podaci: string) {
        let konf: { [kljuc: string]: string } = {};
        const nizPodataka = podaci.split("\n");
        for (let podatak of nizPodataka) {
            const podatakNiz = podatak.split("#");
            const naziv = podatakNiz[0];
            if (typeof naziv != "string" || naziv.trim() == "") continue;
            const vrijednost: string = podatakNiz[1] ?? "";
            konf[naziv.trim()] = vrijednost.trim();
        }
        this.konf = konf as tipKonf;
    }

    private provjeriPodatkeKonfiguracije() {
        if (this.konf.tmdbApiKeyV3 === undefined || this.konf.tmdbApiKeyV3.trim() === "") {
            throw new Error("Fali TMDB API ključ u tmdbApiKeyV3");
        }
        if (this.konf.jwtValjanost === undefined || this.konf.jwtValjanost.trim() === "") {
            throw new Error("Fali JWT valjanost");
        } else {
            const jwtValjanostBroj = parseInt(this.konf.jwtValjanost);
            if (isNaN(jwtValjanostBroj) || jwtValjanostBroj < 15 || jwtValjanostBroj > 300) {
                throw new Error("JWT valjanost mora biti broj između 15 i 300");
            }
        }
        if (this.konf.jwtTajniKljuc === undefined || this.konf.jwtTajniKljuc.trim() === "") {
            throw new Error("Fali JWT tajni ključ");
        } else {
            if (this.konf.jwtTajniKljuc.length < 100 || this.konf.jwtTajniKljuc.length > 200) {
                throw new Error("JWT tajni ključ mora imati između 100 i 200 znakova");
            }
        }
        if (this.konf.tajniKljucSesija === undefined || this.konf.tajniKljucSesija.trim() === "") {
            throw new Error("Fali tajni ključ za sesiju");
        }
        if (this.konf.tmdbApiKeyV4 === undefined || this.konf.tmdbApiKeyV4.trim() === "") {
            throw new Error("Fali TMDB API ključ u tmdbApiKeyV4");
        } else {
            if (this.konf.tmdbApiKeyV4.length < 200) {
                console.warn("Upozorenje: TMDB API ključ V4 je kraći od očekivanih 211 znakova");
            }
        }
    }
}
