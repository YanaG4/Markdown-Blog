const express = require('express')
const Article = require('../models/article')
const router = express.Router()


router.post('/preview', async (req, res) => {
    console.log('in the preview');
    next()
}, previewArticle())

const saveArticleAndRedirect = async function (req, res, next) {

    if (req.body.action == 'preview') {
        res.redirect('/preview') //send article, save copy of article
        return
    }
    else {
        next()
    }
}

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

router.get('preview/:link', async (req, res) => {
    const article = await Article.findOne({ link: req.params.link })
    if (article == null) {
        res.status(400).redirect('/')
        return
    }
    res.render('articles/preview', { article })
})

router.post('/', async (req, res, next) => {
    req.article = new Article()
    next()
}, saveArticleAndRedirect, saveArticle('new'))

router.put('/:id', async (req, res, next) => {
    req.article = await Article.findById(req.params.id)
    next()
}, saveArticleAndRedirect, saveArticle('edit'))

router.delete('/:id', async (req, res) => {
    await Article.findByIdAndDelete(req.params.id)
    res.redirect('/')
})




function previewArticle() {
    return async (req, res) => {
        console.log('in the previewArticle');
        let path
        let article = req.article
        if (!article.title) {
            article.title = req.body.title + '-preview'
            article.description = req.body.description
            article.markdownText = req.body.markdownText
            article.preview = true
            path = 'new'
        } else {
            article = new Article({
                title: req.body.title + '-preview',
                description: req.body.description,
                markdownText: req.body.markdownText,
                preview: true
            })
            path = 'edit'
        }
        try {
            article = await article.save()
            res.redirect(`/articles/preview/${article.link}`)
        }
        catch (err) {
            res.render(`articles/${path}`, { article })
        }
    }
}

function saveArticle(path) {
    return async (req, res) => {
        let article = req.article
        if (article.preview == false) { //if no preview
            article.title = req.body.title
            article.description = req.body.description
            article.markdownText = req.body.markdownText
        }

        else {
            let cleanArticle = await Article.findOne({ title: article.title.replace("-preview", "") }) //check if -preview is in the end or maybe use it on link only???????
            if (cleanArticle) {
                cleanArticle.title = req.body.title.replace("-preview", "")
                cleanArticle.description = req.body.description
                cleanArticle.markdownText = req.body.markdownText
            } else {
                cleanArticle = new Article({
                    title: req.body.title.replace("-preview", ""),
                    description: req.body.description,
                    markdownText: req.body.markdownText
                })
            }
            cleanArticle.preview = false
            await Article.remove(article)
            try {
                cleanArticle = await cleanArticle.save()
                res.redirect(`/articles/${cleanArticle.link}`)
            }
            catch (err) {
                res.render(`articles/${path}`, { oldArticle })
            }
            return
        }
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