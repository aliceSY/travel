export const createStream = (res) => {
  res.setHeader('Content-Type', 'text/event-stream');

  res.setHeader('Cache-Control', 'no-cache');
  
  res.setHeader('Connection', 'keep-alive');
  return {
    send: (data) => {
      try {
        console.log("send", data);
        res.write(`data: ${JSON.stringify(data)}\n\n`);
      }catch(err) {
        throw err;
      }
    },
    end: () => {
     try {
      res.write(`event: end\ndata: {"done": true}\n\n`);
      res.end();
     }catch(err) {
      throw err;
     }
    },
    error: (message) => {
      try {
        res.write(`data: ${JSON.stringify(message)}\n\n`);
        res.end();
      }catch(err) {
        throw err;
      }
    }
  }
}