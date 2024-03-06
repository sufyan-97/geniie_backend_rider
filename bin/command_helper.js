// Libraries
var moment = require("moment-strftime");
var util = require("util");
const exec = util.promisify(require("child_process").exec);
var randomize = require("randomatic");

// Custom Libraries
const { sql } = require("../config/database");

// Constants
const app_constants = require("../config/constants");
 
const sim_helpers = require("../helper/sim_helpers");

module.exports = {

    getSdealersByDealerId: async (dealer_id) => {

		var query = `SELECT dealer_id FROM dealers WHERE connected_dealer = ?`;
		let res = await sql.query(query, [dealer_id]);
		let dealerList = [];
		if (res.length) {
			dealerList = res.map(item => item.dealer_id);
			return dealerList;
		} else {
			return [];
		}
	},

    replaceAt: function (string, index, replace) {
		index--;
		return (
			string.substring(0, index) + replace + string.substring(index + 1)
		);
	},

    generateStandaloneSimId: async function () {
		let standalone_sim_id = `LM${randomize("0", 1, { exclude: "0" })}${randomize('0', 5)}`;
		let query = "SELECT standalone_sim_id FROM standalone_sim_acc WHERE standalone_sim_id=?";
		let result = await sql.query(query, [standalone_sim_id]);
		if (result.length > 1) {
			return await this.generateStandaloneSimId();
		} else {
			return standalone_sim_id;
		}
	},
    
    generatePackageId: async function () {
		let packageId = `PK${randomize("0", 1, { exclude: "0" })}${randomize('0', 3)}`;
		let query = `SELECT package_id FROM packages WHERE package_id=?`;
		let result = await sql.query(query, [packageId]);
		if (result.length > 1) {
			return await this.generatePackageId();
		} else {
			return packageId;
		}
	},

    getInvoiceId: async function () {
		let invoiceId = ""
		var max = "000000"
		let lastInvoice = "SELECT id FROM invoices ORDER BY id DESC LIMIT 1"
		let result = await sql.query(lastInvoice)
		if (result && result.length) {
			invoiceId = (result[0].id + 1).toString()
			invoiceId = max.substring(0, max.length - invoiceId.length) + invoiceId
		} else {
			invoiceId = "000001"
		}
		return 'PI' + invoiceId;
	},

    getAPKLabel: async function (filePath) {
		return await this.getAPKLabelScript(filePath);
	},
    
    getAPKLabelScript: async function (filePath) {
		try {
			let label = `aapt dump badging ${filePath} | grep "application" | sed -e "s/.*label=\'//" -e "s/\' .*//"`;
			const { stdout, stderr, error } = await exec(label);
			// console.log('stdout:', stdout);
			// console.log('stderr:', stderr);
			if (error) {
				return false;
			}

			if (stderr) {
				return false;
			}
			if (stdout) {
				let array = stdout.split(/\r?\n/);
				// console.log("stdout linux: ", array);
				let label = array[0].split(":");

				return label[1] ? label[1].replace(/\'/g, "") : false;
			}
			return false;
		} catch (error) {
			return await this.getWindowAPKLabelScript(filePath);
		}
	},
    
    // linux scripts
	getAPKPackageNameScript: async function (filePath) {
		try {
			let packageName = `aapt list -a ${filePath} | awk -v FS='\"' '/package=/{print $2}'`;
			const { stdout, stderr, error } = await exec(packageName);
			// console.log('stdout:', stdout);
			// console.log('stderr:', stderr);
			if (error) {
				return false;
			}
			if (stderr) {
				return false;
			}
			if (stdout) {
				return stdout;
			}
			return false;
		} catch (error) {
			return await this.getWindowAPKPackageNameScript(filePath);
		}
	},

    getWindowAPKLabelScript: async function (filePath) {
		try {
			let cmd = `aapt dump badging ${filePath} | findstr /C:"application:"`;
			const { stdout, stderr, error } = await exec(cmd);
			// console.log('stdout:', stdout);
			// console.log('stderr:', stderr);
			if (error) {
				return false;
			}
			if (stderr) {
				return false;
			}
			if (stdout) {
				let array = stdout.split(" ");
				let label = array[1].split("=");

				return label[1] ? label[1].replace(/\'/g, "") : false;
			}
			return false;
		} catch (error) {
			return false;
		}
	},
    
    // windows
	getWindowAPKPackageNameScript: async filePath => {
		try {
			let cmd = `aapt dump badging ${filePath} | findstr /C:"package: name"`;
			const { stdout, stderr, error } = await exec(cmd);
			// console.log('stdout:', stdout);
			// console.log('stderr:', stderr);
			if (error) {
				return false;
			}
			if (stderr) {
				return false;
			}
			if (stdout) {
				let array = stdout.split(" ");
				let packageName = array[1].split("=");
				return packageName[1]
					? packageName[1].replace(/\'/g, "")
					: false;
			}
			return false;
		} catch (error) {
			return false;
		}
	},
}

async function saveSimAccHistory(history_data) {
	console.log(history_data);
	let standalone_id = history_data.standalone_acc_id ? history_data.standalone_acc_id : null
	let user_acc_id = history_data.user_acc_id ? history_data.user_acc_id : null
	let sim_table_id = history_data.sim_t_id
	let query = "INSERT INTO sim_acc_action_history (action_type, standalone_acc_id, user_acc_id, sim_table_id, sim_id, action_data, action_by) VALUES (?,?,?,?,?,?,?)"
	let values = [history_data.action, standalone_id, user_acc_id, sim_table_id, history_data.sim_id, JSON.stringify(history_data.actionData), history_data.action_by]
	await sql.query(query, values)
}
