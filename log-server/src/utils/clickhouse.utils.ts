import { Build_logsRecord } from "../schema/generated-schema.js";
import { clickHouseClient } from "../config/clickhouse.config.js";

export async function writeInDB(payload: Build_logsRecord[]) {
    try {
        const result = await clickHouseClient.insert({
            table: 'build_logs',
            values: payload,
            format: 'JSONEachRow'
        });

        console.log(`Successfully inserted ${payload.length} records into build_logs table`, result);
    } catch (error) {
        console.log("Error while inserting in db. Error:", error);
    }
}

export async function readFromDB(project_id: string, build_id: string) {
    try {
        const query = `
            SELECT project_id, build_id, level, timestamp, log_message, service, status
            FROM build_logs
            WHERE project_id = {project_id:String}
            AND build_id = {build_id:String}
            ORDER BY timestamp
        `;

        const resultSet = await clickHouseClient.query({
            query,
            query_params: {
                project_id,
                build_id,
            },
            format: "JSONEachRow"
        });

        const rows = await resultSet.json<{
            project_id: string;
            build_id: string;
            level: string;
            timestamp: string;
            log_message: string;
            service: string;
            status: string;
        }>();
        // console.log(`Successfully read records from build_logs table`, rows);
        return rows;
    } catch (error) {
        console.log("Error while reading from db. Error:", error);
    }
}