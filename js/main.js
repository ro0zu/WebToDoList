/********* Modo oscuro ******************/ 
const darkModeBtn = document.getElementById('btn-dark-mode');
const iconDarkMode = document.getElementById('iconDarkMode');

// Cargar preferencia modo oscuro
if (localStorage.getItem('darkMode') === 'enabled') {
document.body.classList.add('dark-mode');
iconDarkMode.classList.remove('bi-moon-stars-fill');
iconDarkMode.classList.add('bi-sun-fill');
}

darkModeBtn.addEventListener('click', () => {
document.body.classList.toggle('dark-mode');
if (document.body.classList.contains('dark-mode')) {
    localStorage.setItem('darkMode', 'enabled');
    iconDarkMode.classList.remove('bi-moon-stars-fill');
    iconDarkMode.classList.add('bi-sun-fill');
} else {
    localStorage.setItem('darkMode', 'disabled');
    iconDarkMode.classList.remove('bi-sun-fill');
    iconDarkMode.classList.add('bi-moon-stars-fill');
}
});

/********* Funcionalidad Añadir tarea ************/ 

// Abrir y cerrar el menú 
const btnAddTask = document.getElementById('btn-add-task');
const formulario = document.getElementById('formularioAddTask');
const btnCloseForm = document.getElementById('cerrarFormulario');

btnAddTask.addEventListener('click', () => {
  formulario.classList.toggle('visible');
});
btnCloseForm.addEventListener('click', () =>{
  formulario.classList.remove('visible');
});

// Añadir tarea a la lista de tareas.
const taskNameInput = document.getElementById('taskName');
const taskTimeInput = document.getElementById('taskTime');
const listaTareas = document.getElementById('lista-tareas');

// Cargar tareas del localStorage al iniciar 
let tareas = [];
window.addEventListener('DOMContentLoaded', () => {
  const guardadas = localStorage.getItem('tareas');

  if (guardadas) {
    tareas = JSON.parse(guardadas);
    tareas.forEach(tarea => crearTareaEnDOM(tarea));
  }
  actualizarEstadoTareas();
});

  // Funcion crear y mostrar tarea.
  function crearTareaEnDOM(tarea) {
    const nuevaTarea = document.createElement('div');
    nuevaTarea.classList.add('tarea');

    let tiempoRestante = tarea.minutos * 60; // en segundos
    let enPausa = false;
    let intervaloId;

    nuevaTarea.innerHTML = `
      <div class="nombre-tarea">${tarea.nombre}</div>
      <div><span class="timer">${formatearTiempo(tiempoRestante)}</span></div>
      <div class="botones-tarea">
        <button class="btn-pause-task"><i class="bi bi-pause"></i></button>
        <button class="btn-cancel-task"><i class="bi bi-x-lg"></i></button>
      </div>
    `;

    const timerEl = nuevaTarea.querySelector('.timer');
    const pauseBtn = nuevaTarea.querySelector('.btn-pause-task');

    // Función para actualizar el contador
    function actualizarTemporizador() {
      if (!enPausa) {
        tiempoRestante--;
        timerEl.textContent = formatearTiempo(tiempoRestante);

        // Cuando el temporizador llega a 0
        if (tiempoRestante <= 0) {
          clearInterval(intervaloId);
          timerEl.textContent = "00:00";

          // Pausamos la canción y hacemos que suene la alarma
          pausarCancion();
          alarmaAudio.play();

          mostrarConfirmacion(
            tarea,
            nuevaTarea,
            () => {
              // Finalizar
              listaTareas.removeChild(nuevaTarea);
              tareas = tareas.filter(t => !(t.nombre === tarea.nombre && t.minutos === tarea.minutos));
              localStorage.setItem('tareas', JSON.stringify(tareas));
              actualizarEstadoTareas();
            },
            () => {
              // Añadir 5 minutos
              tiempoRestante = 5 * 60;
              timerEl.textContent = formatearTiempo(tiempoRestante);
              intervaloId = setInterval(actualizarTemporizador, 1000);
              reproducirCancion();
            }
          );
        }
      }
    }

    // Iniciar intervalo
    intervaloId = setInterval(actualizarTemporizador, 1000);

    // Pausar / Reanudar
    pauseBtn.addEventListener('click', () => {
      enPausa = !enPausa;
      pauseBtn.innerHTML = enPausa
        ? '<i class="bi bi-play-fill"></i>'
        : '<i class="bi bi-pause"></i>';
    });

    // Eliminar tarea del DOM y localStorage
    nuevaTarea.querySelector('.btn-cancel-task').addEventListener('click', () => {
      listaTareas.removeChild(nuevaTarea);
      tareas = tareas.filter(t => !(t.nombre === tarea.nombre && t.minutos === tarea.minutos));
      localStorage.setItem('tareas', JSON.stringify(tareas));
      actualizarEstadoTareas();
    });

    listaTareas.appendChild(nuevaTarea);
  }
