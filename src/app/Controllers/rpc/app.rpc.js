// Libraries
const path = require('path')
const fs = require('fs')

// Models

exports.saveLanguageStrings = async function (call, callback) {
    try {
        let languagesData = JSON.parse(call.request.data)
        for (const language of languagesData) {
            try {
                let languageFolder = path.join(__dirname, `../../../i18n`);
                
                if (!fs.existsSync(languageFolder)) {
                    fs.mkdirSync(languageFolder, { recursive: true })
                }

                await fs.writeFileSync(path.join(languageFolder, `${language.languageCode}.json`), JSON.stringify(language.languageData))
            } catch (error) {
                console.log(language.languageCode, error)
            }
        }
        callback(null, {
            status: true,
            data: "languages updated successfully"
        })
    } catch (error) {
        console.log(error)
        return callback({
            message: 'Internal Server Error.',
        })
    }
}

exports.getServiceInfo = async function (call, callback) {
    try {

        let reqData = call.request

        // let dashboardCards = await DashboardCard.findAll({
        //     where: {
        //         deleteStatus: false
        //     }
        // })
        callback(null, {
            status: true,
            data: JSON.stringify({
            })
        })
    } catch (error) {
        console.log(error)
        callback(error)
    }
}