const mongoose = require('mongoose');


// 这个是一个活动的列表
const activitySchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },// 关联到User数据集合的自动生成的id
    title: { type: String, required: true },// 标题
    content: { type: String, required: true },// 内容
    adds: { type: String, required: true },// 发布地区
    imageUrl: { type: Array, require: true },// 图片数据存储的是图片地址
    clickCount: { type: Number, default: 0 },// 帖子的点击量
    people: { type: Number, default: 0 },// 
    time: { type: Array, default: [] },
    to_examine: {
        type: String,
        enum: ['progress', 'end', 'cancellation', 'delete'],
        default: 'progress'
    },// 审核判断 【报名中，结束，取消，删除】
    lable: { type: Array, default: [] },// 标签
    created_at: { type: Date, default: Date.now },// 创建时间
    updated_at: { type: Date, default: Date.now },// 更新时间
    participant: [{
        user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        phone: { type: String, default: "空" },
        message: { type: String, default: "无留言" },
    }]
})
const Activity = mongoose.model('Activity', activitySchema);


// 这是一个用户报名的活动列表
const participantSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },// 关联到User数据集合的自动生成的id
    activities: [{
        act_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Activity' },// 使用ref进行绑定活动
        phone: String,
        message: String,
    }]
})

// 当用户点击了提交那么我们会在当前的活动添加一个


const Participant = mongoose.model('Participant', participantSchema);



module.exports = { Activity, Participant };

