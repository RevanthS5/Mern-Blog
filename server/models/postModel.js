const {Schema, model} = require('mongoose')

const postSchema = Schema({
    title: {type: String, required: true},
    category: {type: String, enum: {values: ["Deserts", "Healthy", "Indian", "Italian", "Vegan", "Easy", "Uncategorized", "Baking"], message: "{VALUE} is not supported."}},
    description: {type: String, required: true},
    thumbnail: {type: String, required: true},
    creator: {type: Schema.Types.ObjectId, ref: 'User'},
    thumbnailImage: {type: Buffer, required: true}
}, {timestamps: true})

module.exports = model('Post', postSchema)