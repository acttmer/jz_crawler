try {
    const problems = require('./problem_list.json')
    console.log('We have found ' + problems.length + ' problems at the moment')
    const solutions = require('./solution_list.json')
    console.log('We have crawled ' + solutions.length + ' problems at the moment')
} catch (e) {

}