// Funcion auxiliar para formatear el tiempo
function formatearTiempo(segundos) {
  const min = Math.floor(segundos / 60).toString().padStart(2, '0');
  const sec = (segundos % 60).toString().padStart(2, '0');
  return `${min}:${sec}`;
}

// Guardar tarea una vez se envie el formulario.
  formulario.addEventListener('submit', (e) => {
    e.preventDefault();

    const nombre = taskNameInput.value.trim();
    const minutos = parseInt(taskTimeInput.value.trim());

    const nuevaTarea = { nombre, minutos };
    tareas.push(nuevaTarea);
    localStorage.setItem('tareas', JSON.stringify(tareas));

    crearTareaEnDOM(nuevaTarea);
    actualizarEstadoTareas();
    // Limpiar inputs
    taskNameInput.value = '';
    taskTimeInput.value = '';

    // Ocultar formulario una vez creada tarea
    formulario.classList.remove('visible');

});

// Comprobar si las tareas están vacias para añadir un parrafo o no
function actualizarEstadoTareas() {
  const mensajeVacio = document.getElementById('no-task-p');
  if (tareas.length === 0) {
    if (!mensajeVacio) {
      const p = document.createElement('p');
      p.id = 'no-task-p';
      p.innerHTML = '<i class="bi bi-journal-x"></i> No task pending ...';
      listaTareas.appendChild(p);
    }
  } else {
    if (mensajeVacio) {
      mensajeVacio.remove();
    }
  }
}

// Funcion una vez Finaliza el contador de una tarea.

const modalConfirmacion = document.getElementById('modalConfirmacion');
const mensajeConfirmacion = document.getElementById('mensajeConfirmacion');
const btnFinalizar = document.getElementById('btnFinalizar');
const btnAnadir5 = document.getElementById('btnAnadir5');
const alarmaAudio = document.getElementById('alarma');

let tareaPendiente = null;
let tareaElemento = null;
let tiempoExtraCallback = null;
let eliminarCallback = null;

// Mostrar ventana de confirmacion
function mostrarConfirmacion(tarea, domTarea, onEliminar, onAnadir5) {


  // Parametros de la función, los dos últimos 
  tareaPendiente = tarea;
  tareaElemento = domTarea;
  eliminarCallback = onEliminar;
  tiempoExtraCallback = onAnadir5;

  mensajeConfirmacion.innerHTML = `¡Tiempo finalizado para: <strong>${tarea.nombre}</strong>!`;
  modalConfirmacion.classList.add('visible');
}

// Eventos botones
btnFinalizar.addEventListener('click', () => {
  if (eliminarCallback) eliminarCallback();
  cerrarConfirmacion();
});

btnAnadir5.addEventListener('click', () => {
  if (tiempoExtraCallback) tiempoExtraCallback();
  cerrarConfirmacion();
});

function cerrarConfirmacion() {
  modalConfirmacion.classList.remove('visible');
  tareaPendiente = null;
  tareaElemento = null;
  tiempoExtraCallback = null;
  eliminarCallback = null;
}


/********* Funcionalidad Reproductor / API JAMENDO ************/

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
const progreso = document.getElementById("progreso");

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
progreso.addEventListener("input", () => {
  const nuevoTiempo = (progreso.value * audio.duration) / 100;
  audio.currentTime = nuevoTiempo;
});


/***** ******/



