const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const { format } = require("util");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt-nodejs");
const jwt = require("jsonwebtoken");
require("dotenv/config");
require("./models/Cadastro");
const multer = require("multer");
const Cadastro = mongoose.model("cadastro");
const { Storage } = require("@google-cloud/storage");
const multerGoogleStorage = require("multer-cloud-storage");
const { removeListener } = require("./models/Cadastro");
require("./models/Message");
const Message = mongoose.model("message");

const storage = new Storage();

var uploadHandler = multer({
	storage: multerGoogleStorage.storageEngine({
		bucket: "devforus",
		projectId: "abstract-key-326020",
		credentials: require("./keypair.json"),
		filename: function (req, file, cb) {
			// Extração da extensão do arquivo original:
			const extensaoArquivo = file.originalname.split(".")[1];

			// Cria um código randômico que será o nome do arquivo
			const novoNomeArquivo = require("crypto").randomBytes(64).toString("hex");

			// Indica o novo nome do arquivo:
			cb(null, `${novoNomeArquivo}.${extensaoArquivo}`);
		},
	}),
});

app.use(express.json());

app.post("/login", async (req, res) => {
	const { email, senha } = req.body;

	try {
		const user = await Cadastro.findOne({ email: email });
		const token = jwt.sign(
			{ user: { email: email, senha: senha } },
			"csys@#asdzxc"
		);
		bcrypt.compare(senha, user.senha, async (err, isMatch) => {
			if (err || !isMatch) {
				res.json({ auth: false, message: "problemas com o login" });
			}
			return res.json({ auth: true, message: token });
		});
	} catch (e) {
		console.log(e);
	}
});

app.get("/getusers", async (req, res) => {
	const token = req.headers["x-access-token"];
	const decoded = jwt.verify(token, process.env.SECRET_KEY);


	const { id, nome, conversas } = await Cadastro.findOne({ email: decoded.user.email });

    const arr1 = await Message.find({ $in: { _id: conversas } }).where('nomeDoRemetente').equals(nome);
    const arr2 = await Message.find({ $in: { _id: conversas } }).where('nomeDoDestinatario').equals(nome)

    
    const messages = arr1.concat(arr2)
	
	return res.json({ contacts: messages, id: id, nome: nome });
});

app.post("/addChats", async (req, res) => {
	const { email } = req.body;

	const token = req.headers["x-access-token"];
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const remetente = await Cadastro.findOne({ email: decoded.user.email })
    const destinatario = await Cadastro.findOne({ email: email })
    const {_id} = await Message.create({id: Math.floor(Math.random() * 1000000), nomeDoRemetente: remetente.nome, nomeDoDestinatario: destinatario.nome, fotoDoDestinatario: destinatario.foto, fotoDoRemetente: remetente.foto})
    const cadastro = Cadastro.findOneAndUpdate({ email: email }, { $push: { conversas: _id } })
    
    return res.status(200).send()
});

app.post('/getiddestinatario', async (req, res) => {
    const { nome } = req.body
    
    const { id } = await cadastro.findOne({ nome: nome })

    return res.json({id: id})
})

app.post('/getmessages', async (req, res) => {
    const { idDaConversa } = req.body
    
    const { messages } = await Message.findById(idDaConversa)
    
    return res.json({messages: messages})
})

app.post("/cadastro", uploadHandler.any(), async (req, res) => {
	const { nome, id, email, senha } = req.body;

	if (!req.files) {
		console.log("file");
		res.status(400).send("no file uploaded");
		return;
	}

	try {
		bcrypt.genSalt(10, (err, salt) => {
			console.log(err);
			bcrypt.hash(senha, salt, null, async (err, hash) => {
				console.log(err);

				const cadastro = await Cadastro.create({
					email: email,
					senha: hash,
					nome: nome,
					id: id,
					foto: req.files[0].linkUrl,
				});
				console.log(cadastro);
				return res.json({ message: "success" });
			});
		});
	} catch (err) {
		console.log(err);
	}
});

io.on("connection", async (socket) => {
	console.log("user connected");
	socket.on("message", async ({message, idDaConversa}) => {
		await Message.findOneAndUpdate({ _id: idDaConversa }, {$push: {messages: message}});
        const conversaAtualizada = await Message.findById(idDaConversa);
        socket.emit('mensagemNova', conversaAtualizada)
		
	});
});

server.listen(3000, () => {
	console.log("listening on *:3000");
});
