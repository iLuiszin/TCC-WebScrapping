import Utils from '../utils/Utils.js'
import Captcha from '../utils/Captcha.js'
import fs from 'fs'
import 'dotenv/config'

const aliexpressScraper = async (url) => {
  try {
    Utils.createIfNotExists('./captcha')

    const browser = await Utils.launchBrowser(false)

    const page = await browser.newPage()
    page.setDefaultNavigationTimeout(0)
    await page.goto(url)

    const image = await page.$(
      '#root > div > div.pdp-body.pdp-wrap > div > div.pdp-body-top-left > div.pdp-info > div.pdp-info-right > div:nth-child(1) > div > div'
    )

    let src

    if (image && (await image.$('img'))) {
      src = await image.$eval('img', (el) => el.src)
    }

    const price = await page.$eval(
      'span[class*="currentPriceText"]',
      (el) => el.innerText
    )

    const icmsText = await page.$eval(
      'a[class*="installment--item"]',
      (el) => el.innerText
    )

    const icms = icmsText.match(/R\$[0-9,.]+/)[0]

    const freteText = await page.$eval(
      'div[class*="dynamic-shipping-titleLayout"] > span > span > strong',
      (el) => el.innerText
    )

    const frete = freteText.includes('Frete grátis')
      ? '0,00'
      : freteText.match(/R\$[0-9,.]+/)[0]

    const { formatedPrice, formatedFrete, formatedICMS } = Utils.formatPrices(
      price,
      frete,
      icms
    )

    await browser.close()
    return {
      price: formatedPrice,
      frete: formatedFrete,
      icms: formatedICMS,
    }
  } catch (error) {
    console.log(error)
    return error
  }
}

export default aliexpressScraper
