const { Console } = require("console");
const consoleStamp = require("console-stamp");

const { CommandCenterEvents } = require("./command-center-events");
const {
	getConnectedModulesIDs,
	moduleEvents,
	monitorModulePreferences,
	sendCommandToModule,
	sendPreferenceValueUpdateToModule
} = require("./modules-manager");

/**
 * Configura a comunicação via socket.io com um cliente
 * @param {import("socket.io").Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>} socket Instância do socket conectado
 */
function onWebSocketConnect (socket) {
	const console = new Console(process.stdout, process.stderr);
	consoleStamp(console, { format: `:date(yyyy-mm-dd HH:MM:ss.l).yellow :label ([WEB_SOCKET]).cyan ([${socket.id}]).magenta` });
	console.log("New user connected");

	// Mensagens recebidas do SpeakMaster e que devem ser encaminhadas para um determinado módulo
	socket.on(CommandCenterEvents.COMMAND, data => {
		sendCommandToModule(data.idModule, data.featureIdentifier, data.parameters, data.sentAt);
	});

	socket.on(CommandCenterEvents.PREFERENCE_VALUE_UPDATE, data => {
		sendPreferenceValueUpdateToModule(data.idModule, data.preferences);
	});

	socket.on(CommandCenterEvents.PREFERENCE_WATCH, data => {
		monitorModulePreferences(data.idModule, data.subscribe);
	});

	// Mensagens recebidas de um módulo e que devem ser encaminhadas para o SpeakMaster
	const commandResultHandler = data => socket.emit(CommandCenterEvents.COMMAND_RESULT, data);
	moduleEvents.on(CommandCenterEvents.COMMAND_RESULT, commandResultHandler);

	const moduleConnectionHandler = data => socket.emit(CommandCenterEvents.MODULE_CONNECTION, data);
	moduleEvents.on(CommandCenterEvents.MODULE_CONNECTION, moduleConnectionHandler);

	const dynamicChangesHandler = data => socket.emit(CommandCenterEvents.PREFERENCE_DYNAMIC_CHANGE, data);
	moduleEvents.on(CommandCenterEvents.PREFERENCE_DYNAMIC_CHANGE, dynamicChangesHandler);

	socket.on("disconnect", () => {
		console.log("User disconnected");
		moduleEvents.removeListener(CommandCenterEvents.COMMAND_RESULT, commandResultHandler);
		moduleEvents.removeListener(CommandCenterEvents.MODULE_CONNECTION, moduleConnectionHandler);
		moduleEvents.removeListener(CommandCenterEvents.PREFERENCE_DYNAMIC_CHANGE, dynamicChangesHandler);
	});

	// Informa quais módulos estão inicialmente conectados
	for (const idModule of getConnectedModulesIDs())
		socket.emit(CommandCenterEvents.MODULE_CONNECTION, { idModule, isConnected: true });
}

module.exports = { onWebSocketConnect };
