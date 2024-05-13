const express = require('express')
const cors = require ('cors')
const {Pool} = require ('pg')
const { obtenerInventario, construirHATEOAS } = require('./consultas');
const format = require('pg-format');
require('dotenv').config();

const pool = new Pool({
    host: process.env.PGHOST,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
    port: process.env.PGPORT,
    allowExitOnIdle: true
})

const app = express()

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


app.use (express.json())
app.use(cors())

app.use((req, res, next) => {
    console.log(`Acceso a la ruta: ${req.path}, Método: ${req.method}, Timestamp: ${new Date().toISOString()}`);
    next();
});

app.get('/joyas', async (req, res) => {
    try {
        const { limits, page, order_by } = req.query;
        const inventario = await obtenerInventario({ pool, limits, page, order_by });
        const response = {
            totalJoyas: inventario.length, 
            stockTotal: inventario.reduce((acc, item) => acc + item.stock, 0), 
            results: construirHATEOAS(inventario)
        };
        res.json(response);
    } catch (error) {
        console.error('Error al obtener el inventario:', error);
        res.status(500).send('Error interno del servidor');
    }
});

app.get('/joyas/filtros', async (req, res) => {
    try {
        const { precio_min, precio_max, categoria, metal } = req.query;
        if (!precio_min || !precio_max || !categoria || !metal) {
            return res.status(400).send('Todos los parámetros son requeridos: precio_min, precio_max, categoria, metal');
        }
        
        let query = format('SELECT * FROM inventario WHERE precio BETWEEN %L AND %L AND categoria = %L AND metal = %L', 
                            precio_min.trim(), precio_max.trim(), categoria.trim(), metal.trim());
        const result = await pool.query(query);
        const filteredItems = result.rows.map(item => ({
            id: item.id,
            nombre: item.nombre,
            categoria: item.categoria,
            metal: item.metal,
            precio: item.precio,
            stock: item.stock
        }));
        res.json(filteredItems);
    } catch (error) {
        console.error('Error en filtros de joyas:', error);
        res.status(500).send('Error interno del servidor');
    }
});



module.exports = { app, pool };