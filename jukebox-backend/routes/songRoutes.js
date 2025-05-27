const express = require('express');
const router = express.Router();
const { saveSongsFromFile, saveSongsByName, deleteSongById, getAllSongs, getSongByIdDB,getTopSongs, getTopArtists, searchSongs } = require('../controller/songController.js');
const apicache = require('apicache');

let cache = apicache.middleware

router.get('/save-from-file', saveSongsFromFile);
router.get('/search/:songName', saveSongsByName);
router.get('/top-songs', getTopSongs);
router.get('/top-artists', getTopArtists);
router.delete('/remove/:songId', deleteSongById);
router.get('/', cache('2 minutes'), getAllSongs); 
router.get('/search-db', searchSongs);
router.delete('/:songId', deleteSongById);
// router.get('/', getAllSongs); 
router.get('/:id', getSongByIdDB); 

module.exports = router;
