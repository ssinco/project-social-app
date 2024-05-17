const express = require ('express')
const router = express.Router();

const User = require('../models/users.js');
const Post = require('../models/posts.js');

/* Routes
-------------------------------------------------- */

// Feed route
router.get('/', async (req,res) => {
    try {
        const allPosts = await Post.find().populate([
            {
                path: 'comments.commenterId',
                select: 'profilePhotoUrl author _id',
            },
            {
                path: 'authorId',
                select: 'profilePhotoUrl _id',
            }
        ])
        const user = await User.findById(req.session.user._id)
        const userStats = await uniquePostCount()
        res.render('../views/feed/index', {
            allPosts: allPosts,
            user: user,
            userStats: userStats,
        })
    } catch (error){
        res.redirect('/')
    }
})


// Create a post route
router.post('/post', async (req,res)=>{
    try {
        const authorAcc = await User.findById(req.session.user._id)
        const author = authorAcc.author
        await Post.create({
            content: req.body.content,
            authorId: req.session.user._id,
            author: author,
        })
        res.redirect('/feed')
    } catch (error){
        res.redirect('/')
    }
})


// Delete a post route
router.delete('/delete/:postId', async (req,res) =>{
    try {
        await Post.findByIdAndDelete(req.params.postId)
        res.redirect('/feed')
    } catch (error){
        res.redirect('/')
    }
})

// Edit a post
router.put('/edit/:postId', async (req,res) => {
    try {
        const foundPost = await Post.findById(req.params.postId)
        await foundPost.set({
            content: req.body.content,
            // add more data when ready
        })
        await foundPost.save()
        res.redirect('/feed')
    } catch (error){
        res.redirect('/')
    }
})

/* Routes - Engagement
-------------------------------------------------- */

// Create a comment
router.post('/comment/:postId', async (req,res) => {
    try {
        const authorAcc = await User.findById(req.session.user._id)
        const foundPost = await Post.findById(req.params.postId)
        const newComment = {
            content: req.body.comment,
            commenterId: authorAcc._id,
            commenter: authorAcc.author,
        }
        foundPost.comments.push(newComment)
        await foundPost.save()
        res.redirect('/feed')
    } catch (error){
        res.redirect('/')
    }
})

// Update the like count
router.post('/like/:postId', async (req,res)=>{
    try {
        const findPost = await Post.findById(req.params.postId)
        const userFound = findPost.userLikes.find((userId)=> userId.toString() === req.session.user._id.toString())
        if (!userFound) {
            findPost.userLikes.push(req.session.user._id)
        } else {
            const newArray = await findPost.userLikes.filter((userId)=> userId.toString() !== userFound.toString())
            findPost.userLikes = newArray
        }
        await findPost.save()
        res.redirect('/feed')
    } catch (error){
        res.redirect('/')
    }
})


async function uniquePostCount (){
    const allPosts = await Post.find()
    const allAuthors = await User.find({},'author')

    const allAuthorsObj = allAuthors.map(author => author.toObject());

    allAuthorsObj.forEach((author) => {
        let postCount = 0
        let commentCount = 0
        allPosts.forEach((post) => {
            if (author._id.toString() === post.authorId.toString()) {
                postCount++;
            }
            post.comments.forEach((comment)=>{
                if (author._id.toString() === comment.commenterId.toString()){
                    commentCount++;
                }
            })
        })
        author.totalPostsAndComments = postCount + commentCount
    })
    return allAuthorsObj
}

module.exports = router