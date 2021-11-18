var express = require('express');
var router = express.Router();
//puxar o model
const User = require('../models/user')
//puxar o JWT e o DOTENV
const jwt = require('jsonwebtoken');
require('dotenv').config();
//puxar a chave secreta do arquivo .env - seria possível puxar essa chave daqui. porém ela tem que ser secreta, por isso deixamos no arquivo separado, que não vai pro GITHUB
const secret = process.env.JWT_TOKEN


//ROTA POST - CADASTRAR O USUÁRIO
router.post('/register', async (req, res) => {
  //1 - colocar no objeto da requisição os 3 atributos, nome e-mail e senha - vindos do corpo da requisição
  const {name, email, password} = req.body;
  //2 - criar o usuário com esses 3 parâmetros
  const user = new User({name, email, password});
  try{
    //se der certo: salvo o usuário (o campo password vai ser encriptado antes de ser salvo - bcrypt)
    await user.save()
    //e depois (await) ele vai devolver o json desse usuário
    res.status(200).json(user)
  } catch(e) {
    res.status(500).json({e: 'Error registering new user'})
  }
})

//ROTA POST - LOGIN
router.post('/login', async (req, res) => {
  //1 - criar um objeto com os atributos email e password, vindos do body da requisição
  const {email, password} = req.body;
  try{
    //2 - procurar usuário pelo seu e-mail - usando como parâmetro o email contido no objeto da requisição
    let user = await User.findOne({email})
    //se não houver o usuário
    if(!user){
      //a resposta sera um erro de encontrar o recurso (401)
      res.status(401).json({ error: "Incorrect e-mail or password"})
    } else {
      //se ele existir, verificar o password - usando o método do scheme que criamos dentro do MODEL
      user.isCorrectPassword(password, function(err, same){
        //se estiver errado, eu solto o erro 
        if(!same) res.status(401).json({ error: "Incorrect e-mail or password"})
        else {
          //se estiver certo, chamar o método SIGN do JWT, para criar a chave - ela vai usar aquela variável secret, que tem a string secreta, e o periodo de expiração
          const token = jwt.sign({email}, secret, {expiresIn: '10d'})
          //devolver o usuário e o token dele
          res.json({user: user, token:token})
        }
      })
    }
  } catch(e) {
    //erro de quebra da aplicação
    res.status(500).json({e: 'Internal error, please try again'})
  }
})

module.exports = router;
