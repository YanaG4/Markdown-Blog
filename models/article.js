const mongoose = require('mongoose')
const { marked } = require('marked')
const slugify = require('slugify')
const createDomPurify = require('dompurify')
const { JSDOM } = require('jsdom')
const dompurify = createDomPurify(new JSDOM().window)

const articleSchema = new mongoose.Schema({
    title: {
        required: true,
        type: String
    },
    description: {
        type: String
    },
    markdownText: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    link: {
        type: String,
        required: true,
        unique: true
    },
    sanitizedText: {
        type: String,
        required: true
    }
})

articleSchema.pre('validate', function (next) {
    if (this.title) {
        this.link = slugify(this.title, {
            lower: true,
            strict: true //get rid of any characters that don't fit URL
        })
    }

    if (this.markdownText) {
        this.sanitizedText = dompurify.sanitize(marked(this.markdownText))
    }

    next()
})

module.exports = mongoose.model('Article', articleSchema)