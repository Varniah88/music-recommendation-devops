const fs = require('fs');
const path = require('path');
const Song = require('../model/song.js');
const { getSongById, getSongByName, getArtistById } = require('../services/spotifyService.js');


const saveSongsFromFile = async (req, res) => {
    try {
        // const filePath = path.join(__dirname, '../data/unique_song_ids_by_genre.txt');
        const filePath = path.join(__dirname, '../data/track_ids.txt');
        const content = fs.readFileSync(filePath, 'utf-8');
        const songIds = content.split('\n').map(id => id.trim()).filter(Boolean);

        const savedSongs = [];

        for (const id of songIds) {
            const songData = await getSongById(id);

            const newSong = new Song({
                name: songData.name,
                songId: songData.id,
                artists: songData.artists.map(a => ({
                    name: a.name,
                    id: a.id,
                    href: a.href,
                })),
                album: {
                    name: songData.album.name,
                    id: songData.album.id,
                    href: songData.album.href,
                    images: songData.album.images,
                    release_date: songData.album.release_date,
                },
                duration_ms: songData.duration_ms,
                popularity: songData.popularity,
                explicit: songData.explicit,
                preview_url: songData.preview_url,
                external_urls: songData.external_urls,
                type: songData.type,
                release_date: new Date(songData.album.release_date),
                external_id: songData.external_ids?.isrc || '',
            });

            await newSong.save();
            savedSongs.push(newSong);
            console.log(`Song added: ${songData.name}`);
        }

        res.status(201).json({
            message: `${savedSongs.length} songs saved from file.`,
            songs: savedSongs,
        });
    } catch (error) {
        console.error('Error saving songs from file:', error);
        res.status(500).json({ error: 'Failed to save songs from file' });
    }
};


const saveSongsByName = async (req, res) => {
    try {
        const query = req.params.songName;
        const songResults = await getSongByName(query);

        if (!songResults || songResults.length === 0) {
            return res.status(404).json({ message: 'No songs found for the given name.' });
        }

        const savedSongs = [];

        for (const songData of songResults) {
            // Avoid duplicates by checking songId
            const exists = await Song.findOne({ songId: songData.id });
            if (exists) {
                console.log(`Song already exists: ${songData.name}`);
                continue;
            }

            const newSong = new Song({
                name: songData.name,
                songId: songData.id,
                artists: songData.artists.map(a => ({
                    name: a.name,
                    id: a.id,
                    href: a.href,
                })),
                album: {
                    name: songData.album.name,
                    id: songData.album.id,
                    href: songData.album.href,
                    images: songData.album.images,
                    release_date: songData.album.release_date,
                },
                duration_ms: songData.duration_ms,
                popularity: songData.popularity,
                explicit: songData.explicit,
                preview_url: songData.preview_url,
                external_urls: songData.external_urls,
                type: songData.type,
                release_date: new Date(songData.album.release_date),
                external_id: songData.external_ids?.isrc || '',
            });

            await newSong.save();
            savedSongs.push(newSong);
            console.log(`Song added: ${songData.name}`);
        }

        res.status(201).json({
            message: `${savedSongs.length} new songs saved for search query "${query}".`,
            songs: savedSongs,
        });
    } catch (error) {
        console.error('Error saving songs by name:', error);
        res.status(500).json({ error: 'Failed to save songs by name' });
    }
};

const deleteSongById = async (req, res) => {
    try {
        const { songId } = req.params;

        const deletedSong = await Song.findOneAndDelete({ songId });

        if (!deletedSong) {
            return res.status(404).json({ message: 'Song not found in database.' });
        }

        res.status(200).json({ message: 'Song deleted successfully.', deletedSong });
    } catch (error) {
        console.error('Error deleting song:', error);
        res.status(500).json({ error: 'Failed to delete song from database.' });
    }
};

const getAllSongs = async (req, res) => {
    try {
        const songs = await Song.find({});
        res.status(200).json(songs);
    } catch (error) {
        console.error('Error fetching all songs:', error);
        res.status(500).json({ error: 'Failed to fetch songs from database.' });
    }
};

const getSongByIdDB = async (req, res) => {
    try {
        const { id } = req.params;
        const song = await Song.findOne({ songId: id });

        if (!song) {
            return res.status(404).json({ message: 'Song not found in database.' });
        }

        res.status(200).json(song);
    } catch (error) {
        console.error('Error fetching song by ID:', error);
        res.status(500).json({ error: 'Failed to fetch song from database.' });
    }
};

const getTopSongs = async (req, res) => {
    try {
        const songs = await Song.find({})
            .sort({ popularity: -1 }) // optional: sort by popularity
            .limit(15); // only return 15

        if (!songs || songs.length === 0) {
            return res.status(404).json({ message: 'No songs found in database.' });
        }

        res.status(200).json(songs);
    } catch (error) {
        console.error('Error fetching top songs:', error);
        res.status(500).json({ error: 'Failed to fetch top songs from database.' });
    }
};

const getTopArtists = async (req, res) => {
    try {
        // Fetch 100 songs (more chance to find unique artists)
        const songs = await Song.find({}).limit(100);

        // Extract artist IDs from songs
        const artistIdSet = new Set();
        for (const song of songs) {
            for (const artist of song.artists) {
                artistIdSet.add(artist.id);
            }
            if (artistIdSet.size >= 25) break; // stop once we hit 25 unique artists
        }

        const artistIds = Array.from(artistIdSet).slice(0, 25);

        // Fetch artist details from Spotify
        const artists = await Promise.all(artistIds.map(getArtistById));

        res.status(200).json(artists);
    } catch (error) {
        console.error('Error fetching top artists:', error);
        res.status(500).json({ error: 'Failed to fetch top artists' });
    }
};

const searchSongs = async (req, res) => {
    try {
        const query = req.query.q || '';
        if (!query) return res.status(400).json({ message: 'Search query is required.' });

        const songs = await Song.find({ name: new RegExp(query, 'i') }).limit(10);

        if (songs.length === 0) {
            return res.status(404).json({ message: 'No matching songs found.' });
        }

        res.status(200).json(songs);
    } catch (error) {
        console.error('Error searching songs:', error);
        res.status(500).json({ error: 'Failed to search songs in database.' });
    }
};


module.exports = {
    saveSongsFromFile,
    saveSongsByName,
    deleteSongById,
    getAllSongs,
    getSongByIdDB,
    getTopSongs,
    getTopArtists,
    searchSongs
};