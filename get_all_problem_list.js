const fs = require('fs')
const request = require('request-promise-native')

async function getAllProblems() {
    let list = []

    let data = await request({
        uri: 'http://www.jiuzhang.com/api/solution/?search=+',
        json: true,
        timeout: 20000
    })
    
    console.log('Found ' + data.length + ' problems')

    let counter = 0

    for (let item of data) {
        if (item.is_private) continue
        if (!item.cn_title || item.cn_title == '') continue
        if (!item.cn_description || item.cn_description == '') continue

        list.push({
            id: item.id,
            unique_name: item.unique_name,
            title: item.cn_title,
            description: item.cn_description
        })
        counter++
    }
    
    console.log(' - Processed ' + counter + ' problems')

    return list
}

~async function () {
    let data = await getAllProblems()
    fs.writeFileSync('problem_list.json', JSON.stringify(data), 'utf-8')
}()