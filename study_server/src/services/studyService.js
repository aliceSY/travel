import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage , SystemMessage} from '@langchain/core/messages';
import 'dotenv/config';


class StudyService {
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
    getStudyPrompt(dailyHours, days, subject) {
        return new HumanMessage({
            content: `你是一个专业的学习规划师，你的任务是根据学生的情况，生成一个科学可执行的学习计划。学生情况：备考科目${subject}，备考周期${days}天，每天可学习${dailyHours}小时。请严格按以下 JSON 结构输出，用 \`\`\`json \`\`\` 代码块包裹，不要输出结构之外的其他内容：
\`\`\`json
{
  "学习计划": {
    "基本信息": {
      "科目": "科目名称",
      "备考周期": "如：30天",
      "每日学习时长": "如：4小时",
      "基础要求": "如：有四级基础"
    },
    "时长分配": {
      "基础巩固": 40,
      "强化训练": 50,
      "真题演练": 30,
      "冲刺复盘": 20
    },
    "每日计划": [
      {
        "天数": "第1天",
        "主题": "当天主题",
        "安排": [
          { "时间": "08:00-10:00", "内容": "具体学习内容" }
        ],
        "当日学习任务": "如：背单词100个+精读一篇阅读"
      }
    ],
    "学习建议": ["建议1", "建议2"]
  }
}
\`\`\`
要求：每日计划必须完整覆盖全部 ${days} 天；时长分配各项之和不超过总学习时长（${dailyHours} × ${days} 小时）。`,
        });
    }
     //推荐
    async recommend(dailyHours, days, subject) {
        if(dailyHours < 1 || dailyHours > 12 || days < 1 || days > 365) {
            throw new Error('Daily hours must be 1-12 and days must be 1-365!');
        }
        //提示词
        const prompt = this.getStudyPrompt(dailyHours, days, subject);
        //调用大模型生成学习计划
        try {
            const response = await this.llm.invoke([prompt]);
            return response;
        } catch (error) {
            console.error('Error invoking LLM:', error);
            throw new Error('Internal server error');
        }
    }

    async chat(message, streamCallback) {
        const messages = [
            new SystemMessage({
                content: '你是一个专业的学习规划师，擅长根据学生的备考目标、基础和可用时间制定复习计划、推荐学习方法和资料。请用中文回答',
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

export default  new StudyService();
