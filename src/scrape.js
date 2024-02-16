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
        const domain = item.textContent
        const type = selectType[index].textContent
        const manager = selectTldManager[index].textContent
        console.log('Scraping tld:'+ domain + ', type:' + type + ', manager:' + manager)
        return {
            'domain': domain,
            'type': type,
            'tldManager' : manager
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
