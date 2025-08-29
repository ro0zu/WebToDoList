/********* Funcionalidad Reproductor / API JAMENDO ************/

export function initReproductor(){
    // Mostrar y Ocultar Rerproductor
    const btnReproductor = document.getElementById('btn-reproductor');
    const iconBtnReproductor = document.getElementById('disco-giratorio')
    const reproductor = document.getElementById('reproductorContenedor');
    const btnCloseReproductor = document.getElementById('cerrarReproductor');

    btnReproductor.addEventListener('click', () => {
    reproductor.classList.toggle('visible');
    });
    btnCloseReproductor.addEventListener('click', () =>{
    reproductor.classList.remove('visible');
    });

    /* Elementos del HTML para funcionalidades reproductor */

    const audio = document.getElementById("audio");
    const btnPlay = document.querySelector(".btn-play");
    const btnNext = document.querySelector(".btn-siguiente");
    const btnPrev = document.querySelector(".btn-anterior");
    const titulo = document.getElementById("titulo-cancion");
    const artista = document.getElementById("artista-cancion");
    const progreso = document.getElementById("progreso");const volumenControl = document.getElementById('volumen');


    // Declaro las siguentes variables
    let playlist = []; // La playlist la llenaré de los objetos después de llamar a la API. Linea 207.
    let indiceActual = 0;// Indico donde va a empezar a reproducir
    let enReproduccion = false;

    const clientId = 'bb705b58'; // ID mi usuario de JAMENDO
    const apiUrl = `https://api.jamendo.com/v3.0/tracks/?client_id=${clientId}&format=json&limit=5&fuzzytags=chill+lofi`; // URL de la API para musica chill y lofi.

    // Funcion para traer los datos de la api.
    async function cargarPlaylistDesdeAPI() {
    const resp = await fetch(apiUrl);
    const json = await resp.json();
    // Cada elemento incluye audio, título y artista.
    // json.result es un array que contiene los datos de los elementos obtenidos
    // .map para crear un nuevo array con los datos que se ve en la estructura de los parentesis
    playlist = json.results.map(item => ({
        titulo: item.name, // el .name .artist_name hay que consultarlo en la estructura JSON de la API.
        artista: item.artist_name,
        archivo: item.audio
    }));
    return playlist;
    }

    cargarPlaylistDesdeAPI().then(() => {
    if (playlist.length) {
        cargarCancion(0);
    }
    });

    function cargarCancion(i) {
    const can = playlist[i];
    titulo.textContent = can.titulo;
    artista.textContent = can.artista;
    audio.src = can.archivo;
    }
    // Funciones para pausar y reproducir.
    function reproducirCancion() {
    audio.play();
    enReproduccion = true;
    btnPlay.innerHTML = '<i class="bi bi-pause-fill"></i>';
    iconBtnReproductor.classList.add('girar');
    }
    function pausarCancion() {
    audio.pause();
    enReproduccion = false;
    btnPlay.innerHTML = '<i class="bi bi-play-fill"></i>';
    iconBtnReproductor.classList.remove('girar');
    }

    // Botones de gestión del reproductor
    btnPlay.addEventListener("click", () => {
    if (enReproduccion) {
        pausarCancion();
    } else {
        reproducirCancion();
    }
    });
    btnNext.addEventListener("click", () => {
    indiceActual = (indiceActual + 1) % playlist.length;
    cargarCancion(indiceActual);
    reproducirCancion();
    });
    btnPrev.addEventListener("click", () => {
    indiceActual = (indiceActual - 1 + playlist.length) % playlist.length;
    cargarCancion(indiceActual);
    reproducirCancion();
    });

    // Barra de duración canción
    audio.addEventListener("timeupdate", () => {
    const porcentaje = (audio.currentTime / audio.duration) * 100;
    progreso.value = porcentaje || 0;
    // Pasa a la siguiente canción cuando la barra llega a 100
    if (porcentaje == 100){
        console.log(indiceActual);
        indiceActual = (indiceActual + 1) % playlist.length;
        console.log(indiceActual);
        cargarCancion(indiceActual);
        reproducirCancion();
    }
    });
    // Permitir cambiar el tramo de la canción
    progreso.addEventListener('input', () => {
    const nuevoTiempo = (progreso.value * audio.duration) / 100;
    audio.currentTime = nuevoTiempo;
    });

    // Control de volumen
    volumenControl.addEventListener('input', () => {
    audio.volume = volumenControl.value;

    const iconoVolumen = document.getElementById('icono-volumen');
    if (volumenControl.value == 0){
        iconoVolumen.innerHTML = '<i class="bi bi-volume-mute-fill"></i>'
    } else {
        iconoVolumen.innerHTML = '<i class="bi bi-volume-up-fill"></i>'
    }
    });
}