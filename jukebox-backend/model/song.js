const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
  name: {
    type: String,
    required: false,
  },
  songId: {
    type: String,
    unique: true,  
    required: true,
  },
  artists: [
    {
      name: String,
      id: String,
      href: String, 
    }
  ],
  album: {
    name: String,
    id: String,
    href: String,
    images: [
      {
        url: String,  
        width: Number,
        height: Number
      }
    ],
    release_date: String,  
  },
  duration_ms: {
    type: Number,  
    required: true,
  },
  popularity: {
    type: Number,  
    min: 0,
    max: 100
  },
  explicit: {
    type: Boolean,  
    default: false,
  },
  preview_url: {
    type: String,  
  },
  external_urls: {
    spotify: {
      type: String,  
      required: true,
    }
  },
  type: {
    type: String,  
    required: true,
  },
  release_date: {
    type: Date,  
  },
  external_id: {
    type: String, 
  },
});

module.exports = mongoose.model('Song', songSchema);
