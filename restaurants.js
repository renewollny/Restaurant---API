const { MongoClient } = require("mongodb");
const express = require("express");
const app = express();

const port = 3000;
const hostname = "localhost";


// MongoDB-Verbindung
const uri = "mongodb+srv://renewollny:dirk4mvp@cluster0.frgwjd3.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri);
client.connect();
const db = client.db("database");
const coll = db.collection("restaurant");
client.connect().then(() => console.log("Connected to MongoDB"));


// Prüfung, ob Element bereits vorhanden ist
const exists = (name) => {
    let result = restaurants.find((elem) => {
        if (elem.name == r.name) {
            return true;
        }
    });
    if (result) {
        return true;
    } else {
        return false;
    }
};

let restaurants = [{
    "name": "restaurant1",
    "address": "kindergarten1",
    "category": "burger"
}];


// Index des Restaurants finden für die weitere Verwendung
function getIndex(name) {
    let index = -1;
    for (let i = 0; i < restaurants.length; i++) {
        if (restaurants[i].name == name) {
            index = i;
        };
    };
    return index;
};


// Funktion zum Löschen eines Restaurants
function delRestaurant(name) {
    const index = getIndex(name);
    let deletedRest = restaurants.splice(index, 1);
    return deletedRest;
};


// Funktion zum Hinzufügen eines Restaurants
function createRestaurant(neu) {
    restaurants.push(neu);
};


app.use(express.json());


/* API-Endpunkte */
// wenn req nicht benutzt wird, kann auch ein "_" geschrieben werden
// Liste aller Restaurants
app.get("/restaurants", async function(_,res) {
    let r = await coll.find().toArray();
    res.status(200);
    res.send(r);
});


// Ein neues Restaurant hinzufügen, wenn es nicht vorhanden ist
app.post("/restaurant", (req, res) => {
    let r = req.body;
    if (!r.name || !r.address || !r.category) {
        res.send("Objekt ist nicht vollständig");
    } else {
        // Überprüfung, ob das Element bereits in der Liste Restaurants existiert
        let e = exists(r.name);
        if (e = false) {
            // Element hinzufügen
            restaurants.push(r);
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
    // Undefined Variable für Resultat der Suche anlegen
    let result;
    // Prüfen, ob Restaurant in Liste vorhanden ist
    restaurants.forEach((elem) => {
        // wenn Restaurant vorhanden, Restaurant-Daten in Resultat-Variable speichern
        if (elem.name === req.params.name) {
            result = elem;
        };
    });
    // Ergebnis der Suche zurückgeben
    if (result) {
        res.status(200);
        res.send(result)
    } else {
        res.status(404);
        res.send("Restaurant existiert nicht.");
    };
});


// Aktualisierung eines Restaurants
app.put("/restaurant/:name", (req, res) => {
    if (getIndex(req.params.name) != -1) {
        const r = req.body;
        if (r.name && r.address && r.category) {
            delRestaurant(r.name);
            createRestaurant(r);
            res.status(200);
            res.send(r);
            // console.log(`Aktualisiere ${req.params.name}: ${r.name}, ${r.adresse}, ${r.kategorie}.`);
        } else {
            res.status(400);
            res.send("Daten unvollständig, nicht aktualisiert.");
        }
    } else {
        res.status(404);
        res.send("Restaurant nicht gefunden.");
    };
});


// Ein Restaurant löschen
app.delete("/restaurant/:name", (req, res) => {
    if (getIndex(req.params.name) != -1) {
        let del = delRestaurant(req.params.name);
        res.send("Folgendes Restaurant wurde gelöscht " + JSON.stringify(del));
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
    client.close();
    console.log("database connection closed");
    process.exit();
})