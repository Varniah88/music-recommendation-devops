const express = require('express');
const path = require('path');
const router = express.Router();

const basePath = path.join(__dirname, '../../jukebox-frontend/views');

router.get('/', (req, res) => res.sendFile(path.join(basePath, 'landing.html')));
router.get('/about', (req, res) => res.sendFile(path.join(basePath, 'about.html')));
router.get('/admin', (req, res) => res.sendFile(path.join(basePath, 'admin.html')));
router.get('/home', (req, res) => res.sendFile(path.join(basePath, 'home.html')));
router.get('/login', (req, res) => res.sendFile(path.join(basePath, 'login.html')));
router.get('/playlist', (req, res) => res.sendFile(path.join(basePath, 'playlist.html')));
router.get('/profile', (req, res) => res.sendFile(path.join(basePath, 'profile.html')));
router.get('/register', (req, res) => res.sendFile(path.join(basePath, 'register.html')));
router.get('/songrecommendation', (req, res) => res.sendFile(path.join(basePath, 'songrecommendation.html')));
router.get('/playlistLiveRoom', (req, res) => res.sendFile(path.join(basePath, 'playlistLiveRoom.html')));
router.get('/landing', (req, res) => res.sendFile(path.join(basePath, 'landing.html')));

module.exports = router;
