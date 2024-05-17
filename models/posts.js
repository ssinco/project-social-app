const mongoose = require('mongoose');

const commentSchema = mongoose.Schema({
    content: {
        type: String,
        required: true,
    },
    commenterId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref:'User',
    },

    commenter: {
        type: String,
        required: true,
    },

    // add post date 
    
})

const postSchema = mongoose.Schema({
    content: {
        type: String,
        required: true,
    },

    userLikes: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'User',

    },

    authorId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref:'User',
    },

    author: {
        type: String,
        required: true,
    },

    comments: [commentSchema]

    // add post date 
   
});



const Post = mongoose.model('Post', postSchema);
const Comment = mongoose.model('Comment', commentSchema);


module.exports = Post;