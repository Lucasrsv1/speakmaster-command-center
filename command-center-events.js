const CommandCenterEvents = Object.freeze({
	// Enviado de um módulo para o command center para realizar a autenticação (message: { token: string })
	// Enviado do command center para um módulo para indicar o resultado da autenticação (message: { success: boolean })
	AUTHENTICATION: "AUTHENTICATION",

	// Enviado do SpeakMaster para o command center para solicitar a execução de um comando (data: { idModule: number; featureIdentifier: string; parameters: IFeatureParameters | undefined; sentAt: number })
	// Enviado do command center para um módulo para solicitar a execução de um comando (message: { featureIdentifier: string; parameters: IFeatureParameters | undefined; sentAt: number })
	COMMAND: "COMMAND",

	// Enviado de um módulo para o command center para informar o resultado da execução de um comando (message: { featureIdentifier: string; result: boolean | { parameters: IFeatureParameters; options: IAmbiguityOption[]; }; sentAt: number })
	// Enviado do command center para o SpeakMaster para informar o resultado da execução de um comando (data: { idModule: number; featureIdentifier: string; result: boolean | { parameters: IFeatureParameters; options: IAmbiguityOption[]; }; sentAt: number })
	COMMAND_RESULT: "COMMAND_RESULT",

	// Enviado do command center para um módulo para informar uma mensagem normalmente de erro (message: { message: string })
	MESSAGE: "MESSAGE",

	// Enviado do command center para o SpeakMaster para informar se um módulo está conectado (data: { idModule: number; isConnected: boolean })
	MODULE_CONNECTION: "MODULE_CONNECTION",

	// Enviado de um módulo para o command center para informar que houveram alterações em uma, ou mais, preferências (message: { preferences: IPreferenceUpdate | IPreferenceUpdate[] })
	// Enviado do command center para o SpeakMaster para informar que houveram alterações em uma, ou mais, preferências (data: { idModule: number; preferences: IPreferenceUpdate | IPreferenceUpdate[] })
	PREFERENCE_DYNAMIC_CHANGE: "PREFERENCE_DYNAMIC_CHANGE",

	// Enviado do SpeakMaster para o command center para informar o novo valor de uma, ou mais, preferências (data: { idModule: number; preferences: Array<{ identifier: string; value: PreferenceValue; }> })
	// Enviado do command center para um módulo para informar o novo valor de uma, ou mais, preferências (message: { preferences: Array<{ identifier: string; value: PreferenceValue; }> })
	PREFERENCE_VALUE_UPDATE: "PREFERENCE_VALUE_UPDATE",

	// Enviado do SpeakMaster para o command center para solicitar, ou interromper, o monitoramento de alterações das preferências de um módulo (data: { idModule: number; subscribe: boolean })
	// Enviado do command center para um módulo para solicitar, ou interromper, o monitoramento de alterações das preferências (message: { subscribe: boolean })
	PREFERENCE_WATCH: "PREFERENCE_WATCH"
});

module.exports = { CommandCenterEvents };
