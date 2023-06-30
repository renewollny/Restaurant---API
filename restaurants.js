const sqlite3 = require("better-sqlite3");
const express = require("express");
const app = express();

const port = 3000;
const hostname = "localhost";


// SQLite-Verbindung
let db = new sqlite3("restaurants.db");
console.log("Mit SQL-Datenbank verbunden.")
db.prepare("CREATE TABLE IF NOT EXISTS restaurant (rest_id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, address TEXT NOT NULL, category TEXT NOT NULL)").run();


// Restaurant mittels Name finden
function findRestaurant(name) {
    return db.prepare(`SELECT * FROM restaurant WHERE name = ?`).get(name);
};


app.use(express.json());


/* API-ENDPUNKTE */

// Liste aller Restaurants
app.get("/restaurants", (req, res) => {
    res.send(db.prepare("SELECT * FROM restaurant").all());
    res.status(200);
});


// Ein neues Restaurant hinzufügen, wenn es nicht vorhanden ist
app.post("/restaurant", (req, res) => {
    const r = req.body;
    
    // Überprüfung, ob alle Werte des neuen Restaurants mitgegeben wurden sind
    if (!r.name || !r.address || !r.category) {
        res.send("Objekt ist nicht vollständig");
    
    } else {
        // Überprüfung, ob das Element bereits in der Datenbank existiert
        const e = findRestaurant(r.name);
        // wenn Restaurant nicht in Datenbank vorhanden
        if (e === undefined) {
            // Element hinzufügen
            db.prepare("INSERT INTO restaurant (name, address, category) VALUES (?,?,?)").run(r.name, r.address, r.category);
            res.status(201);
            res.send("Restaurant wurde hinzugefügt");
        
        // wenn Restaurant in Datenbank vorhanden
        } else {
            res.send("Restaurant ist bereits vorhanden.")
        };
    };
});


// Ein Restaurant suchen
app.get("/restaurant/:name", (req, res) => {
    // Prüfen, ob Restaurant in Datenbank vorhanden
    const result = findRestaurant(req.params.name);
    
    // wenn Restaurant in Datenbank vorhanden
    if (result !== undefined) {
        res.send(result);
        res.status(200);
    
    // wenn Restaurant nicht in Datenbank vorhanden
    } else {
        res.status(404);
        res.send("Restaurant existiert nicht.");
    };
});


// Aktualisierung eines Restaurants
app.put("/restaurant/:name", (req, res) => {
    const r = req.body;
    
    // Prüfen, ob Restaurant in Datenbank vorhanden
    const result = findRestaurant(r.name);
    
    // wenn Restaurant in Datenbank vorhanden
    if (result !== undefined) {
        // Prüfen, ob alle 3 Felder angegeben wurden
        if (r.name && r.address && r.category) {
            db.prepare(`UPDATE restaurant SET name = ?, address = ?, category = ? WHERE name = ?`).run(r.name, r.address, r.category, r.name);
            res.status(200);
            res.send(r);
        // wenn Daten unvollständig
        } else {
            res.status(400);
            res.send("Daten unvollständig, nicht aktualisiert.");
        };
    
    // wenn Restaurant nicht in Datenbank vorhanden
    } else {
            res.status(404);
            res.send("Restaurant nicht gefunden.");
        };
});


// Ein Restaurant löschen
app.delete("/restaurant/:name", (req, res) => {
    // Prüfen, ob Restaurant in Datenbank vorhanden
    const result = findRestaurant(req.params.name);
    
    // wenn Restaurant in Datenbank vorhanden
    if (result !== undefined) {
        db.prepare("DELETE FROM restaurant WHERE name = ?").run(req.params.name);
        res.status(200);
        res.send("Restaurant wurde gelöscht." + JSON.stringify(result));
    
    // wenn Restaurant nicht in Datenbank vorhanden
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
});