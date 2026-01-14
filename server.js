const express = require('express');
const sql = require('mssql');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Sirve archivos estáticos (HTML, CSS, JS)

// Configuración de la base de datos
const config = {
    user: 'node_user',
    password: 'NodePass123!',
    server: 'localhost', // o tu servidor
    database: 'inventario_informatico_roldan_pruebas',
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

// Ruta para servir el HTML principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Ruta para obtener todas las marcas
app.get('/api/marcas', async (req, res) => {
    try {
        let pool = await sql.connect(config);
        let result = await pool.request().query('SELECT * FROM Marcas');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Ruta para crear un computador
app.post('/api/computadores', async (req, res) => {
    try {
        const {
            placaComputador,
            numeroSerial,
            procesador,
            nombreMarca,
            nombreModelo,
            nombreSistemaOperativo,
            discosDuros,
            memoriasRam,
            interfacesRed
        } = req.body;

        let pool = await sql.connect(config);
        let result = await pool.request()
            .input('PlacaComputador', sql.VarChar(50), placaComputador)
            .input('NumeroSerial', sql.VarChar(50), numeroSerial)
            .input('Procesador', sql.VarChar(50), procesador)
            .input('NombreMarca', sql.VarChar(50), nombreMarca)
            .input('NombreModelo', sql.VarChar(50), nombreModelo)
            .input('NombreSistemaOperativo', sql.VarChar(50), nombreSistemaOperativo)
            .input('DiscosDuros', sql.NVarChar(sql.MAX), JSON.stringify(discosDuros))
            .input('MemoriasRam', sql.NVarChar(sql.MAX), JSON.stringify(memoriasRam))
            .input('InterfacesRed', sql.NVarChar(sql.MAX), JSON.stringify(interfacesRed))
            .execute('sp_InsertarComputador');

        res.json({ success: true, data: result.recordset[0] });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});