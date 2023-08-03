const mongoose = require('mongoose');
const User = require('./User');  // 确保正确导入 User 模型


// 在线表格
const onlineSchema = new mongoose.Schema({
    user_id: { type: mongoose.Types.ObjectId, ref: "User", required: true }, // 用户id 使用uuid进行生成

    created_at: { type: Date, default: Date.now }, // 上线时间
    device: { type: Object, default: {} },// 登录设备等信息
    wsid: { type: String },// wsid 可以用这个进行设置id
    online: { type: Boolean, default: true }// 设置在线或者不在线
})


const Online = mongoose.model('Online', onlineSchema);



// 用户聊天信息表
const frienSchema = new mongoose.Schema({
    user_id: { type: mongoose.Types.ObjectId, ref: "User", required: true },// 当前用户
    fuser_id: { type: mongoose.Types.ObjectId, ref: "User", required: true },// 好友user_id
    created_at: { type: Date, default: Date.now }, // 私聊时间
    message: [
        { type: mongoose.Types.ObjectId, ref: "Message" },// 已读信息
    ],
    unread: [
        { type: mongoose.Types.ObjectId, ref: "Message" },// 未读
    ]
})

const Frien = mongoose.model('Frien', frienSchema);




// 用户消息表
const messageSchema = new mongoose.Schema({
    user_id: { type: mongoose.Types.ObjectId, ref: "User", required: true },// 发送者
    fuser_id: { type: mongoose.Types.ObjectId, ref: "User", required: true },// 接收者
    neiron: { type: String },// 内容
    created_at: { type: Date, default: Date.now }, // 私聊时间
    type: {
        type: String,
        enum: [0, 1, 2, 3],
        default: 0
    },// 消息类型 【0表示文字,1表示图片链接,2表示音频链接,3表示视频链接】
})
const Message = mongoose.model('Message', messageSchema);



// 黑名单表
const blacklistSchema = new mongoose.Schema({
    user_id: { type: mongoose.Types.ObjectId, ref: "User", required: true },// 当前用户
    black_user: { type: mongoose.Types.ObjectId, ref: "User", required: true },// 拉黑的用户
    created_at: { type: Date, default: Date.now }, // 拉黑时间
})

const BlackList = mongoose.model('BlackList', blacklistSchema);




module.exports = { Online, Frien, Message, BlackList };
