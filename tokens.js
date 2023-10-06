const axios = require("axios");
const { OAuth2Client } = require("google-auth-library");
const OAUTH2_CLIENT = new OAuth2Client(process.env.GOOGLE_OAUTH_CLIENT_ID);

const verifyIdToken = async (idToken) => {
	try {
		const ticket = await OAUTH2_CLIENT.verifyIdToken({
			idToken: idToken,
			audience: process.env.GOOGLE_OAUTH_CLIENT_ID,
		});
		const payload = ticket.getPayload();

		if (payload.aud !== process.env.GOOGLE_OAUTH_CLIENT_ID) {
			return {
				status: 401,
				success: false,
				message: "Bad ID token",
				retry: true,
			};
		}

		return {
			status: 200,
			success: true,
		};
	} catch (error) {
		throw new Error(
			JSON.stringify({
				status: 500,
				success: false,
				message: "Could not verify ID token",
				retry: true,
			})
		);
	}
};

const verifyAccessToken = async (accessToken) => {
	return new Promise((resolve, reject) => {
		const url = new URL(
			`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`
		);
		axios
			.get(url.href)
			.then((response) => {
				resolve(response);
			})
			.catch(() => {
				reject();
			});
	});
};

module.exports = { verifyIdToken, verifyAccessToken };
