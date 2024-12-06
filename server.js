const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Conexión a la base de datos MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // Cambia según tu configuración
    password: '', // Cambia según tu configuración
    database: 'gestion_inventarios'
});

db.connect(err => {
    if (err) {
        console.error('Error al conectar a MySQL:', err.message);
        return;
    }
    console.log('Conectado a MySQL');
});

// Ruta raíz para mostrar información básica sobre los endpoints
app.get('/', (req, res) => {
    res.send(`
        <h1>API de Gestión de Inventarios</h1>
        <p>Bienvenido a la API de Gestión Empresarial. Puedes usar los siguientes endpoints:</p>
        <ul>
            <li><a href="/productos">/productos</a> - Gestión de productos</li>
            <li><a href="/clientes">/clientes</a> - Gestión de clientes</li>
            <li><a href="/pedidos">/pedidos</a> - Gestión de pedidos</li>
            <li><a href="/informe-pdf">/informe-pdf</a> - Descargar informe en PDF</li>
            <li><a href="/informe-excel">/informe-excel</a> - Descargar informe en Excel</li>
        </ul>
    `);
});

// *** CRUD para Productos ***
app.get('/productos', (req, res) => {
    db.query('SELECT * FROM productos', (err, results) => {
        if (err) res.status(500).send(err.message);
        else res.json(results);
    });
});

app.post('/productos', (req, res) => {
    const { nombre, precio, stock } = req.body;

    // Validar valores negativos
    if (precio < 0 || stock < 0) {
        return res.status(400).send('El precio y el stock no pueden ser negativos.');
    }

    const sql = 'INSERT INTO productos (nombre, precio, stock) VALUES (?, ?, ?)';
    db.query(sql, [nombre, precio, stock], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error al crear el producto.');
        } else {
            res.status(201).send('Producto creado correctamente.');
        }
    });
});


app.put('/productos/:id', (req, res) => {
    const { id } = req.params;
    const { nombre, precio, stock } = req.body;

    // Validar valores negativos
    if (precio < 0 || stock < 0) {
        return res.status(400).send('El precio y el stock no pueden ser negativos.');
    }

    const sql = 'UPDATE productos SET nombre = ?, precio = ?, stock = ? WHERE id = ?';
    db.query(sql, [nombre, precio, stock, id], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error al actualizar el producto.');
        } else {
            res.send('Producto actualizado correctamente.');
        }
    });
});

app.delete('/productos/:id', (req, res) => {
    const { id } = req.params;

    // Eliminar detalles relacionados antes de eliminar el producto
    db.query('DELETE FROM detalles_pedido WHERE producto_id = ?', [id], (err) => {
        if (err) {
            console.error('Error al eliminar detalles del producto:', err);
            return res.status(500).send('Error al eliminar los detalles del producto.');
        }

        // Ahora eliminar el producto
        db.query('DELETE FROM productos WHERE id = ?', [id], (err, result) => {
            if (err) {
                console.error('Error al eliminar el producto:', err);
                return res.status(500).send('Error al eliminar el producto.');
            }
            res.sendStatus(204); // No Content
        });
    });
});





// *** CRUD para Clientes ***
app.get('/clientes', (req, res) => {
    db.query('SELECT * FROM clientes', (err, results) => {
        if (err) {
            console.error('Error al obtener clientes:', err.message);
            res.status(500).send('Error al obtener clientes');
        } else {
            res.json(results);
        }
    });
});

app.post('/clientes', (req, res) => {
    const { nombre, email } = req.body;
    db.query(
        'INSERT INTO clientes (nombre, email) VALUES (?, ?)',
        [nombre, email],
        (err, result) => {
            if (err) res.status(500).send(err.message);
            else res.status(201).json({ id: result.insertId });
        }
    );
});

app.put('/clientes/:id', (req, res) => {
    const { id } = req.params;
    const { nombre, email } = req.body;
    db.query(
        'UPDATE clientes SET nombre = ?, email = ? WHERE id = ?',
        [nombre, email, id],
        (err, result) => {
            if (err) res.status(500).send(err.message);
            else res.json({ message: 'Cliente actualizado' });
        }
    );
});

app.delete('/clientes/:id', (req, res) => {
    const { id } = req.params;

    // Eliminar pedidos relacionados antes de eliminar el cliente
    db.query('DELETE FROM detalles_pedido WHERE pedido_id IN (SELECT id FROM pedidos WHERE cliente_id = ?)', [id], (err) => {
        if (err) {
            console.error('Error al eliminar detalles de pedidos del cliente:', err);
            return res.status(500).send('Error al eliminar los detalles de pedidos del cliente.');
        }

        db.query('DELETE FROM pedidos WHERE cliente_id = ?', [id], (err) => {
            if (err) {
                console.error('Error al eliminar los pedidos del cliente:', err);
                return res.status(500).send('Error al eliminar los pedidos del cliente.');
            }

            // Ahora eliminar el cliente
            db.query('DELETE FROM clientes WHERE id = ?', [id], (err, result) => {
                if (err) {
                    console.error('Error al eliminar el cliente:', err);
                    return res.status(500).send('Error al eliminar el cliente.');
                }
                res.sendStatus(204); // No Content
            });
        });
    });
});



