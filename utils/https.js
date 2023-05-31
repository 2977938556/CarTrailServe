const os = require('os');

// 获取当前服务器的ip地址，端口是固定的3000e
exports.GetIp = () => {
    return new Promise((resolve, reject) => {
        const interfaces = os.networkInterfaces();
        let address = null;
        for (const name of Object.keys(interfaces)) {
            for (const iface of interfaces[name]) {
                if (iface.family !== 'IPv4' || iface.internal !== false) {
                    // 跳过它不是IPv4或内部接口的地址
                    continue;
                }
                // 找到匹配的 IP 地址
                address = iface.address;
                break;
            }
            if (address) {
                resolve(address)
                break;
            } else {
                reject(new Error("服务器错误请重试"))
            }
        }
    })
}