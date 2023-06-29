const sqlite3 = require("better-sqlite3");
const express = require("express");
const app = express();

const port = 3000;
const hostname = "localhost";


// SQLite-Verbindung
let db = new sqlite3("restaurants");
console.log("Mit SQL-Datenbank verbunden.")

db.prepare("CREATE TABLE IF NOT EXISTS restaurant (rest_id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, address TEXT NOT NULL, category TEXT NOT NULL)").run();


// Restaurant mittels Name finden
function findRestaurant(name) {
    const search = db.prepare(`SELECT * FROM restaurant WHERE name = ?`);
    const finalSearch = search.all(name);
    return finalSearch;
};


app.use(express.json());


/* API-Endpunkte */
// wenn req nicht benutzt wird, kann auch ein "_" geschrieben werden
// Liste aller Restaurants
app.get("/restaurants", (req, res) => {
    res.status(200);
    res.send(db.prepare("SELECT * FROM restaurant").all());
});


// Ein neues Restaurant hinzufügen, wenn es nicht vorhanden ist
/* GEHT NICHT!!! siehe Code-Zeile 51 */
app.post("/restaurant", (req, res) => {
    const r = req.body;
    // rest_name = r.name;
    // rest_address = r.address;
    // rest_category = r.category;
    // Überprüfung, ob alle Werte des neuen Restaurants mitgegeben wurden sind
    if (!r.name || !r.address || !r.category) {
        res.send("Objekt ist nicht vollständig");
    } else {
        // Überprüfung, ob das Element bereits in der Liste Restaurants existiert
        let e = findRestaurant(r.name);
        if (e.length === 0) {
            // Element hinzufügen
            /* GEHT NICHT!!! SQL-Statemenet funktioniert in TablePlus, aber hier
            kommt Fehlermeldung "Too few parameter values were provided" */
            db.prepare("INSERT INTO restaurant (name, address, category) VALUES (?,?,?)", (rest_name, rest_address, rest_category)).run();
            res.status(201);
            res.send("Restaurant wurde hinzugefügt");
        } else {
            // Element ist bereits vorhanden
            res.send("Restaurant ist bereits vorhanden.")
        };
    };
});


// Ein Restaurant suchen
app.get("/restaurant/:name", (req, res) => {
    const r = findRestaurant(req.params.name);
    if (r.length > 0) {
        res.status(200);
        res.send(r);    
    } else {
        res.status(404);
        res.send("Restaurant existiert nicht.");
    };
});


// Aktualisierung eines Restaurants
/* GEHT NICHT!!! Fehlermeldung "Cannot PUT /restaurant"; GET-Methoden funktionieren, und Name des Restaurants ist in der DB
vorhanden */
app.put("/restaurant/:name", (req, res) => {
    const r = findRestaurant(req.params.name);
    const n = req.body;
    if (r.length > 0) {
        if (r.name && r.address && r.category) {
            const update = db.prepare(`UPDATE restaurant SET name = ${n.name}, address = ${n.address}, category = ${n.category} WHERE name = ?`);
            const finalUpdate = update.all(req.params.name);
            res.status(200);
            res.send(finalUpdate);
        } else {
            res.status(400);
            res.send("Daten unvollständig, nicht aktualisiert.");
        };
    } else {
            res.status(404);
            res.send("Restaurant nicht gefunden.");
        };
});



// Ein Restaurant löschen
/* GEHT NICHT!!! Fehlermeldung "Cannot DELETE /restaurant"; GET-Methoden funktionieren, und Name des Restaurants ist in der DB
vorhanden */
app.delete("/restaurant/:name", (req, res) => {
    const r = findRestaurant(req.params.name);
    if (r.length > 0) {
        const del = db.prepare("DELETE FROM restaurant WHERE name = ?");
        const finalDel = del.all(req.params.name);
        res.status(200);
        res.send("Restaurant wurde gelöscht.");
    } else {
        res.status(404);
        res.send("Restaurant nicht gefunden.");
    };
});


// Server starten
app.listen(port, hostname, () => {
    console.log(`Server gestartet ${hostname}:${port}`);
});


// Datenbank-Verbindung beim Beenden des Servers schließen
process.on("SIGINT", () => {
    db.close();
    console.log("database connection closed");
    process.exit();
})