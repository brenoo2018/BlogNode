const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
require("../models/Categoria");
const Categoria = mongoose.model("categorias");
require("../models/Posts")
const Post = mongoose.model("posts")
const {eAdmin} = require("../helpers/eAdmin")




router.get("/",eAdmin, function(req, res){
    res.render("admin/index")
});

router.get("/categorias",eAdmin, function(req, res){
    Categoria.find().sort({date: "desc"}).then((categorias) =>{
        res.render("admin/categorias", {categorias: categorias})
    }).catch((erro) => {
        req.flash("error", "Erro ao listar as categorias")
        res.redirect("/admin")
    })
});

router.get("/categorias/add",eAdmin, function(req, res){
    res.render("admin/addcategorias")
});

router.post("/categorias/nova",eAdmin, function(req, res){

    var erros = []
    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        erros.push({texto: "Nome inválido"});        
    }

    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({texto: "Slug inválido"});
    }

    if(req.body.nome.length < 2){
        erros.push({texto: "Nome muito curto"})
    }

    if(erros.length > 0){
        res.render("admin/addcategorias", {erros: erros})
    } else{
        const novaCategoria = {
            nome: req.body.nome,
            slug: req.body.slug
        }
    
        new Categoria(novaCategoria).save().then(function(){
            req.flash("success", "Categoria criada com sucesso")
            res.redirect("/admin/categorias")
        }).catch(function(erro){
            req.flash("error", "Erro ao salvar a categoria")
            res.redirect("/admin")
        })
    }

});

router.get("/categorias/edit/:id",eAdmin, function(req, res){
    Categoria.findOne({_id:req.params.id}).then(function(categoria){
        res.render("admin/editcategorias", {categoria: categoria})
    }).catch(function(erro){
        req.flash("error", "Categoria inexistente")
        res.redirect("/admin/categorias")
    })
    
})

router.post("/categorias/edit",eAdmin, function(req, res){

    var erros = []
    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        erros.push({texto: "Nome inválido"});        
    }

    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({texto: "Slug inválido"});
    }

    if(req.body.nome.length < 2){
        erros.push({texto: "Nome muito curto"})
    }

    if(erros.length > 0){
        res.render("admin/addcategorias", {erros: erros})
    }else{
        Categoria.findOne({_id: req.body.id}).then(function(categoria){

            categoria.nome = req.body.nome
            categoria.slug = req.body.slug

            categoria.save().then(function(){

                req.flash("success", "categoria editada")
                res.redirect("/admin/categorias")
            }).catch(function(erro){
                req.flash("error", "erro interno ao editar categoria")
                res.redirect("/admin/categorias")
            })

        }).catch(function(erro){   
            req.flash("error", "erro ao editar")
            res.redirect("/admin/categorias")
        })

    }

        
})

router.post("/categorias/delete",eAdmin, function(req, res){
    Categoria.remove({_id: req.body.id}).then(function(){
        req.flash("success", "Categoria deletada")
        res.redirect("/admin/categorias")
    }).catch(function(erro){
        req.flash("error", "Erro ao remover categoria")
        res.redirect("/admin/categorias")
    })
})


router.get("/posts",eAdmin, function(req, res){
    Post.find().populate("categoria").sort({data: "desc"}).then(function(posts){
        res.render("admin/posts", {posts: posts})
    }).catch(function(erro){
        req.flash("error", "Erro ao listar as potagens")
        res.redirect("/admin")
    })
    
})

router.get("/posts/add",eAdmin, function(req, res){
    Categoria.find().then(function(categorias){
        res.render("admin/addpost", {categorias: categorias})
    }).catch(function(erro){
        req.flash("error", "Erro ao carregar o formulário")
        res.redirect("/admin")
    })
    
})

router.post("/posts/nova",eAdmin, function(req, res){
    var erros = []

    if (!req.body.titulo || typeof req.body.titulo == undefined || req.body.titulo == null) {
        erros.push({texto: "Título inválido"});        
    }

    if(!req.body.descricao || typeof req.body.descricao == undefined || req.body.descricao == null){
        erros.push({texto: "Descrição inválido"});
    }

    if (!req.body.conteudo || typeof req.body.conteudo == undefined || req.body.conteudo == null) {
        erros.push({texto: "Coneúdo inválido"});        
    }

    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({texto: "Slug inválido"});
    }


    if(req.body.categoria == 0){
        erros.push({texto: "Categoria inválida, selecione uma"})
    }
    if(erros.length > 0){
        res.render("admin/addpost", {erros: erros})
    }else{
        const novaPostagem = {
            titulo: req.body.titulo,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria,
            slug: req.body.slug
        }
        new Post(novaPostagem).save().then(function(){
            req.flash("success", "Post criado")
            res.redirect("/admin/posts")
        }).catch(function(erro){
            req.flash("error", "Erro ao criar Post")
            res.redirect("/admin/posts")
        })
    }

})

router.get("/posts/edit/:id",eAdmin, function(req, res){
    Post.findOne({_id: req.params.id}).then(function(post){
        Categoria.find().then(function(categorias){
            res.render("admin/editposts", {categorias: categorias, post: post})
        }).catch(function(erro){
            req.flash("error", "Erro ao listar  as categorias")
            res.redirect("/admin/posts")
        })
    }).catch(function(erro){
        req.flash("error", "Categoria inexistente")
        res.redirect("/admin/posts")
    })
})

router.post("/posts/edit",eAdmin, function(req, res){
    var erros = []

    if (!req.body.titulo || typeof req.body.titulo == undefined || req.body.titulo == null) {
        erros.push({texto: "Título inválido"});        
    }

    if(!req.body.descricao || typeof req.body.descricao == undefined || req.body.descricao == null){
        erros.push({texto: "Descrição inválido"});
    }

    if (!req.body.conteudo || typeof req.body.conteudo == undefined || req.body.conteudo == null) {
        erros.push({texto: "Coneúdo inválido"});        
    }

    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({texto: "Slug inválido"});
    }


    if(req.body.categoria == 0){
        erros.push({texto: "Categoria inválida, selecione uma"})
    }
    if(erros.length > 0){
        res.render("admin/addpost", {erros: erros})
    }else{
        Post.findOne({_id: req.body.id}).then(function(post){
            post.titulo = req.body.titulo
            post.descricao = req.body.descricao
            post.conteudo = req.body.conteudo
            post.categoria = req.body.categoria
            post.slug = req.body.slug

            post.save().then(function(){
                req.flash("success", "Post Editado")
                res.redirect("/admin/posts")
            }).catch(function(erro){
                req.flash("error", "Falha interna")
                res.redirect("/admin/posts")
            })
        }).catch(function(erro){
            req.flash("error", "erro ao salvar edição")
            res.redirect("/admin/posts")
        })
    }
})

router.get("/posts/delete/:id",eAdmin, function(req, res){
    Post.remove({_id: req.params.id}).then(function(){
        req.flash("success", "Post deletado")
        res.redirect("/admin/posts")
    }).catch(function(erro){
        req.flash("error", "Houve um erro interno")
        res.redirect("/admin/posts")
    })
})



module.exports = router;