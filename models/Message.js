const mongoose = require("../db");

const messageSchema = new mongoose.Schema({
	id: { type: Number, required: true },
	messages: {
		type: Array,
	},
	nomeDoRemetente: { type: String, required: true },
    nomeDoDestinatario: { type: String, required: true },
    fotoDoRemetente: { type: String, required: true },
    fotoDoDestinatario: { type: String, required: true}
});

const Message = mongoose.model("message", messageSchema);

module.exports = Message;
