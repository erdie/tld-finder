const fs = require('fs')
const got = require('got')
const { JSDOM } = require("jsdom")

const url= 'https://www.iana.org/domains/root/db'

got(url).then(response => {
    const dom = new JSDOM(response.body)
    const selectDomain = dom.window.document.querySelectorAll('table td:nth-child(1) span a')
    const selectType = dom.window.document.querySelectorAll('table tr td:nth-child(2)')
    const selectTldManager = dom.window.document.querySelectorAll('table tr td:nth-child(3)')

    const compileData = Array.from(selectDomain).map((item, index) => {
        return {
            'domain': item.textContent,
            'type': selectType[index].textContent,
            'tldManager' : selectTldManager[index].textContent
        }
    })

    fs.writeFile('./public/iana-tld.json', JSON.stringify(compileData), err => {
        if (err) {
            console.log('Error writing file', err)
        } else {
            console.log('Successfully wrote file')
        }
    })
}).catch(err => {
    console.log(err)
})
