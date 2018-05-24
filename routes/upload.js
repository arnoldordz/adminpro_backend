// Requires
var express = require("express");
var fileUpload = require("express-fileupload");
var uuidv4 = require("uuid/v4");
var fs = require("fs");

// Modelos
var Hospital = require("../models/hospital");
var Medico = require("../models/medico");
var Usuario = require("../models/usuario");

// Inicializar variables
var app = express();

// default options
app.use(fileUpload());

// Rutas
app.put("/:tipo/:id", (req, res, next) => {
  var tipo = req.params.tipo;
  var id = req.params.id;

  // tipos de colecciones
  var tiposValidos = ["hospitales", "usuarios", "medicos"];
  if (tiposValidos.indexOf(tipo) < 0) {
    return res.status(400).json({
      ok: false,
      mensaje: "Tipo de coleccion no es valida",
      errors: { message: "Tipo de coleccion no es valida" }
    });
  }

  if (!req.files) {
    return res.status(400).json({
      ok: false,
      mensaje: "No selecciono nada",
      errors: { message: "Debe de seleccionar una imagen" }
    });
  }

  //Obtener nombre del archivo
  var archivo = req.files.imagen;
  var nombreCortado = archivo.name.split(".");
  var extensionArchivo = nombreCortado[nombreCortado.length - 1];

  // solo estas exensiones aceptamos
  var extensionesValidas = ["png", "jpg", "gif", "jpeg"];

  if (extensionesValidas.indexOf(extensionArchivo) < 0) {
    return res.status(400).json({
      ok: false,
      mensaje: "Extension no valida",
      errors: {
        message: "Las extensiones validas son " + extensionesValidas.join(", ")
      }
    });
  }

  // Nombre de archivo personalizado
  var nombreArchivo = `${tipo}_${uuidv4()}.${extensionArchivo}`;

  // Mover el archivo del temporal a un path
  var path = `./uploads/images/${nombreArchivo}`;

  archivo.mv(path, function(err) {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al mover archivo",
        errors: err
      });
    }

    subirPorTipo(tipo, id, nombreArchivo, res);
  });
});

function subirPorTipo(tipo, id, nombreArchivo, res) {
  var path = `./uploads/images/${nombreArchivo}`;

  if (tipo === "usuarios") {
    Usuario.findById(id, (err, usuario) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: "Error al buscar usuario",
          errors: err
        });
      }

      if (!usuario) {
        return res.status(400).json({
          ok: false,
          mensaje: "El usuario con el id " + id + " no existe",
          errors: { message: "no existe un usuario con ese id" }
        });
      }

      var pathViejo = `./uploads/images/${usuario.img}`;

      if (fs.existsSync(pathViejo)) {
        fs.unlinkSync(pathViejo);
      }

      usuario.img = nombreArchivo;

      usuario.save((err, usuarioActualizado) => {
        res.status(200).json({
          ok: true,
          mensaje: "Imagen de usuario actualizada",
          usuario: usuarioActualizado.removePassword(true)
        });
      });
    });
  }
  if (tipo === "medicos") {
    Medico.findById(id, (err, medico) => {
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

      var pathViejo = `./uploads/images/${medico.img}`;

      if (fs.existsSync(pathViejo)) {
        fs.unlinkSync(pathViejo);
      }

      medico.img = nombreArchivo;

      medico.save((err, medicoActualizado) => {
        res.status(200).json({
          ok: true,
          mensaje: "Imagen de medico actualizada",
          medico: medicoActualizado
        });
      });
    });
  }
  if (tipo === "hospitales") {
    Hospital.findById(id, (err, hospital) => {
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

      var pathViejo = `./uploads/images/${hospital.img}`;

      if (fs.existsSync(pathViejo)) {
        fs.unlinkSync(pathViejo);
      }

      hospital.img = nombreArchivo;

      hospital.save((err, hospitalActualizado) => {
        res.status(200).json({
          ok: true,
          mensaje: "Imagen de hospital actualizada",
          hospital: hospitalActualizado
        });
      });
    });
  }
}

module.exports = app;
