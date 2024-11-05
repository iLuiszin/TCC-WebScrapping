import fs from 'node:fs'
import puppeteer from 'puppeteer-extra'
import RecaptchaPlugin from 'puppeteer-extra-plugin-recaptcha'
import { v4 as uuidv4 } from 'uuid'
import path from 'node:path'
import axios from 'axios'
import pdfjs from 'pdfjs-dist'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import userPrefs from 'puppeteer-extra-plugin-user-preferences'
import { executablePath } from 'puppeteer'

export default class Utils {
  // Seta todas as configurações para o download
  static async configureDownloadSettings(client, downloadFolder) {
    await client.send('Browser.setDownloadBehavior', {
      behavior: 'allowAndName',
      downloadPath: downloadFolder,
      eventsEnabled: true,
    })
  }

  // Gera um nome único para o arquivo
  static generateFileName(name) {
    return `${name.replace(/[./-]/g, '')}-${uuidv4()}.pdf`
  }

  // Espera um seletor e clica em um outro (pode ser o mesmo também)
  static async waitForSelectorAndClick(page, waitForSelector, clickSelector) {
    await page.waitForSelector(waitForSelector)
    await page.click(clickSelector)
  }

  // Clica em um elemento e espera a navegação para outra pagina
  static async clickAndWaitForNavigation(page, clickSelector) {
    await Promise.all([page.click(clickSelector), page.waitForNavigation()])
  }

  // Inicia o browser
  static async launchBrowser(headlessOption = false) {
    puppeteer.use(StealthPlugin())
    const browser = await puppeteer.launch({
      headless: headlessOption,
      slowMo: 20,
      executablePath: executablePath('chrome'),
    })
    return browser
  }

  static async sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  // Ativa o plugin do recaptcha
  static async activateRecaptchaPlugin(id, token) {
    puppeteer.use(
      RecaptchaPlugin({
        provider: {
          id,
          token,
        },
        visualFeedback: true,
      })
    )
  }

  // Cria a pasta caso não exista
  static createIfNotExists(directoryName) {
    if (!fs.existsSync(directoryName)) {
      fs.mkdirSync(directoryName)
      console.log(`Diretório '${directoryName}' criado com sucesso.`)
    }
  }

  // Deleta a pasta caso exista
  static deleteIfExists(filePath) {
    if (fs.existsSync(filePath)) {
      fs.rmSync(filePath, { recursive: true })
    }
  }

  static formatPrices(price, frete, icms = 0) {
    const regexPrice = /R\$\s\d+,\d{2}/
    const regexNumbers = /\d+(\.\d+)?/g
    const priceFrete = frete.match(regexPrice) ?? frete.match(regexNumbers)
    const numbersFrete = priceFrete ? priceFrete[0].match(regexNumbers) : null
    const numbersPrice = price.match(regexNumbers)

    if (numbersPrice.length > 2) {
      numbersPrice.pop()
    }

    const numbersICMS = icms != 0 ? icms.match(regexNumbers) : null
    const formatedFrete = numbersFrete ? numbersFrete.join('.') : 0
    const formatedPrice = numbersPrice ? numbersPrice.join('.') : 0
    const formatedICMS = numbersICMS ? numbersICMS.join('.') : 0

    return {
      formatedPrice: parseFloat(formatedPrice),
      formatedFrete: parseFloat(formatedFrete),
      formatedICMS: parseFloat(formatedICMS),
    }
  }
}
