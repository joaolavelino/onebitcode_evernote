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
  //console.log(title, body, userId, req.user, author)
  try{
    //criar a nota: para o titulo e o corpo da nota usamos os dados extraídos da requisição. O autor vai ser puxado através da middleware de autenticação - o middleware vai pegar o token, e vai colocar dentro da requisição um user, esse user é o autor da nota (vamos colocar o id dele)
    let note = new Note ({title: title, body: body, author: req.user._id})
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

//------------- ROTA GET - PEGAR LISTA DE NOTAS ----------------------
router.get('/', withAuth, async (req, res) => {
    try{
      //fazer a busca no DB usando como argumento do find o id do autor (que veio com o autenticador)  
      const notes = await Note.find({author:req.user._id})
      //isso é um check que fiz a parte: se o author não tiver notas (ou seja, se o array gerado tiver length = 0), ele dá um erro de que não tem nota desse autor
      if(notes.length==0) res.status(500).json({error: 'There are no available notes by the author'})
      else res.json(notes)
    } catch(error) {
      res.status(500).json({error:error})
    }
})

// ------------ ROTA PUT - ATUALIZAR UMA NOTA -------------------------
router.put('/:id', withAuth, async (req, res) => {
  //trazer o titulo e o corpo da nota usando o REQ BODY
  let {title, body} = req.body
  //Trazer o ID da nota usando o req.params
  let {id} = req.params

  try{
    //buscar a nota usando a ID
    let note = await Note.findById(id)
    //checar se o user é o dono da nota
    if (isOwner(req.user, note)){
      //usar o método findOneAndUpdate para atualizar a nota
      let updatedNote = await Note.findOneAndUpdate(
        //primeiro argumento é o ID pra ela procurar
        id,
        //o segundo argumento é usar o $set para definir quais os campos a alterar
        { $set: {title:title, body:body} },
        //terceiro argumento é o UPSERT - que vai dizer pro mongo que ele tem que me devolver a nota nova atualizada
        {upsert:true, 'new':true}
      )
      //no final, devolvo a nota atualizada
      res.json(updatedNote)
    }
    else res.status(403).json({error:'Permission denied'})
  } catch(e) {
    res.status(500).json({error:'Unable to update note'})
  }
})

//  ---------- DELETAR UMA NOTA -----------------
router.delete('/:id', withAuth, async (req, res) => {
  const {id} = req.params
  try{
    let note = await Note.findById(id)
    if(isOwner(req.user, note)){
      await note.delete()
      res.json({message: 'OK, note successfully deleted'}).status(204)
    } else res.status(403).jsos({error: "Permission denied"})
  } catch(e) {
    res.status(500).json({error: 'Unable to delete note'})
  }
})

const isOwner = (user, note) => {
    //ele vai comparar o id do usuário (que vai ser alimentado pelo autenticador) com o author (que é o id do usuário que criou a nota)
  if(JSON.stringify(user._id) == JSON.stringify(note.author)) return true
  else return false
}

module.exports = router