import { initDarkMode } from './modoOscuro.js';
import { initReproductor } from './reproductor.js';

// Inicializar el modo oscuro
initDarkMode();
// Inicializar el reproductor
initReproductor();

/********* Funcionalidad Añadir tarea ************/ 

// Abrir y cerrar el menú 
const btnAddTask = document.getElementById('btn-add-task');
const formulario = document.getElementById('formularioAddTask');
const btnCloseForm = document.getElementById('cerrarFormulario');

btnAddTask.addEventListener('click', () => {
  formulario.classList.toggle('visible');
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'a' || e.key === 'A') {
    formulario.classList.add('visible');
  }
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
    // Creo el elemento div y le añado la clase tarea para aplicarle los estilos
    let nuevaTarea = document.createElement('div');
    nuevaTarea.classList.add('tarea');

    // declaro las variables que usaré en la funcion
    let tiempoRestante = tarea.minutos * 60; // tiempo en segundos
    let enPausa = true; // Por defecto la tarea estará en pausa.
    let intervaloId; // Temporizador

    nuevaTarea.innerHTML = `
      <div class="nombre-tarea">${tarea.nombre}</div>
      <div><span class="timer">${formatearTiempo(tiempoRestante)}</span></div>
      <div class="botones-tarea">
        <button class="btn-pause-task"><i class="bi bi-play-fill"></i></button>
        <button class="btn-cancel-task"><i class="bi bi-x-lg"></i></button>
      </div>
    `;

    let timerEl = nuevaTarea.querySelector('.timer');
    let pauseBtn = nuevaTarea.querySelector('.btn-pause-task');

    // Función para actualizar el contador
    function actualizarTemporizador() {
      if (!enPausa) {
        tiempoRestante--;
        timerEl.textContent = formatearTiempo(tiempoRestante);

        // Cuando el temporizador llega a 0
        if (tiempoRestante <= 0) {
          clearInterval(intervaloId);
          timerEl.textContent = "00:00";
          let estabaReproduciendo = false; // Variable para saber si estaba reproduciendo la canción.

          // Pausamos la canción y hacemos que suene la alarma.
          if (enReproduccion){
            pausarCancion();
            estabaReproduciendo = true
          }
          // Fuerzo el volumen de audio de la alarma ya que muchos navegadores los bloquean
          alarmaAudio.volume = 1; // volumen de 0.0 a 1.0
          // Se reproduce la alarma.
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
              if (estabaReproduciendo) {
                reproducirCancion();
                estabaReproduciendo = false;
              }
            },
            () => {
              // Añadir 5 minutos
              tiempoRestante = 5 * 60;
              timerEl.textContent = formatearTiempo(tiempoRestante);
              intervaloId = setInterval(actualizarTemporizador, 1000);
              if (estabaReproduciendo) {
                reproducirCancion();
                estabaReproduciendo = false;
              }
            }
          );


        }
      }
    }

    // // Iniciar intervalo
    intervaloId = setInterval(actualizarTemporizador, 1000);

    // Pausar y Reanudar
    pauseBtn.addEventListener('click', () => {
      // Pongo a reanudar la tarea especifica a la que se pulsar play.
      enPausa = !enPausa;
      pauseBtn.innerHTML = enPausa
        ? '<i class="bi bi-play-fill"></i>'
        : '<i class="bi bi-pause"></i>';
    });

    // Eliminar tarea del DOM y localStorage
    nuevaTarea.querySelector('.btn-cancel-task').addEventListener('click', () => {
      // Limpiamos el contador
      clearInterval(intervaloId);

      listaTareas.removeChild(nuevaTarea);
      tareas = tareas.filter(t => !(t.nombre === tarea.nombre && t.minutos === tarea.minutos));
      localStorage.setItem('tareas', JSON.stringify(tareas));
      actualizarEstadoTareas();
    });

    listaTareas.appendChild(nuevaTarea);
  }
// Funcion auxiliar para formatear el tiempo
function formatearTiempo(segundos) {
  let min = Math.floor(segundos / 60).toString().padStart(2, '0');
  let sec = (segundos % 60).toString().padStart(2, '0');
  return `${min}:${sec}`;
}

// Accion al enviar el formulario
formulario.addEventListener('submit', (e) => {
  e.preventDefault();
  
  // Guardar tarea en el localStorage una vez se envie el formulario.
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

// Comprobar si las tareas están vacias para añadir el parrafo de no hay tareas o no
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
  iniciarCuentaAtras(); // Funcion de cuanta atrás hasta 10.

  // Temporizador de 10 segundos

  setTimeout(() => {
    eliminarCallback();
    cerrarConfirmacion();
    actualizarEstadoTareas();
  }, 10000)
}

// Eventos botones al finalizar tarea.
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

// Cuenta atrás funcion

function iniciarCuentaAtras() {
  let contador = document.getElementById('timeoutCount');
  let tiempo = 10;

  contador.textContent = `La tarea se borrará en ${tiempo}`;
  contador.style.display = 'block'; // Aseguramos que esté visible

  let intervalo = setInterval(() => {
    tiempo--;
    contador.textContent = `La tarea se borrará en ${tiempo}`;

    if (tiempo <= 0) {
      clearInterval(intervalo);
      contador.style.display = 'none'; // Lo ocultamos si quieres que desaparezca al terminar
    }
  }, 1000);
}





