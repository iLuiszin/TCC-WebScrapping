import { CronJob } from 'cron'
import aliexpressScraper from './scrapers/aliexpress.js'
import magazineScraper from './scrapers/magazine.js'
import amazonScraper from './scrapers/amazon.js'
import shopeeScraper from './scrapers/shopee.js'
import Product from './models/Product.js'

// rodar a cada 1 minuto
// const job = new CronJob('*/1 * * * *', async () => {
const main = async () => {
  console.log('Cron rodando...')
  const products = await Product.find()

  for (const product of products) {
    const [aliexpress, amazon, magazine] = await Promise.all([
      aliexpressScraper(product.aliexpressUrl),
      // amazonScraper(product.amazonUrl),
      // magazineScraper(product.magazineUrl),
      // shopeeScraper(product.shopeeUrl),
    ])

    console.log(aliexpress, amazon, magazine)

    product.aliexpressPrice = aliexpress.price
    product.aliexpressFrete = aliexpress.frete
    product.aliexpressICMS = aliexpress.icms
    product.amazonPrice = amazon.price
    product.amazonFrete = amazon.frete
    product.magazinePrice = magazine.price
    product.magazineFrete = magazine.frete
    product.shopeeICMS = product.shopeeICMS ? product.shopeeICMS : 0
    product.shopeeFrete = product.shopeeFrete ? product.shopeeFrete : 0

    product.price = Math.min(aliexpress.price, amazon.price, magazine.price)

    await product.save()

    console.log('Cron concluído!')
  }
}

main()

// })

// job.start()
