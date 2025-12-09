import { cancel, confirm, intro, isCancel, outro } from "@clack/prompts";

import { logger } from "better-auth";
import { createAuthClient } from "better-auth/client";
import { deviceAuthorizationClient } from "better-auth/plugins";
import prisma from "../../../lib/db.ts";

import chalk from "chalk";
import { Command } from "commander";
import fs from "fs/promises";
import open from "open";
import path from "path";
import os from "os";
import yoctoSpinner from "yocto-spinner";
import * as z from "zod/v4";
import dotenv from "dotenv";
import {
  getStoredToken,
  isTokenExpired,
  storeToken,
  clearStoredToken,
  requireAuth,
} from "../../../lib/token.ts";

dotenv.config();

const URL = process.env.SERVER_URL || "http://localhost:3005";
const CLIENT_ID = process.env.GITHUB_CLIENT_ID || "";
export const CONFIG_DIR = path.join(os.homedir(), ".better-auth");
export const TOKEN_FILE = path.join(CONFIG_DIR, "token");

export async function loginAction(opts) {
  const options = z.object({
    serverUrl: z.string().optional(),
    clientId: z.string().optional(),
  });

  const serverUrl = opts.serverUrl || URL;
  const clientId = opts.clientId || CLIENT_ID;

  intro(chalk.bold.greenBright("🔐 Auth CLI Login"));

  //change this with token management utils

  const existingToken = await getStoredToken();

  const expired = await isTokenExpired();

  if (existingToken && !expired) {
    const shouldReAuth = await confirm({
      message: "Your are already logged in. Do you want to re-authenticate?",
      initialValue: false,
    });

    if (isCancel(shouldReAuth)) {
      cancel("Login cancelled");
      process.exit(0);
    }
  }

  const authClient = createAuthClient({
    baseURL: serverUrl,
    plugins: [deviceAuthorizationClient()],
  });

  const spinner = yoctoSpinner({
    text: "Requesting device authorization...",
  });
  spinner.start();

  try {
    console.log(chalk.gray(`Connecting to ${serverUrl}...`));

    const { data, error } = await authClient.device.code({
      client_id: clientId,
      scope: "openid profile email",
    });

    spinner.stop();

    if (error || !data) {
      console.error(chalk.red("❌ Failed to request device authorization"));
      if (error) {
        console.error(
          chalk.red(
            `Error: ${
              error.error_description || error.message || JSON.stringify(error)
            }`
          )
        );
      }
      if (!clientId) {
        console.error(
          chalk.yellow(
            "⚠️  Warning: GITHUB_CLIENT_ID is not set in environment variables"
          )
        );
      }
      process.exit(1);
    }

    const {
      device_code,
      user_code,
      verification_uri,
      verification_uri_complete,
      expires_in,
      interval = 5,
    } = data;

    console.log(chalk.cyan("\n✓ Device Authorization Required\n"));

    console.log(
      `Please visit ${chalk.underline.blue(
       verification_uri_complete || verification_uri 
      )}`
    );

    console.log(`Enter Code : ${chalk.bold.green(user_code)}\n`);

    const shouldOpen = await confirm({
      message: "Open Browser Automatically?",
      initialValue: true,
    });

    if (isCancel(shouldOpen)) {
      cancel("Login cancelled");
      process.exit(0);
    }

    if (shouldOpen) {
      // Prefer the complete verification URI (usually already includes the user_code)
      // and fall back to the base verification URI if it's not provided.
      const urlToOpen = verification_uri_complete || verification_uri;
      await open(urlToOpen);
    }

    console.log(
      chalk.gray(
        `\nWaiting for authorization (expires in ${Math.floor(
          expires_in / 60
        )} minutes)...`
      )
    );

    const token = await pollForToken(
      authClient,
      device_code,
      clientId,
      interval
    );

    if (token) {
      // Persist the received token for future CLI runs
      const saved = await storeToken(token);

      if (!saved) {
        console.log(
          chalk.yellow("❌ Warning: Could not save authentication token")
        );

        console.log(chalk.yellow(" Your may need to login again on next use"));
      }

      outro(chalk.greenBright("Login successful!"));


      console.log(chalk.gray(`\n Token saved to: ${TOKEN_FILE}\n`));


      console.log(
        chalk.gray(" You can now use Ai commands without logging in again\n"));
    }
  } catch (error:any) {
    spinner.stop();
    console.error(chalk.red("\nLogin failed : "),error.message);
    process.exit(1);
  }
}

