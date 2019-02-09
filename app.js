const express = require("express");
const app = express();
const handlebars = require("express-handlebars");
const bodyParser = require ("body-parser");
const admin = require("./routes/admin");
const path = require("path");
const mongoose = require ("mongoose");
const session = require("express-session");
const flash = require("connect-flash");
require("./models/Posts")
const Post = mongoose.model("posts")
require("./models/Categoria")
const Categoria = mongoose.model("categorias")
const usuarios = require("./routes/usuario")
const passport = require("passport")
require("./config/auth")(passport)

//config
    //sessão
        app.use(session({
            secret: "sessaomidleware",
            resave: true,
            saveUninitialized: true
        }))

        app.use(passport.initialize())
        app.use(passport.session())
    //flash
        app.use(flash());
    //middleware
        app.use(function(req, res, next){
            res.locals.success = req.flash("success")
            res.locals.error = req.flash("error")
            res.locals.user = req.user || null
            next()
    })
    //bodyParser
        app.use(bodyParser.urlencoded({extended: true}))
        app.use(bodyParser.json());

    //handlebars
        app.engine("handlebars", handlebars({defaultLayout: "main"}))
        app.set("view engine", "handlebars")

    //mongoose
        mongoose.Promise = global.Promise;
        mongoose.connect("mongodb://localhost:27017/blognode", {
            useNewUrlParser: true
        }).then(function(){
            console.log("contectado ao Mongo")
        }).catch(function(erro){
            console.log("MONGODB erro ao conectar: "+erro)
        })
    //arquivos estaticos
        app.use(express.static(path.join(__dirname, "public")));

        

    //rotas
    
    app.get("/", function(req, res){
        Post.find().populate("categoria").sort({data: "desc"}).then(function(posts){
            res.render("index", {posts: posts})
        }).catch(function(erro){
            req.flash("error", "Houve um erro interno")
            res.redirect("/404")
        })
    })

    app.get("/post/:slug", function(req, res){
        Post.findOne({slug: req.params.slug}).then(function(post){
            if(post){
                res.render("post/index", {post: post})
            }else{
                req.flash("error", "Post inexistente")
                res.redirect("/")
            }
        }).catch(function(erro){
            req.flash("error", "Houve um erro interno")
            res.redirect("/")
        })
    })
    
    app.get("/categorias", function(req, res){
        Categoria.find().then(function(categorias){
            res.render("categorias/index", {categorias: categorias})
        }).catch(function(erro){
            req.flash("error", "Houve um erro interno")
            res.redirect("/")
        })
    })

    app.get("/categorias/:slug", function(req, res){
        Categoria.findOne({slug: req.params.slug}).then(function(categoria){
            if(categoria){
                Post.find({categoria: categoria._id}).then(function(posts){
                    res.render("categorias/posts", {posts: posts, categoria: categoria})
                }).catch(function(erro){
                    req.flash("error", "Erro ao listar os posts")
                    res.redirect("/")
                })
            }else{
                req.flash("error", "categoria inexistente")
                res.redirect("/")
            }
        }).catch(function(erro){
            req.flash("error", "Houve um erro interno")
            res.redirect("/")
        })
    })

    app.get("/404", function(req, res){
        res.send("Erro 404!")
    })

    app.use("/usuarios", usuarios)

    app.use("/admin", admin);



const PORT = 8000;
app.listen(PORT, function(){
    console.log("SERVIDOR ATIVO")
})
