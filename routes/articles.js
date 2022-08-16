const express = require('express')
const Article = require('../models/article')
const router = express.Router()

router.get('/new', (req, res) => {
    res.render("articles/new", { article: new Article() })
})

router.get('/edit/:id', async (req, res) => {
    const article = await Article.findById(req.params.id)
    res.render("articles/edit", { article })
})

router.get('/:link', async (req, res) => {
    const article = await Article.findOne({ link: req.params.link })
    if (article == null) {
        res.status(400).redirect('/')
        return
    }
    res.render('articles/show', { article })
})

router.post('/', async (req, res, next) => {
    req.article = new Article()
    next()
}, saveArticleAndRedirect('new'))

router.put('/:id', async (req, res, next) => {
    req.article = await Article.findById(req.params.id)
    next()
}, saveArticleAndRedirect('edit'))

router.delete('/:id', async (req, res) => {
    await Article.findByIdAndDelete(req.params.id)
    res.redirect('/')
})

function saveArticleAndRedirect(path) {
    return async (req, res) => {
        let article = req.article
        article.title = req.body.title
        article.description = req.body.description
        article.markdownText = req.body.markdownText

        try {
            article = await article.save()
            res.redirect(`/articles/${article.link}`)
        }
        catch (err) {
            res.render(`articles/${path}`, { article: article })
        }
    }
}

module.exports = router