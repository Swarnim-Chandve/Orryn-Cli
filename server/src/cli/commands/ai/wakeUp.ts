import chalk from "chalk";
import { Command } from "commander";

import yoctoSpinner from "yocto-spinner";
import { getStoredToken } from "../../../lib/token.ts";

import prisma from "../../../lib/db.ts";
import {select} from "@clack/prompts"
import { startChat } from "../../chat/chat-with-ai.ts";
import { startToolChat } from "../../chat/chat-with-ai-tool.ts";
import { startAgentChat } from "../../chat/chat-with-ai-agent.ts";


const wakeUpAction = async() => {
    const token = await getStoredToken();


    if(!token?.access_token){
        console.log(chalk.redBright("Not Authenticated .Please login "));
        return;
    }

    const spinner = yoctoSpinner({
        text: "Fetching user information..."
    });
    spinner.start();


    const user = await prisma.user.findFirst({
        where:{
            sessions:{
                some:{
                    token: token.access_token,
                }
            }
        },
        select:{
            id: true,
            name: true,
            email: true,
            image:true,
        }
    })


    spinner.stop();


    if(!user){
        console.log(chalk.red("User not found"));
        return;
    }


    console.log(chalk.green(`Welcome back, ${user.name}!\n`))



    const choice = await select({
        message: "Select an option",
        options:[
            {
                value: "chat",
                label: "Chat",
                hint: "Simple chat with AI",
            },
            {
                value: "tools",
                label: "Tool Calling",
                hint: "Chat with tools (Google Search ,Code Execution)",

            },

            {
                value: "agent",
                label: "Agentic Mode",
                hint: "Advanced AI agent(Coming soon)",
            },
        ],
    });



    switch(choice){
        case "chat":
           await startChat("chat")
            break;
        case "tools":
            await startToolChat()
            break;
        case "agent":
            await startAgentChat()
            break;
        
    }
}

export const wakeUp = new Command("wakeup")
.description("Wake up the AI")
.action(wakeUpAction);