/********* Modo oscuro ******************/ 
export function initDarkMode() {
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
}