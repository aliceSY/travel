import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage , SystemMessage} from '@langchain/core/messages';
import 'dotenv/config';


class TravelService {
    constructor() {
       this.llm = null;
       this.init();
    }
    init() {
        const provider = process.env.MODEL_PROVIDER;
        let apiKey, baseURL, modelName;
        if (provider === 'ARK') {
            apiKey  = process.env.ARK_API_KEY;
            baseURL = process.env.ARK_BASE_URL;
            modelName = process.env.ARK_MODEL;
        } else {
            apiKey  = process.env.DEEPSEEK_API_KEY;
            baseURL = process.env.DEEPSEEK_BASE_URL;
            modelName = process.env.DEEPSEEK_MODEL;
        }
        this.llm = new ChatOpenAI({
            apiKey,
            configuration: { baseURL },
            modelName,
            temperature: 0.5,
            streaming: true, //流式 打字机的那种效果
        });
    }


    //提示词
    getTravelPrompt(budget, days, destination) {
        return new HumanMessage({
            content: `你是一个专业的旅行规划师，你的任务是根据用户的需求，生成一个符合要求的旅行计划。用户需求：预算${budget}元，${days}天，目的地${destination}。请严格按以下 JSON 结构输出，用 \`\`\`json \`\`\` 代码块包裹，不要输出结构之外的其他内容：
\`\`\`json
{
  "旅行计划": {
    "基本信息": {
      "目的地": "目的地名称",
      "行程安排": "如：3天2晚",
      "总预算": 3000,
      "出行方式": "如：高铁往返",
      "建议出行季节": "如：春秋季"
    },
    "预算分配": {
      "交通": 800,
      "住宿": 600,
      "餐饮": 400,
      "门票": 300,
      "备用金": 200
    },
    "每日行程": [
      {
        "天数": "第1天",
        "主题": "当天主题",
        "行程": [
          { "时间": "08:00-09:30", "安排": "具体安排" }
        ],
        "当日花费预估": "如：门票62元+餐饮130元"
      }
    ],
    "实用贴士": ["贴士1", "贴士2"]
  }
}
\`\`\`
要求：每日行程必须完整覆盖全部 ${days} 天；预算分配各项金额之和不超过总预算。`,
        });
    }
     //推荐
    async recommend(budget, days, destination) {
        if(budget < 100 || days < 1 || days > 30) {
            throw new Error('Budget, days, and destination must be valid!');
        }
        //提示词
        const prompt = this.getTravelPrompt(budget, days, destination);
        //调用大模型生成推荐
        try {
            const response = await this.llm.invoke([prompt]);
            console.log(response);
            return response;
        } catch (error) {
            console.error('Error invoking LLM:', error);
            throw new Error('Internal server error');
        }
    }

    async chat(message, streamCallback) {
        const messages = [
            new SystemMessage({
                content: '你是一个旅游规划师，你的任务是根据用户的需求，生成一个符合要求的旅游计划。请用中文回答',
            }),
           new HumanMessage(message),
        ]
      try {
        const stream = await this.llm.stream(messages);
        let fullResponse = '';
        for await (const chunk of stream) {
            const content = chunk.content  || '';
            if(content.trim() === '') {
                continue;
            }
            fullResponse += content;

            if(streamCallback) {
                streamCallback(content);
            }
        }
        return {
            success: true,
            message: fullResponse,
        }
        }catch(error) {
           return {
            success: false,
            message: error.message,
           }
        }
}  
} 

export default  new TravelService();