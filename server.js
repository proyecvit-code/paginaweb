const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;
const counterFile = path.join(__dirname, "views.json");

// Crear el archivo views.json si no existe
if (!fs.existsSync(counterFile)) {
    fs.writeFileSync(counterFile, JSON.stringify({ views: 0 }));
}

// Servir archivos estáticos
app.use(express.static(__dirname));

// Función para leer el contador
function getViewsCount() {
    try {
        const data = JSON.parse(fs.readFileSync(counterFile, "utf8"));
        return data.views || 0;
    } catch (e) {
        return 0;
    }
}

// 1. Obtener visitas actuales (SOLO LEER, NO INCREMENTA)
app.get("/api/views", (req, res) => {
    res.json({ views: getViewsCount() });
});

// 2. Registrar NUEVA visita (INCREMENTA +1)
app.post("/api/views", (req, res) => {
    let views = getViewsCount() + 1;
    fs.writeFileSync(counterFile, JSON.stringify({ views }));
    res.json({ views });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});