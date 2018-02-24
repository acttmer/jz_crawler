const fs = require('fs')
const request = require('request-promise-native')
const problems = require('./problem_list.json')

async function getSolutions() {
    let list = []
    let counter = 0

    console.log('Total number of problems: ' + problems.length)

    for (let problem of problems) {
        try {
            let data = await request({
                uri: 'http://www.jiuzhang.com/api/solution_code/get_code_list/?unique_name=' + problem.unique_name + '&language=1',
                json: true,
                timeout: 10000
            })

            console.log('Problem {Id=' + problem.id + '}')

            list.push({
                id: problem.id,
                unique_name: problem.unique_name,
                title: problem.title,
                description: problem.description,
                code: data.results[0].code
            })

            counter++
            console.log(' - Totally processed ' + counter + ' problems')
            
        } catch (e) {
            fs.writeFileSync('cache/__cache_solution_list', JSON.stringify(list), 'utf-8')
            console.log('*** Failed to process Problem {id=' + problem.id + '}')
        }
    }

    return list
}

~async function () {
    let data = await getSolutions()
    fs.writeFileSync('solution_list.json', JSON.stringify(data), 'utf-8')
}()