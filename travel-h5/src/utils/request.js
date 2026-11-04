import axios from "axios";

//创建axios实例

const request  = axios.create({
    baseURL:'http://localhost:3400/api/travel',
    timeout: 60000,
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


export const fetchStream = (url, data, onChunk, onComplete, onError) => {
    fetch(`http://localhost:3400/api/travel${url}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.body)
    .then(body => body.on('data', onChunk))
    .then(() => onComplete())
    .catch(onError)
}
