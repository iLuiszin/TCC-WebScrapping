import Utils from '../utils/Utils.js'
import Captcha from '../utils/Captcha.js'
import fs from 'fs'
import 'dotenv/config'

const aliexpressScraper = async (url) => {
  try {
    Utils.createIfNotExists('./captcha')

    const browser = await Utils.launchBrowser('new')

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

    let price = ''

    if (
      src ===
      'https://ae01.alicdn.com/kf/Sa88c45fd792549109cf6ff034b556a2eY/256x32.png_.webp'
    ) {
      price = await page.$eval(
        '#root > div > div.pdp-body.pdp-wrap > div > div.pdp-body-top-left > div.pdp-info > div.pdp-info-right > div.price--wrap--tA4MDk4.product-price.price--hasDiscount--LTvrFnq > div.price--original--qDQaH8V > span.price--originalText--Zsc6sMv',
        (el) => el.innerText
      )
    } else {
      const priceDiv = await page.$(
        '#root div.price--current--H7sGzqb.product-price-current > div'
      )

      const priceSpans = await priceDiv.$$('span')

      for (const span of priceSpans) {
        price += await page.evaluate((span) => span.innerText, span)
      }
    }

    const freteDiv = await page.$(
      '#root > div > div.pdp-body.pdp-wrap > div > div.pdp-body-top-right > div > div > div.shipping--wrap--Dhb61O7 > div > div.shipping--content--xEqXBXk'
    )
    let icms = '';
    if (await page.$('#root > div > div.pdp-body.pdp-wrap > div > div.pdp-body-top-left > div.pdp-info > div.pdp-info-right > div.vat-installment--wrap--VAGtT5q > a')) {
      icms = await page.$eval(
        '#root > div > div.pdp-body.pdp-wrap > div > div.pdp-body-top-left > div.pdp-info > div.pdp-info-right > div.vat-installment--wrap--VAGtT5q > a',
        (el) => el.innerText
      )

    }

    const frete = await freteDiv.$eval('strong', (el) => el.innerText)
    const { formatedPrice, formatedFrete, formatedICMS } = Utils.formatPrices(
      price,
      frete,
      icms
    )

    await browser.close()
    return {
      price: formatedPrice,
      frete: formatedFrete,
      icms: formatedICMS
    }
  } catch (error) {
    console.log(error)
    return error
  }
}


export default aliexpressScraper
