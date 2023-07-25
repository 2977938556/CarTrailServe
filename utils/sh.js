// 获取各个审核模块的列表数据的函数
function GetDaat({ modules, query, pageSize, page, stores = { updated_at: 1 } }) {
    return new Promise(async (resolve, reject) => {
        // 总条数
        let totals = await modules.collection.countDocuments(query);
        // 有多少页数据
        let pageCounts = Math.ceil(totals / pageSize);
        // 查询数据并查询出发布者的数据并通过分页的方式返回数据
        let datas = await modules.find(query).populate('user_id').sort(stores).skip((page - 1) * pageSize).limit(pageSize)

        if (datas != null) {
            resolve({
                totals,
                pageCounts,
                datas
            })
        } else {
            reject(new Error("获取数据失败"))
        }
    })
}


// 基于提交的数据返回一个查询条件
// 这里分别是查询的条件，input查询的参数 是否是用户
function GetQuery(type, searchVal, typeofs) {
    let query = {}
    const regExp = new RegExp(searchVal, 'is'); // 不区分大小写匹配

    // 这里的状态是指g关于流浪猫的情况
    if (type == "whole") {
        query = {}
    } else {
        // 这里就是返回数据回去
        // 这里是特殊情况由于用户没有数据to_examine 属性所以呢就需要进行判断一下
        // query.role = type
        // 这里需要进行一个判断这里因为是用户模块所以需要设置判断是否是yjgl
        if (typeofs == 'yhgl') {
            query.role = type
        } else {
            query.to_examine = type
        }

    }

    // 这里是搜索的条件
    if (searchVal != "") {
        query.title = regExp
        query.content = regExp
    }



    return query
}





module.exports = {
    GetDaat,
    GetQuery
};