import fetch from "node-fetch";
import ServerConfig from "../config/server.config.js";
import logger from "../config/logger.config.js";

export type BotServerAddressT = { address: string, port: string } | null;

export let bot_server_address: { address: string, port: string } | null = null;

export async function getService(serviceName: string) {
    try {
        const res = await fetch(`http://${ServerConfig.CONSUL_HOST}:${ServerConfig.CONSUL_PORT}/v1/catalog/service/${serviceName}`);
        const data: any = await res.json();

        if (!data || data.length === 0) {
            logger.error(`Service "${serviceName}" is not available`);
            return null;
        }

        const instance = data[0];
        const address = instance.ServiceAddress || instance.Address;
        const port = instance.ServicePort;

        return { address, port };
    } catch (err) {
        logger.error('Error querying Consul:', err);
        return null;
    }
}

export async function get_bot_server_address() {
    if (bot_server_address) {
        return bot_server_address;
    }

    bot_server_address = await getService(ServerConfig.BOT_SERVER_CONSUL_SERVICE_NAME);
    return bot_server_address;
}
