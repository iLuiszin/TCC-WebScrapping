import mongoose from '../db/conn.js'
const { Schema } = mongoose

const Product = new mongoose.model(
  'Product',
  new Schema(
    {
      product_id: {
        type: String,
        required: true,
        trim: true,
        unique: true,
      },
      title: {
        type: String,
        trim: true,
        required: true,
      },
      price: {
        type: Number,
        trim: true,
        required: true,
      },
      description: {
        type: String,
        trim: true,
        required: true,
      },
      content: {
        type: String,
        trim: true,
        required: true,
      },
      images: {
        type: Object,
        required: true,
      },
      checked: {
        type: Boolean,
        default: false,
      },
      amazonUrl: {
        type: String,
        trim: true,
        required: true,
      },
      amazonPrice: {
        type: Number,
        trim: true,
        required: true,
      },
      amazonFrete: {
        type: Number,
        trim: true,
        required: true,
      },
      magazineUrl: {
        type: String,
        trim: true,
        required: true,
      },
      magazinePrice: {
        type: Number,
        trim: true,
        required: true,
      },
      magazineFrete: {
        type: Number,
        trim: true,
        required: true,
      },
      shopeeUrl: {
        type: String,
        trim: true,
        required: true,
      },
      shopeePrice: {
        type: Number,
        trim: true,
        required: true,
      },
      shopeeFrete: {
        type: Number,
        trim: true,
        required: true,
      },
      shopeeICMS: {
        type: Number,
        trim: true,
        required: true,
      },
      aliexpressUrl: {
        type: String,
        trim: true,
        required: true,
      },
      aliexpressPrice: {
        type: Number,
        trim: true,
        required: true,
      },
      aliexpressFrete: {
        type: Number,
        trim: true,
        required: true,
      },
      aliexpressICMS: {
        type: Number,
        trim: true,
        required: true,
      }
    },
    { timestamps: true }
  )
)

export default Product
