const mongoose = require('mongoose');

const CatSchema = new mongoose.Schema({
    cat_id: { type: String, require: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },// 关联到User数据集合的自动生成的id
    title: { type: String, required: true },// 标题
    content: { type: String, required: true },// 内容
    addrs: { type: Object, required: true },// 发布地区
    imageUrl: { type: Array, require: true },// 图片数据存储的是图片地址
    clickCount: { type: Number, default: 0 },// 帖子的点击量
    to_examine: {
        type: String,
        enum: ['examine', 'pass', 'nopass', 'offine', 'delete', "ok"],
        default: 'examine'
    },// 审核判断 【审核中，通过，未通过,下线，上线,删除,已完成】
    Successful_adoption: {
        type: Boolean, default: false
    },// 这个是判断是否被申请了
    isApproved: { type: Boolean, default: true }, // 是否审核
    lable: { type: Array, require: true },// 标签
    created_at: { type: Date, default: Date.now },// 创建时间
    updated_at: { type: Date, default: Date.now },// 更新时间
})


const Cat = mongoose.model('CatSchem', CatSchema);


module.exports = Cat;

