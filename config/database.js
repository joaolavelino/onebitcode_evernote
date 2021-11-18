//1)require do mongoose
var mongoose = require("mongoose");
//2) conectar com a promisse global
mongoose.Promise = global.Promise;

mongoose.connect("mongodb://localhost/javascriptnote", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("conectado ao MongoDb"))
  .catch((err) => console.error(err));
