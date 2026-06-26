const express = require("express");
const { Pool } = require("pg");

const app = express();

app.use(express.json());

async function main() {
    try {
        const pool = new Pool({
            user: "admin",
            password: "biblio123",
            host: "localhost",
            database: "bibliotech_db",
            port: 5432
        });

        const db = await pool.connect();

        console.log("Database connected");

        await db.query(`
            CREATE TABLE IF NOT EXISTS livres (
                id SERIAL PRIMARY KEY,
                titre VARCHAR(255) NOT NULL,
                auteur VARCHAR(255) NOT NULL,
                categorie VARCHAR(100) NOT NULL,
                annee_publication INT NOT NULL,
                disponible BOOLEAN DEFAULT TRUE`);

        app.post("/livres", async (req, res) => {
            try {
                const { titre, auteur, categorie, annee_publication, disponible } = req.body;

                const result = await db.query(
                    `INSERT INTO livres
                    (titre, auteur, categorie, annee_publication, disponible)
                    VALUES ($1,$2,$3,$4,$5)
                    RETURNING *`,
                    [titre, auteur, categorie, annee_publication, disponible]
                );

                res.status(201).json(result.rows[0]);
            } catch (err) {
                res.status(500).json({ message: "Server error" });
            }
        });

        app.get("/livres", async (req, res) => {
            try {
                const { disponible } = req.query;

                let result;

                if (disponible !== undefined) {
                    result = await db.query(
                        "SELECT * FROM livres WHERE disponible = $1",
                        [disponible === "true"]
                    );
                } else {
                    result = await db.query("SELECT * FROM livres");
                }

                res.status(200).json(result.rows);
            } catch (err) {
                res.status(500).json({ message: "Server error" });
            }
        });

        app.get("/livres/search", async (req, res) => {
            try {
                const { categorie } = req.query;

                const result = await db.query(
                    "SELECT * FROM livres WHERE categorie = $1",
                    [categorie]
                );

                res.status(200).json(result.rows);
            } catch (err) {
                res.status(500).json({ message: "Server error" });
            }
        });

        app.get("/livres/:id", async (req, res) => {
            try {
                const { id } = req.params;

                const result = await db.query(
                    "SELECT * FROM livres WHERE id = $1",
                    [id]
                );

                if (result.rowCount === 0) {
                    return res.status(404).json({
                        message: "Livre introuvable"
                    });
                }

                res.status(200).json(result.rows[0]);
            } catch (err) {
                res.status(500).json({ message: "Server error" });
            }
        });

        app.put("/livres/:id", async (req, res) => {
            try {
                const { id } = req.params;
                const { titre, auteur, categorie, annee_publication, disponible } = req.body;

                const result = await db.query(
                    `UPDATE livres
                    SET titre=$1,
                        auteur=$2,
                        categorie=$3,
                        annee_publication=$4,
                        disponible=$5
                    WHERE id=$6
                    RETURNING *`,
                    [titre, auteur, categorie, annee_publication, disponible, id]
                );

                if (result.rowCount === 0) {
                    return res.status(404).json({
                        message: "Livre introuvable"
                    });
                }

                res.status(200).json(result.rows[0]);
            } catch (err) {
                res.status(500).json({ message: "Server error" });
            }
        });

        app.delete("/livres/:id", async (req, res) => {
            try {
                const { id } = req.params;

                const result = await db.query(
                    "DELETE FROM livres WHERE id=$1 RETURNING *",
                    [id]
                );

                if (result.rowCount === 0) {
                    return res.status(404).json({
                        message: "Livre introuvable"
                    });
                }

                res.status(200).json({
                    message: "Livre supprimé"
                });
            } catch (err) {
                res.status(500).json({ message: "Server error" });
            }
        });

        app.get("/stats/total", async (req, res) => {
            try {
                const result = await db.query(
                    "SELECT COUNT(*) FROM livres"
                );

                res.status(200).json({
                    total: result.rows[0].count
                });
            } catch (err) {
                res.status(500).json({ message: "Server error" });
            }
        });

        app.listen(8080, () => {
            console.log("Server running on port 8080");
        });

    } catch (err) {
        console.log(err);
    }
}

main();