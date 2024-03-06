// const { Mongoose } = require("mongoose")

const { location } = require("../MongoModels/location");
// const model = Mongoose.model('location')

exports.getAll = async function (req, res) {

    return res.send("its locations setting");
}

exports.getOne = async function (req, res) {
    let id = req.request.id;
    // res.send(req.params)

    console.log("get rider here", id);

    location.findOne({ riderId: id }).then(item => {
        return res(null, item);
    }).catch(err => {
        return res(null, err);
    })
}

exports.post = async function (req, res) {

    let data = req.body.match;

    location.findOneAndUpdate({ riderId: data.riderId }, data, { upsert: true },
        function (err, item) {
            if (err) {
                res.send(err)
            } else {
                res.send(item)
            }
        }
    )

}