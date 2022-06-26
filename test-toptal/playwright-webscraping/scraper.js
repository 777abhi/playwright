const { chromium } = require('playwright')
const random_useragent = require('random-useragent')
const fs = require('fs')

const BASE_URL = 'https://github.com/topics/playwright'

;(async () => {
  //create Random agent
  const agent = random_useragent.getRandom()

  //Setup Browser
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    userAgent: agent,
  })
  const page = await context.newPage({ bypassCSP: true })
  await page.setDefaultTimeout(30000)
  await page.setViewportSize({ width: 800, height: 600 })
  await page.goto(BASE_URL)

  //Get Data for website
  const repositories = await page.$$eval('article.border', (repoCards) => {
    return repoCards.map((card) => {
      const [user, repo] = card.querySelectorAll('h3 a')

      const formatText = (element) => element && element.innerText.trim()

      return {
        user: formatText(user),
        repo: formatText(repo),
        url: repo.href,
      }
    })
  })

  //Store data into file

  const logger = fs.createWriteStream('data.txt', { flags: 'w' })
  logger.write(JSON.stringify(repositories,null,' '));

  // close browser
  await browser.close()
})().catch((error) => {
  console.log(error)
  process.exit(1)
})
