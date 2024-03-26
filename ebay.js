import Utils from './utils/Utils.js'
import Captcha from './utils/Captcha.js'
import path from 'path'
import fs from 'fs'
import 'dotenv/config'

const ebayScraper = async () => {
  Utils.createIfNotExists('./captcha')

  const nomeArquivo = `captcha-${Math.floor(Math.random() * 1000000)}.png`
  const downloadFolder = path.resolve('./captcha')
  const caminhoArquivo = path.join(downloadFolder, nomeArquivo)
  const browser = await Utils.launchBrowser()

  const page = await browser.newPage()

  await page.setDefaultNavigationTimeout(0)
  await page.goto(
    'https://www.ebay.com/itm/354593770099?_trkparms=amclksrc%3DITM%26aid%3D777008%26algo%3DPERSONAL.TOPIC%26ao%3D1%26asc%3D20230811172246%26meid%3D4849389b282e4adc82cec2715f3ac230%26pid%3D101783%26rk%3D1%26rkt%3D1%26itm%3D354593770099%26pmt%3D0%26noa%3D1%26pg%3D4375194%26algv%3DFeaturedDealsV2&_trksid=p4375194.c101783.m150506&_trkparms=parentrq%3A1b307ad218e0ab8d189db214ffff9c76%7Cpageci%3A295161f3-dcd8-11ee-b301-b67a0d6d7629%7Ciid%3A1%7Cvlpname'
  )

  console.log('teste')

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

  await page.waitForSelector(
    '#mainContent > div.vim.d-vi-evo-region > div.vim.x-price-section.mar-t-20 > div > div > div.x-price-approx > span.x-price-approx__price > span'
  )
  const price = await page.$eval(
    '#mainContent > div.vim.d-vi-evo-region > div.vim.x-price-section.mar-t-20 > div > div > div.x-price-approx > span.x-price-approx__price > span',
    (el) => el.innerText
  )

  console.log(price)

  const frete = await page.$eval(
    '#mir-layout-DELIVERY_BLOCK-slot-PRIMARY_DELIVERY_MESSAGE_LARGE > span',
    (el) => el.innerText
  )

  console.log(price)
  console.log(frete)

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

export default ebayScraper
