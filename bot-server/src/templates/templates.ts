export const start_chat_template = (): string => {
    return `
<b>🚀 Welcome to BhaiDeployKarDe Bot!</b>

Think of me as your personal <i>coder bro</i> — here to help you quickly deploy and showcase your projects to the world.

Whether you're building a portfolio, launching a side project, or testing out an idea, I’ll guide you step-by-step to get your project online — fast.

Just send me your project files or public GitHub repo, and let’s launch something awesome! 🌍✨

<code>Type /help to see what I can do.</code>
`
};

export const help_chat_template = (): string => {
    return `
<b>📖 How to use BhaiDeployKarDe Bot</b>

Send me your <b>public GitHub repository URL</b>, and I will:
• Clone your repo
• Build your project
• Deploy it online so you can showcase it instantly

Make sure your repo is public and contains the necessary files (e.g., build scripts).

<code>Type /commands to see all the valid commands.</code>

Happy deploying! 🚀
`
};

export const commands_chat_template = (): string => {
    return `
<b>🛠️ Available Commands</b>

Here are the commands you can use with DevLaunch Bot:

<code>/start</code> — Begin interacting with the bot  
<code>/help</code> — Know about me  
<code>/deploy</code> — Start the deployment process  
<code>/status</code> — Check the status of your project deployment
`
};

export const deploying_project_template = (projectName: string, projectId: string, gitUrl: string, slug: string, status: string, projectType: string): string => {
    return (
        `🚀 <b>Deployment Started!</b>\n\n` +
        `📦 <b>Project:</b> ${projectName}\n` +
        `🆔 <b>Project ID:</b> ${projectId}\n` +
        `❓ <b>Project Type:</b> ${projectType}\n\n` +
        `🔗 <b>GitHub Repo:</b> <a href="${gitUrl}">${gitUrl}</a>\n` +
        `🌍 <b>Live URL:</b> <a href="https://${slug}.yourdomain.com">https://${slug}.yourdomain.com</a>\n` +
        `⏰ <b>Current Status:</b> ${status}\n\n` +
        `⏳ Your project is being deployed. You'll be able to access it shortly!`
    );
}