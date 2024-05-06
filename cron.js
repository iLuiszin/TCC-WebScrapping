import { CronJob } from 'cron'
import aliexpressScraper from './scrapers/aliexpress.js'
import ebayScraper from './scrapers/ebay.js'
import amazonScraper from './scrapers/amazon.js'
import mongoose from './db/conn.js'
import Product from './models/Product.js'

// rodar a cada 5 minu
const job = new CronJob('*/5 * * * *', async () => {

  // get all data from db
  const products = await Product.find({ aliexpressUrl: { $exists: true } })

  for (const product of products) {

    const [aliexpress, amazon] = await Promise.all([
      aliexpressScraper(product.aliexpressUrl),
      amazonScraper(product.amazonUrl),
    ])

    product.aliexpressPrice = aliexpress.price
    product.aliexpressFrete = aliexpress.frete
    product.aliexpressICMS = aliexpress.icms
    product.amazonPrice = amazon.price
    product.amazonFrete = amazon.frete

    console.log(product)

    // await product.save()
  }

  job.start()
})
