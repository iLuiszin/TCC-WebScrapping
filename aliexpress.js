import Utils from './utils/Utils.js'
import Captcha from './utils/Captcha.js'
import fs from 'fs'
import 'dotenv/config'

const aliexpressScraper = async () => {
  Utils.createIfNotExists('./captcha')

  const browser = await Utils.launchBrowser()

  const page = await browser.newPage()
  page.setDefaultNavigationTimeout(0)
  await page.goto(
    'https://pt.aliexpress.com/item/32368600785.html?spm=a2g0o.productlist.main.65.6d0f4d27d5Epmm&algo_pvid=6c54b1d7-73de-4d75-93fb-0edbbaaec693&algo_exp_id=6c54b1d7-73de-4d75-93fb-0edbbaaec693-33&pdp_npi=4%40dis%21BRL%2117.46%2117.46%21%21%213.34%213.34%21%402103250717102848882343705edf98%2161516383089%21sea%21BR%211679525897%21&curPageLogUid=Db5sF1FmoopE&utparam-url=scene%3Asearch%7Cquery_from%3A'
  )

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

  const frete = await freteDiv.$eval('strong', (el) => el.innerText)

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

export default aliexpressScraper
