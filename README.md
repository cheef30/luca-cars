# Luca Cars, Sombor

Sajt za Luca Cars DOO, prodaja polovnih automobila, Ilije Birčanina 60, 25000 Sombor.

Sajt je čist HTML, CSS i JavaScript, bez instalacije i bez build koraka. Objavljen je preko GitHub Pages: svaka izmena na grani `main` je na sajtu za minut ili dva.

## Kako se dodaje vozilo

Sva vozila su u jednom fajlu: [`data/vozila.json`](data/vozila.json). Sajt sam pravi kartice, filtere, stranicu vozila i "Slična vozila" iz tog fajla.

### Korak 1: pripremite fotografije

Fotografije se na sajtu prikazuju preko linka, ne čuvaju se u ovom repozitorijumu.

1. Otpremite fotografije vozila na Google profil placa (Google mape, "Dodaj fotografije") ili u Google Photos.
2. Otvorite fotografiju, kliknite desnim tasterom na nju i izaberite **Kopiraj adresu slike** (Copy image address).
3. Link izgleda ovako: `https://lh3.googleusercontent.com/...=w1600`. Kraj linka (`=w1600` i slično) možete ostaviti kakav jeste, sajt ga sam menja u pravu veličinu za karticu, galeriju i pregled preko celog ekrana.

Ako želite fotografije u repozitorijumu, napravite folder `slike/`, ubacite ih tamo i u polje `slike` upišite putanju, na primer `"slike/golf-1.jpg"`.

### Korak 2: otvorite fajl za izmenu

1. Na GitHub-u otvorite repozitorijum `luca-cars`.
2. Kliknite na folder `data`, pa na fajl `vozila.json`.
3. Kliknite na ikonicu olovke (Edit this file) u gornjem desnom uglu.

### Korak 3: dodajte vozilo

Kopirajte ceo blok jednog vozila, od `{` do `}`, i nalepite ga odmah posle uglaste zagrade `[` na početku fajla. Posle zatvorene zagrade `}` mora da stoji zarez ako iza nje sledi još neko vozilo. Zatim izmenite podatke:

```json
{
  "id": "skoda-octavia-1-6-tdi-2014",
  "istaknuto": true,
  "dodato": "2026-11-20",
  "marka": "Škoda",
  "model": "Octavia",
  "verzija": "1.6 TDI",
  "godiste": 2014,
  "kilometraza": 186000,
  "gorivo": "Dizel",
  "menjac": "Manuelni",
  "snaga_kw": 77,
  "kubikaza": 1598,
  "karoserija": "Karavan",
  "pogon": "Prednji",
  "boja": "Bela",
  "vrata": "5",
  "cena": 7900,
  "oprema": ["Klima", "Tempomat", "Parking senzori"],
  "opis": "Prvi vlasnik, redovno servisirano. Ovde napišite sve što kupac treba da zna.",
  "slike": [
    "https://lh3.googleusercontent.com/...=w1600",
    "https://lh3.googleusercontent.com/...=w1600"
  ]
}
```

Šta znači koje polje:

| Polje | Obavezno | Opis |
|---|---|---|
| `id` | da | Jedinstveni naziv za link stranice vozila. Mala slova, brojevi i crtice, bez razmaka i bez slova č, ć, š, ž, đ. Primer: `skoda-octavia-1-6-tdi-2014`. |
| `istaknuto` | ne | `true` znači da se vozilo prikazuje na početnoj strani među izdvojenima (prikazuju se prva tri). |
| `dodato` | ne | Datum u obliku `GGGG-MM-DD`. Koristi se za redosled "Najnovije dodato". |
| `marka`, `model`, `verzija` | da | Na primer `Volkswagen`, `Golf 7`, `2.0 TDI`. Marka mora biti napisana uvek isto da bi filter radio. |
| `godiste` | da | Samo broj, na primer `2014`. |
| `kilometraza` | da | Samo broj, bez tačaka i bez "km", na primer `186000`. |
| `gorivo` | da | `Dizel`, `Benzin`, `Benzin + TNG`, `Hibrid` ili `Električni`. |
| `menjac` | da | `Manuelni` ili `Automatski`. |
| `cena` | da | Cena u evrima, samo broj, na primer `7900`. |
| `snaga_kw`, `kubikaza` | ne | Brojevi. Snaga u KS se računa sama. |
| `karoserija`, `pogon`, `boja`, `vrata` | ne | Tekst, na primer `Karavan`, `4x4`, `Siva`, `5`. |
| `oprema` | ne | Lista opreme u uglastim zagradama, svaka stavka pod navodnicima. |
| `opis` | ne | Slobodan tekst. Novi pasus dobijate sa `\n`. |
| `slike` | da | Lista linkova. Prva slika je naslovna na kartici. |
| `fokus` | ne | Pomera kadar naslovne slike ako je automobil sa strane, na primer `"80% 50%"` (vodoravno, uspravno). |
| `primer` | ne | Samo za probne oglase. Prikazuje oznaku "Primer oglasa". Kod pravih vozila izostavite ovo polje. |

### Korak 4: sačuvajte

1. Dole na stranici kliknite **Commit changes**.
2. Za minut ili dva vozilo je na sajtu. Ako se ne pojavi, osvežite stranicu (Ctrl + F5).

### Prodato vozilo

Obrišite ceo njegov blok od `{` do `}` zajedno sa zarezom koji ga odvaja od susednog vozila, pa sačuvajte.

### Kad nešto ne radi

Ako posle izmene ponuda prikaže poruku "Ponuda trenutno nije dostupna", u fajlu je greška u zapisu. Najčešće je to zarez viška posle poslednjeg vozila, zarez koji fali između dva vozila ili navodnik koji fali. Nalepite sadržaj fajla na [jsonlint.com](https://jsonlint.com) i on će pokazati tačan red sa greškom.

## Primeri

U fajlu je šest probnih vozila označenih sa `"primer": true` i tekstom "PRIMER OGLASA" u opisu. Njihovi podaci nisu stvarni. Kad unesete prava vozila, obrišite primere.

## Struktura

```
index.html        početna
ponuda.html       ponuda sa filterima (filteri se čuvaju u linku, na primer ponuda.html?marka=Volkswagen)
vozilo.html       stranica vozila (vozilo.html?id=...)
o-nama.html       o nama
kontakt.html      kontakt
404.html          stranica za pogrešan link
data/vozila.json  sva vozila
assets/           stil, skripta i fontovi
```
