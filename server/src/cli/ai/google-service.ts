import { google } from "@ai-sdk/google";
import { convertToModelMessages, generateObject, streamText, tool } from "ai";
import { config } from "../../config/google.config.ts";
import chalk from "chalk";

export class AiService {
  constructor() {
    if (!config.googleApiKey) {
      throw new Error("Google API Key is not defined in environment variables");
    }

    this.model = google(config.model, {
      apiKey: config.googleApiKey,
    });
  }

  async sendMessage(messages, onChunk, tools = undefined, onToolCall = null) {
    try {
      const streamConfig = {
        model: this.model,
        messages: messages,
      };


      if(tools && Object.keys(tools).length > 0){
        streamConfig.tools = tools;
        streamConfig.maxSteps = 5;
        
        
        console.log(
          chalk.gray(`
            [Debug] Tools enabled: ${Object.keys(tools).join(", ")}`)
        )
      }


      const result = streamText(streamConfig);

      let fullResponse = "";



      for await (const chunk of result.textStream) {
        fullResponse += chunk;

        if (onChunk) {
          onChunk(chunk);
        }
      }

      const fullResult = result;


      const toolCalls = [];
      const toolResults = [];


      if(fullResult.steps && Array.isArray(fullResult.steps)){
        for(const step of fullResult.steps){
          if(step.toolCalls && step.toolCalls.length > 0){

            for(const tooCall of step.toolCalls){
              toolCalls.push(tooCall);


              if(onToolCall){
                onToolCall(tooCall);
              }
            }
          }


          if(step.toolResults && step.toolResults.length > 0){
            toolResults.push(...step.toolResults);
          }
        }
      }


      return {
        content: fullResponse,
        finishResponse: fullResult.finishReason,
        usage: fullResult.usage,
        toolCalls,
        toolResults,
        steps: fullResult.steps,
      };
    } catch (error) {
      console.error(chalk.red("AI service error : "), error.message);
      throw error;
    }
  }

  async getMessage(messages, tools = undefined) {
    let fullResponse = "";

   const result = await this.sendMessage(messages, (chunk) => {
      fullResponse += chunk;
    },tools);

    return result.content;
  }




  async generateStructured(schema,prompt){
    try {
      const result = await generateObject({
        model: this.model,
        schema: schema,
        prompt: prompt,
      })


      return result.object
    } catch (error) {
        console.error(chalk.red("AI Structured Generation Error: "),error.message)
        throw error
    }
  }
}
