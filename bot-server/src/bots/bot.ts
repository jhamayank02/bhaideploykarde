import { Context, session, Telegraf } from "telegraf";
import dotenv from 'dotenv';

dotenv.config();

export interface BotDeploymentSession {
    step?: 'isExisting' | 'projectName' | 'projectType' | 'dependencyInstallCmd' | 'buildCmd' | 'buildDir' | 'gitUrl';
    projectId?: string;
    projectName?: string;
    gitUrl?: string;
    userDBId?: number;
    projectType?: string;
    build_command?: String;
    dependency_install_command?: String;
    build_directory?: String;
}

export interface BotStatusSession {
    step?: 'projectId';
    projectId?: string;
    userDBId?: number;
}

export interface BotSession {
    deployment: BotDeploymentSession;
    status: BotStatusSession;
}

export interface BotContext extends Context {
    session: BotSession
}

const bot = new Telegraf<BotContext>(process.env.TELEGRAM_BOT_TOKEN || '')
bot.use(session({
    defaultSession: (): BotSession => ({
        deployment: {
            step: undefined,
            projectId: undefined,
            projectName: undefined,
            gitUrl: undefined,
            userDBId: undefined,
            projectType: undefined,
            build_command: undefined,
            dependency_install_command: undefined,
            build_directory: undefined
        },
        status: {
            step: undefined,
            projectId: undefined,
            userDBId: undefined
        }
    }),
}));

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))

export default bot;