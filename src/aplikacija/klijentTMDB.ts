export class TMDBklijent {
    private bazicniURL = "https://api.themoviedb.org/3";
    private apiKljuc: string;

    constructor(apiKljuc: string) {
        this.apiKljuc = apiKljuc;
    }

    public async pretraziOsobe(upit: string, stranica: number = 1) {
        let resurs = "/search/person";
        let parametri = {
            query: upit,
            page: stranica,
        };

        let odgovor = await this.obaviZahtjev(resurs, parametri);
        return JSON.parse(odgovor);
    }

    private async obaviZahtjev(
        resurs: string,
        parametri: { [kljuc: string]: string | number | boolean } = {}
    ) {
        let zahtjev = `${this.bazicniURL}${resurs}?api_key=${this.apiKljuc}`;
        for (let p in parametri) {
            zahtjev += `&${p}=${parametri[p]}`;
        }
        console.log(zahtjev);
        let odgovor = await fetch(zahtjev);
        if (!odgovor.ok) {
            throw new Error(`Greška pri dohvaćanju podataka: ${odgovor.status}`);
        }
        let rezultat = await odgovor.text();
        return rezultat;
    }
}
