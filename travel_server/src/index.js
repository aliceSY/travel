import 'dotenv/config';
import express from 'express';
import travelRouter from './routes/travel.js';

import cors from 'cors';

const app = express();
const port = process.env.PORT || 3000;
app.use(cors());


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
    

app.use('/api/travel', travelRouter);
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});