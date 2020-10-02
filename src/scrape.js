const fs = require('fs')
const got = require('got')
const jsdom = require("jsdom")
const { JSDOM } = jsdom

const url= 'https://www.iana.org/domains/root/db'

got(url).then(response => {
    const dom = new JSDOM(response.body)

    // select element
    const selectDomain = dom.window.document.querySelectorAll('table td:nth-child(1) span a')
    const selectType = dom.window.document.querySelectorAll('table tr td:nth-child(2)')
    const selectTldManager = dom.window.document.querySelectorAll('table tr td:nth-child(3)')

    const domainArray = []
    selectDomain.forEach(fistColumn => {
      domainArray.push(fistColumn.textContent)
    });

    const typeArray = []
    selectType.forEach(secondColumn => {
      typeArray.push(secondColumn.textContent)
    });

    const managerArray = []
    selectTldManager.forEach(thirdColumn => {
      managerArray.push(thirdColumn.textContent)
    });

    // compile all object into json format
    const compileData = []
    domainArray.forEach((item, index)  => {
      const row = {
        'domain': domainArray[index],
        'type': typeArray[index],
        'tldManager' : managerArray[index]
      }
      compileData.push(row)
    })

    const dataJSON = JSON.stringify(compileData)
    // console.log(dataJSON)

    fs.writeFile('../public/iana-tld.json', dataJSON, err => {
      if (err) {
          console.log('Error writing file', err)
      } else {
          console.log('Successfully wrote file')
      }
  })
}).catch(err => {
    console.log(err)
})
