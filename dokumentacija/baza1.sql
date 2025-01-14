-- Creator:       MySQL Workbench 8.0.40/ExportSQLite Plugin 0.1.0
-- Author:        Patrik
-- Caption:       New Model
-- Project:       Name of the project
-- Changed:       2024-11-21 15:13
-- Created:       2024-11-21 14:16

BEGIN;
CREATE TABLE "tip_korisnika"(
  "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  "naziv" VARCHAR(45) NOT NULL,
  "opis" TEXT,
  CONSTRAINT "naziv_UNIQUE"
    UNIQUE("naziv")
);
CREATE TABLE "korisnik"(
  "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  "ime" VARCHAR(50),
  "prezime" VARCHAR(100),
  "adresa" TEXT,
  "korime" VARCHAR(50) NOT NULL,
  "lozinka" VARCHAR(1000) NOT NULL,
  "email" VARCHAR(100) NOT NULL,
  "tip_korisnika_id" INTEGER NOT NULL,
  CONSTRAINT "korime_UNIQUE"
    UNIQUE("korime"),
  CONSTRAINT "email_UNIQUE"
    UNIQUE("email"),
  CONSTRAINT "fk_korisnik_tip_korisnika"
    FOREIGN KEY("tip_korisnika_id")
    REFERENCES "tip_korisnika"("id")
);
CREATE INDEX "korisnik.fk_korisnik_tip_korisnika_idx" ON "korisnik" ("tip_korisnika_id");
COMMIT;


INSERT INTO "tip_korisnika" ("naziv", "opis") VALUES
('registrirani korisnik', 'Korisnik sa osnovnim ovlastima unutar sustava.'),
('administrator', 'Korisnik s punim ovlastima za upravljanje sustavom.');


INSERT INTO "korisnik" ("ime", "prezime", "adresa", "korime", "lozinka", "email", "tip_korisnika_id") VALUES
('Običan', 'Korisnik', 'Neka Adresa 1', 'obican', 'rwa', 'obican@example.com',
 (SELECT "id" FROM "tip_korisnika" WHERE "naziv" = 'registrirani korisnik')),
('Admin', 'Korisnik', 'Admin Adresa 1', 'admin', 'rwa', 'admin@example.com',
 (SELECT "id" FROM "tip_korisnika" WHERE "naziv" = 'administrator'));


UPDATE korisnik 
SET lozinka = '2317c5cc4e67b0cb5f55b26fdcf5fe0a24012503ae99d22b26f3c866d281be2b'
WHERE korime = 'obican';

