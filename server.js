const express = require('express');
const pool = require('./db');

pool.query('SELECT NOW()')
    .then(() => console.log('Database connected'))
    .catch(err => console.error(err));

const app = express();
const port = 8080;

app.use(express.json());

app.listen(port, () => {
    console.log(`the server is running on port ${port}`);
});

app.post('/livres', async (req, res) => {
    try {
        const { titre, auteur, categorie, annee_publication, disponible } = req.body;

        const nouveauLivre = await pool.query(
            `INSERT INTO livres
            (titre, auteur, categorie, annee_publication, disponible)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *`,
            [titre, auteur, categorie, annee_publication, disponible]
        );

        res.status(201).json({
            message: 'Livre ajouté avec succès',
            livre: nouveauLivre.rows[0]
        });

    } catch (error) {
        console.error(error.message);
        res.status(500).json({
            message: 'Erreur serveur'
        });
    }
});

app.get('/livres', async (req, res) => {
    try {
        const livres = await pool.query('SELECT * FROM livres');

        res.status(200).json(livres.rows);

    } catch (error) {
        console.error(error.message);
        res.status(500).json({
            message: 'Erreur serveur'
        });
    }
});

app.get('/livres/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const livre = await pool.query(
            'SELECT * FROM livres WHERE id = $1',
            [id]
        );

        if (livre.rows.length === 0) {
            return res.status(404).json({
                message: 'Livre introuvable'
            });
        }

        res.status(200).json(livre.rows[0]);

    } catch (error) {
        console.error(error.message);
        res.status(500).json({
            message: 'Erreur serveur'
        });
    }
});

app.put('/livres/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { titre, auteur, categorie, annee_publication, disponible } = req.body;

        const livre = await pool.query(
            `UPDATE livres
            SET titre = $1,
                auteur = $2,
                categorie = $3,
                annee_publication = $4,
                disponible = $5
            WHERE id = $6
            RETURNING *`,
            [titre, auteur, categorie, annee_publication, disponible, id]
        );

        if (livre.rows.length === 0) {
            return res.status(404).json({
                message: 'Livre introuvable'
            });
        }

        res.status(200).json({
            message: 'Livre modifié avec succès',
            livre: livre.rows[0]
        });

    } catch (error) {
        console.error(error.message);
        res.status(500).json({
            message: 'Erreur serveur'
        });
    }
});

app.delete('/livres/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const livre = await pool.query(
            'DELETE FROM livres WHERE id = $1 RETURNING *',
            [id]
        );

        if (livre.rows.length === 0) {
            return res.status(404).json({
                message: 'Livre introuvable'
            });
        }

        res.status(200).json({
            message: 'Livre supprimé avec succès',
            livre: livre.rows[0]
        });

    } catch (error) {
        console.error(error.message);
        res.status(500).json({
            message: 'Erreur serveur'
        });
    }
});