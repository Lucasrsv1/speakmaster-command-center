const axios = require("axios").default;

class SpeakMasterAPI {
	/**
	 * @type {import("axios").AxiosInstance}
	 */
	_axios;

	constructor () {
		this._axios = axios.create({ baseURL: process.env.SPEAKMASTER_API_URL });
	}

	async validateToken (token) {
		try {
			const response = await this._axios.get("modules/api/authentication/validation", {
				headers: { authentication: token }
			});

			return response.status === 204;
		} catch (error) {
			return false;
		}
	}
}

module.exports = new SpeakMasterAPI();
