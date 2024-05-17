const mongoose = require('mongoose');


const userSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  author: {
    type: String,
  },

  city: {
    type: String,
  },

  state: {
    type: String,
  },

  profilePhotoUrl: {
    type: String,
    default: '/assets/icons_profile/icon_profile_origami-blue.png',
  }

});

const User = mongoose.model('User', userSchema);


module.exports = User;