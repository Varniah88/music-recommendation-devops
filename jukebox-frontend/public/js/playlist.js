let playlist = [];
let playlistSongs = [];
let allPlaylists = [];

let currentPlaylistId = null;

async function fetchPlaylists() {
  try {
    const response = await fetch('http://127.0.0.1:3000/api/playlists');
    const data = await response.json();
    playlist = data.map(pl => ({
      title: pl.playlist_name,
      img: pl.songs[0]?.image || 'jukebox-frontend/public/images/play 6.png'  // fallback image
    }));
    allPlaylists = data;
    playlistSongs = data[0]?.songs || [];

    renderCarousels();
  } catch (error) {
    console.error('Failed to fetch playlists:', error);
  }
}

function createCard(item, type) {
  const wrapper = document.createElement('div');
  wrapper.classList.add('carousel-item');

  const card = document.createElement('div');
  card.classList.add(type === 'song' ? 'card-song' : 'card-artist');

  const img = document.createElement('img');
  img.src = item.img;
  img.alt = type === 'song' ? item.title : item.name;
  card.appendChild(img);

  const content = document.createElement('div');
  content.classList.add('card-content');

  const heading = document.createElement('h6');
  heading.textContent = type === 'song' ? item.title : item.name;
  heading.classList.add(type === 'song' ? 'song-title' : 'artist-name');
  content.appendChild(heading);


  const button = document.createElement('button');
  button.textContent = 'Explore';
  button.classList.add('explore-button');
  button.addEventListener('click', () => {
    const matched = allPlaylists.find(p => p.playlist_name === item.title);
    if (!matched) return;

    playlistSongs = matched.songs;
    openPlaylistModal(matched);
  });
  content.appendChild(button);

  card.appendChild(content);
  wrapper.appendChild(card);
  return wrapper;
}

function renderCarousels() {
  const trendingContainer = document.getElementById('carousel-trending');
  const artistsContainer = document.getElementById('carousel-artists');
  playlist.forEach(song => trendingContainer.appendChild(createCard(song, 'song')));
}

function openPlaylistModal() {
  const modal = document.getElementById('playlist-modal');
  if (modal) {
    modal.classList.add('active');
    renderPlaylistSongs(); // Render songs when modal opens
  }
}

function openPlaylistModal(playlist) {
  currentPlaylistId = playlist._id;  // Save playlist MongoDB ID globally
  // existing code to open modal and render songs
  renderPlaylistSongs();
  const modal = document.getElementById('playlist-modal');
  if (modal) modal.classList.add('active');
}

function closePlaylistModal() {
  const modal = document.getElementById('playlist-modal');
  if (modal) modal.classList.remove('active');
}

document.getElementById('modal-close-btn').addEventListener('click', () => {
  const modal = document.getElementById('playlist-modal');
  if (modal) {
    modal.classList.remove('active');
  }
});


document.addEventListener('DOMContentLoaded', fetchPlaylists);

function renderPlaylistSongs() {
  const tbody = document.getElementById('playlist-songs-body');
  tbody.innerHTML = ''; // Clear existing rows

  playlistSongs.forEach((song, index) => {
    const row = document.createElement('tr');

    row.innerHTML = `
      <td>${index + 1}</td>
      <td>
        <div style="display: flex; align-items: center;">
          <img src="${song.image}" alt="${song.title}" style="width: 40px; height: 40px; margin-right: 10px;">
          <div>
            <div style="font-weight: 600;">${song.title}</div>
            <div style="font-size: 12px; color: gray;">${song.artist}</div>
          </div>
        </div>
      </td>
      <td>${song.album}</td>
      <td>${song.duration}</td>
      <td>
        <button class="remove-button" data-index="${index}" style="
          background-color: transparent;
          color: red;
          border: none;
          cursor: pointer;
          font-size: 16px;
        ">
          Remove
        </button>
      </td>
    `;

    tbody.appendChild(row);
  });

  // Attach remove event to each button
  const removeButtons = document.querySelectorAll('.remove-button');
  removeButtons.forEach(button => {
    button.addEventListener('click', async (e) => {
      const songIndex = parseInt(e.target.getAttribute('data-index'), 10);
      const songToRemove = playlistSongs[songIndex];

      if (!songToRemove?.track_id) {
        alert('Song ID missing, cannot remove');
        return;
      }

      const updatedPlaylist = await removeSong(currentPlaylistId, songToRemove.track_id);
      if (updatedPlaylist) {
        playlistSongs = updatedPlaylist.songs;
        renderPlaylistSongs();
      }
    });
  });
}

async function removeSong(playlistId, songId) {
  try {
    const endpoint = `http://127.0.0.1:3000/api/playlists/${playlistId}/songs/${songId}`;
    console.log('DELETE request to:', endpoint);
    const response = await fetch(endpoint, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to remove song');
    }
    const updatedPlaylist = await response.json();
    return updatedPlaylist;
  } catch (error) {
    console.error('Error removing song:', error);
    alert('Failed to remove song');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const deleteBtn = document.querySelector('.delete-btn');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', async () => {
      if (!currentPlaylistId) {
        alert('No playlist selected');
        return;
      }

      if (!confirm('Are you sure you want to delete this playlist?')) return;

      await deletePlaylist(currentPlaylistId);
      closePlaylistModal();
    });
  }
});

async function deletePlaylist(playlistId) {
  try {
    const response = await fetch(`http://127.0.0.1:3000/api/playlists/${playlistId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete playlist');
    }

    alert('Playlist deleted successfully');
    // Refresh playlists after deletion
    allPlaylists = allPlaylists.filter(p => p._id !== playlistId);
    // Update UI (call your function that renders playlists)
    window.location.reload();
  } catch (error) {
    console.error('Error deleting playlist:', error);
    alert('Failed to delete playlist');
  }
}

const playlistNameInput = document.getElementById('playlist-name');

playlistNameInput.addEventListener('keypress', async (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();

    const newName = playlistNameInput.value.trim();
    if (!newName) {
      alert('Playlist name cannot be empty');
      return;
    }

    if (!currentPlaylistId) {
      alert('No playlist selected');
      return;
    }

    try {
      const response = await fetch(`http://127.0.0.1:3000/api/playlists/${currentPlaylistId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playlist_name: newName }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update playlist name');
      }

      const updatedPlaylist = await response.json();
      // Update local data
      const index = allPlaylists.findIndex(p => p._id === currentPlaylistId);
      if (index !== -1) {
        allPlaylists[index].playlist_name = updatedPlaylist.playlist_name;
      }

      window.location.reload();
    } catch (error) {
      console.error(error);
      alert('Error updating playlist name');
    }
  }
});