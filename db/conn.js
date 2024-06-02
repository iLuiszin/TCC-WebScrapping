import 'dotenv/config'
import mongoose from 'mongoose'
const uri = process.env.MONGODB_URI

async function main() {
  await mongoose.connect(uri)
  console.log('Conectou ao mongodb com mongoose')
}

main().catch((err) => console.log(err))

export default mongoose
