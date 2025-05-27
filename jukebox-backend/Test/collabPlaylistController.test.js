const { expect } = require('chai');
const sinon = require('sinon');
const Playlist = require('../model/collaborativePlaylist');
const playlistController = require('../controller/collabPlaylistController');
const socketManager = require('../socket');
const mongoose = require('mongoose');
const Song = require('../model/song');
const UserPlaylist = require('../model/playlist');

describe('Playlist Controller', () => {
  describe('getPlaylists', () => {
    it('should return playlists', async () => {
      const fakePlaylists = [{ name: 'Test Playlist 1' }, { name: 'Test Playlist 2' }];
      const req = {};
      const res = {
        json: sinon.spy()
      };

      const findStub = sinon.stub(Playlist, 'find').returns({
        sort: sinon.stub().returns(Promise.resolve(fakePlaylists))
      });

      await playlistController.getPlaylists(req, res);

      expect(res.json.calledOnce).to.be.true;
      expect(res.json.calledWith(fakePlaylists)).to.be.true;

      findStub.restore();
    });
  });

describe('createPlaylist', () => {
  afterEach(() => {
    sinon.restore(); // Restore all stubs/spies after each test
  });

  it('should create a new playlist, emit socket event, and return 201 with playlist', async () => {
    const validObjectId = '66510d6e7a2bc6e5f52a1225';

    const req = {
      body: {
        name: 'My Playlist',
        userId: new mongoose.Types.ObjectId(validObjectId),
        username: 'testuser'
      },
      file: {
        filename: 'img.png'
      },
      protocol: 'http',
      get: sinon.stub().withArgs('host').returns('localhost:3000')
    };

    // Stub Playlist.prototype.save to avoid DB calls
    const saveStub = sinon.stub(Playlist.prototype, 'save').resolves();

    // Stub socketManager.getIO().emit to spy on it
    const emitStub = sinon.stub();
    sinon.stub(socketManager, 'getIO').returns({ emit: emitStub });

    // Spy on res.status and res.json
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    await playlistController.createPlaylist(req, res);

    // Assertions
    expect(saveStub.calledOnce).to.be.true;
    expect(emitStub.calledOnce).to.be.true;
    expect(emitStub.calledWith('playlistCreated')).to.be.true;

    expect(res.status.calledOnceWith(201)).to.be.true;
    expect(res.json.calledOnce).to.be.true;

    const responseArg = res.json.firstCall.args[0];
    expect(responseArg).to.have.property('message', 'Playlist created');
    expect(responseArg).to.have.property('playlist');

    // The playlist returned should be a plain object with the expected fields
    expect(responseArg.playlist).to.include({
      name: 'My Playlist',
    });
    expect(responseArg.playlist.imageUrl).to.equal('http://localhost:3000/uploads/img.png');

    // createdBy object with correct userId and username (compare userId as string)
    expect(responseArg.playlist.createdBy.username).to.equal('testuser');
    expect(responseArg.playlist.createdBy.userId.toString()).to.equal(validObjectId);

    // songs array should be empty
    expect(responseArg.playlist.songs).to.be.an('array').that.is.empty;
  });
});


describe('addSong controller', () => {
  let req, res, statusStub, jsonStub;
  let playlistFindStub, songFindStub;
  let saveStub;
  let socketStub;

  beforeEach(() => {
    req = {
      params: { playlistId: 'playlistId123' },
      body: {
        songId: 'songId123',
        userId: 'user123',
        username: 'testuser'
      }
    };

    jsonStub = sinon.stub();
    statusStub = sinon.stub().returns({ json: jsonStub });
    res = { status: statusStub, json: jsonStub };

    saveStub = sinon.stub();

    socketStub = {
      to: sinon.stub().returns({ emit: sinon.stub() })
    };

    sinon.stub(socketManager, 'getIO').returns(socketStub);
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should return 404 if playlist not found', async () => {
    playlistFindStub = sinon.stub(Playlist, 'findById').resolves(null);

    await playlistController.addSong(req, res);

    expect(statusStub.calledWith(404)).to.be.true;
    expect(jsonStub.calledWith({ message: 'Playlist not found' })).to.be.true;
  });

  it('should return 404 if song not found', async () => {
    playlistFindStub = sinon.stub(Playlist, 'findById').resolves({ songs: [], save: saveStub });
    songFindStub = sinon.stub(Song, 'findById').resolves(null);

    await playlistController.addSong(req, res);

    expect(statusStub.calledWith(404)).to.be.true;
    expect(jsonStub.calledWith({ message: 'Song not found in database.' })).to.be.true;
  });

  it('should return 400 if song already added', async () => {
    playlistFindStub = sinon.stub(Playlist, 'findById').resolves({
      songs: [{ songId: 'songId123' }],
      save: saveStub
    });
    songFindStub = sinon.stub(Song, 'findById').resolves({ _id: 'songId123' });

    await playlistController.addSong(req, res);

    expect(statusStub.calledWith(400)).to.be.true;
    expect(jsonStub.calledWith({ message: 'Song already added.' })).to.be.true;
  });

  it('should add song, emit event, and return playlist', async () => {
    const playlistMock = {
      songs: [],
      save: saveStub.resolves()
    };
    const songMock = {
      _id: 'songId123',
      name: 'Song Name',
      artists: [{ name: 'Artist1' }, { name: 'Artist2' }],
      album: { images: [{ url: 'http://image.com/art.jpg' }] }
    };

    playlistFindStub = sinon.stub(Playlist, 'findById').resolves(playlistMock);
    songFindStub = sinon.stub(Song, 'findById').resolves(songMock);

    await playlistController.addSong(req, res);

    expect(playlistMock.songs).to.have.lengthOf(1);
    const addedSong = playlistMock.songs[0];
    expect(addedSong.title).to.equal('Song Name');
    expect(addedSong.artist).to.equal('Artist1, Artist2');
    expect(addedSong.imageUrl).to.equal('http://image.com/art.jpg');
    expect(addedSong.addedBy).to.deep.equal({ userId: 'user123', username: 'testuser' });

    expect(saveStub.calledOnce).to.be.true;
    expect(socketManager.getIO().to.calledWith('playlist-playlistId123')).to.be.true;
    expect(res.json.calledWith({
      message: 'Song added',
      playlist: playlistMock
    })).to.be.true;
  });
});

describe('removeSong controller', () => {
  let req, res, statusStub, jsonStub;
  let playlistFindStub, saveStub;
  let socketStub;

  beforeEach(() => {
    req = {
      params: { playlistId: 'playlist123' },
      body: {
        songId: 'song123',
        userId: 'user1'
      }
    };

    jsonStub = sinon.stub();
    statusStub = sinon.stub().returns({ json: jsonStub });
    res = { status: statusStub, json: jsonStub };

    socketStub = {
      to: sinon.stub().returns({ emit: sinon.stub() })
    };

    sinon.stub(socketManager, 'getIO').returns(socketStub);
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should return 404 if playlist not found', async () => {
    playlistFindStub = sinon.stub(Playlist, 'findById').resolves(null);

    await playlistController.removeSong(req, res);

    expect(statusStub.calledWith(404)).to.be.true;
    expect(jsonStub.calledWith({ message: 'Playlist not found' })).to.be.true;
  });

  it('should return 403 if user is not the creator', async () => {
    playlistFindStub = sinon.stub(Playlist, 'findById').resolves({
      createdBy: { userId: 'differentUser' },
      songs: [{ songId: 'song123' }]
    });

    await playlistController.removeSong(req, res);

    expect(statusStub.calledWith(403)).to.be.true;
    expect(jsonStub.calledWith({ message: 'Only the creator can remove songs' })).to.be.true;
  });

  it('should return 403 if song is not in playlist', async () => {
    playlistFindStub = sinon.stub(Playlist, 'findById').resolves({
      createdBy: { userId: 'user1' },
      songs: [{ songId: 'anotherSongId' }]
    });

    await playlistController.removeSong(req, res);

    expect(statusStub.calledWith(403)).to.be.true;
    expect(jsonStub.calledWith({ message: 'song not found' })).to.be.true;
  });

  it('should remove song and emit socket event', async () => {
    const saveStub = sinon.stub().resolves();
    const playlistMock = {
      createdBy: { userId: 'user1' },
      songs: [{ songId: 'song123' }, { songId: 'song456' }],
      save: saveStub
    };

    playlistFindStub = sinon.stub(Playlist, 'findById').resolves(playlistMock);

    await playlistController.removeSong(req, res);

    expect(playlistMock.songs).to.have.lengthOf(1);
    expect(playlistMock.songs[0].songId).to.equal('song456');
    expect(saveStub.calledOnce).to.be.true;

    expect(socketManager.getIO().to.calledWith('playlist-playlist123')).to.be.true;
    expect(res.json.calledWith({
      message: 'Song removed',
      playlist: playlistMock
    })).to.be.true;
  });
});

});
