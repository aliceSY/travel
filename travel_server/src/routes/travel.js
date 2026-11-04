import express from 'express';
import TravelService from '../services/travelService.js';
import { createStream } from '../utils/createStream.js';
const router = express.Router();    

router.post('/chat', async(req, res) => {
  const {message} = req.body;
  if(!message) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a message!'
    });
  }
   // 对SSE流式返回进行处理
  const stream = createStream(res);
  // 调用大模型获取流式响应
    const result  = await TravelService.chat(message, (chunk) => {
      stream.send({type:'chunk' ,  message: chunk});
    });
    stream.send({type:'complete', data: result});
    stream.end();
  }); 

router.post('/recommend', async(req, res) => {
   const {budget, days, destination} = req.body;
    if(!budget || !days || !destination) {
      return res.status(400).json({
        success: false,
        message: 'Please provide budget, days, and destination!'
      });
    }
    try {
      const recommendation = await TravelService.recommend(budget, days, destination);
     console.log(recommendation);
      const fullResponse = recommendation.content || '';
      let resData;
      try {
        const matched = fullResponse.match(/```json([\s\S]*?)```/) ||
          fullResponse.match(/\{[\s\S]*\}/);
        resData = JSON.parse(matched[1] ?? matched[0]);
      } catch (err) {
        return res.status(500).json({
          success: false,
          error: 'JSON解析失败',
          rawResponse: fullResponse.slice(0, 500)
        });
      }
      return res.json({ success: true, data: resData });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }

});


export default router;                          