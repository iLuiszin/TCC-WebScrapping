import axios from 'axios'
import 'dotenv/config'
import FormData from 'form-data'


export default class Captcha {
  static async enviaCaptcha(corpo, captchaKey) {
    try {
      const formData = new FormData()
      formData.append('key', captchaKey)
      formData.append('method', 'base64')
      formData.append('regsense', 1)
      formData.append('body', corpo)

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }

      const response = await axios.post(
        'http://2captcha.com/in.php',
        formData,
        config
      )
      return response.data
    } catch (error) {
      console.log(error)
    }
  }

  static async pegaCaptcha(taskId, captchaKey, isReady = false, response = '') {
    try {
      let contagem = 0
      while (!isReady && contagem < 20) {
        contagem++
        let taskResponse = await axios.get(
          `http://2captcha.com/res.php?key=${captchaKey}&action=get&id=${taskId}`
        )

        if (taskResponse.data.split('|')[0] === 'OK') {
          isReady = true
          response = taskResponse.data.split('|')[1]
        }

        await new Promise((r) => setTimeout(r, 2000))
      }

      return response
    } catch (error) {
      console.log(error)
    }
  }
}
