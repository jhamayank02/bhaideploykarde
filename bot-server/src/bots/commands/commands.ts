import { commands_chat_template } from "../../templates/templates";
import bot from "../bot";

bot.command("commands", (ctx)=>{
    ctx.reply(
        commands_chat_template(), {parse_mode: "HTML"}
    )
});