import Utils from './utils/Utils.js'
import Captcha from './utils/Captcha.js'
import fs from 'fs'
import 'dotenv/config'

const aliexpressScraper = async (url) => {
  Utils.createIfNotExists('./captcha')

  const browser = await Utils.launchBrowser()

  const page = await browser.newPage()
  page.setDefaultNavigationTimeout(0)
  await page.goto(url)

  const image = await page.$(
    '#root > div > div.pdp-body.pdp-wrap > div > div.pdp-body-top-left > div.pdp-info > div.pdp-info-right > div:nth-child(1) > div > div'
  )

  let src

  if (image && (await image.$('img'))) {
    src = await page.$eval('img', (el) => el.src)
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

  const icms = await page.$eval(
    '#root > div > div.pdp-body.pdp-wrap > div > div.pdp-body-top-left > div.pdp-info > div.pdp-info-right > div.vat-installment--wrap--VAGtT5q > a',
    (el) => el.innerText
  )



  const regexNumbers = /\d+(\.\d+)?/g
  const frete = await freteDiv.$eval('strong', (el) => el.innerText)
  const numbersFrete = frete.match(regexNumbers);
  const numbersPrice = price.match(regexNumbers);
  const numbersICMS = icms.match(regexNumbers)
  const formatedFrete = numbersFrete ? numbersFrete.join('.') : 0;
  const formatedPrice = numbersPrice ? numbersPrice.join('.') : 0;
  const formatedICMS = numbersICMS ? numbersICMS.join('.') : 0;



  await browser.close()
  return {
    price: Number(formatedPrice),
    frete: Number(formatedFrete),
    icms: Number(formatedICMS)
  }


}

export default aliexpressScraper
