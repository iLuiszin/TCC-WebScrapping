import { CronJob } from 'cron'
import aliexpressScraper from './aliexpress.js'
import ebayScraper from './ebay.js'
import amazonScraper from './amazon.js'

// rodar a cada 5 minu
const job = new CronJob('*/5 * * * *', () => {
  aliexpressScraper()
  ebayScraper()
  amazonScraper()
})

job.start()
