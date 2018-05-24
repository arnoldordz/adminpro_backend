// Requires
var express = require("express");

const path = require("path");
const fs = require("fs");

// Inicializar variables
var app = express();

// Rutas
app.get("/:img", (req, res, next) => {
  var img = req.params.img;

  var pathImagen = path.resolve(__dirname, `../uploads/images/${img}`);

  if (fs.existsSync(pathImagen)) {
    res.sendFile(pathImagen);
  } else {
    var pathNoImagen = path.resolve(__dirname, `../assets/no-img.jpg`);
    res.sendFile(pathNoImagen);
  }
});

module.exports = app;
