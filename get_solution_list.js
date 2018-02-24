const fs = require('fs')
const request = require('request-promise-native')
const problems = require('./problem_list.json')

const snooze = ms => new Promise(resolve => setTimeout(resolve, ms))

async function getSolutions() {
    let list = []
    let counter = 0

    console.log('Total number of problems: ' + problems.length)

    for (let problem of problems) {
        try {
            let highlight_tags = await request({
                uri: 'http://www.jiuzhang.com/api/solution/' + problem.unique_name + '/get_highlight_tags/',
                json: true,
                timeout: 10000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.167 Safari/537.36',
                    'Host': 'www.jiuzhang.com',
                    'Referer': 'http://www.jiuzhang.com/solution/' + problem.unique_name
                }
            })

            let suffix = ''
            if (highlight_tags[0].count > 0) {
                suffix += '&is_highlight=true'
            }

            let language_tags = await request({
                uri: 'http://www.jiuzhang.com/api/solution/' + problem.unique_name + '/get_language_tags/?from=cu' + suffix,
                json: true,
                timeout: 10000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.167 Safari/537.36',
                    'Host': 'www.jiuzhang.com',
                    'Referer': 'http://www.jiuzhang.com/solution/' + problem.unique_name
                }
            })

            console.log('Problem {Id=' + problem.id + '}')

            let solutions = []

            for (let language of language_tags) {
                let final_suffix = suffix + '&language=' + language.value

                let codedata = await request({
                    uri: 'http://www.jiuzhang.com/api/solution_code/get_code_list/?unique_name=' + problem.unique_name + final_suffix,
                    json: true,
                    timeout: 10000,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.167 Safari/537.36',
                        'Host': 'www.jiuzhang.com',
                        'Referer': 'http://www.jiuzhang.com/solution/' + problem.unique_name
                    }
                })
                
                solutions.push({
                    language: language.name,
                    code: codedata.results[0].code
                })

                await snooze(100)
            }
            
            console.log(' - processed ' + language_tags.length + ' languages')

            list.push({
                id: problem.id,
                unique_name: problem.unique_name,
                title: problem.title,
                description: problem.description,
                solutions: solutions 
            })

            counter++
            console.log(' - Totally processed ' + counter + ' problems')
            
        } catch (e) {
            fs.writeFileSync('cache/__cache_solution_list', JSON.stringify(list), 'utf-8')
            console.log('*** Failed to process Problem {id=' + problem.id + '}')
        }

        await snooze(100)

        /*if (counter % 43 == 0) {
            console.log('=====> We must have a rest ^_^ <=====')
            await snooze(75000)
        }*/
    }

    return list
}

~async function () {
    let data = await getSolutions()
    fs.writeFileSync('solution_list.json', JSON.stringify(data), 'utf-8')
}()