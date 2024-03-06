let path = require('path');
let fs = require('fs');

module.exports = function (lngKey, defaultValue, lngCode = 'en') {
	try {

		let defaultLngData = JSON.parse(fs.readFileSync(path.join(__dirname, '../i18n/en.json'), 'utf8'))

        if (!lngCode || lngCode === 'en') {
            if (!defaultLngData || !defaultLngData.length) {
                console.log('default language data not found')
                return defaultValue
            }

            let lngObj = defaultLngData.find(lngObj => lngObj.key.toLowerCase() === lngKey.toLowerCase())
            if (!lngObj) {
                return defaultValue
            }
            return lngObj.value
        }


        // let usrLngData = require(`../i18n/${lngCode}`)
		let usrLngData = JSON.parse(fs.readFileSync(path.join(__dirname, `../i18n/${lngCode}.json`), 'utf8'))

        if (!usrLngData || !usrLngData.length) {
            return defaultValue
        }
        let lngObj = null;

        lngObj = usrLngData.find(lngObj => lngObj.key.toLowerCase() === lngKey.toLowerCase())
        if (!lngObj) {

            if (!defaultLngData || !defaultLngData.length) {
                console.log('default language data not found')
                return defaultValue
            }

            let defaultLngObj = defaultLngData.find(lngObj => lngObj.value.toLowerCase() === lngKey.toLowerCase())
            if (!defaultLngObj) {
                return defaultValue
            }

            lngObj = usrLngData.find(lngObj => lngObj.key.toLowerCase() === defaultLngObj.key.toLowerCase())
            if (!lngObj) {
                return defaultValue
            }
        }
        return lngObj.value

    } catch (error) {
        console.log(error.message)
        return defaultValue
    }
}