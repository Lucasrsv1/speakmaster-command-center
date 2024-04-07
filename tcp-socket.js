const consoleStamp = require("console-stamp");
const { Console } = require("console");
const { jwtDecode } = require("jwt-decode");

const speakmasterApi = require("./speakmaster-api");
const { CommandCenterEvents } = require("./command-center-events");
const { registerModule, getModuleIDBySocket, gotResultFromModule, unregisterModule } = require("./modules-manager");

/**
 * Configura a comunicação via socket TCP com um cliente
 * @param {import("net").Socket} socket Instância do socket TCP conectado
 */
function onTCPSocketConnect (socket) {
	const console = new Console(process.stdout, process.stderr);
	consoleStamp(console, { format: `:date(yyyy-mm-dd HH:MM:ss.l).yellow :label ([TCP_SOCKET]).cyan ([${socket.remoteAddress}:${socket.remotePort}]).magenta` });
	console.log("New module connected");

	socket.on("data", data => {
		try {
			const message = JSON.parse(data.toString());
			switch (message.event) {
				case CommandCenterEvents.AUTHENTICATION:
					_handleModuleAuthentication(socket, message);
					break;
				case CommandCenterEvents.COMMAND_RESULT:
					_handleModuleCommandResult(socket, message);
					break;
				default:
					_sendToModule(socket, CommandCenterEvents.MESSAGE, { message: "Invalid event: " + message.event });
					break;
			}
		} catch (error) {
			_sendToModule(socket, CommandCenterEvents.MESSAGE, { message: "Invalid JSON message: " + data.toString() });
		}
	});

	socket.on("close", () => {
		console.log("Module disconnected");
		const idModule = getModuleIDBySocket(socket);
		if (idModule)
			unregisterModule(idModule, socket);
	});

	socket.on("error", error => {
		console.error(error);
	});
}

async function _handleModuleAuthentication (socket, message) {
	const success = await speakmasterApi.validateToken(message.token);
	_sendToModule(socket, CommandCenterEvents.AUTHENTICATION, { success });

	// Desconecta se a autenticação falhou
	if (!success)
		return socket.end();

	const { idModule, name } = jwtDecode(message.token);
	registerModule(idModule, name, socket);
}

async function _handleModuleCommandResult (socket, message) {
	const idModule = getModuleIDBySocket(socket);
	if (!idModule)
		_sendToModule(socket, CommandCenterEvents.MESSAGE, { message: "Module not registered or authenticated" });

	// Envia o resultado para o front-end via socket.io
	gotResultFromModule(idModule, message.featureKey, message.result, message.sentAt);
}

function _sendToModule (socket, event, data) {
	data.event = event;
	socket.write(JSON.stringify(data));
}

module.exports = { onTCPSocketConnect };
