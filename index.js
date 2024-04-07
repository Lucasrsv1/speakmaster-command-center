// Configura variáveis de ambiente o mais cedo possível
require("dotenv").config();

// Configura estampa de tempo dos logs
require("console-stamp")(console, { format: ":date(yyyy-mm-dd HH:MM:ss.l).yellow :label" });

const { createServer: createTCPServer } = require("net");
const { createServer: createWebServer } = require("node:http");
const { Server } = require("socket.io");

const { onWebSocketConnect } = require("./web-socket");
const { onTCPSocketConnect } = require("./tcp-socket");

const allowedOrigins = ["https://speakmaster.lrv.dev.br"];

if (process.env.NODE_ENV === "development") {
	allowedOrigins.push("http://localhost:3000");
	allowedOrigins.push("http://localhost:4200");
}

// ========== Web Socket Server ==========

const webServer = createWebServer();
const io = new Server(webServer, {
	cors: {
		origin: allowedOrigins
	}
});

io.on("connection", onWebSocketConnect);

webServer.on("error", error => {
	console.error("Web Server Error:", error);
});

webServer.listen(process.env.WEB_SOCKET_PORT, () => {
	console.log(`WebSocket server is running on port ${process.env.WEB_SOCKET_PORT}`);
});

// ========== TCP Socket Server ==========

const tcpServer = createTCPServer(onTCPSocketConnect);

tcpServer.on("error", error => {
	console.error("TCP Server Error:", error);
});

tcpServer.listen(process.env.MODULES_SOCKET_PORT, () => {
	console.log(`TCP socket server is running on port ${process.env.MODULES_SOCKET_PORT}`);
});
