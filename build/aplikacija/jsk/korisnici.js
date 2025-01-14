
    const tbody = document.getElementById("korisnici-tbody");

    tbody.addEventListener("click", async (e) => {
        if (e.target.tagName === "BUTTON") {
            const korime = e.target.getAttribute("data-korime");
            const akcija = e.target.className;

            let url, method;
            if (akcija === "daj-pristup") {
                url = `/admin/daj-pristup`;
                method = "POST";
            } else if (akcija === "zabrani-pristup") {
                url = `/admin/zabrani-pristup`;
                method = "DELETE";
            }

            try {
                const response = await fetch(url, {
                    method,
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ korime }),
                });

                if (response.ok) {
                    alert("Akcija uspješna!");
                    window.location.reload();
                } else {
                    const error = await response.json();
                    alert("Greška: " + (error.greska || "Nepoznata greška."));
                }
            } catch (error) {
                console.error("Greška: ", error);
                alert("Greška prilikom izvršavanja akcije.");
            }
        }
    });

