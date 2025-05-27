const songs = [
];

let searchResults = [];

function msToMinutesSeconds(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function appendSong(song) {
  const tableBody = document.getElementById('song-table-body');

  const title = song.name || 'Unknown';
  const artistNames = song.artists ? song.artists.map(a => a.name).join(', ') : 'Unknown Artist';
  const albumName = song.album?.name || 'Unknown Album';
  const imageUrl = song.album?.images?.[0]?.url || '/images/song 1.png';
  const duration = song.duration || '0:00';
  const trackId = song.track_id || 'Unknown ID';
  // Calculate current row number + 1
  const currentRows = tableBody.rows.length;
  const newIndex = currentRows + 1;

  const row = `
    <tr>
      <td class="white-text">${newIndex}</td>
      <td>
        <div class="song-info">
          <img src="${imageUrl}" class="song-img">
          <div>
            <span class="song-title white-text">${title}</span><br>
            <span class="song-artist grey-text text-lighten-1">${artistNames}</span>
          </div>
        </div>
      </td>
      <td class="song-album white-text">${albumName}</td>
      <td class="song-duration white-text">${duration}</td>
      <td style="display: none;" class="track-id">${trackId}</td>
    </tr>
  `;

  tableBody.insertAdjacentHTML('beforeend', row);
}
// Render songs
// const tableBody = document.getElementById('song-table-body');

// songs.forEach((song, index) => {
//   const row = `
//     <tr>
//       <td class="white-text">${index + 1}</td>
//       <td>
//         <div class="song-info">
//           <img src="${song.image}" class="song-img">
//           <div>
//             <span class="song-title white-text">${song.title}</span><br>
//             <span class="song-artist grey-text text-lighten-1">${song.artist}</span>
//           </div>
//         </div>
//       </td>
//       <td class="white-text">${song.album}</td>
//       <td class="white-text">${song.duration}</td>
//     </tr>
//   `;
//   tableBody.insertAdjacentHTML('beforeend', row);
// });

function openPlaylistModal() {

  const rows = document.querySelectorAll('#song-table-body tr');
  const songs = [];

  rows.forEach(row => {
    const title = row.querySelector('.song-title')?.textContent.trim();
    const artist = row.querySelector('.song-artist')?.textContent.trim();
    const album = row.querySelector('.song-album')?.textContent.trim();
    const duration = row.querySelector('.song-duration')?.textContent.trim();
    const track_id = row.querySelector('.track-id')?.textContent.trim();
    const image = row.querySelector('img')?.src || '/images/song 1.png';

    songs.push({ track_id, title, artist, album, duration, image });
  });

  console.log('Selected songs:', songs);
  if (songs.length === 0) {
    alert('No songs selected!');
    return;
  }

  fetch('http://127.0.0.1:5000/api/recommend', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      songs: songs.map(song => song.title),
      model_type: 'song'
    })
  })
    .then(response => response.json())
    .then(data => {
      console.log('Response:', data);
      if (data.error) {
        alert(data.error);
        return;
      }

      const trackIds = data.recommendations.map(r => r.track_id);

      return fetch('http://127.0.0.1:5000/api/song_details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ track_ids: trackIds })
      });
    })
    .then(res => res.json())
    .then(songDetails => {
      playlistSongs.length = 0;
      songs.forEach(song => playlistSongs.push(song));
      songDetails.forEach(song => {
        playlistSongs.push({
          track_id: song.track_id,
          title: song.title,
          artist: song.artist,
          album: song.album,
          duration: song.duration || '3:30',
          image: song.image || '/images/song 1.png'
        });
      });
      console.log(JSON.stringify(songDetails, null, 2));
      renderPlaylistSongs();
      modal.style.display = 'flex';
      setTimeout(() => {
        modal.classList.add('show');
      }, 10);
    })
    .catch(err => {
      console.error('Error:', err);
      alert('Failed to get recommendations.');
    });
}

function closePlaylistModal() {
  document.getElementById('playlist-modal').style.display = 'none';
}

// Dummy playlist songs (you'll pull from real data later)
const playlistSongs = [
];

const modal = document.getElementById('playlist-modal');
const playlistBody = document.getElementById('playlist-songs-body');

// Show modal
document.querySelector('.btn').addEventListener('click', () => {
  renderPlaylistSongs();
  modal.style.display = 'flex';
  setTimeout(() => {
    modal.classList.add('show');
  }, 10);
});

