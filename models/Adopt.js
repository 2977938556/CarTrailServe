const mongoose = require('mongoose');


// 申请领养的模块
const ApplyForSchema = new mongoose.Schema({
    cat_id: { type: mongoose.Schema.Types.ObjectId, ref: 'CatSchem' },// 领养的猫咪ID
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },// 申请领养者
    fuser_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },// 发布猫用户
    content: { type: String, required: true },// 用户留言
    user_content: { type: String, default: "" },// 发布者留言
    to_examine: {
        type: String,
        enum: ['examine', 'ok', 'nopass', 'delete'],
        default: 'examine'
    },// 审核判断 【待审核,同意领养通过，不同意,删除】
    created_at: { type: Date, default: Date.now }, // 用户注册时间
    updated_at: { type: Date, default: Date.now },// 更新时间
})

const ApplyFor = mongoose.model('ApplyFor', ApplyForSchema);

module.exports = { ApplyFor };

