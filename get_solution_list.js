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
                    'Cookie': '__cfduid=d1e03dad38c7968597dd5c7115609ec2b1519364912; _ga=GA1.2.801675240.1519364916; _gid=GA1.2.177831493.1519364916; csrftoken=bQApIgDRNPtkRo3oXFTHwEmATXY94fHB; sessionid=vrvao0msd0yrw7b8r1m6yn2p6jmv3byf; _gat=1' + Math.random()
                }
            })

            let suffix = ''
            if (highlight_tags[0].count > 0) {
                suffix += '&is_highlight=true'
            }

            await snooze(100)

            let language_tags = await request({
                uri: 'http://www.jiuzhang.com/api/solution/' + problem.unique_name + '/get_language_tags/?from=cu' + suffix,
                json: true,
                timeout: 10000,
                headers: {
                    'Cookie': '__cfduid=d1e03dad38c7968597dd5c7115609ec2b1519364912; _ga=GA1.2.801675240.1519364916; _gid=GA1.2.177831493.1519364916; csrftoken=bQApIgDRNPtkRo3oXFTHwEmATXY94fHB; sessionid=vrvao0msd0yrw7b8r1m6yn2p6jmv3byf; _gat=1' + Math.random()
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
                        'Cookie': '__cfduid=d1e03dad38c7968597dd5c7115609ec2b1519364912; _ga=GA1.2.801675240.1519364916; _gid=GA1.2.177831493.1519364916; csrftoken=bQApIgDRNPtkRo3oXFTHwEmATXY94fHB; sessionid=vrvao0msd0yrw7b8r1m6yn2p6jmv3byf; _gat=1' + Math.random()
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