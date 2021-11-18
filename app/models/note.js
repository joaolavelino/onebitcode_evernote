//1- Chamar o Mongoose
const mongoose = require('mongoose')
//desenvolver o esquema do nosso modelo de usuário
let noteSchema = new mongoose.Schema({
    title: String,
    body: String,
    created_at: {type: Date, default: Date.now},
    updated_at: {type:Date, default: Date.now},
    //relação com usuário - vai ser feita com o ID do usuário, na collection USER, e é obrigatória
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    }
})

module.exports=mongoose.model('Note', noteSchema)