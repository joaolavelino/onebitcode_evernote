var express = require('express');
var router = express.Router();
//puxar o model
const Note = require('../models/note')
//puxar o middleware
const withAuth = require('../middlewares/auth')


// ----------  Criar a rota de criação de nota
//coloquei a mais o middleware... ele entra como um argumento , entre o endereço e a função
router.post('/', withAuth, async (req, res) => {
  const {title, body} = req.body
  const userId = req.user._id
  console.log(title, body, userId)
  //console.log(title, body, userId, req.user, author)
  
  try{
    //criar a nota: para o titulo e o corpo da nota usamos os dados extraídos da requisição. O autor vai ser puxado através da middleware de autenticação - o middleware vai pegar o token, e vai colocar dentro da requisição um user, esse user é o autor da nota (vamos colocar o id dele)
    let note = new Note ({title: title, body: body, author: userId})
    console.log(note)
      //se der certo, salvamos a nota
    await note.save()
    res.status(200).json(note)
  } catch(error) {
      // se der errado
      console.log(error.message)
      res.status(500).json({error: 'Unable to create a new note'})
      
  }
})

// ----------  Criar a rota de obtenção de nota
//também devemos pegar o middleware aqui porque o usuário só pode pegar notas que são dele
router.get('/:id', withAuth, async (req, res) => {
    try{
        //pegar o id. ele vai ser puxado da url, então usamos o req.params
        const {id} = req.params;
        //procurar a nota que queremos dentro da collection, usando o findById
        let note = await Note.findById(id)
        //verificar se o usuário é o dono da nota. vamos usar uma função externa, criada abaixo, chamada isOwner, se sim, devolvemos a nota como resposta à requisição. Se não, lançamos um erro
        if(isOwner(req.user, note)) res.json(note)
        else res.status(403).json({error: 'Access denied.'})
    } catch(e) {
        res.status(500).json({error: 'Unable to get the note'})
    }
})

const isOwner = (user, note) => {
    //ele vai comparar o id do usuário (que vai ser alimentado pelo autenticador) com o author (que é o id do usuário que criou a nota)
  if(JSON.stringify(user._id) == JSON.stringify(note.author)) return true
  else return false
}

module.exports = router