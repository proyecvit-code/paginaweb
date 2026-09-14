const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const counterFile = path.join(__dirname, "views.json");

// Middleware para procesar JSON
app.use(express.json());

// Servir los archivos estáticos (index.html, style.css, script.js, assets, etc.)
app.use(express.static(__dirname));

// Función para garantizar que el archivo views.json exista
function ensureCounterFile() {
    if (!fs.existsSync(counterFile)) {
        try {
            fs.writeFileSync(counterFile, JSON.stringify({ views: 0 }, null, 2));
        } catch (error) {
            console.error("Error al crear views.json:", error);
        }
    }
}

// Función para obtener la cantidad actual de visitas
function getViewsCount() {
    ensureCounterFile();
    try {
        const data = JSON.parse(fs.readFileSync(counterFile, "utf8"));
        return data.views || 0;
    } catch (error) {
        console.error("Error al leer views.json:", error);
        return 0;
    }
}

// 1. Obtener contador de visitas (SOLO LEER)
app.get("/api/views", (req, res) => {
    const views = getViewsCount();
    res.json({ views });
});

// 2. Incrementar contador de visitas (+1)
app.post("/api/views", (req, res) => {
    let views = getViewsCount() + 1;
    try {
        fs.writeFileSync(counterFile, JSON.stringify({ views }, null, 2));
        res.json({ views });
    } catch (error) {
        console.error("Error al escribir en views.json:", error);
        res.status(500).json({ error: "No se pudo actualizar el contador de vistas" });
    }
});

// Inicializar verificación del archivo de visitas
ensureCounterFile();

// Iniciar Servidor
app.listen(PORT, () => {
    console.log(` Servidor corriendo en http://localhost:${PORT}`);
});