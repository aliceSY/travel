import {Router} from "express";
import {registerUser, loginUser} from "../services/userService.js";



const router = Router();


router.post('/register', async(req, res) => {
    const {username, password} = req.body;
    if(!username || !password || password.length < 6) {
        return res.status(400).json({
            success: false,
            message: '用户名和密码（6位以上，必填） 不能为空'
        })
    }
    try {
        await registerUser(username, password);
        return res.status(200).json({
            success: true,
            message: '注册成功'
        })
    }catch(e) {
        return res.status(400).json({
            success: false,
            message: e.message
        })
    }
})


router.post('/login', async(req, res) => {
    const {username, password} = req.body;
    if(!username || !password) {
        return res.status(400).json({
            success: false,
            message: '用户名和密码不能为空'
        })
    }
    try {
        const token = await loginUser(username, password);
        return res.status(200).json({
            success: true,
            data: {
                token, username
            }
        })
    }catch(e) {
        //401 未授权
        return res.status(401).json({
            success: false,
            message: e.message
        })
    }
})

export default router