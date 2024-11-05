import * as chromeLauncher from 'chrome-launcher'
import CDP from 'chrome-remote-interface'
import path from 'path'
import fs from 'fs'
import os from 'os'
import * as rimraf from 'rimraf'
import pdf from 'pdf-parse/lib/pdf-parse.js'

const shopeeScrapper = async (
  url = 'https://shopee.com.br/Razer-Mouse-%C3%93ptico-Ergon%C3%B4mico-De-DeathAdder-6400DPI-Com-Fio-USB-i.262478502.12540969018'
) => {
  let chrome
  let chromeProfileDir
  let unwantedDir // Diretório indesejado que será criado

  try {
    // Definir um caminho manualmente dentro do /tmp do WSL
    chromeProfileDir = '/tmp/chrome-temp-profile'

    // Verificar se o diretório existe e criar se necessário
    if (!fs.existsSync(chromeProfileDir)) {
      fs.mkdirSync(chromeProfileDir, { recursive: true })
      console.log(`Diretório temporário criado: ${chromeProfileDir}`)
    }

    // Função para iniciar o Chrome
    async function launchChrome() {
      return await chromeLauncher.launch({
        chromeFlags: ['--no-first-run', '--disable-gpu', '--no-sandbox'],
        chromePath: '/usr/bin/google-chrome',
        userDataDir: chromeProfileDir,
      })
    }

    chrome = await launchChrome()
    const protocol = await CDP({ port: chrome.port })

    const { Page, Runtime } = protocol

    await Page.enable()
    await Page.navigate({ url })
    await Page.loadEventFired()

    await new Promise((resolve) => setTimeout(resolve, 5000))

    const bodyHtml = await Runtime.evaluate({
      expression: `
        document.querySelector('body').innerHTML
      `,
    })

    const html = bodyHtml.result.value

    const priceRegex = /R\$\d{1,3}(?:\.\d{3})*,\d{2}/g

    const prices = html.match(priceRegex)

    let productPrice = null
    let lowestFretePrice = null

    prices.forEach((price) => {
      const value = parseFloat(price.replace('R$', '').replace(',', '.'))

      if (value > 30) {
        if (productPrice === null || value < productPrice) {
          productPrice = value
        }
      } else if (value <= 30) {
        if (lowestFretePrice === null || value < lowestFretePrice) {
          lowestFretePrice = value
        }
      }
    })

    await protocol.close()
    await chrome.kill()
    return { price: productPrice, frete: lowestFretePrice }
  } catch (error) {
    console.error('Erro ao iniciar o Chrome:', error)
  } finally {
    if (chromeProfileDir) {
      rimraf.sync(chromeProfileDir)
      console.log(`Diretório temporário ${chromeProfileDir} excluído.`)
    }

    // Remover diretórios indesejados que incluem "wsl.localhost"
    try {
      const baseDir = '/home/luis/workspace/study/TCC-WebScrapping'
      const dirContents = fs.readdirSync(baseDir)

      dirContents.forEach((dir) => {
        const fullPath = path.join(baseDir, dir)
        if (
          fs.statSync(fullPath).isDirectory() &&
          fullPath.includes('wsl.localhost')
        ) {
          rimraf.sync(fullPath)
          console.log(`Diretório indesejado ${fullPath} excluído.`)
        }
      })
    } catch (err) {
      console.error(`Erro ao excluir o diretório indesejado: ${err.message}`)
    }

    if (chrome) {
      await chrome.kill()
    }
  }
}

export default shopeeScrapper
