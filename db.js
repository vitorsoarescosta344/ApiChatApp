const mongoose = require("mongoose");
require("dotenv/config");

mongoose.connect(process.env.DATABASE_URI, {
	useUnifiedTopology: true,
	useNewUrlParser: true,
});

mongoose.connection.on("error", (err) => {
	console.log("Mongoose Connection ERROR: " + err.message);
});

mongoose.connection.once("open", () => {
	console.log("Mongoose Connection");
});

mongoose.Promise = global.Promise;

module.exports = mongoose;
