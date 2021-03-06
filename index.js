const cliArgs = require("command-line-args")([{
		name: "upload-path",
		alias: "u",
		type: String
	}, {
		name: "port",
		alias: "p",
		type: Number
	}, {
		name: "base-url",
		alias: "l",
		type: String
	}, {
		name: "hostname",
		alias: "h",
		type: String,
		defaultValue: "127.0.0.1"
	}, {
		name: "random-length",
		alias: "r",
		type: Number,
		defaultValue: 16
	}, {
		name: "tokens",
		alias: "t",
		multiple: !0,
		type: String,
		defaultValue: null
	}]),
	fastify = require("fastify")(),
	fs = require("fs"),
	path = require("path"),
	makeid = r => {
		for (var e = "", a = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789", t = a.length, i = 0; i < r; i++) e += a.charAt(Math.floor(Math.random() * t));
		return e
	};

if (fastify.register(require("fastify-multipart")), !fs.existsSync(cliArgs["upload-path"])) throw new Error("Invalid upload-path provided");
if (!cliArgs.port || cliArgs.port <= 1e3 || cliArgs.port > 65535) throw new Error("Invalid port provided");
if (!cliArgs["base-url"] || !cliArgs["base-url"].match(/^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/g)) throw new Error("Invalid base-url provided");
if (!cliArgs["random-length"] || cliArgs["random-length"] < 6 || cliArgs["random-length"] > 128) throw new Error("Invalid random-length provided");

cliArgs["base-url"] = cliArgs["base-url"].replace(/\/$/, ""), fastify.listen(cliArgs.port, cliArgs.hostname, r => {
	if (r) throw r
}), fastify.post("/", async (r, e) => {
	if (cliArgs.tokens[0] && !cliArgs.tokens.includes(r.headers?.token)) return e.code(403), {
		error: "Invalid token!"
	};
	let a = await r.file(),
		t = makeid(cliArgs["random-length"]) + path.extname(a.filename);
	return await a.file.pipe(fs.createWriteStream(path.join(cliArgs["upload-path"], t))), {
		link: cliArgs["base-url"] + "/" + t
	}
});
