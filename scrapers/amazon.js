import Utils from '../utils/Utils.js'
import Captcha from '../utils/Captcha.js'
import path from 'path'
import fs from 'fs'
import 'dotenv/config'

const amazonScraper = async (url) => {
  try {
    Utils.createIfNotExists('./captcha')

    const nomeArquivo = `captcha-${Math.floor(Math.random() * 1000000)}.png`
    const downloadFolder = path.resolve('./captcha')
    const caminhoArquivo = path.join(downloadFolder, nomeArquivo)
    const browser = await Utils.launchBrowser('new')

    const page = await browser.newPage()

    await page.goto(url)

    if (
      await page.$(
        'body > div > div.a-row.a-spacing-double-large > div.a-section > div > div > form > div.a-row.a-spacing-large > div > div > div.a-row.a-text-center > img'
      )
    ) {
      await getCaptchaImageAndResolve(
        page,
        process.env.CAPTCHA_KEY,
        'body > div > div.a-row.a-spacing-double-large > div.a-section > div > div > form > div.a-row.a-spacing-large > div > div > div.a-row.a-text-center > img',
        caminhoArquivo
      )
      Utils.deleteIfExists(caminhoArquivo)
    }

    await page.waitForSelector('#corePriceDisplay_desktop_feature_div')
    const price = await page.$eval(
      '#corePriceDisplay_desktop_feature_div > div.a-section.a-spacing-none.aok-align-center.aok-relative > span.aok-offscreen',
      (el) => el.innerText
    )

    const frete = await page.$eval(
      '#mir-layout-DELIVERY_BLOCK-slot-PRIMARY_DELIVERY_MESSAGE_LARGE > span',
      (el) => el.innerText
    )

    const { formatedPrice, formatedFrete } = Utils.formatPrices(
      price,
      frete
    )

    await browser.close()

    return { price: formatedPrice, frete: formatedFrete }
  } catch (error) {
    console.log(error)
    return error
  }
}

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

export default amazonScraper
