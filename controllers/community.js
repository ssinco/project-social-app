const express = require ('express')
const router = express.Router();

const User = require('../models/users.js');
const Post = require('../models/posts.js');

/* Routes
-------------------------------------------------- */

// Show the community page
router.get('/', async (req,res) => {
    try {
        const allUsers = await User.find()
        const viewerId = req.session.user._id 
        res.render('../views/community/index', {
            allUsers:allUsers,
            viewerId:viewerId,
        })
    } catch(error){
        res.redirect('/')
    }
})


module.exports = router