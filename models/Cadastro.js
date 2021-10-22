const mongoose = require("../db");

const CadastroSchema = new mongoose.Schema({
	nome: {
		required: true,
		type: String,
	},
    id: {
        required: true,
        type: Number
    },
    foto: {
        required: true,
        type: String,
    },
	email: {
		required: true,
		type: String,
	},
	senha: {
		required: true,
		type: String,
    },
    conversas: {
        required: false,
        type: Array,
    }
});

const Cadastro = mongoose.model("cadastro", CadastroSchema);

module.exports = Cadastro;
