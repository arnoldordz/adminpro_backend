// Requires
var express = require("express");
var bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");

// Inicializar variables
var app = express();

// Usuario schema
var Usuario = require("../models/usuario");

// Seed
var SEED = require("../config/config").SEED;

// Crear token
app.post("/", (req, res) => {
  var body = req.body;

  Usuario.findOne({ email: body.email }).exec((err, usuarioDB) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al buscar usuario",
        errors: err
      });
    }

    if (!usuarioDB) {
      return res.status(400).json({
        ok: false,
        mensaje: "Credenciales incorrectas",
        errors: err
      });
    }

    if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
      return res.status(400).json({
        ok: false,
        mensaje: "Credenciales incorrectas",
        errors: err
      });
    }

    // elimino password del objeto
    usuarioDB = usuarioDB.toObject();
    delete usuarioDB.password;

    var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 });

    res.status(200).json({
      ok: true,
      usuario: usuarioDB,
      id: usuarioDB.id,
      token
    });
  });
});

module.exports = app;
