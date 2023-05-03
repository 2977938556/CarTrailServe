const express = require('express');
const path = require('path')
const router = express.Router();
const { v4: uuidv4 } = require('uuid')
const fs = require('fs');



const carouselData = [
    {
        id: 1,
        title: '轮播图1',
        imgUrl: 'https://n.sinaimg.cn/edu/transform/20161129/vFH5-fxycika9082742.jpg'
    },
    {
        id: 2,
        title: '轮播图2',
        imgUrl: 'https://mobile-img-baofun.zhhainiao.com/pcwallpaper_ugc_mobile/static/6e5ac7fde3e7e67b5eb8b1aa470124cc.jpg?x-oss-process=image%2Fresize%2Cm_lfit%2Cw_640%2Ch_1138'
    },
    {
        id: 3,
        title: '轮播图2',
        imgUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSn_9ltm95qVWV0e1Qa-IVBFb7WdR2xcmIgQ4fLrAfjYfWxZ6sdN4zFTrionvvp8NRRRzg&usqp=CAU'
    }
];




router.get('/home/banner', (req, res) => {
    res.json({
        code: 200,
        message: "ok",
        result: carouselData
    });
});





// 定义一个 保存的位置
let savePath = path.join(__dirname, `../upload/cart/`);





// 创建一个multer实例，设置上传文件的保存目录
router.post('/release/filte', (req, res) => {
    let { fileData, inputData } = req.body
    // 文件后缀名
    let imgType = "";
    // 固定名称
    let uuid = ""
    const tasks = fileData.map(({ key, reader }) => {
        return new Promise((resolve, rejects) => {
            let savePath = path.join(__dirname, `../public/uploads/cart/`);
            let uuid = uuidv4()
            // 处理后缀名
            imgType = key.type.substring(key.type.lastIndexOf(".") + 1);
            // 拼接的保存路劲
            savePath = `${savePath}${uuid}.${imgType}`
            // 这个是数据二进制的
            let imgBuff = Buffer.from(reader.split(',')[1], 'base64');


            // 写入数据
            fs.writeFile(savePath, imgBuff, (err) => {
                if (err) {
                    rejects("错误")
                } else {
                    resolve(`/public/uploads/cart/${uuid}.${imgType}`)
                }
            })
        })
    })





    Promise.all(tasks).then(value => {
        // console.log(value);

        // 这里是获取上传的路径然后可以存入数据库
        res.json({
            code: 200,
            message: "ok",
            result: { message: "上传成功" }
        });
    }).catch(e => {
        console.log("错误了");
    })



    // 目前测试到这里 项目初始化 2023/5/3


});







module.exports = router;