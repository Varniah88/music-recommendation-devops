console.log("🎬 playlistLiveRoom.js is running");
const socket = io("http://100.88.93.60:3000");
// Connect to backend server

socket.on("connect", () => {
  console.log("🔌 Connected to Socket.IO server:", socket.id);
});

socket.on("playlistCreated", (playlist) => {
  console.log("🆕 New playlist created via socket:", playlist);

  const playlistListContainer = document.getElementById('playlistList');

  if (playlistListContainer) {
    const col = document.createElement('div');
    col.className = 'col s12 m6 l4';
    col.innerHTML = `
     <div class="card black">
              <div class="card-content playlist-card-content white-text">
                <img src="${playlist.imageUrl}" alt="Playlist Image" class="playlist-image" />
                <h5 class="playlist-title">${playlist.name}</h5>
                <p class="playlist-creator">Created By: ${playlist.createdBy.username}</p>
              </div>
              <div class="card-action center-align">
                <a href="#" class="join-playlist-btn pink-text" data-id="${playlist._id}">Join</a>
              </div>
        </div>
    `;
    playlistListContainer.appendChild(col);
  }
});




document.addEventListener('DOMContentLoaded', async function () {
  const username = sessionStorage.getItem('userName') || 'Guest';
  const email = sessionStorage.getItem('userEmail');

  socket.on('userJoined', ({ userId, username, message }) => {
    // Show two toast notifications using Materialize CSS
    M.toast({ html: `👤 User joined: ${username}`, displayLength: 700 });

    // Update notification element if it exists
    const notifElem = document.getElementById("userJoinNotification");
    if (notifElem) {
      // Use message.username if available, fallback to generic text
      notifElem.innerText = `🎉 ${username || 'A user'} joined the playlist!`;
      notifElem.style.display = "block";

      // Hide notification after 10 seconds
      setTimeout(() => {
        notifElem.style.display = "none";
      }, 5000);
    }
  });



  if (!email) {
    M.toast({ html: 'You must be logged in.', displayLength: 800 });


    window.location.href = '../views/login.html';
    return;
  }

  const usernameElem = document.getElementById('username');
  const playlistSelect = document.getElementById('playlistSelect');
  const playlistListContainer = document.getElementById('playlistList');
  const playlistSongsModalElem = document.getElementById('playlistSongsModal');
  const playlistSongsModal = M.Modal.init(playlistSongsModalElem); // Only init once

  const modalElem = document.getElementById('addSongModal');
  const elems = document.querySelectorAll('.modal');
  M.Modal.init(elems)

  const modalInstance = M.Modal.getInstance(modalElem);
  M.Modal.init(document.querySelectorAll('.modal'));
  if (usernameElem) {
    usernameElem.textContent = username;
  }

  // Initialize Materialize components
  M.FormSelect.init(document.querySelectorAll('select'));

  socket.on('songAdded', ({ playlistId, song }) => {
    const currentPlaylistId = localStorage.getItem('currentPlaylistId');

    if (playlistId !== currentPlaylistId) return; // ignore updates for other playlists

    const tbody = document.getElementById('songsTableBody');
    const tr = document.createElement('tr');
    tr.innerHTML = `
  <td>
  <img src="${song.imageUrl || 'default.jpg'}" alt="Song Image"
       style="width: 50px; height: 50px; object-fit: cover; border-radius: 50%;">
</td>
<td style="font-weight: bold;">${song.title}</td> 
<td style="font-weight: bold;">${song.addedBy.username}</td>`;
    tbody.appendChild(tr);
    socket.emit('songAdded', { currentPlaylistId, song });
    console.log(`${song.title} added by ${song.addedBy.username}`)
  });

 

  playlistListContainer.addEventListener('click', async function (e) {
    const playlistSongsModalElem = document.getElementById('playlistSongsModal');
   const playlistSongsModal = M.Modal.init(playlistSongsModalElem, {
  onCloseEnd: () => {
    const playlistId = localStorage.getItem('currentPlaylistId');
    const playlistName = document.getElementById('modalPlaylistName').textContent;
    const username = sessionStorage.getItem('userName') || 'Guest';

    if (playlistId) {
      socket.emit('leavePlaylist', { playlistId, username, playlistName });
      localStorage.removeItem('currentPlaylistId');
      console.log(`You left playlist: ${playlistName}`);
    }
  }
});
    const username = sessionStorage.getItem('userName') || 'Guest'
    if (e.target.classList.contains('join-playlist-btn')) {
      e.preventDefault();
      const playlistId = e.target.getAttribute('data-id');
      localStorage.setItem('currentPlaylistId', playlistId);
      try {
        const res = await fetch('http://localhost:3000/api/playlist/all');
        const playlists = await res.json();
        console.log(playlists)
        const playlist = playlists.find(p => p._id === playlistId);
        if (!playlist) {
          M.toast({ html: 'Playlist not found.', displayLength: 800 });
          return;
        }

        // Show playlist name
        document.getElementById('modalPlaylistName').textContent = playlist.name;
        const playlistName = playlist.name
        // Fill table
        const tbody = document.getElementById('songsTableBody');
        tbody.innerHTML = '';

        if (playlist.songs.length === 0) {
          M.toast({ html: 'Playlist Empty!', displayLength: 700 });
        } else {
          playlist.songs.forEach(song => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
              <td>
  <img src="${song.imageUrl || 'default.jpg'}" alt="Song Image"
       style="width: 50px; height: 50px; object-fit: cover; border-radius: 50%;">
</td>
              <td style="font-weight: bold;">${song.title}</td>
<td style="font-weight: bold;">${song.addedBy.username}</td>
            `;
            tbody.appendChild(tr);
          });
        }

        playlistSongsModal.open();
        socket.emit('joinPlaylist', { playlistId, username, playlistName });
      } catch (err) {
        console.error('Failed to fetch playlist songs:', err);
        M.toast({ html: 'Failed to load songs. Please try again later.', displayLength: 700 });

      }
    }

  });

  async function fetchPlaylists() {
    try {
      const res = await fetch('http://localhost:3000/api/playlist/all');
      const playlists = await res.json();

      if (playlistSelect) {
        playlistSelect.innerHTML = '<option disabled selected>Select a Playlist Room</option>';
      }
      if (playlistListContainer) {
        playlistListContainer.innerHTML = '';
      }

      playlists.forEach(p => {
        if (playlistSelect) {
          const option = document.createElement('option');
          option.value = p._id;
          option.textContent = p.name;
          playlistSelect.appendChild(option);
        }
          const col = document.createElement('div');
          col.className = 'col s12 m6 l4';
          col.innerHTML = `
            <div class="card black">
              <div class="card-content playlist-card-content white-text">
                <img src="${p.imageUrl}" alt="Playlist Image" class="playlist-image" />
                <h5 class="playlist-title">${p.name}</h5>
                <p class="playlist-creator">Created By: ${p.createdBy.username}</p>
              </div>
              <div class="card-action center-align">
                <a href="#" class="join-playlist-btn pink-text" data-id="${p._id}">Join Room</a>
              </div>
            </div>
          `;
          playlistListContainer.appendChild(col);

      });

      M.FormSelect.init(playlistSelect);
    } catch (err) {
      console.error('Failed to fetch playlists:', err);
    }
  }

  async function handleCreatePlaylist() {
     const form = document.getElementById('createPlaylistForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nameInput = document.getElementById('playlistNameInput');
    const imageInput = document.getElementById('playlistImageInput');
    const name = nameInput.value.trim();
    const imageFile = imageInput.files[0];  // grab the first selected file

    if (!name || !imageFile) {
      M.toast({ html: 'Please provide both playlist name and an image.', displayLength: 800 });
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('username', username);  // make sure username is defined somewhere
      formData.append('image', imageFile);

      const res = await fetch('http://localhost:3000/api/playlist/create', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        nameInput.value = '';
        imageInput.value = '';
        M.Modal.getInstance(document.getElementById('createPlaylistModal')).close();
        await fetchPlaylists(); // Refresh list
      } else {
        const errData = await res.json();
        M.toast({ html: 'Failed to create playlist.', displayLength: 800 });
      }
    } catch (err) {
      console.error('Error creating playlist:', err);
      M.toast({ html: 'Error occurred. Check console.', displayLength: 800 });
    }
  });
  }

  const addSongToPlaylist = async () => {

    // Add song to playlist
    document.getElementById('addSongButton').addEventListener('click', async () => {
      const playlistId = localStorage.getItem('currentPlaylistId');

      if (!playlistId) {
        console.error('playlistId is required to add a song');
        return;
      }

      const searchInput = document.getElementById('searchInput').value.trim();
      const playlistName = document.getElementById('modalPlaylistName').textContent;

      if (!searchInput || !playlistName) {
        M.toast({ html: 'Please enter a song title and ensure a playlist is selected.', displayLength: 800 });
        return;
      }

      try {
        const songId = localStorage.getItem(`selectedSong`) // you need to implement this
        if (!songId) {
          M.toast({ html: 'Song not found.', displayLength: 800 });
          return;
        }
        // Get current user info
        const username = sessionStorage.getItem('userName') || 'Guest'
        const email = sessionStorage.getItem('userEmail') || 'unknown@example.com'


        // Send song to backend
        const res = await fetch(`http://localhost:3000/api/playlist/${playlistId}/add-song`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ songId, username }),
        });

        const data = await res.json();

        if (res.ok) {
          M.toast({ html: 'Song added successfully!', displayLength: 800 });
          document.getElementById('searchInput').value = '';

          // Refresh playlist songs in modal
          //     const tbody = document.getElementById('songsTableBody');
          //     const tr = document.createElement('tr');
          //     const title = localStorage.getItem(`songtitle`)
          //     tr.innerHTML = `
          //   <td>${title}</td>
          //   <td>${username}</td>
          // `;
          //     tbody.appendChild(tr);
        } else {
          throw new Error(data.message || 'Failed to add song');
        }
      } catch (error) {
        console.error('❌ Error adding song:', error);
        console.error('Failed to add song. Please try again.');
      }
    });



  }
  window.logout = () => {
    sessionStorage.clear();
    window.location.href = '../views/login.html';
  };


  await fetchPlaylists();
  await handleCreatePlaylist();
  await addSongToPlaylist();

});

