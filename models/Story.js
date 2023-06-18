const mongoose = require('mongoose');

const StorySchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },// 关联到User数据集合的自动生成的id
    title: { type: String, },// 标题
    content: { type: String, required: true },// 内容
    imageUrl: { type: Array, require: true },// 图片数据存储的是图片地址
    clickCount: { type: Number, default: 0 },// 故事的点击量
    to_examine: {
        type: String,
        enum: ['examine', 'pass', 'nopass'],
        default: 'examine'
    },// 审核判断 【审核中，通过，未通过】
    isApproved: { type: Boolean, default: false }, // 是否审核
    created_at: { type: Date, default: Date.now },// 创建时间
    updated_at: { type: Date, default: Date.now },// 更新时间
})


const Story = mongoose.model('StorySchema', StorySchema);


module.exports = Story;

