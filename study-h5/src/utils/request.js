import axios from "axios";

//创建axios实例

const request  = axios.create({
    baseURL:'http://localhost:3400/api/study',
    timeout: 180000,
    headers: {
        'Content-Type': 'application/json'
    },

})

// 请求拦截器
request.interceptors.request.use(
    config => {
        return config
    },
    error => {
        return Promise.reject(error)
    }
)


// 响应拦截器
request.interceptors.response.use(
    response => {
        return response.data
    },
    error => {
        return Promise.reject(error)
    }
)

// get function
export const get = (url, params) => {
    return request.get(url, {params})
}


//post function
export const post = (url, data) => {
    return request.post(url, data)
}

// 用fetch读取SSE流式响应
export const fetchStream = async(url, data, onChunk, onComplete, onError) => {
   try {
 const controller = new AbortController();  // 需要中断的时候请求
    const response = await fetch(`http://localhost:3400/api/study${url}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
        signal: controller.signal,
    })

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    while(true) {
        const  {done, value} = await reader.read();
        if(done) {
            break;
        }
        const text = decoder.decode(value , {stream: true});
        
        const events = text.split("\n\n");
        for(const event of events) {
            if(!event.trim()) {
                continue;
            }
            // 一个 event 块可能包含多行，比如流结束的 "event: end\ndata: {...}"
            // 只有 data: 开头的行才携带 JSON，其他标记行跳过，否则 JSON.parse 会报错
            const dataLine = event.split('\n').find(line => line.startsWith('data: '));
            if(!dataLine) {
                continue;
            }
            try {
                const payload = JSON.parse(dataLine.slice(6)); // 去掉 'data: ' 前缀（6个字符）
                if(payload.type === 'chunk') {
                    onChunk?.(payload.message); // 后端的字段名是 message，不是 content
                }else if(payload.type === 'complete') {
                    onComplete?.(payload.data); // 完整结果 { success, message }
                }else if(payload?.error) {
                    onError?.(payload.error);
                }
            }catch(err) {
               onError?.(err);
            }
        }
    }
    return controller;
   }catch(err) {
    onError?.(err);
   }
}
