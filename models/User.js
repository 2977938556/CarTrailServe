const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true }, // 用户名称
    password: { type: String, required: true },// 用户密码（需要加密）
    mobile: { type: String, required: true },// 用户手机号
    slogin: { type: String, default: "领养替代购买" },// 用户标语
    bgimgUrl: { type: String, default: 'https://img.js.design/assets/img/6437f726bacae957a1524acb.png' },// 用户头像
    user_id: { type: String, required: true }, // 用户id 使用uuid进行生成
    created_at: { type: String, default: Date.now }, // 用户注册时间
    role: {
        type: String,
        enum: ['user', 'admin', 'ban'],
        default: 'user'
    }
});

const User = mongoose.model('User', userSchema);


module.exports = User;