async function pollForToken(
  authClient,
  deviceCode,
  clientId,
  initialIntervalue
) {
  let pollingInterval = initialIntervalue;
  const spinner = yoctoSpinner({
    text: "",
    color: "cyan",
  });
  let dots = 0;

  return new Promise((resolve, reject) => {
    const poll = async () => {
      dots = (dots + 1) % 4;
      spinner.text = `Polling for authorization${".".repeat(dots)}${" ".repeat(
        3 - dots
      )}`;

      if (!spinner.isSpinning) spinner.start();

      try {
        const { data, error } = await authClient.device.token({
          grant_type: "urn:ietf:params:oauth:grant-type:device_code",
          // The Better Auth device flow expects `device_code`, not `device_id`
          device_code: deviceCode,
          client_id: clientId,
          fetchOptions: {
            headers: {
              "user-agent": `My CLI`,
            },
          },
        });

        if (data?.access_token) {
          console.log(
            chalk.bold.yellow(`Your access token is: ${data.access_token}`)
          );
          spinner.stop();
          resolve(data);
          return;
        } else if (error) {
          switch (error.error) {
            case "authorization_pending":
              // Continue polling
              break;
            case "slow_down":
              pollingInterval += 5;
              break;
            case "access_denied":
              console.error("Access was denied by the user");
              return;
            case "expired_token":
              console.error("The device code has expired. Please try again.");
              return;
            default:
              spinner.stop();
              logger.error(`Error: ${error.error_description}`);
              process.exit(1);
          }
        }
      } catch (error) {
        spinner.stop();
        logger.error(`Network error: ${error.messager}`);
        process.exit(1);
      }

      setTimeout(poll, pollingInterval * 1000);
    };

    setTimeout(poll, pollingInterval * 1000);
  });
}


export async function logoutAction(){
  intro(chalk.bold(" ➜🚪 Logout"))


  const token = await getStoredToken();

  if(!token){
    console.log(chalk.yellow("You are not logged in."))
    process.exit(0);
  }

  const shouldLogout = await confirm({
    message: "Are you sure you want to logout?",
    initialValue: false,
  });


  if(isCancel(shouldLogout) || !shouldLogout){
    cancel("Logout cancelled");
    process.exit(0);
}

  const cleared = await clearStoredToken();

  if (cleared) {
    outro(chalk.greenBright("🏠︎ You have been logged out successfully!"));
  } else {
    console.log(chalk.yellow(" Could not clear token file"));
  }
}

export const login = new Command("login")
  .description("Login to Better Auth server")
  .option("--server-url <url>", "Better Auth server URL ", URL)
  .option("--client-id <id>", "The OAuth Client ID", CLIENT_ID)
  .action(loginAction);

export const logout = new Command("logout")
  .description("Logout and clear stored credentials")
  .action(logoutAction);

export const whoami = new Command("whoami")
  .description("Show current authenticated user")
  .option("--server-url <url>", "Better Auth server URL ", URL)
  .action(whoamiAction);

export async function whoamiAction(opts: any) {
  if (!process.env.DATABASE_URL) {
    console.log(
      chalk.red(
        "❌ DATABASE_URL is not set. Please configure your database connection in the server .env before running 'orryn whoami'."
      )
    );
    process.exit(1);
  }

  const token = await requireAuth();

  if(!token?.access_token){

    console.log("No access token found. Please login")
    process.exit(1);
  }


  const user = await prisma.user.findFirst({
    where:{
      sessions:{
        some:{
          token: token.access_token,
        },
      },
    },

    select:{
      id: true,
      name: true,
      email: true,
      image: true,
    },
  })


  console.log(
    chalk.bold.greenBright(`
      👤︎ User : ${user?.name} 
      📩︎ Email : ${user?.email} 
      🆔︎ Id : ${user?.id}
      `)
  );
}