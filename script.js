const btn = document.querySelector('.radial-button');
const cadran = document.querySelector('.yokai-cadran');
const overlay = document.querySelector('.overlay');

btn.addEventListener('click', () => {
  cadran.classList.toggle('active');
  overlay.classList.toggle('active');

  // 🪄 Double frame pour synchroniser le clone dès le changement de classe
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const oldSvg = document.querySelector('.radial-svg');
      const cloneSvg = oldSvg.cloneNode(true);
      oldSvg.parentNode.replaceChild(cloneSvg, oldSvg);
    });
  });
});

overlay.addEventListener('click', () => {
  cadran.classList.remove('active');
  overlay.classList.remove('active');
});