const express = require('express')
const app = express()
const cors = require('cors')
const path = require('path')
const http = require('http');
const mongoose = require('mongoose')
const { authMiddleware } = require('./utils/tokenVerfy.js')
const { Userpermissions } = require('./utils/Userpermissions.js')





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
app.use('/public/uploads', express.static(__dirname + '/public/uploads'));



//前端路由 导入路由
const HomeRouter = require('./routes/home.js')// 首页
const RegisterRouter = require('./routes/register.js') // 注册
const LoginRoutert = require('./routes/login.js')// 登录
const ReleaseRouter = require('./routes/release.js')// 上传模块
const Detail = require('./routes/detail.js')// 详情模块
const UserRouter = require('./routes/user.js')// 用户中心模块
const StoryRouter = require('./routes/story.js')// 猫迹故事模块
const UploadsRouter = require('./routes/upload.js')// 上传模块【测试七牛云】
const AcatilyRouter = require('./routes/activit.js')// 活动模块
const GuideRouter = require('./routes/guide.js')// 养猫指南模块
const MessageRouter = require('./routes/Message.js')// 领养申请模块
const SearchHistory = require('./routes/search.js')// 搜索模块



//后端路由
const BgLogin = require('./routes/background/login.js')// 后端登录
const Bgregster = require('./routes/background/register.js')// 后端登录
const { sh_llmgl, echarts } = require('./routes/background/sh.js');// 后端流浪猫审核
const BgConfig = require('./routes/background/config.js')// 配置模块


const { Socket } = require('socket.io');



// 允许跨域
app.use(cors())

// 解析数据
app.use(express.urlencoded({ extended: true }))


// 验证tken
app.use(authMiddleware)

// 验证用户
app.use(Userpermissions)


// 配置路由
app.use('/api', HomeRouter)  // 首页
app.use('/api', RegisterRouter)// 注册
app.use('/api', LoginRoutert)// 登录
app.use('/api', ReleaseRouter)// 上传
app.use('/api', Detail)// 帖子详情 收藏 点赞 评论 等功能
app.use('/api', UserRouter)// 修改头像 名称等功能
app.use('/api', StoryRouter)// 上传故事 用户删除模块
app.use('/api', UploadsRouter)// 上传模块
app.use('/api', AcatilyRouter)// 活动模块
app.use('/api', GuideRouter)// 养猫指南模块
app.use('/api', MessageRouter)// 信息模块
app.use('/api', SearchHistory)// 信息模块





// 配置模块
require('./utils/config..js')




// 后台管理模块
app.use('/api', BgLogin)// 后端登录
app.use('/api', sh_llmgl)// 审核模块
app.use('/api', Bgregster)// 注册
app.use('/api', echarts)// 注册
app.use('/api', BgConfig)// 注册




const PORT1 = 3000; // 网页服务使用的端口号
const PORT2 = 8200; // webSocket





//  这个是ws 服务配置文件
const socketIO = require('socket.io');
const app2 = express();
// 设置一个新的服务
const server2 = http.createServer(app2);

const io = socketIO(server2, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

// 解决跨域
app2.use(cors())


let { UserSocket } = require('./routes/webSocket/index.js')
UserSocket(io)
// // 处理 WebSocket 连接事件



// 这个是网页基础服务
app.listen(PORT1, () => {
    console.log('基础服务已经启动,请访问：localhost:3000')
})

// ws服务
server2.listen(PORT2, () => {
    console.log(`webSocket服务已经启动请访问 ${PORT2}`);
});
