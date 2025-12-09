#!/usr/bin/env node

import dotenv from "dotenv";
import chalk from "chalk";
import { Command } from "commander";
import figlet from "figlet";
import path from "path";
import { login, logout, whoami } from "./commands/auth/login.ts";
import { wakeUp } from "./commands/ai/wakeUp.ts";

// Always load the server-level .env so CLI commands work no matter
// which directory you run them from (e.g. src/cli).
dotenv.config({
  path: path.resolve(__dirname, "..", "..", ".env"),
});


async function main() {

    console.log(
        chalk.cyan(
            figlet.textSync("Orryn CLI",{
                font: "Standard",
                horizontalLayout: "default",
                verticalLayout: "default",
              
            }),
        )
    )


    console.log(chalk.bgRedBright("\n A CLI based AI tool!! \n"  ));


    const program = new Command("orryn");

    program.version("0.0.1").description("Orryn CLI - Your AI Companion in the Terminal")
    .addCommand(login)
    .addCommand(logout)
    .addCommand(whoami)
    .addCommand(wakeUp);

    program.action(() => {
        program.help();
    });


    program.parse()




}


main().catch((err)=> {
    console.log(chalk.red("Error running the CLI : "),err);
    process.exit(1);

});