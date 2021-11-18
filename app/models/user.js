//1- Chamar o Mongoose
const mongoose = require('mongoose')
//Chamar o Bcrypt para criptografar a senha
const bcrypt = require('bcrypt')
//desenvolver o esquema do nosso modelo de usuário
let userSchema = new mongoose.Schema({
    name: String,
    //o email é obrigatório, e essa função Unique define que não pode ter emails repetidos
    email: {type: String, required:true, unique:true},
    password: {type: String, require:true},
    created_at: {type: Date, default: Date.now},
    updated_at: {type:Date, default: Date.now},
})

//esse script será rodado antes (PRE) do esquema
//ele é o que vai transformar a senha em uma hash, e vamos jogar essa hash dentro do nosso schema ao invés da senha digitada. Por isso que tem que rodar antes.
//esse (next) funciona como um middleware, para passar pro próximo comando
userSchema.pre('save', function(next){
    //1) verificar se o cadastro é novo ou se a senha foi modificada
    if(this.isNew || this.isModified('password')){
        //2) colocamos esse cadastro dentro de uma variável
        const document = this;
        //3) rodamos o Bcrypt (argumentos: 1- o que vai ser lido, 2-passos de criptografia, 3-callback)
        bcrypt.hash(this.password, 10, (err, hashedPassword) => {
            //se der erro, passa pro proximo passo, e lança o erro
          if(err) next(err)
          else{
              //se não der erro, troca o password do cadastro pela hash
              this.password = hashedPassword
              next()
          }
        })
    }
})
//criar um metodo para verificar se a senha está correta
//crio uma função com 2 argumentos (a senha inserida e uma função de retorno)
userSchema.methods.isCorrectPassword = function(password, callback){
    //uso o bcrypt pra comparar a senha inserida com a senha salva no usuário (this.password)
    bcrypt.compare(password, this.password, function(err, same){
        if(err) callback(err)
        else callback(err, same)
    })
}


module.exports=mongoose.model('User', userSchema)