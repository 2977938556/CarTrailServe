const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path')
const HomeRouter = require('./routes/home.js')
//配置获取post请求体
var bodyParser = require("body-parser");
app.use(bodyParser.json({ limit: '100mb' }))
app.use(bodyParser.urlencoded({ limit: '100mb', extended: false }))



// 开放静态资源

//开放静态资源文件
app.use('/public/uploads/cart', express.static(path.join(__dirname, '/public/uploads/cart')))


// 解析数据
app.use(express.urlencoded({ extended: true }));

// 设置跨域
const whitelist = ['172.16.73.117']; // 允许访问的AI地址列表

// 判断函数设置跨域
// 获取到请求头的ip进行获取里面的IP地址
const corsOptions = {
    origin: function (origin, callback) {
        const ip = origin.match(/\/\/([\d.]+):/)[1]
        // console.log(ip) // 输出 172.16.67.175
        // 判断是否等于数组中数值
        if (whitelist.indexOf(ip) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }
};

// 安装插件
app.use("/api", cors(corsOptions));


app.use('/api', HomeRouter); // 指定路由的根路径为/api

app.listen(3000, () => {
    console.log('Server is running on http://172.16.67.175:3000');
});