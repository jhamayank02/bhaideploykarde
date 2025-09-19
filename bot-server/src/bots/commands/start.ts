import { start_chat_template } from "../../templates/templates";
import bot from "../bot";

bot.start((ctx)=>{
    ctx.reply(
        start_chat_template(), {parse_mode: "HTML"}
    );
});