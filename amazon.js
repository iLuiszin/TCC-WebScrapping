import Utils from './utils/Utils.js'
import Captcha from './utils/Captcha.js'
import path from 'path'
import fs from 'fs'
import 'dotenv/config'

const amazonScraper = async () => {
  Utils.createIfNotExists('./captcha')

  const nomeArquivo = `captcha-${Math.floor(Math.random() * 1000000)}.png`
  const downloadFolder = path.resolve('./captcha')
  const caminhoArquivo = path.join(downloadFolder, nomeArquivo)
  const browser = await Utils.launchBrowser()

  const page = await browser.newPage()

  await page.goto(
    'https://www.amazon.com.br/Muscula%C3%A7%C3%A3o-Contador-Ajust%C3%A1vel-Antebra%C3%A7o-100kg/dp/B0CS3VC38D?ref_=Oct_d_onr_d_17833917011_1&pd_rd_w=cSAIx&content-id=amzn1.sym.d991f3b3-3107-4a98-bbe4-0100b8e0114c&pf_rd_p=d991f3b3-3107-4a98-bbe4-0100b8e0114c&pf_rd_r=M3PR1EBEBGAJMZ64PP8Z&pd_rd_wg=5mx0k&pd_rd_r=e86a2308-1c6d-4508-8df5-3a8de9591117&pd_rd_i=B0CS3VC38D'
  )

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

  console.log(price)

  const regex = /R\$\s\d+,\d{2}/

  const resultado = frete.match(regex)
  console.log(resultado[0])

  await browser.close()
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
