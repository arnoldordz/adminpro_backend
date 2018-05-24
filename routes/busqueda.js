// Requires
var express = require("express");

// Inicializar variables
var app = express();

// Modelos
var Hospital = require("../models/hospital");
var Medico = require("../models/medico");
var Usuario = require("../models/usuario");

// Busqueda por todo
app.get("/todo/:busqueda", (req, res, next) => {
  var busqueda = req.params.busqueda;
  var regex = new RegExp(busqueda, "i");

  Promise.all([
    buscarHospitales(busqueda, regex),
    buscarMedicos(busqueda, regex),
    buscarUsuarios(busqueda, regex)
  ])
    .then(respuestas => {
      res.status(200).json({
        ok: true,
        hospitales: respuestas[0],
        medicos: respuestas[1],
        usuarios: respuestas[2]
      });
    })
    .catch(error => {
      return res.status(500).json({
        ok: false,
        mensaje: "Error cargando busqueda",
        errors: err
      });
    });
});

// Busqueda por coleccion
app.get("/coleccion/:tabla/:busqueda", (req, res) => {
  var tabla = req.params.tabla;
  var busqueda = req.params.busqueda;
  var regex = new RegExp(busqueda, "i");

  var promesa;

  switch (tabla) {
    case "medicos":
      promesa = buscarMedicos(busqueda, regex);
      break;
    case "hospitales":
      promesa = buscarHospitales(busqueda, regex);
      break;
    case "usuarios":
      promesa = buscarUsuarios(busqueda, regex);
      break;

    default:
      return res.status(400).json({
        ok: false,
        mensaje: "Error coleccion no existe",
        errors: err
      });
      break;
  }

  promesa
    .then(respuestas => {
      res.status(200).json({
        ok: true,
        [tabla]: respuestas
      });
    })
    .catch(error => {
      return res.status(500).json({
        ok: false,
        mensaje: "Error cargando busqueda",
        errors: err
      });
    });
});

function buscarHospitales(busqueda, regex) {
  return new Promise((resolve, reject) => {
    Hospital.find({ nombre: regex })
      .populate("usuario", "nombre email")
      .limit(5)
      .exec((err, hospitales) => {
        if (err) {
          reject("Error al cargar hospitales", err);
        } else {
          resolve(hospitales);
        }
      });
  });
}

function buscarMedicos(busqueda, regex) {
  return new Promise((resolve, reject) => {
    Medico.find({ nombre: regex })
      .populate("usuario", "nombre email")
      .populate({
        path: "hospital",
        populate: { path: "usuario", select: "nombre email", model: "Usuario" }
      })
      .limit(5)
      .exec((err, medicos) => {
        if (err) {
          reject("Error al cargar medicos", err);
        } else {
          resolve(medicos);
        }
      });
  });
}

function buscarUsuarios(busqueda, regex) {
  return new Promise((resolve, reject) => {
    Usuario.find({}, "nombre email img role")
      .or([{ nombre: regex }, { email: regex }])
      .exec((err, usuarios) => {
        if (err) {
          reject("Error al cargar usuarios", err);
        } else {
          resolve(usuarios);
        }
      });
  });
}
module.exports = app;
