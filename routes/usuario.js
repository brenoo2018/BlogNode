const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")
require("../models/Usuario")
const Usuario = mongoose.model("usuarios")
const bcypt = require("bcryptjs")
const passport = require("passport")

router.get("/registro", function(req, res){
    res.render("usuarios/registro")
})

router.post("/registro", function(req, res){
    var erros = []
    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        erros.push({texto: "Nome inválido"});        
    }

    if(!req.body.email || typeof req.body.email == undefined || req.body.email == null){
        erros.push({texto: "Email inválido"});
    }

    if(!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null){
        erros.push({texto: "Senha inválido"});
    }

    if(req.body.senha.length < 4 ){
        erros.push(({texto: "Senha muito curta"}))
    }

    if(req.body.senha != req.body.senha2){
        erros.push({texto: "Senhas diferentes, tente usar a mesma senha"})
    }

    if(erros.length > 0){
        res.render("usuarios/registro", {erros: erros})
    }else{

        Usuario.findOne({email: req.body.email}).then(function(usuario){
            if(usuario){
                req.flash("error", "Email já existente")
                res.redirect("/usuarios/registro")
            }else{
                const novoUsuario = new Usuario({
                    nome: req.body.nome,
                    email: req.body.email,
                    senha: req.body.senha
                })

                bcypt.genSalt(10, function(erro, salt){
                    bcypt.hash(novoUsuario.senha, salt, function(erro, hash){
                        if(erro){
                            req.flash("error", "Erro durante o salvamento")
                            res.redirect("/")
                        }

                        novoUsuario.senha = hash;
                        novoUsuario.save().then(function(){
                            req.flash("success", "Usuário criado com sucesso")
                            res.redirect("/")
                        }).catch(function(erro){
                            req.flash("error", "Houve um erro ao criar o usuário, tente novamente!")
                            res.redirect("/usuarios/registro")
                        })
                    })
                })
            }
        }).catch(function(erro){
            req.flash("error", "Houve um erro interno")
            res.redirect("/")
        })
    }
    
       
})

router.get("/login", function(req, res){
    res.render("usuarios/login")
})

router.post("/login", function(req, res, next){
    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/usuarios/login",
        failureFlash: true 
    })(req, res, next)
})

router.get("/logout", function(req, res){
    req.logout()
    req.flash("success", "Deslogado com sucesso")
    res.redirect("/")
})


module.exports = router;