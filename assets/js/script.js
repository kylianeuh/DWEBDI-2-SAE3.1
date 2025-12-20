document.addEventListener("DOMContentLoaded", initialize);

function initialize() {
   openMenu();
   //openModal();
   selectedViz();
   openTags();
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
/*function openModal() {
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
}*/

// ==== viz selectionner ====
function selectedViz() {
   const galleryContainer = document.querySelector('.section__gallery');
   const vizs = document.querySelectorAll('.gallery');

   galleryContainer.addEventListener('click', (e) => {
       const clickedViz = e.target.closest('.gallery');
       if (!clickedViz) return;

       vizs.forEach(viz => viz.classList.remove('active'));
       clickedViz.classList.add('active');

       // recalcule de la place disponible
       requestAnimationFrame(() => {
           window.dispatchEvent(new Event('resize')); // ECharts écoute automatiquement
       });
   });
}

// ==== ouvrir choix tag telephone ====
function openTags() {
   const filterDivs = document.querySelectorAll('.filter__div');
 
   filterDivs.forEach(filterDiv => {
     const title = filterDiv.querySelector('h3');
     const tags = filterDiv.querySelectorAll('.filter__tag-link');
 
     // Ouvrir / fermer au clic sur le titre
     title.addEventListener('click', (e) => {
       e.stopPropagation(); // empêche le document.click
       filterDiv.classList.toggle('active');
     });
 
     // Fermer quand on clique sur un tag
     tags.forEach(tag => {
       tag.addEventListener('click', () => {
         filterDiv.classList.remove('active');
       });
     });
   });
 
   // Fermer si clic en dehors
   document.addEventListener('click', () => {
     filterDivs.forEach(filterDiv => {
       filterDiv.classList.remove('active');
     });
   });
 } 