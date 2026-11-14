import jwt from "jsonwebtoken";

const WHITELIST = ['/api/study/health', '/api/study/auth/login', '/api/study/auth/register'];


export const auth = (req, res, next) => {
    // CORS 预检请求不带自定义 header，直接放行
    if (req.method === 'OPTIONS') {
        return next();
    }
    // 白名单：登录/注册是获取 token 的入口，health 是探活接口，都不需要 token
    if (WHITELIST.includes(req.path)) {
        return next();
    }
    const header  = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';
    if(!token) {
        return res.status(401).json({
            success: false,
            message: '未授权, 请登录'
        })
    }
    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        return next();
    }catch(err) {
        const message = err.name === 'TokenExpiredError' ? '登录已过期，请重新登录' : '无效的登录状态'
        return res.status(401).json({ success: false, message })
    }
}