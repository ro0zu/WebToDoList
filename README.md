# 🕒 Gestor de Tareas con Temporizador Pomodoro

Este proyecto es una aplicación web que permite crear, administrar y controlar tareas mediante temporizadores al estilo Pomodoro. Cuando una tarea finaliza, aparece una ventana de confirmación con una cuenta regresiva de 10 segundos que permite al usuario decidir si finalizarla o añadir más tiempo.

---

## 🚀 Características

- ✅ Crear tareas con duración personalizada en minutos.
- ⏸ Pausar o reanudar tareas en cualquier momento.
- 🔔 Alarma sonora al finalizar cada tarea.
- ⏳ Modal de confirmación con cuenta atrás de 10 segundos.
- ➕ Posibilidad de añadir 5 minutos extra a una tarea.
- 💾 Guardado de tareas en `localStorage` para mantenerlas entre sesiones.
- 🧼 Interfaz amigable y limpia con diseño responsivo.

---

## 🛠️ Tecnologías Utilizadas

- HTML5
- CSS3
- JavaScript (Vanilla)
- Bootstrap Icons (para íconos)
- Web Storage API (`localStorage`)

---

## 🔊 Nota sobre el audio

Los navegadores modernos bloquean el autoplay de audio. El volumen de la alarma se fuerza a 1 al terminar la tarea, pero es recomendable que el usuario haya interactuado previamente con la página para asegurar su funcionamiento.
