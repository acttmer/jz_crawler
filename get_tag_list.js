const fs = require('fs')
const request = require('request-promise-native')

async function getTags() {
    let list = []

    let tags = await request({
        uri: 'http://www.jiuzhang.com/api/tag/',
        json: true
    })

    console.log('Found ' + tags.length + ' tags')

    for (let tag of tags) {
        if (tag.solution_count > 0) {
            list.push(tag.unique_name)
        }
    }
    console.log(' - Processed ' + list.length + ' tags')

    return list
}

~async function () {
    let data = await getTags()
    fs.writeFileSync('tag_list.json', JSON.stringify(data), 'utf-8')
}()