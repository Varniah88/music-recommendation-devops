// // --- Your existing songs array and render code here (leave as is)

// const searchInput = document.getElementById('search-input');

// searchInput.addEventListener('input', function() {
//   const query = this.value.toLowerCase();

//   // Clear existing rows
//   tableBody.innerHTML = '';

//   // Filter songs
//   const filteredSongs = songs.filter(song =>
//     song.title.toLowerCase().includes(query) ||
//     song.artist.toLowerCase().includes(query) ||
//     song.album.toLowerCase().includes(query)
//   );

//   // Re-render filtered songs
//   filteredSongs.forEach((song, index) => {
//     const row = `
//       <tr>
//         <td class="white-text">${index + 1}</td>
//         <td>
//           <div class="song-info">
//             <img src="${song.image}" class="song-img">
//             <div>
//               <span class="song-title white-text">${song.title}</span><br>
//               <span class="song-artist grey-text text-lighten-1">${song.artist}</span>
//             </div>
//           </div>
//         </td>
//         <td class="white-text">${song.album}</td>
//         <td class="white-text">${song.duration}</td>
//       </tr>
//     `;
//     tableBody.insertAdjacentHTML('beforeend', row);
//   });
// });

