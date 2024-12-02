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
    db.query(
        'INSERT INTO productos (nombre, precio, stock) VALUES (?, ?, ?)',
        [nombre, precio, stock],
        (err, result) => {
            if (err) res.status(500).send(err.message);
            else res.status(201).json({ id: result.insertId });
        }
    );
});

app.put('/productos/:id', (req, res) => {
    const { id } = req.params;
    const { nombre, precio, stock } = req.body;
    db.query(
        'UPDATE productos SET nombre = ?, precio = ?, stock = ? WHERE id = ?',
        [nombre, precio, stock, id],
        (err, result) => {
            if (err) res.status(500).send(err.message);
            else res.json({ message: 'Producto actualizado' });
        }
    );
});

app.delete('/productos/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM productos WHERE id = ?', [id], (err, result) => {
        if (err) res.status(500).send(err.message);
        else res.json({ message: 'Producto eliminado' });
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
    db.query('DELETE FROM clientes WHERE id = ?', [id], (err, result) => {
        if (err) res.status(500).send(err.message);
        else res.json({ message: 'Cliente eliminado' });
    });
});

// *** CRUD para Pedidos ***
app.get('/pedidos', (req, res) => {
    db.query(
        `SELECT pedidos.id, clientes.nombre AS cliente, pedidos.fecha, pedidos.total 
         FROM pedidos 
         JOIN clientes ON pedidos.cliente_id = clientes.id`,
        (err, results) => {
            if (err) res.status(500).send(err.message);
            else res.json(results);
        }
    );
});

app.post('/pedidos', (req, res) => {
    const { cliente_id, detalles } = req.body;

    if (!cliente_id || !detalles || detalles.length === 0) {
        res.status(400).send('El pedido debe incluir un cliente y al menos un producto.');
        return;
    }

    db.beginTransaction((err) => {
        if (err) return res.status(500).send('Error al iniciar transacción');

        const pedidoSQL = 'INSERT INTO pedidos (cliente_id, total) VALUES (?, ?)';
        const total = detalles.reduce((sum, item) => sum + item.subtotal, 0);

        db.query(pedidoSQL, [cliente_id, total], (err, result) => {
            if (err) {
                return db.rollback(() => res.status(500).send('Error al crear pedido'));
            }

            const pedidoId = result.insertId;
            const detallesSQL = 'INSERT INTO detalles_pedido (pedido_id, producto_id, cantidad, subtotal) VALUES ?';

            const valores = detalles.map((item) => [
                pedidoId,
                item.producto_id,
                item.cantidad,
                item.subtotal,
            ]);

            db.query(detallesSQL, [valores], (err) => {
                if (err) {
                    return db.rollback(() => res.status(500).send('Error al insertar detalles del pedido'));
                }

                db.commit((err) => {
                    if (err) {
                        return db.rollback(() => res.status(500).send('Error al confirmar pedido'));
                    }

                    res.send('Pedido registrado exitosamente');
                });
            });
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
