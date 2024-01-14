const express = require("express");
const router = express.Router();
const cors = require("cors");
require("dotenv").config();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const _ = require("lodash");

const db = require("./firebase");
const { verifyIdToken, verifyAccessToken } = require("./tokens");

router.use(cors(JSON.parse(process.env.CORS_OPTIONS)));
router.use(bodyParser.json());
router.use(cookieParser());

/**
 * @api {get} /api/user/:id/fetch-data Fetch User Data
 * @apiName FetchUserData
 * @apiGroup User
 *
 * @apiParam {String} id The user's unique identifier.
 *
 * @apiSuccess (Success 200) {Object} data User data.
 * @apiSuccess (Success 201) {Object} data User data created successfully.
 *
 * @apiError {Number} 401 Unauthorized - Access tokens missing or invalid. Retry with refresh token.
 * @apiError {Number} 500 Could not verify ID token - Unable to verify the provided ID token.
 * @apiError {Number} 401 Unauthorized - Access token or ID token is invalid. Retry with refresh token.
 * @apiError {Number} 401 Unauthorized - Access token or ID token is expired. Retry with refresh token.
 * @apiError {Number} 401 Unauthorized - Access token or ID token is unauthenticated. Retry with refresh token.
 */
router.get("/:id/fetch-data", async (req, res) => {
    const { accessToken, idToken, refreshToken } = req.cookies;
    const id = req.params.id;
    let email = "";

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
            } else if (data?.id !== id) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized",
                });
            }

            email = data.email;
        })
        .catch((error) => {
            return res
                .status(401)
                .json({ success: false, message: "Unauthorized", retry: true });
        });

    const data = await db.getDocument("users", id);

    if (data) return res.status(200).json(data.data);
    else {
        const doc = {
            data: { main: [], custom: {} },
            email: email,
        };
        await db.createDocument("users", id, doc);

        return res.status(201).json(doc.data);
    }
});

/**
 * @api {post} /api/user/:id/post-data Post User Data
 * @apiName PostUserData
 * @apiGroup User
 *
 * @apiParam {String} id The user's unique identifier.
 * @apiParam {Object} body_data User data to be posted.
 *
 * @apiSuccess {Object} 200 OK - Data is already up to date.
 * @apiSuccess {Object} 201 Created - User data created or updated successfully.
 *
 * @apiError {Number} 401 Unauthorized - Access tokens missing or invalid. Retry with refresh token.
 * @apiError {Number} 500 Could not verify ID token - Unable to verify the provided ID token.
 * @apiError {Number} 401 Unauthorized - Access token or ID token is invalid. Retry with refresh token.
 * @apiError {Number} 401 Unauthorized - Access token or ID token is expired. Retry with refresh token.
 * @apiError {Number} 401 Unauthorized - Access token or ID token is unauthenticated. Retry with refresh token.
 */
router.post("/:id/post-data", async (req, res) => {
    const { accessToken, idToken, refreshToken } = req.cookies;
    const id = req.params.id;
    const body_data = req.body;
    let email = "";

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
            } else if (data?.id !== id) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized",
                });
            }

            email = data.email;
        })
        .catch((error) => {
            return res
                .status(401)
                .json({ success: false, message: "Unauthorized", retry: true });
        });

    const saved_data = await db.getDocument("users", id);
    let game_data = saved_data?.data;
    if (!game_data) {
        game_data = { main: [], custom: {} };
        const doc = {
            data: game_data,
            email: email,
        };
        await db.createDocument("users", id, doc);
    }

    if (_.isEqual(game_data, body_data)) {
        return res.status(200).json(game_data);
    }

    const doc = {
        data: mergeGameData(game_data, body_data),
        email: email,
    };
    await db.updateDocument("users", id, doc);
    return res.status(201).json(doc.data);
});

function mergeGameData(serverData, clientData) {
    // Merge main data
    serverData.main = mergeArrays(serverData.main, clientData.main);

    // If the server does not have custom data, use client's custom data
    if (!serverData.custom) {
        serverData.custom = clientData.custom;
    } else {
        // Otherwise, iterate through each custom key in client's data
        for (let key in clientData.custom) {
            if (!serverData.custom[key]) {
                // If the server doesn't have this key, simply use the client's data for this key
                serverData.custom[key] = clientData.custom[key];
            } else {
                // If the server has this key, merge the arrays
                serverData.custom[key] = mergeArrays(
                    serverData.custom[key],
                    clientData.custom[key]
                );
            }
        }
    }
    return serverData;
}

function mergeArrays(serverArray, clientArray) {
    if (!clientArray) return serverArray;

    // Create a set to hold unique IDs from the server
    let uniqueIds = new Set(serverArray.map((g) => g.id));

    // Filter out client data that has IDs already in server data
    let newData = clientArray.filter((g) => !uniqueIds.has(g.id));

    // Combine server data with the new data from the client and sort by id
    const concat_array = serverArray.concat(newData);
    const sorted_array = concat_array.sort((a, b) => a.id - b.id);
    return sorted_array;
}

module.exports = router;