const input = document.getElementById('searchInput');
const suggestionsList = document.getElementById('suggestions');

input.addEventListener('input', async () => {
  const query = input.value.trim();
  if (!query) {
    suggestionsList.style.display = 'none';
    suggestionsList.innerHTML = '';
    return;
  }

  try {
    const res = await fetch(`http://localhost:3000/api/songs/search-db?q=${encodeURIComponent(query)}`);
    const songs = await res.json();

    suggestionsList.innerHTML = '';
    if (!Array.isArray(songs)) {
      suggestionsList.style.display = 'none';
      return;
    }

    songs.forEach(song => {
      const li = document.createElement('li');
      li.textContent = song.name + ' – ' + (song.artists[0]?.name || 'Unknown Artist');
      li.style.padding = '8px';
      li.style.cursor = 'pointer';

      li.addEventListener('click', () => {
        input.value = song.name;
        suggestionsList.style.display = 'none';
        // Optional: redirect to song detail or display info

        localStorage.setItem('selectedSong', song._id);
        localStorage.setItem('songtitle', song.name);

      });

      suggestionsList.appendChild(li);
    });

    suggestionsList.style.display = songs.length > 0 ? 'block' : 'none';
  } catch (err) {
    console.error('Search error:', err);
    suggestionsList.innerHTML = '';
    suggestionsList.style.display = 'none';
  }
});

// Hide dropdown when clicking outside
document.addEventListener('click', e => {
  if (!e.target.closest('#searchInput')) {
    suggestionsList.style.display = 'none';
  }
});
