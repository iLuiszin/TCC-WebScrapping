import { CronJob } from 'cron'
import aliexpressScraper from './aliexpress.js'
import ebayScraper from './ebay.js'
import amazonScraper from './amazon.js'
import mongoose from './db/conn.js'
import Product from './models/Product.js'

// rodar a cada 5 minu
const job = new CronJob('*/5 * * * *', async () => {

  // get all data from db
  const products = await Product.find({})


  aliexpressScraper()
  ebayScraper()
  amazonScraper()
})

job.start()
