const express = require('express')
const app = express()
const cors = require('cors')
const path = require('path')
const mongoose = require('mongoose')
const { authMiddleware } = require('./utils/tokenVerfy.js')



// 连接数据库
// 连接到MongoDB数据库
mongoose.connect('mongodb://127.0.0.1:27017/CatTrail', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('数据库链接成功')
}).catch((err) => {
    console.log(err);
    console.log("数据库链接失败 error")
})





//配置获取post请求体
var bodyParser = require("body-parser")
app.use(bodyParser.json({ limit: '100mb' }))
app.use(bodyParser.urlencoded({ limit: '100mb', extended: false }))


//开放静态资源文件
app.use('/public/uploads/cart', express.static(path.join(__dirname, '/public/uploads/cart')))
app.use('/public/uploads/userimg', express.static(path.join(__dirname, '/public/uploads/userimg')))
app.use('/public/uploads/storybook', express.static(path.join(__dirname, '/public/uploads/storybook')))


//前端路由 导入路由
const HomeRouter = require('./routes/home.js')// 首页
const RegisterRouter = require('./routes/register.js') // 注册
const LoginRoutert = require('./routes/login.js')// 登录
const ReleaseRouter = require('./routes/release.js')// 上传模块
const Detail = require('./routes/detail.js')// 详情模块
const UserRouter = require('./routes/user.js')// 用户中心模块
const StoryRouter = require('./routes/story.js')// 猫迹故事模块







//后端路由
const BgLogin = require('./routes/background/login.js')// 后端登录
const { sh_llmgl, sh_user } = require('./routes/background/sh.js')// 后端流浪猫审核



// 允许跨域
app.use(cors())

// 解析数据
app.use(express.urlencoded({ extended: true }))



// 验证tken
app.use(authMiddleware)


// 配置路由
app.use('/api', HomeRouter)  // 首页
app.use('/api', RegisterRouter)// 注册
app.use('/api', LoginRoutert)// 登录
app.use('/api', ReleaseRouter)// 上传
app.use('/api', Detail)// 帖子详情 收藏 点赞 评论 等功能
app.use('/api', UserRouter)// 修改头像 名称等功能
app.use('/api', StoryRouter)// 上传故事 用户删除模块




// 后端配置的路由
app.use('/api', BgLogin)// 后端登录
// app.use('/api', ShLlmGl)// 审核流浪猫管理
app.use('/api', sh_llmgl)
app.use('/api', sh_user)


app.listen(3000, () => {
    console.log('服务器启动成功,请访问：localhost:3000')
}) 