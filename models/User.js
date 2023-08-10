const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    user_id: { type: String }, // 用户id 使用uuid进行生成
    username: { type: String }, // 用户名称
    password: { type: String },// 用户密码（需要加密）
    mobile: { type: String },// 用户手机号
    slogin: { type: String, default: "领养替代购买" },// 用户标语
    bgimgUrl: { type: String, default: 'https://img.js.design/assets/img/64d19e663e75e479d103acbd.png#475edcba57aa3cb347f79daffb2165e4' },// 用户头像
    created_at: { type: Date, default: Date.now }, // 用户注册时间
    role: {
        type: String,
        enum: ['user', 'admin', 'ban', 'delete', 'institution', 'business'],
        default: 'user'
        // 分别为：普通用户 管理员 被封禁 无当前账户 机构 商家
    },
    configuration_information: {
        History: {
            type: Boolean,
            enum: [true, false,],
            default: false,
        },// 是否开启历史记录
        private_letter: {
            type: Boolean,
            enum: [true, false,],
            default: false,
        },// 是否开启私信
        view_favorites: {
            type: Boolean,
            enum: [true, false,],
            default: false,
        }//查看收藏
    },
    bantimt: {
        createdTime: { type: Date },// 开始时间
        endTime: { type: Date },// 封禁结束时间
        deleteTime: { type: Date }// 删除用户的时间
    }
    // 封禁的时间
})


const User = mongoose.model('User', userSchema);


module.exports = User;
