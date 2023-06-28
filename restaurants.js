const express = require("express");
const app = express();

const port = 3000;
const hostname = "localhost";

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


function getIndex(name) {
    let index = -1;
    for (let i = 0; i < restaurants.length; i++) {
        if (restaurants[i].name == name) {
            index = i;
        };
    };
    return index;
};


function delRestaurant(name) {
    const index = getIndex(name);
    let deletedRest = restaurants.splice(index, 1);
    return deletedRest;
};


function createRestaurant(neu) {
    restaurants.push(neu);
};


app.use(express.json());


// wenn req nicht benutzt wird, kann auch ein "_" geschrieben werden
app.get("/restaurants", (_, res) => {
    res.status(200);
    res.send(restaurants);
});


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


app.delete("/restaurant/:name", (req, res) => {
    if (getIndex(req.params.name) != -1) {
        let del = delRestaurant(req.params.name);
        res.send("Folgendes Restaurant wurde gelöscht " + JSON.stringify(del));
    } else {
        res.status(404);
        res.send("Restaurant nicht gefunden.");
    };
});


app.listen(port, hostname, () => {
    console.log(`Server gestartet ${hostname}:${port}`);
});