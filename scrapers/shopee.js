import Utils from '../utils/Utils.js'
import Captcha from '../utils/Captcha.js'
import path from 'path'
import fs from 'fs'
import 'dotenv/config'

const shopeeScrapper = async (url = 'https://shopee.com.br/Razer-Mouse-%C3%93ptico-Ergon%C3%B4mico-De-DeathAdder-6400DPI-Com-Fio-USB-i.262478502.12540969018') => {
  Utils.createIfNotExists('./captcha')
  const browser = await Utils.launchBrowser(false)

  const page = await browser.newPage()

  await page.set
  await page.setDefaultNavigationTimeout(0)
  await page.goto(url)

  await Utils.sleep(5000)

  await page.click('#main > div > div.baUdvi > div > div.aktksg > button.DYKctS.hqfBzL.NfY4UB.CEiA6B.ukVXpA')

  await Utils.sleep(5000)

  await page.type('input[name="loginKey"]', process.env.LOGIN_KEY)
  await page.type('input[name="password"]', process.env.PASSWORD)

  await Utils.sleep(2000)

  await page.click('#main > div > div.uqT7Nz > div > div > div > div:nth-child(2) > div > div.p7oxk2 > form > div.biFZbP > div.q18aRr > button')

  await page.click('#main > div > div.uqT7Nz > div > div > div > div:nth-child(2) > div > div.p7oxk2 > form > button')

  await Utils.sleep(1000)

  await page.pdf({
    path: 'screenshot.pdf',
    format: 'a4',
    margin: {
      top: '10px',
      right: '0px',
      bottom: '10px',
      left: '0px',
    },
  })

  await page.screenshot({ path: 'screenshot.png' })

  // get current url
  const currentUrl = await page.url()

  await page.screenshot({ path: 'screenshot.png' })





  // const { formatedPrice, formatedFrete } = Utils.formatPrices(
  //   price,
  //   frete
  // )


  await browser.close()

  return { price: formatedPrice, frete: formatedFrete }

}

shopeeScrapper()

const getCaptchaImageAndResolve = async (
  page,
  captchaKey,
  selector,
  caminhoArquivo
) => {
  const captcha = await page.$(selector)
  await captcha.screenshot({
    path: caminhoArquivo,
    omitBackground: true,
  })

  const fileContent = fs.readFileSync(caminhoArquivo)
  const captchaBase64 = Buffer.from(fileContent).toString('base64')

  const captchaResponse = await Captcha.enviaCaptcha(captchaBase64, captchaKey)
  const taskId = captchaResponse.split('|')[1]
  await Utils.sleep(2000)
  const captchaResolvido = await Captcha.pegaCaptcha(taskId, captchaKey)

  await page.type('#captchacharacters', captchaResolvido)
  await page.click('button')
  await Utils.sleep(2000)
}

export default shopeeScrapper
