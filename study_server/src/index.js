import 'dotenv/config';
import express from 'express';
import studyRouter from './routes/study.js';

import cors from 'cors';

const app = express();
const port = process.env.PORT || 3000;
app.use(cors());


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/api/study', studyRouter);
app.listen(port, () => {
  console.log(`Study server listening at http://localhost:${port}`);
});
