const fileType = require('file-type')
const stream = require('stream')
const fs = require('fs')
const FormData = require('form-data')
const input = './1.jpg'
async function getSauce(input, options) {
    let form = new FormData()
    if(Object(options) === options)
      for(let key in options) form.append(key, options[key])
    form.append('db', 999)
    form.append('numres', 3)
    form.append('output_type', 2)
    form.append('api_key', '74fdc34e80188b7d05da417820a1ded8d45f857c')

    switch(true) {
      case (typeof input === 'string'):
        if(~input.search(/^https?:\/\//))
          form.append('url', input)
        else
          form.append('file', fs.createReadStream(input))
      break

      case (input instanceof stream.Readable):
        form.append('file', input)
      break

      case (input instanceof Buffer):
        let inputType = fileType(input)
        form.append('file', input, {
          filename: `file.${inputType.ext}`,
          contentType: inputType.mime
        })
      break

      default: throw new TypeError('unrecognized input format')
    }

    let response = await new Promise((resolve, reject) => {
      form.submit('https://saucenao.com/search.php', (err, res) => {
        if(err) reject(err)
        else resolve(res)
      })
    })

    try {
      response.body = ''
      response.setEncoding('utf8')
      response.on('data', chunk => response.body += chunk)
      await new Promise(r => response.on('end', r))

      response.json = JSON.parse(response.body)
    } catch (err) {
      err.response = response
      throw err
    }

    return response
  }

  getSauce(input, {}).then((response)=>{
    console.log(response.json.results)
  }).catch()