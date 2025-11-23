document.addEventListener("DOMContentLoaded", initialize);

function initialize() {
   openMenu();
   openModal();
}

// ==== Menu Toggle ====
function openMenu() {
   const header = document.querySelector(".header");
   const navbar = document.querySelector(".navbar");
   const navLinks = document.querySelectorAll(".navbar__link");
   const toggleButton = document.querySelector(".toggle");

   // Changer le style du header au du scroll
   window.addEventListener("scroll", () =>{
      header.classList.toggle("active", window.scrollY > 25)
   });

   // Ouvrir/fermer le menu
   toggleButton.addEventListener("click", () => {
      navbar.classList.toggle("active");

      if (window.scrollY <= 50) {
         header.classList.toggle("active");
      }
   });

   // Retirer le menu lors du clic
   navLinks.forEach((navLink) => {
      navLink.addEventListener("click", () => {
         navbar.classList.remove("active");

         if (window.scrollY <= 50) {
            header.classList.remove("active");
         }
      });
   })
}

// == Ouvrir modal
function openModal() {
   const modalContainer = document.querySelector('.modal__container');
   const clickableGraphs = document.querySelectorAll('.gallery.viz div');
   const modalGraphs = document.querySelectorAll('.modal.viz > div[id$="-modal"]');


   clickableGraphs.forEach(graph => {
      graph.addEventListener('click', (e) => {
         const clickedId = e.currentTarget.id;
         const targetModalId = clickedId + '-modal';
         modalGraphs.forEach(modalGraph => {
            if (modalGraph.id === targetModalId) {
               modalGraph.style.display = 'block';
            } else {
               modalGraph.style.display = 'none';
            }
         });
         modalContainer.style.display = 'grid';
         setTimeout(() => {
             window.dispatchEvent(new Event('resize'));
         }, 10);
      });
   });
   closeModal();
}

// ==== Fermer modal ====
function closeModal() {
   const closeBtn = document.querySelector('.modal__btn');
   const modal = document.querySelector('.modal__container');

   closeBtn.addEventListener('click', () => {
      modal.style.display = 'none';
      console.log('click');
   })
}