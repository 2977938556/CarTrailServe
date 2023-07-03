const express = require('express');
const router = express.Router();
const User = require('../models/User.js')
const { v1 } = require('uuid')
const path = require('path')
const fs = require('fs');
const { GetIp } = require('../utils/https.js')
const qiniu = require('qiniu');




router.post('/upload/img', async (req, res) => {
    // 获取传递过来的base64Url
    let imgBase64 = req.body.base64

    const base64Data = imgBase64.replace(/^data:image\/\w+;base64,/, '');// 这个是只截取base64后面的内容部分
    const buffer = Buffer.from(base64Data, 'base64');// 这个转换成bufer流

    // 第三步：配置七牛云密钥和存储区域
    const accessKey = 'PS0cYPFZ5iCPBXDFD5CTQSUtdarhKgfnkaQrmP0v';
    const secretKey = 'QcvYXO5mH743vhaVeiQHaW3XBRMjx2SEX_QQri-W';
    const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);

    const options = {
        scope: 'abcdefg',
    };
    const config = new qiniu.conf.Config();
    config.zone = qiniu.zone.Zone_z2; // 选择存储区域，例如华南
    let imageUrl = '';


    function uploadImageToQiniu(imagePath, imageName) {
        const putPolicy = new qiniu.rs.PutPolicy(options);
        const uploadToken = putPolicy.uploadToken(mac);

        // const base64Image = fs.readFileSync(imagePath, { encoding: 'base64' });

        const formUploader = new qiniu.form_up.FormUploader(config);
        const putExtra = new qiniu.form_up.PutExtra();

        formUploader.put(uploadToken, imageName, imagePath, putExtra, function (respErr, respBody, respInfo) {
            if (respErr) {
                throw respErr;
            }
            if (respInfo.statusCode === 200) {
                console.log('文件上传成功:');
                imageUrl = `http://rwyswjtk7.hn-bkt.clouddn.com/${respBody.key}`;
                console.log(imageUrl);
            } else {
                console.log(respErr, respBody, respInfo);
                console.log('文件上传失败:');
            }
        });
    }

    setTimeout(() => {
        uploadImageToQiniu(buffer, `${v1()}.jpg`);

    }, 2000)

})








module.exports = router




        // 构建图片名
        // 构建图片路径
        // var filePath = savePath + '/' + randomChars;
        // //过滤data:URL
        // var dataBuffer = buffer


        // console.log(filePath);



        // const accessKey = 'PS0cYPFZ5iCPBXDFD5CTQSUtdarhKgfnkaQrmP0v';
        // const secretKey = 'QcvYXO5mH743vhaVeiQHaW3XBRMjx2SEX_QQri-W';
        // const bucket = 'abcdefg';

        // var mac = new qiniu.auth.digest.Mac(accessKey, secretKey);

        // //要上传的空间
        // var options = {
        //     scope: bucket,
        //     returnBody: '{"key":"$(key)","hash":"$(etag)","fsize":$(fsize),"bucket":"$(bucket)","name":"$(x:name)"}'
        // };

        // // 构建上传凭证
        // var putPolicy = new qiniu.rs.PutPolicy(options);
        // var uploadToken = putPolicy.uploadToken(mac);

        // var config = new qiniu.conf.Config();
        // config.zone = qiniu.zone.Zone_z2; // 华南区 写你自己的


        // fs.writeFile(filePath, dataBuffer, function (err) {
        //     if (err) {
        //         res.end(JSON.stringify({ status: '102', msg: '文件写入失败' }));
        //     } else {

        //         var formUploader = new qiniu.form_up.FormUploader(config);
        //         var putExtra = new qiniu.form_up.PutExtra();


        //         // 文件上传
        //         formUploader.putFile(uploadToken, randomChars, filePath, putExtra, function (respErr,
        //             respBody, respInfo) {

        //             if (respErr) {
        //                 console.log(respErr);
        //                 return res.end(JSON.stringify({ status: '-1', msg: '上传失败', error: respErr }));
        //             }

        //             if (respInfo.statusCode == 200) {
        //                 var imageSrc = respBody.key; // 这里可以拼接你访问的域名
        //                 console.log(respBody.key);

        //                 res.end(JSON.stringify({ status: '200', msg: '上传成功', imageUrl: imageSrc }));
        //             } else {
        //                 res.end(JSON.stringify({ status: '-1', msg: '上传失败', error: JSON.stringify(respBody) }));
        //             }
        //             // 上传之后删除本地文件
        //             fs.unlinkSync(filePath);
        //         });
        //     }
        // });







