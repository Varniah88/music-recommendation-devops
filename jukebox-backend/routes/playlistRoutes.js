const express = require('express');
const router = express.Router();
const playlistController = require('../controller/playlistController');

router.get('/', playlistController.getAllPlaylists);
router.delete('/:playlistId/songs/:trackId', playlistController.removeSongFromPlaylist);
router.delete('/:id', playlistController.deletePlaylist);
router.put('/:playlistId', playlistController.updatePlaylistName);
router.post('/', playlistController.createPlaylist);

module.exports = router;