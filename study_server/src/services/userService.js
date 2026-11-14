import bcrypt from 'bcryptjs'
import {db} from '../utils/db.js'
import jwt from 'jsonwebtoken'


export const registerUser = async(username, password) => {
    const exist = db.prepare('SELECT id FROM users WHERE username = ?').get(username)
    if(exist) throw new Error('username already exists')

    const hash = await bcrypt.hash(password, 10);
    db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)').run(username, hash)
    return username;
}

export const loginUser = async(username, password) => {
    const user = db.prepare('SELECT id, password_hash FROM users WHERE username = ?').get(username)
    const msg  = '用户名或者密码错误'
    // 注意：区分「未注册」和「密码错误」体验更好，但会暴露用户名是否存在（用户枚举风险）
    // 个人项目体验优先；企业级应用通常统一提示「用户名或密码错误」
    if(!user) throw new Error('该用户名未注册，请先注册')
    const ok = await bcrypt.compare(password, user.password_hash)
    if(!ok) throw new Error(msg)
    return jwt.sign(
        {userId: user.id, username: user.username},
        process.env.JWT_SECRET,
        {expiresIn: '7d'}
    )
}