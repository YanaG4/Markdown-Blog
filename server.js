require('dotenv').config()
const express = require('express')
const app = express()
const mongoose = require('mongoose')
const articleRouter = require('./routes/articles')
const Article = require('./models/article')
const methodOverride = require('method-override')

mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true })

app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: false }))
app.use(methodOverride('_method'))
app.use(express.static('public'))

app.get('/', async (req, res) => {
    const sort = req.query.rev || 0
    let path
    let articles
    if (sort == 0) {
        articles = await Article.find().sort({ createdAt: 'desc' })
        path = '/?rev=1'
    }
    else {
        articles = await Article.find()
        path = '/'
    }
    res.render('articles/index', { articles, path })
})

app.get('/about', (req, res) => {
    res.render('articles/about')
})

app.use('/articles', articleRouter)

app.listen(5000)