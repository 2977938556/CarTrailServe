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

router.get('/', (req, res) => {
    res.send("Hello World")
});


router.get('/home/banner', (req, res) => {
    res.json({
        code: 200,
        message: "ok",
        result: carouselData
    });
});










module.exports = router;