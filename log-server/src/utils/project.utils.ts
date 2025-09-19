import fetch from "node-fetch";
import ServerConfig from "../config/server.config.js";
import logger from "../config/logger.config.js";
import { BotServerAddressT, get_bot_server_address } from "./consul.utils.js";
import { createBreaker } from "./circuitbreaker.utils.js";

const botBreaker = createBreaker(fetchFromBot);

async function fetchFromBot(project_id: string, build_id: number) {
    const bot_service_address: BotServerAddressT = await get_bot_server_address();
    if (!bot_service_address) {
        throw new Error("Could not resolve bot server address");
    }

    const response = await fetch(
        `http://${bot_service_address.address}:${bot_service_address.port}/project?project_id=${project_id}&build_id=${build_id}`,
        { method: "GET" }
    );

    if (!response.ok && response.status !== 400 && response.status !== 404) {
        throw new Error(`Bot service returned ${response.status}`);
    }

    return await response.json();
}

export async function fetchProjectStatus(project_id: string, build_id: number) {
    try {
        const data = await botBreaker.fire(project_id, build_id);
        return data;
    } catch (error: any) {
        logger.error(
            `Circuit breaker error while fetching PROJECT_ID: ${project_id} BUILD_ID: ${build_id}`,
            { error: error.message || error }
        );

        return {
            status: 500,
            success: false,
            error: "Bot service temporarily unavailable. Please try again later."
        };
    }
}
