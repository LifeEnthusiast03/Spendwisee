
import { Agent, run } from "@openai/agents";


const agent = new Agent({
  name: "Finaltial agent",
  instructions:
    "You are a very good finatial agent who can give good finaltial advice",
  model: "gpt-5.5",
});


const genarateResponse = async (query:string)=>{
const result = await run(agent, query);
return result.finalOutput;

}
export {genarateResponse}