// *** CRUD para Pedidos ***
// Endpoint para obtener todos los pedidos con sus detalles
app.get('/pedidos', (req, res) => {
    const query = `
        SELECT 
            p.id AS pedido_id,
            c.nombre AS cliente,
            p.fecha,
            p.total,
            dp.producto_id,
            pr.nombre AS producto,
            dp.cantidad,
            dp.subtotal
        FROM pedidos p
        INNER JOIN clientes c ON p.cliente_id = c.id
        INNER JOIN detalles_pedido dp ON p.id = dp.pedido_id
        INNER JOIN productos pr ON dp.producto_id = pr.id
        ORDER BY p.id, dp.producto_id;
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener los pedidos:', err);
            res.status(500).send('Error al obtener los pedidos.');
        } else {
            // Agrupar los resultados por pedido
            const pedidosAgrupados = results.reduce((acc, row) => {
                const { pedido_id, cliente, fecha, total, producto_id, producto, cantidad, subtotal } = row;

                if (!acc[pedido_id]) {
                    acc[pedido_id] = {
                        id: pedido_id,
                        cliente,
                        fecha,
                        total,
                        productos: []
                    };
                }

                acc[pedido_id].productos.push({
                    id: producto_id,
                    nombre: producto,
                    cantidad,
                    subtotal
                });

                return acc;
            }, {});

            res.json(Object.values(pedidosAgrupados));
        }
    });
});

app.post('/pedidos', (req, res) => {
    const { cliente_id, detalles } = req.body;

    if (!cliente_id || !detalles || detalles.length === 0) {
        return res.status(400).send('El pedido debe incluir un cliente y al menos un producto.');
    }

    db.beginTransaction((err) => {
        if (err) return res.status(500).send('Error al iniciar transacción.');

        // Validar que haya suficiente stock para todos los productos en el pedido
        const validarStockPromises = detalles.map((item) => {
            return new Promise((resolve, reject) => {
                const stockSQL = 'SELECT stock FROM productos WHERE id = ?';
                db.query(stockSQL, [item.producto_id], (err, results) => {
                    if (err) return reject(err);

                    const stockDisponible = results[0]?.stock;
                    if (!stockDisponible || stockDisponible < item.cantidad) {
                        return reject(
                            new Error(
                                `Stock insuficiente para el producto con ID ${item.producto_id}.`
                            )
                        );
                    }
                    resolve();
                });
            });
        });

        Promise.all(validarStockPromises)
            .then(() => {
                // Insertar el pedido
                const pedidoSQL = 'INSERT INTO pedidos (cliente_id, total) VALUES (?, ?)';
                const total = detalles.reduce((sum, item) => sum + item.subtotal, 0);

                db.query(pedidoSQL, [cliente_id, total], (err, result) => {
                    if (err) {
                        return db.rollback(() =>
                            res.status(500).send('Error al crear el pedido.')
                        );
                    }

                    const pedidoId = result.insertId;

                    // Insertar los detalles del pedido
                    const detallesSQL =
                        'INSERT INTO detalles_pedido (pedido_id, producto_id, cantidad, subtotal) VALUES ?';
                    const valoresDetalles = detalles.map((item) => [
                        pedidoId,
                        item.producto_id,
                        item.cantidad,
                        item.subtotal,
                    ]);

                    db.query(detallesSQL, [valoresDetalles], (err) => {
                        if (err) {
                            return db.rollback(() =>
                                res.status(500).send('Error al insertar detalles del pedido.')
                            );
                        }

                        // Actualizar el stock de los productos
                        const actualizarStockSQL =
                            'UPDATE productos SET stock = stock - ? WHERE id = ?';
                        const operacionesStock = detalles.map((item) =>
                            new Promise((resolve, reject) => {
                                db.query(
                                    actualizarStockSQL,
                                    [item.cantidad, item.producto_id],
                                    (err) => {
                                        if (err) return reject(err);
                                        resolve();
                                    }
                                );
                            })
                        );

                        Promise.all(operacionesStock)
                            .then(() => {
                                db.commit((err) => {
                                    if (err) {
                                        return db.rollback(() =>
                                            res.status(500).send('Error al confirmar pedido.')
                                        );
                                    }
                                    res.send('Pedido registrado exitosamente.');
                                });
                            })
                            .catch(() => {
                                db.rollback(() =>
                                    res.status(500).send('Error al actualizar el stock.')
                                );
                            });
                    });
                });
            })
            .catch((err) => {
                db.rollback(() => res.status(400).send(err.message));
            });
    });
});

// Generación de informes en PDF
app.get('/informe-pdf', (req, res) => {
    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=informe.pdf');

    doc.text('Informe de Ventas', { align: 'center' });
    doc.text('-------------------------------------------');
    db.query(
        `SELECT productos.nombre, SUM(pedido_detalles.cantidad) AS vendidos 
         FROM pedido_detalles 
         JOIN productos ON pedido_detalles.producto_id = productos.id 
         GROUP BY productos.id`,
        (err, results) => {
            if (err) return res.status(500).send(err.message);

            results.forEach(row => {
                doc.text(`Producto: ${row.nombre}, Vendidos: ${row.vendidos}`);
            });

            doc.end();
        }
    );
    doc.pipe(res);
});

// Generación de informes en Excel
app.get('/informe-excel', (req, res) => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Informe de Ventas');

    sheet.columns = [
        { header: 'Producto', key: 'nombre', width: 30 },
        { header: 'Vendidos', key: 'vendidos', width: 10 }
    ];

    db.query(
        `SELECT productos.nombre, SUM(pedido_detalles.cantidad) AS vendidos 
         FROM pedido_detalles 
         JOIN productos ON pedido_detalles.producto_id = productos.id 
         GROUP BY productos.id`,
        (err, results) => {
            if (err) return res.status(500).send(err.message);

            sheet.addRows(results);
            res.setHeader(
                'Content-Type',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            );
            res.setHeader(
                'Content-Disposition',
                'attachment; filename=informe.xlsx'
            );
            workbook.xlsx.write(res).then(() => res.end());
        }
    );
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
