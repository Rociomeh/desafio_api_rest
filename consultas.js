const format = require('pg-format');

const obtenerInventario = async ({ pool, limits = 10, page = 1, order_by = 'id_ASC' }) => {
    const offset = (page - 1) * limits;
    const order = order_by.split('_');
    const orderByField = order[0];
    const orderByDirection = order[1].toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    let query = format('SELECT * FROM inventario ORDER BY %I %s LIMIT %L OFFSET %L', orderByField, orderByDirection, limits, offset);
    const { rows: inventario } = await pool.query(query);
    return inventario;
};

const construirHATEOAS = (items) => {
    return items.map(item => {
        return {
            name: item.nombre,
            href: `/joyas/joya/${item.id}`
        };
    });
};

module.exports = { obtenerInventario, construirHATEOAS };