import { GoogleSpreadsheet } from 'google-spreadsheet'

import { fromBase64 } from '../../utils/base64'

import moment from 'moment'



const doc = new GoogleSpreadsheet(process.env.SHEET_DOC_ID)

const genCupom = () => {
    const code = parseInt(moment().format('YYMMDDHHmmssSSS')).toString(16).toUpperCase()
    return code.substr(0,4) + '-' + code.substr(4,4) + '-'+ code.substr(8,4)
}



export default async(req, res) => {
    await doc.useServiceAccountAuth({
        client_email: process.env.SHEET_CLIENT_EMAIL,
        private_key: fromBase64(process.env.SHEET_PRIVATE_KEY)
    })
    await doc.loadInfo()

    const sheet = doc.sheetsByIndex[1]
    const data = JSON.parse(req.body)

    const sheetConfig = doc.sheetsByIndex[2]
    await sheetConfig.loadCells('A3:B3')

    const mostrarPromocaoCell = sheetConfig.getCell(2,0)
    const textoCell = sheetConfig.getCell(2,1)

    let Promo =''
    let Cupom = ''
    if(mostrarPromocaoCell.value === 'Verdadeiro'){
        Promo = textoCell.value
        Cupom = genCupom()
    }
    
    
    // Nome Email WhatsApp Promo Cupom
    await sheet.addRow({
        Nome: data.Nome,
        Email: data.Email,
        WhatsApp: data.WhatsApp,
        Nota: parseInt(data.Nota),
        'Data Preenchimento': moment().format('DD/MM/YYY HH:mm:ss'),
        Promo,
        Cupom
    })
    res.end(JSON.stringify({
        showCoupon: Cupom !== '',
        Cupom,
        Promo
    }))

}