// Hide modal when clicking outside content
modal.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.classList.remove('show');
    setTimeout(() => {
      modal.style.display = 'none';
    }, 400);
  }
});

// Render playlist songs table
function renderPlaylistSongs() {
  playlistBody.innerHTML = '';
  playlistSongs.forEach((song, index) => {
    const row = `
      <tr>
        <td class="white-text">${index + 1}</td>
        <td>
          <div class="song-info">
            <img src="${song.image}" class="song-img">
            <div>
              <span class="song-title white-text">${song.title}</span><br>
              <span class="song-artist grey-text text-lighten-1">${song.artist}</span>
            </div>
          </div>
        </td>
        <td class="white-text">${song.album}</td>
        <td class="white-text">${song.duration}</td>
        <td class="track-id" style="display:none;">${song.track_id}</td>
        <td><button class="remove-btn" onclick="removeSong(this)">Remove</button></td>
      </tr>
    `;
    playlistBody.insertAdjacentHTML('beforeend', row);
  });
}

function removeSong(button) {
  // Find the closest <tr> (row) and remove it
  var row = button.closest('tr');
  row.remove();
}

$(document).ready(() => {
  const $input = $('#search-input');
  const $dropdown = $('#autocomplete-results');

  $input.on('input', function () {
    const query = $(this).val().trim();
    if (!query) {
      $dropdown.empty().hide();
      return;
    }

    fetch(`http://127.0.0.1:5000/api/search_songs?q=${encodeURIComponent(query)}`)
      .then(response => response.json())
      .then(data => {
        searchResults = data;  // Save current search results
        $dropdown.empty();

        if (data.length === 0) {
          $dropdown.hide();
          return;
        }
        console.log('Response:', data);
        data.forEach(song => {
          const artistNames = song.artists.map(artist => artist.name).join(', ');
          const imageUrl = song.album?.images?.[0]?.url || '/images/song 1.png';
          const item = `
          <li class="collection-item suggestion-item" data-title="${song.name}" style="display: flex; align-items: center; gap: 8px;">
            <img src="${imageUrl}" alt="album cover" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px;">
            <div style="text-align: left;">
              <strong>${song.name}</strong><br>
              <small>${artistNames}</small>
            </div>
          </li>`;
          $dropdown.append(item);
        });

        $dropdown.show();
      })
      .catch(err => {
        console.error('Fetch error:', err);
        $dropdown.empty().hide();
      });
  });

  $(document).on('click', '.suggestion-item', function () {
    const title = $(this).data('title');
    $input.val(title);
    $dropdown.empty().hide();

    // Find the song object in searchResults by title
    const selectedSong = searchResults.find(song => song.name === title);
    if (!selectedSong) return;

    // Convert duration_ms to mm:ss
    const duration = selectedSong.duration_ms ? msToMinutesSeconds(selectedSong.duration_ms) : '0:00';

    const songToRender = {
      track_id: selectedSong.songId,
      name: selectedSong.name,
      artists: selectedSong.artists,
      album: selectedSong.album,
      duration: duration,
    };

    appendSong(songToRender);
  });

  $(document).click(function (e) {
    if (!$(e.target).closest('#search-input, #autocomplete-results').length) {
      $dropdown.empty().hide();
    }
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const createPlaylistBtn = document.querySelector('.create-playlist-btn');
  if (createPlaylistBtn) {
    createPlaylistBtn.addEventListener('click', async () => {
      const playlistNameInput = document.querySelector('.playlist-input');
      const playlistName = playlistNameInput.value.trim();

      if (!playlistName) {
        alert('Please enter a playlist name');
        return;
      }

      if (!playlistSongs || playlistSongs.length === 0) {
        alert('No songs added to the playlist');
        return;
      }

      // Prepare songs data in the format your API expects
      // Assuming each song object has track_id or some identifier
      const songsPayload = playlistSongs.map(song => ({
        track_id: song.track_id,
        title: song.title,
        artist: song.artist,
        album: song.album,
        duration: song.duration,
        image: song.image
      }));
      try {
        const response = await fetch('http://127.0.0.1:3000/api/playlists', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            playlist_name: playlistName,
            songs: songsPayload
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to create playlist');
        }

        alert('Playlist created successfully');
        playlistNameInput.value = '';  // clear input
      } catch (error) {
        console.error('Error creating playlist:', error);
        alert('Failed to create playlist');
      }
    });
  }
});
