const express = require("express");
const router = express.Router();
const cors = require("cors");
const axios = require("axios");
const querystring = require("querystring");
require("dotenv").config();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const { verifyIdToken, verifyAccessToken } = require("./tokens");

router.use(cors(JSON.parse(process.env.CORS_OPTIONS)));
router.use(bodyParser.json());
router.use(cookieParser());

/**
 * @api {post} /api/auth/code Exchange Authorization Code for Access and ID Token
 * @apiName ExchangeAuthorizationCode
 * @apiGroup Authentication
 *
 * @apiParam {String} code The authorization code obtained from the authentication flow.
 * @apiParam {String} scope The requested scope for access.
 *
 * @apiSuccess {Number} 200 Success - Indicates the exchange was successful.
 *
 * @apiError {Number} 400 Bad request - Missing code or scope.
 * @apiError {Number} 500 Bad token request - Unable to exchange authorization code.
 */
router.post("/code", (req, res) => {
    if (!req.body?.code || !req.body?.scope)
        return res.status(400).json({ error: "Bad request" });

    const data = {
        code: req.body.code,
        redirect_uri: process.env.REDIRECT_URI,
        client_id: process.env.GOOGLE_OAUTH_CLIENT_ID,
        client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
        scope: req.body.scope,
        grant_type: "authorization_code",
    };

    axios
        .post(
            "https://oauth2.googleapis.com/token",
            querystring.stringify(data),
            {
                "Content-Type": "application/x-www-form-urlencoded",
            }
        )
        .then((response) => {
            const data = response.data;

            res.cookie("refreshToken", data.refresh_token, {
                ...process.env.COOKIE_OPTIONS,
                maxAge: 180 * 24 * 60 * 60 * 1000,
            });
            res.cookie("idToken", data.id_token, {
                ...process.env.COOKIE_OPTIONS,
                maxAge: data.expires_in * 1000,
            });
            res.cookie("accessToken", data.access_token, {
                ...process.env.COOKIE_OPTIONS,
                maxAge: data.expires_in * 1000,
            });

            return res.status(200).json({ success: true });
        })
        .catch((error) => {
            return res.status(500).json({
                success: false,
                message: "Bad token request",
            });
        });
});

/**
 * @api {post} /api/auth/refresh-token Refresh Access and ID Token
 * @apiName RefreshAccessToken
 * @apiGroup Authentication
 *
 * @apiParam {Cookie} refreshToken The refresh token to obtain a new access token.
 *
 * @apiSuccess {Number} 200 Success - Indicates the token refresh was successful.
 *
 * @apiError {Number} 401 Unauthorized - Refresh token not provided.
 * @apiError {Number} 500 Bad refresh token request - Unable to refresh access token.
 */
router.post("/refresh-token", (req, res) => {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const data = {
        client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: process.env.GOOGLE_OAUTH_CLIENT_ID,
    };

    axios
        .post(
            "https://oauth2.googleapis.com/token",
            querystring.stringify(data),
            {
                "Content-Type": "application/x-www-form-urlencoded",
            }
        )
        .then((response) => {
            const data = response.data;

            res.cookie("idToken", data.id_token, {
                ...process.env.COOKIE_OPTIONS,
                maxAge: data.expires_in * 1000,
            });
            res.cookie("accessToken", data.access_token, {
                ...process.env.COOKIE_OPTIONS,
                maxAge: data.expires_in * 1000,
            });

            return res.status(200).json({ success: true });
        })
        .catch((error) => {
            res.clearCookie("refreshToken", { path: "/" });
            res.clearCookie("accessToken", { path: "/" });

            return res.status(500).json({
                success: false,
                message: "Bad refresh token request",
            });
        });
});

/**
 * @api {get} /api/auth/vat Verify Access Tokens
 * @apiName VerifyAccessTokens
 * @apiGroup Authentication
 *
 * @apiParam {Cookie} accessToken The access token.
 * @apiParam {Cookie} idToken The ID token.
 * @apiParam {Cookie} refreshToken The refresh token.
 *
 * @apiSuccess (Success 200) {String} data.id Unique user identifier.
 * @apiSuccess (Success 200) {String} data.email User's email address.
 * @apiSuccess (Success 200) {String} data.name User's full name.
 * @apiSuccess (Success 200) {String} data.picture URL of the user's profile picture.
 * @apiSuccess (Success 200) {Boolean} data.verified_email Indicates if the user's email is verified.
 *
 * @apiError {Number} 401 Unauthorized - Access tokens missing or invalid. Retry with refresh token.
 * @apiError {Number} 500 Could not verify ID token - Unable to verify the provided ID token.
 * @apiError {Number} 401 Unauthorized - Access token or ID token is invalid. Retry with refresh token.
 * @apiError {Number} 401 Unauthorized - Access token or ID token is expired. Retry with refresh token.
 * @apiError {Number} 401 Unauthorized - Access token or ID token is unauthenticated. Retry with refresh token.
 */
router.get("/vat", async (req, res) => {
    const { accessToken, idToken, refreshToken } = req.cookies;

    if (!accessToken || !idToken || !refreshToken) {
        if (refreshToken) {
            return res.status(401).json({
                success: false,
                message:
                    "Unauthorized access token or id token. Retry with refresh token",
                retry: true,
            });
        }
        return res
            .status(401)
            .json({ success: false, message: "Unauthorized" });
    }

    await verifyIdToken(idToken)
        .then((data) => {
            if (data?.status === 401) {
                return res.status(401).json({
                    success: false,
                    message: "Bad ID token",
                    retry: true,
                });
            }
        })
        .catch((error) => {
            return res.status(500).json({
                success: false,
                message: "Could not verify ID token",
                retry: true,
            });
        });

    await verifyAccessToken(accessToken)
        .then((response) => {
            const data = response.data;

            if (data?.code === 401 && data?.status === "UNAUTHENTICATED") {
                return res.status(401).json({
                    success: false,
                    message:
                        "Unauthenticated access token or id token. Retry with refresh token",
                    retry: true,
                });
            }

            return res.status(200).json(data);
        })
        .catch((error) => {
            return res
                .status(401)
                .json({ success: false, message: "Unauthorized", retry: true });
        });
});

/**
 * @api {get} /api/auth/logout Logout
 * @apiName Logout
 * @apiGroup Authentication
 *
 * @apiSuccess (Success 200) {void} - Successful logout.
 */
router.get("/logout", (req, res) => {
    res.clearCookie("refreshToken", { path: "/" });
    res.clearCookie("accessToken", { path: "/" });
    res.clearCookie("idToken", { path: "/" });
    res.status(200).send();
});

module.exports = router;
