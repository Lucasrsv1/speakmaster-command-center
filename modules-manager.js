const EventEmitter = require("events");
const { CommandCenterEvents } = require("./command-center-events");

const moduleEvents = new EventEmitter();

/**
 * @type {Map<number, import("net").Socket>}
 */
const modules = new Map();

function registerModule (idModule, moduleName, socket) {
	if (modules.has(idModule))
		modules.get(idModule).end();

	modules.set(idModule, socket);
	moduleEvents.emit(CommandCenterEvents.MODULE_CONNECTION, { idModule, isConnected: true });
	console.log(`New module registered: ${moduleName} [ID: ${idModule}]`);
}

function unregisterModule (idModule, disconnectedSocket) {
	if (!modules.has(idModule))
		return;

	const socket = modules.get(idModule);
	if (socket !== disconnectedSocket)
		return;

	modules.delete(idModule);
	moduleEvents.emit(CommandCenterEvents.MODULE_CONNECTION, { idModule, isConnected: false });
	console.log("Module unregistered:", idModule);
}

function getConnectedModulesIDs () {
	return Array.from(modules.keys());
}

function getModuleIDBySocket (targetSocket) {
	for (const [idModule, socket] of modules) {
		if (socket === targetSocket)
			return idModule;
	}

	return undefined;
}

function sendCommandToModule (idModule, featureIdentifier, parameters, sentAt) {
	if (!modules.has(idModule))
		return;

	const socket = modules.get(idModule);
	socket.write(JSON.stringify({
		event: CommandCenterEvents.COMMAND,
		featureIdentifier,
		parameters,
		sentAt
	}));
}

function gotResultFromModule (idModule, featureIdentifier, result, sentAt) {
	moduleEvents.emit(CommandCenterEvents.COMMAND_RESULT, { idModule, featureIdentifier, result, sentAt });
}

module.exports = {
	moduleEvents,
	registerModule, unregisterModule,
	getConnectedModulesIDs, getModuleIDBySocket,
	sendCommandToModule, gotResultFromModule
};
