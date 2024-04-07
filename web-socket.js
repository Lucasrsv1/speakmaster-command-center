const { Console } = require("console");
const consoleStamp = require("console-stamp");

const { CommandCenterEvents } = require("./command-center-events");
const { moduleEvents, sendCommandToModule, getConnectedModulesIDs } = require("./modules-manager");

/**
 * Configura a comunicação via socket.io com um cliente
 * @param {import("socket.io").Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>} socket Instância do socket conectado
 */
function onWebSocketConnect (socket) {
	const console = new Console(process.stdout, process.stderr);
	consoleStamp(console, { format: `:date(yyyy-mm-dd HH:MM:ss.l).yellow :label ([WEB_SOCKET]).cyan ([${socket.id}]).magenta` });
	console.log("New user connected");

	socket.on(CommandCenterEvents.COMMAND, data => {
		sendCommandToModule(data.idModule, data.featureIdentifier, data.parameters, data.sentAt);
	});

	const commandResultHandler = data => socket.emit(CommandCenterEvents.COMMAND_RESULT, data);
	moduleEvents.on(CommandCenterEvents.COMMAND_RESULT, commandResultHandler);

	const moduleConnectionHandler = data => socket.emit(CommandCenterEvents.MODULE_CONNECTION, data);
	moduleEvents.on(CommandCenterEvents.MODULE_CONNECTION, moduleConnectionHandler);

	socket.on("disconnect", () => {
		console.log("User disconnected");
		moduleEvents.removeListener(CommandCenterEvents.COMMAND_RESULT, commandResultHandler);
		moduleEvents.removeListener(CommandCenterEvents.MODULE_CONNECTION, moduleConnectionHandler);
	});

	// Informa quais módulos estão inicialmente conectados
	for (const idModule of getConnectedModulesIDs())
		socket.emit(CommandCenterEvents.MODULE_CONNECTION, { idModule, isConnected: true });
}

module.exports = { onWebSocketConnect };
