import fs from 'node:fs'
import puppeteer from 'puppeteer-extra'
import RecaptchaPlugin from 'puppeteer-extra-plugin-recaptcha'
import { v4 as uuidv4 } from 'uuid'
import path from 'node:path'
import axios from 'axios'
import pdfjs from 'pdfjs-dist'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import userPrefs from 'puppeteer-extra-plugin-user-preferences'

export default class Utils {
  // Lê o arquivo e retorna em base64
  static readFileToBase64(filePath) {
    try {
      const fileContent = fs.readFileSync(filePath)
      const base64Data = Buffer.from(fileContent).toString('base64')
      return base64Data
    } catch (error) {
      console.error('Erro ao ler o arquivo:', error)
      throw new Error('Falha ao ler arquivo')
    }
  }

  // Seta todas as configurações para o download
  static async configureDownloadSettings(client, downloadFolder) {
    await client.send('Browser.setDownloadBehavior', {
      behavior: 'allowAndName',
      downloadPath: downloadFolder,
      eventsEnabled: true,
    })
  }

  // Formata o CNPJ para o padrão 00.000.000/0000-00 ou CPF para 000.000.000-00
  static formatCnpjAndCpf(cnpj) {
    if (cnpj.length === 14) {
      return `${cnpj.slice(0, 2)}.${cnpj.slice(2, 5)}.${cnpj.slice(
        5,
        8
      )}/${cnpj.slice(8, 12)}-${cnpj.slice(12)}`
    } else if (cnpj.length === 11) {
      return `${cnpj.slice(0, 3)}.${cnpj.slice(3, 6)}.${cnpj.slice(
        6,
        9
      )}-${cnpj.slice(9)}`
    }
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
  static async launchBrowser() {
    puppeteer.use(StealthPlugin())
    const browser = await puppeteer.launch({
      headless: 'new',
      slowMo: 20,
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
      console.log(`Arquivo '${filePath}' deletado com sucesso.`)
    }
  }

  static async downloadPDF(pdfUrl, downloadFolder, fileName) {
    try {
      const response = await axios.get(pdfUrl, { responseType: 'stream' })
      // Crie um fluxo de escrita para o arquivo de destino
      const writer = fs.createWriteStream(
        path.resolve(downloadFolder, fileName)
      )
      // Pipe (encaminhe) os dados da resposta para o arquivo
      response.data.pipe(writer)
      await new Promise((resolve, reject) => {
        writer.on('finish', resolve)
        writer.on('error', reject)
      })
      console.log(`Download do PDF concluído e salvo em ${fileName}`)
    } catch (error) {
      console.error(`Erro ao fazer o download do PDF: ${error.message}`)
    }
  }

  static async findQtdProcessos(caminhoArquivo) {
    const data = new Uint8Array(fs.readFileSync(caminhoArquivo))
    const pdfDocument = await pdfjs.getDocument(data).promise
    const numberofPages = pdfDocument.numPages
    const regexPedido = /PEDIDON(\d+)DE\d{2}\/\d{2}\/\d{4}/

    let processando = false
    let positiva = false

    let pageText
    for (let i = 1; i <= numberofPages; i++) {
      const page = await pdfDocument.getPage(i)
      const textContent = await page.getTextContent()
      pageText += textContent.items.map((item) => item.str).join(' ')
    }
    let textoAnalise = pageText.replace(/\s+/g, '')
    const correspondenciasPedido = textoAnalise.match(regexPedido)

    const numPedido = correspondenciasPedido
      ? correspondenciasPedido.map((match) => {
          const numero = match.replace(
            /PEDIDON(\d+)DE\d{2}\/\d{2}\/\d{4}/,
            '$1'
          )
          return '0' + numero
        })
      : []

    if (textoAnalise.includes('Pedidoemandamento')) {
      processando = true
    } else if (textoAnalise.includes('AsinformaçõesdisponíveisnoSistema')) {
      positiva = true
    }
    return {
      processando: processando,
      positiva: positiva,
      numPedido: numPedido.length > 0 ? numPedido[0] : null,
      qtdProcessos: 0,
    }
  }

  // Formata a data para o padrão "dia de mês de ano às hora:minutos"
  static formatDate() {
    const meses = [
      'janeiro',
      'fevereiro',
      'março',
      'abril',
      'maio',
      'junho',
      'julho',
      'agosto',
      'setembro',
      'outubro',
      'novembro',
      'dezembro',
    ]

    const dataAtual = new Date()
    const dia = dataAtual.getDate()
    const mes = meses[dataAtual.getMonth()]
    const ano = dataAtual.getFullYear()
    const hora = dataAtual.getHours()
    const minutos = dataAtual.getMinutes()

    return `${dia} de ${mes} de ${ano} às ${hora
      .toString()
      .padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`
  }

  // resolve a promise e retorna o JSON
  static async handleDownload(downloadFolder, fileName) {
    return new Promise((resolve, reject) => {
      const base64 = Utils.readFileToBase64(path.join(downloadFolder, fileName))
      const currentDate = new Date()
      const dataISO = currentDate.toISOString()

      const situation = 0

      resolve({
        Status: 200,
        DateTime: dataISO,
        HasErrors: false,
        Data: {
          Detalhamento: null,
          Pdf: base64,
        },
        Situation: situation,
        Processing: false,
        Expiracy: null,
      })
    })
  }
}
