document.addEventListener("DOMContentLoaded", function () {
    fetch("/api/korisnik")
        .then((response) => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error("Greška prilikom dohvaćanja podataka korisnika.");
            }
        })
        .then((korisnik) => {
            document.querySelector("#ime").innerText = korisnik.ime;
            document.querySelector("#prezime").innerText = korisnik.prezime;
            document.querySelector("#email").innerText = korisnik.email;
            document.querySelector("#adresa").innerText = korisnik.adresa;
            document.querySelector("#tipKorisnika").innerText = korisnik.tipKorisnika;
        })
        .catch((error) => {
            console.error(error);
        });
});
