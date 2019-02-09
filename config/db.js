if(process.env.NODE_ENV == "production"){
    module.exports = {
        mongoURI: "mongodb+srv://taynan:breno8144@blogapp-c154w.mongodb.net/test?retryWrites=true"
    }
}else{
    module.exports = {
        mongoURI: "mongodb://localhost:27017/blognode"
    }
}