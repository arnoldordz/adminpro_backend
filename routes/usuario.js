// Requires
var express = require("express");
var bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");

// Inicializar variables
var app = express();

// Usuario schema
var Usuario = require("../models/usuario");

var mdAutenticacion = require("../middlewares/autenticacion");

// Obtener todos los usuarios
app.get("/", (req, res) => {
  var desde = req.query.desde || 0;
  desde = Number(desde);

  Usuario.find({}, "nombre email img role")
    .skip(desde)
    .limit(5)
    .exec((err, usuarios) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: "Error cargando usuarios",
          errors: err
        });
      }

      Usuario.count({}, (err, conteo) => {
        if (err) {
          return res.status(500).json({
            ok: false,
            mensaje: "Error contando usuarios",
            errors: err
          });
        }

        res.status(200).json({
          ok: true,
          total: conteo,
          usuarios
        });
      });
    });
});

// Actualizar Usuario
app.put("/:id", mdAutenticacion.verificarToken, (req, res) => {
  var id = req.params.id;
  var body = req.body;

  Usuario.findById(id, "nombre email img role").exec((err, usuario) => {
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

    usuario.nombre = body.nombre;
    usuario.email = body.email;
    usuario.role = body.role;

    usuario.save((err, usuarioGuardado) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: "Error al actualizar usuario",
          errors: err
        });
      }
      res.status(200).json({
        ok: true,
        usuario: usuarioGuardado
      });
    });
  });
});

// Crear Usuario
app.post("/", mdAutenticacion.verificarToken, (req, res) => {
  var body = req.body;

  var salt = bcrypt.genSaltSync(10);

  var usuario = new Usuario({
    nombre: body.nombre,
    email: body.email,
    password: bcrypt.hashSync(body.password, salt),
    img: body.img,
    role: body.role
  });

  usuario.save((err, usuarioGuardado) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: "Error al crear usuario",
        errors: err
      });
    }

    usuarioGuardado = usuarioGuardado.toObject();
    delete usuarioGuardado.password;

    res.status(201).json({
      ok: true,
      usuario: usuarioGuardado,
      usuarioToken: req.usuario
    });
  });
});

// Elimiar Usuario
app.delete("/:id", mdAutenticacion.verificarToken, (req, res) => {
  var id = req.params.id;

  Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al borrar usuario",
        errors: err
      });
    }
    if (!usuarioBorrado) {
      return res.status(400).json({
        ok: false,
        mensaje: "No existe un usuario con ese Id",
        errors: { message: "No existe un usuario con ese Id" }
      });
    }

    usuarioBorrado.password = "";

    res.status(200).json({
      ok: true,
      usuario: usuarioBorrado
    });
  });
});

module.exports = app;
