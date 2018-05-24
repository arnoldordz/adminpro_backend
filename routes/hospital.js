// Requires
var express = require("express");
var bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");

// Inicializar variables
var app = express();

// Usuario schema
var Usuario = require("../models/usuario");
var Hospital = require("../models/hospital");

var mdAutenticacion = require("../middlewares/autenticacion");

// Obtener todos los hospitales
app.get("/", (req, res) => {
  var desde = req.query.desde || 0;
  desde = Number(desde);

  Hospital.find({}, "nombre img usuario")
    .populate("usuario", "nombre email")
    .skip(desde)
    .limit(5)
    .exec((err, hospitales) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: "Error cargando hospitales",
          errors: err
        });
      }

      Hospital.count({}, (err, conteo) => {
        if (err) {
          return res.status(500).json({
            ok: false,
            mensaje: "Error contando hospitales",
            errors: err
          });
        }
        res.status(200).json({
          ok: true,
          total: conteo,
          hospitales
        });
      });
    });
});

// Crear Hospital
app.post("/", mdAutenticacion.verificarToken, (req, res) => {
  var body = req.body;

  var hospital = new Hospital({
    nombre: body.nombre,
    usuario: req.usuario._id
  });

  hospital.save((err, hospitalGuardado) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: "Error al crear hospital",
        errors: err
      });
    }
    res.status(201).json({
      ok: true,
      hospital: hospitalGuardado,
      usuarioToken: req.usuario
    });
  });
});

// Actualizar Usuario
app.put("/:id", mdAutenticacion.verificarToken, (req, res) => {
  var id = req.params.id;
  var body = req.body;

  Hospital.findById(id, "nombre img usuario").exec((err, hospital) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al buscar hospital",
        errors: err
      });
    }

    if (!hospital) {
      return res.status(400).json({
        ok: false,
        mensaje: "El hospital con el id " + id + " no existe",
        errors: { message: "no existe un hospital con ese id" }
      });
    }

    hospital.nombre = body.nombre;
    hospital.usuario = req.usuario._id;

    hospital.save((err, hospitalGuardado) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: "Error al actualizar hospital",
          errors: err
        });
      }
      res.status(200).json({
        ok: true,
        hospital: hospitalGuardado
      });
    });
  });
});

// Elimiar hospital
app.delete("/:id", mdAutenticacion.verificarToken, (req, res) => {
  var id = req.params.id;

  Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al borrar hospital",
        errors: err
      });
    }
    if (!hospitalBorrado) {
      return res.status(400).json({
        ok: false,
        mensaje: "No existe un hospital con ese Id",
        errors: { message: "No existe un hospital con ese Id" }
      });
    }

    res.status(200).json({
      ok: true,
      hospital: hospitalBorrado
    });
  });
});
/* 


 */

module.exports = app;
