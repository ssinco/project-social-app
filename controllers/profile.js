const express = require ('express')
const router = express.Router();

const User = require('../models/users.js');
const Post = require('../models/posts.js');


/* Routes
-------------------------------------------------- */


// Show the profile page
router.get('/', async (req,res) => {
    try {
        const allUserPosts = await Post.find({authorId: req.session.user._id}).populate([
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
        const viewerId = req.session.user._id 
        res.render('../views/profile/index', {
            allPosts: allUserPosts,
            user: user, 
            viewerId: viewerId,
        })
    } catch (error){
        res.redirect('/')
    }
})

// router.get('/', async (req,res)=>{
//     try {
//       const allUserPosts = await Post.find({authorId: req.session.user._id})
//       const user = await User.findById(req.session.user._id)
//       const viewerId = req.session.user._id 
//       res.render('../views/profile/index', {
//         allPosts: allUserPosts,
//         user: user,
//         viewerId: viewerId,
//       })
//     } catch(error){
//       res.send('error')
//     }
//   })

// Show the profile edit page
router.get('/edit', async (req,res)=>{
    try {
        const user = await User.findById(req.session.user._id)
        res.render('../views/profile/edit', {
            user: user,
        })
    } catch(error){
        res.redirect('/profile')
    }
})

// Show the profile of other users
router.get('/:userId', async (req,res) => {
    try {
        const allUserPosts = await Post.find({authorId: req.params.userId}).populate([
        {
            path: 'comments.commenterId',
            select: 'profilePhotoUrl author _id',
        },
        {
            path: 'authorId',
            select: 'profilePhotoUrl _id',
        }
        ])
        const user = await User.findById(req.params.userId)
        const viewerId = req.session.user._id
        res.render('../views/profile/index', {
            allPosts: allUserPosts,
            user: user,
            viewerId: viewerId,
        })
    } catch(error){
        res.redirect('/profile')
    }
   
})




// Update the users profile
router.put('/edit', async (req,res)=>{
    try {
        const userToUpdate = await User.findById(req.session.user._id)
        await updateAuthor(req.body.author, req.session.user._id)
        await userToUpdate.set(req.body)
        await userToUpdate.save()
        res.redirect('/profile')
    } catch(error){
        res.redirect('/profile')
    }   
})




/* Routes - Posting
-------------------------------------------------- */

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
        res.redirect('/profile')
    } catch(error){
        res.redirect('/profile')
    }
})

// Delete a post route
router.delete('/delete/:postId', async (req,res) =>{
    try {
        await Post.findByIdAndDelete(req.params.postId)
        res.redirect('/profile')
    } catch(error) {
        res.redirect('/profile')
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
        res.redirect('/profile')
    } catch(error){
        res.redirect('/profile')
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
        res.redirect('/profile')
    } catch (error){
        res.redirect('/profile')
    }
    
})

// Update the like count
router.post('/like/:postId', async (req,res)=>{
    try {   
        const findPost = await Post.findById(req.params.postId)
        const userFound = findPost.userLikes.some((userId)=> userId.toString() === req.session.user._id.toString())
        if (!userFound) {
            findPost.userLikes.push(req.session.user._id)
        } else {
            const newArray = findPost.userLikes.filter((userId)=> userId.toString() === userFound.toString())
            findPost.userLikes = newArray
        }
        await findPost.save()
        res.redirect('/profile')
    } catch(error){
        res.redirect('/profile')
    }
})

  module.exports = router


/* Functions 
-------------------------------------------------- */

async function updateAuthor(newAuthor, userId) {
    const allPosts= await Post.find()
    for (const post of allPosts){
        if (post.authorId.toString() === userId.toString()) {
            post.author = newAuthor
        }
        post.comments.forEach((comment)=>{
            if (comment.commenterId.toString() === userId.toString()){
                comment.commenter = newAuthor
            }
        })
        await post.save()
    }
    allPosts.forEach((post)=>{
    })
}
