const fs = require('fs')
const request = require('request-promise-native')
const search_tags = require('./tag_list.json')

async function getProblemsByTags(tags) {
    let list = []
    let added_ids = []

    for (let tag of tags) {
        try {
            let data = await request({
                uri: 'http://www.jiuzhang.com/api/solution/?tags=' + tag,
                json: true,
                timeout: 10000
            })

            console.log('Tag {' + tag + '} has ' + data.length + ' problems')

            let counter = 0

            for (let item of data) {
                if (item.is_private) continue
                if (item.cn_title == '') continue
                if (added_ids.indexOf(item.id) > 0) continue

                added_ids.push(item.id)
                list.push({
                    id: item.id,
                    unique_name: item.unique_name,
                    //en_title: item.title,
                    //en_description: item.description,
                    title: item.cn_title,
                    description: item.cn_description
                })

                counter++
            }
            console.log(' - Processed ' + counter + ' problems')
            
        } catch (e) {
            fs.writeFileSync('cache/__cache_problem_list_until_tag_' + tag + '.json', JSON.stringify(list), 'utf-8')
            console.log('*** Failed to process Tag {' + tag + '}')
        }
    }

    return list
}

~async function () {
    let data = await getProblemsByTags(search_tags)
    fs.writeFileSync('problem_list.json', JSON.stringify(data), 'utf-8')
}()