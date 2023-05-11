const mongoose = require('mongoose');

const CatSchema = new mongoose.Schema({
    cat_id: { type: String, require: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },// 关联到User数据集合的自动生成的id
    title: { type: String, required: true },// 标题
    content: { type: String, required: true },// 内容
    addrs: { type: Object, required: true },// 发布地区
    imageUrl: { type: Array, require: true },// 图片数据存储的是图片地址
    lable: { type: Array, require: true },
    isApproved: { type: Boolean, default: false }, // 是否审核
    created_at: { type: Date, default: Date.now },// 创建时间
    updated_at: { type: Date, default: Date.now }// 更新时间
})


const Cat = mongoose.model('CatSchem', CatSchema);


module.exports = Cat;

