document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("odjavaGumb").addEventListener("click", async () => {
        try {
            let response = await fetch("/odjava", {
                method: "GET",
                credentials: "include"
            });
            if (response.ok) {
                window.location.href = "/prijava";
            } else {
                console.error("Greška prilikom odjave");
            }
        } catch (error) {
            console.error("Greška prilikom slanja zahtjeva za odjavu:", error);
        }
    });
});
