-- Creator:       MySQL Workbench 8.0.40/ExportSQLite Plugin 0.1.0
-- Author:        Patrik
-- Caption:       New Model
-- Project:       Name of the project
-- Changed:       2024-11-23 16:07
-- Created:       2024-11-23 16:07

BEGIN;
CREATE TABLE "film"(
  "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  "naslov" VARCHAR(45) NOT NULL,
  "originalni_naslov" VARCHAR(45) NOT NULL,
  "opis" TEXT,
  "popularnost" FLOAT NOT NULL,
  "slika_plakata" VARCHAR(255) NOT NULL,
  "jezik" VARCHAR(30) NOT NULL,
  "datum_izdavanja" DATE NOT NULL
);
CREATE INDEX "film.idx_film_naslov" ON "film" ("naslov");
CREATE TABLE "osoba"(
  "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  "ime_prezime" VARCHAR(100) NOT NULL,
  "poznat_po_odjelu" VARCHAR(100) NOT NULL,
  "popularnost" VARCHAR(55) NOT NULL,
  "profilna_slika" VARCHAR(255) NOT NULL
);
CREATE INDEX "osoba.idx_osoba_ime_prezime" ON "osoba" ("ime_prezime");
CREATE TABLE "galerija"(
  "id" INTEGER NOT NULL,
  "putanja" VARCHAR(255) NOT NULL,
  "osoba_id" INTEGER NOT NULL,
  PRIMARY KEY("id","osoba_id"),
  CONSTRAINT "fk_galerija_osoba1"
    FOREIGN KEY("osoba_id")
    REFERENCES "osoba"("id")
    ON DELETE CASCADE
);
CREATE INDEX "galerija.fk_galerija_osoba1_idx" ON "galerija" ("osoba_id");
CREATE TABLE "korisnik_servis"(
  "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  "korime" VARCHAR(55) NOT NULL
);
CREATE TABLE "uloga"(
  "lik" VARCHAR(45) NOT NULL,
  "film_id" INTEGER NOT NULL,
  "osoba_id" INTEGER NOT NULL,
  PRIMARY KEY("osoba_id","film_id"),
  UNIQUE("film_id","osoba_id"),
  CONSTRAINT "fk_uloga_film"
    FOREIGN KEY("film_id")
    REFERENCES "film"("id")
    ON DELETE CASCADE,
  CONSTRAINT "fk_uloga_osoba1"
    FOREIGN KEY("osoba_id")
    REFERENCES "osoba"("id")
    ON DELETE CASCADE
);
CREATE INDEX "uloga.fk_uloga_film_idx" ON "uloga" ("film_id");
CREATE INDEX "uloga.fk_uloga_osoba1_idx" ON "uloga" ("osoba_id");
COMMIT;
