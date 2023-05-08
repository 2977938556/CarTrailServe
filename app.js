const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path')
const mongoose = require('mongoose')



// 连接数据库
// 连接到MongoDB数据库
mongoose.connect('mongodb://127.0.0.1:27017/CatTrail', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('数据库链接成功');
}).catch((err) => {
    console.log("数据库链接失败 error");
});





//配置获取post请求体
var bodyParser = require("body-parser");
app.use(bodyParser.json({ limit: '100mb' }))
app.use(bodyParser.urlencoded({ limit: '100mb', extended: false }))


//开放静态资源文件
app.use('/public/uploads/cart', express.static(path.join(__dirname, '/public/uploads/cart')))


// 导入路由
const HomeRouter = require('./routes/home.js')// 首页
const RegisterRouter = require('./routes/register.js'); // 注册


// 允许跨域
app.use(cors());


// 解析数据
app.use(express.urlencoded({ extended: true }));

// 配置路由
app.use('/api', HomeRouter); // 首页的数据
app.use('/api', RegisterRouter)// 注册


app.listen(3000, () => {
    console.log('服务器启动成功,请访问：localhost:3000');
});