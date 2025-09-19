import { ECSClient, RunTaskCommand } from "@aws-sdk/client-ecs";
import ServerConfig from "../config/serverConfig";
import logger from "../config/loggerConfig";

interface ECSParams {
    cluster: string;
    taskDefinition: string;
    launchType: "EC2" | "FARGATE";
    count: number;
    networkConfiguration: {
        awsvpcConfiguration: {
            subnets: string[];
            securityGroups?: string[];
            assignPublicIp?: "ENABLED" | "DISABLED";
        };
    };
    overrides?: {
        containerOverrides?: Array<{
            name: string;
            command?: string[];
            environment?: Array<{ name: string; value: string }>;
        }>;
    };
}

export function createParams(
    projectType: string,
    projectDependencyInstallCmd: string,
    projectBuildCmd: string,
    projectBuildDir: string
): ECSParams {
    return {
        cluster: ServerConfig.ECS_CLUSTER,
        taskDefinition: ServerConfig.ECS_TASK_DEFINITION,
        launchType: ServerConfig.ECS_LAUNCH_TYPE,
        count: ServerConfig.ECS_COUNT,
        networkConfiguration: {
            awsvpcConfiguration: {
                assignPublicIp: ServerConfig.ECS_ASSIGN_PUBLIC_IP,
                subnets: ServerConfig.ECS_SUBNETS.split(","),
                securityGroups: ServerConfig.ECS_SECURITY_GROUPS.split(",")
            }
        },
        overrides: {
            containerOverrides: [{
                name: ServerConfig.ECS_CONTATINER_NAME,
                environment: [
                    { name: "PORT", value: ServerConfig.PORT + '' },
                    { name: "PROJECT_ID", value: ServerConfig.PROJECT_ID },
                    { name: "BUILD_ID", value: ServerConfig.BUILD_ID },
                    { name: "AWS_S3_BUCKET", value: ServerConfig.AWS_S3_BUCKET },
                    { name: "AWS_S3_REGION", value: ServerConfig.AWS_S3_REGION },
                    { name: "AWS_S3_ACCESS_KEY_ID", value: ServerConfig.AWS_S3_ACCESS_KEY_ID },
                    { name: "AWS_S3_SECURITY_ACCESS_KEY", value: ServerConfig.AWS_S3_SECURITY_ACCESS_KEY },
                    { name: "GIT_REPOSITORY_URL", value: ServerConfig.GIT_REPOSITORY_URL },
                    { name: "PROJECT_TYPE", value: projectType },
                    { name: "PROJECT_DEPENDENCY_INSTALL_COMMAND", value: projectDependencyInstallCmd },
                    { name: "PROJECT_BUILD_COMMAND", value: projectBuildCmd },
                    { name: "PROJECT_BUILD_DIRECTORY", value: projectBuildDir }
                ]
            }]
        }
    }
}

const ecsClient = new ECSClient({
    region: ServerConfig.ECS_REGION
});

const runEcsTask = async (
    projectType: string,
    projectDependencyInstallCmd: string,
    projectBuildCmd: string,
    projectBuildDir: string
) => {
    try {
        const params = createParams(projectType, projectDependencyInstallCmd, projectBuildCmd, projectBuildDir);
        const command = new RunTaskCommand(params);
        const result = await ecsClient.send(command);
        logger.info("Task started:", result?.tasks?.[0]?.taskArn);
    } catch (error) {
        logger.error("Error running task:", error);
    }
}

export default runEcsTask;