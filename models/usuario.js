var mongoose = require("mongoose");
var uniqueValidator = require("mongoose-unique-validator");

var Schema = mongoose.Schema;

var rolesValidados = {
  values: ["ADMIN_ROLE", "USER_ROLE"],
  message: "{VALUE} no es un role permitido"
};

var usuarioSchema = new Schema({
  nombre: { type: String, required: [true, "El nombre es necesario"] },
  email: {
    type: String,
    unique: true,
    required: [true, "El correo es necesario"]
  },
  password: { type: String, required: [true, "La contraseña es nacesaria"] },
  img: { type: String, required: false },
  role: {
    type: String,
    required: true,
    default: "USER_ROLE",
    enum: rolesValidados
  }
});

usuarioSchema.methods.removePassword = function(role = false) {
  var newUser = this.toObject();

  delete newUser.password;
  delete newUser.__v;

  if (role) {
    delete newUser.role;
  }

  return newUser;
};

usuarioSchema.plugin(uniqueValidator, {
  message: "{PATH} debe de ser unico"
});

module.exports = mongoose.model("Usuario", usuarioSchema);
