const { Pool } = require("pg");

const pool = new Pool({
    user: "admin",
    host: "localhost",
    database: "bibliotech_db",
    password: "biblio123",
    port: 5432,
});

module.exports = pool;