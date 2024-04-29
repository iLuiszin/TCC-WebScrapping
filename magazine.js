import Utils from './utils/Utils.js'
import Captcha from './utils/Captcha.js'
import path from 'path'
import fs from 'fs'
import 'dotenv/config'

const magazineScrapper = async (url = 'https://www.magazineluiza.com.br/mouse-gamer-razer-deathadder-essential-mechanical-switch-5-botoes-6400dpi-preto/p/jb07fh578f/in/mger/') => {
  Utils.createIfNotExists('./captcha')

  const nomeArquivo = `captcha-${Math.floor(Math.random() * 1000000)}.png`
  const downloadFolder = path.resolve('./captcha')
  const caminhoArquivo = path.join(downloadFolder, nomeArquivo)
  const browser = await Utils.launchBrowser()

  const page = await browser.newPage()


  await page.setDefaultNavigationTimeout(0)
  await page.goto(url)

  await page.click('#__next > div > main > section:nth-child(7) > div.sc-fqkvVR.jHtlDv > div.sc-dhKdcB.ccRGAF.sc-cezyBN.cAGJQN > span')

  await page.waitForSelector('#zipcode')

  await page.type('#zipcode', '70200-730')

  await Utils.sleep(5000)

  const price = await page.$eval(
    '#__next > div > main > section:nth-child(7) > div.sc-dcJsrY.bCfntu > div:nth-child(1) > div > div > div > p',
    (el) => el.innerText
  )

  const frete = await page.$eval(
    '#\\31  > p.sc-kpDqfm.eCPtRw.sc-jBeBSR.kpbDDL',
    (el) => el.innerText
  )

  const { formatedPrice, formatedFrete } = Utils.formatPrices(
    price,
    frete
  )


  await browser.close()

  return { price: formatedPrice, frete: formatedFrete }

}

magazineScrapper()

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

export default magazineScrapper
