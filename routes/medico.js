// Requires
var express = require("express");
var bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");

// Inicializar variables
var app = express();

// Usuario schema
var Usuario = require("../models/usuario");
var Hospital = require("../models/hospital");
var Medico = require("../models/medico");

var mdAutenticacion = require("../middlewares/autenticacion");

// Obtener todos los medicos
app.get("/", (req, res) => {
  var desde = req.query.desde || 0;
  desde = Number(desde);

  Medico.find({}, "nombre img usuario hospital")
    .populate("usuario", "nombre email")
    .populate("hospital")
    .skip(desde)
    .limit(5)
    .exec((err, medicos) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: "Error cargando medicos",
          errors: err
        });
      }

      Medico.count({}, (err, conteo) => {
        if (err) {
          return res.status(500).json({
            ok: false,
            mensaje: "Error contando medicos",
            errors: err
          });
        }

        res.status(200).json({
          ok: true,
          total: conteo,
          medicos
        });
      });
    });
});

// Crear Medico
app.post("/", mdAutenticacion.verificarToken, (req, res) => {
  var body = req.body;

  var medico = new Medico({
    nombre: body.nombre,
    usuario: req.usuario._id,
    hospital: body.hospital
  });

  medico.save((err, medicoGuardado) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: "Error al crear medico",
        errors: err
      });
    }
    res.status(201).json({
      ok: true,
      medico: medicoGuardado,
      usuarioToken: req.usuario
    });
  });
});

// Actualizar medico
app.put("/:id", mdAutenticacion.verificarToken, (req, res) => {
  var id = req.params.id;
  var body = req.body;

  Medico.findById(id, "nombre img medico").exec((err, medico) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al buscar medico",
        errors: err
      });
    }

    if (!medico) {
      return res.status(400).json({
        ok: false,
        mensaje: "El medico con el id " + id + " no existe",
        errors: { message: "no existe un medico con ese id" }
      });
    }

    medico.nombre = body.nombre;
    medico.hospital = body.hospital;

    medico.save((err, medicoGuardado) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: "Error al actualizar medico",
          errors: err
        });
      }
      res.status(200).json({
        ok: true,
        medico: medicoGuardado
      });
    });
  });
});

// Elimiar medico
app.delete("/:id", mdAutenticacion.verificarToken, (req, res) => {
  var id = req.params.id;

  Medico.findByIdAndRemove(id, (err, medicoBorrado) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al borrar medico",
        errors: err
      });
    }
    if (!medicoBorrado) {
      return res.status(400).json({
        ok: false,
        mensaje: "No existe un medico con ese Id",
        errors: { message: "No existe un medico con ese Id" }
      });
    }

    res.status(200).json({
      ok: true,
      medico: medicoBorrado
    });
  });
});

module.exports = app;
