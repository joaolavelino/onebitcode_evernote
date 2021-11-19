//1-Chamar as bibliotecas
//     - o DOTWNV que permite que peguemos aquela string secreta
//     - o JWT
require('dotenv').config()
const jwt = require('jsonwebtoken')
//2-trazer a string secreta
const secret = process.env.JWT_TOKEN
//3 - trazer o model de usuário
const User = require('../models/user')

//4) Criar o middleware que vai autenticar
const WithAuth = (req, res, next) => {
  //requerer o token, ele vai ser passado no header da requisição
    const token = req.headers['x-access-token']
    //se não houver token, jogo um erro
    if(!token) res.status(401).json({error: "Unauthorized: No token provided"})
    else{
        //se tiver um token no header, vou usar um método do JWT que é verificar
        jwt.verify(token, secret, (err, decoded) => {
          if(err) res.status(401).json({error: "Unauthorized: Invalid token"})
          else{
              //vamos sobrescrever o e-mail da requisição pelo resultado da verificação (o decoded)
              req.email = decoded.email
              //agora usamos esse dado para puxar o usuário
              User.findOne({email: decoded.email})
                // agora vou oegar esse usuário encontrado e vou colocá-lo na requisição  
              .then(foundUser =>{
                  //o usuário da requisição passa a ser o usuário encontrado pelo findOne
                  req.user = foundUser
                  next()
              })
              .catch((err) => {
                res.status(401).json({error: err})
              })
          }
        } )
    }
}

//exportar o middleware
module.exports = WithAuth;
