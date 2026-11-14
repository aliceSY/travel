import 'dotenv/config';
import express from 'express';
import studyRouter from './routes/study.js';

import cors from 'cors';
import authRouter from './routes/auth.js';
import { auth } from './middlewares/auth.js';
import { requestLogger } from './middlewares/logger.js';

const app = express();
const port = process.env.PORT || 3000;


//挂载中间件， 需要对请求统一处理的
app.use(requestLogger);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(auth);
app.use('/api/study/auth', authRouter)  // 4. 登录注册（白名单放行）
app.use('/api/study', studyRouter)      // 5. 业务接口（受保护）

app.listen(port, () => {
  console.log(`Study server listening at http://localhost:${port}`);
});
