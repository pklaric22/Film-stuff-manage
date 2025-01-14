

document.getElementById("traziGumb").addEventListener("click", async function() {
    const upit = document.getElementById("pretraga").value;
    const rezultatiDiv = document.getElementById("rezultati");

    try {
        let odgovor = await fetch(`/api/pretragaOsoba?upit=${encodeURIComponent(upit)}`);
        if (!odgovor.ok) {
            throw new Error("Došlo je do greške prilikom pretrage osoba.");
        }

        let podaci = await odgovor.json();

        let html = "<table border='1'><tr><th>Ime i prezime</th><th>Poznat po</th><th>Akcije</th></tr>";
        podaci.results.forEach(osoba => {
            html += `<tr>
                        <td>${osoba.name}</td>
                        <td>${osoba.known_for_department}</td>
                        <td>
                            <button type="button" class="dodaj-gumb">Dodaj</button>
                            <button type="button" class="obrisi-gumb">Obriši</button>
                        </td>
                     </tr>`;
        });
        html += "</table>";
        rezultatiDiv.innerHTML = html;

    } catch (error) {
        rezultatiDiv.innerHTML = `<p>${error.message}</p>`;
    }
});


