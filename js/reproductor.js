const clientId = 'bb705b58'; // reemplázalo por el tuyo
const apiUrl = `https://api.jamendo.com/v3.0/tracks/?client_id=${clientId}&format=json&limit=5&fuzzytags=chill+lofi`;

async function cargarPlaylistDesdeAPI() {
  const resp = await fetch(apiUrl);
  const json = await resp.json();
  // Cada elemento incluye audio, título y artista
  const playlist = json.results.map(tr => ({
    titulo: tr.name,
    artista: tr.artist_name,
    archivo: tr.audio
  }));
  return playlist;
}

// Ejemplo de llamada
cargarPlaylistDesdeAPI().then(pl => {
  console.log(pl); // comprueba que trae [{titulo, artista, archivo}, ...]
});