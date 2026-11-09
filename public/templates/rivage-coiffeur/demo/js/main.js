/* ==========================================================================
   Rendu et interactions : navigation mobile, listes générées depuis data.js,
   barre « Prendre rendez-vous » et validation du formulaire.
   ========================================================================== */

(function () {
  "use strict";

  var D = window.SITE_DATA;
  if (!D) return;

  /* --- Petits utilitaires ------------------------------------------------ */

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function creer(balise, classes, texte) {
    var n = document.createElement(balise);
    if (classes) n.className = classes;
    if (texte != null) n.textContent = texte;
    return n;
  }

  /* --- Navigation mobile -------------------------------------------------- */

  function initNav() {
    var bouton = document.querySelector("[data-nav-ouvrir]");
    if (!bouton) return;
    var liens = document.querySelector("[data-nav-liens]");
    bouton.addEventListener("click", function () {
      var ouvert = bouton.getAttribute("aria-expanded") === "true";
      bouton.setAttribute("aria-expanded", String(!ouvert));
      document.documentElement.classList.toggle("menu-ouvert", !ouvert);
    });
    liens.addEventListener("click", function (e) {
      if (e.target && e.target.closest("a")) {
        bouton.setAttribute("aria-expanded", "false");
        document.documentElement.classList.remove("menu-ouvert");
      }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        bouton.setAttribute("aria-expanded", "false");
        document.documentElement.classList.remove("menu-ouvert");
        bouton.focus();
      }
    });
  }

  /* --- Rendu des listes ---------------------------------------------------- */

  function rendreServicesResume() {
    var conteneur = document.getElementById("services-resume");
    if (!conteneur) return;
    var frag = document.createDocumentFragment();
    D.services.forEach(function (groupe) {
      var bloc = creer("section", "groupe-service");
      var titre = creer("h3", "groupe-service-titre", groupe.group);
      bloc.appendChild(titre);
      var liste = creer("ul", "liste-service");
      groupe.items.forEach(function (item) {
        var li = creer("li", "ligne-service");
        var nom = creer("span", "ligne-service-nom", item.nom);
        var duree = creer("span", "ligne-service-duree", item.duree);
        var prix = creer("span", "ligne-service-prix", item.prix);
        li.appendChild(nom);
        li.appendChild(duree);
        li.appendChild(prix);
        liste.appendChild(li);
      });
      bloc.appendChild(liste);
      frag.appendChild(bloc);
    });
    conteneur.appendChild(frag);
  }

  function rendreServicesComplets() {
    var conteneur = document.getElementById("services-complets");
    if (!conteneur) return;
    var frag = document.createDocumentFragment();
    D.services.forEach(function (groupe) {
      var section = creer("section", "service-groupe");
      section.appendChild(creer("h2", "service-groupe-titre", groupe.group));
      var liste = creer("ul", "service-liste");
      groupe.items.forEach(function (item) {
        var li = creer("li", "service-carte");
        li.appendChild(creer("h3", "service-carte-nom", item.nom));
        li.appendChild(creer("p", "service-carte-desc", item.description));
        var meta = creer("p", "service-carte-meta");
        meta.appendChild(creer("span", "service-carte-duree", "Durée : " + item.duree));
        meta.appendChild(creer("span", "service-carte-prix", "À partir de " + item.prix));
        li.appendChild(meta);
        liste.appendChild(li);
      });
      section.appendChild(liste);
      frag.appendChild(section);
    });
    var note = creer("p", "note-cheveux-longs", D.noteCheveuxLongs);
    frag.appendChild(note);
    conteneur.appendChild(frag);
  }

  function rendreEquipe() {
    var conteneur = document.getElementById("equipe");
    if (!conteneur) return;
    var frag = document.createDocumentFragment();
    D.equipe.forEach(function (membre, i) {
      var carte = creer("article", "membre");
      var img = creer("img", "membre-photo");
      img.src = "assets/placeholder/equipe-" + (i + 1) + ".svg";
      img.alt = "Portrait de " + membre.nom;
      img.width = 800;
      img.height = 1000;
      img.loading = "lazy";
      carte.appendChild(img);
      carte.appendChild(creer("h3", "membre-nom", membre.nom));
      carte.appendChild(creer("p", "membre-role", membre.role));
      carte.appendChild(creer("p", "membre-specialite", membre.specialite));
      frag.appendChild(carte);
    });
    conteneur.appendChild(frag);
  }

  function rendreGalerie() {
    var conteneur = document.getElementById("galerie");
    if (!conteneur) return;
    var frag = document.createDocumentFragment();
    D.galerie.forEach(function (photo) {
      var fig = creer("figure", "galerie-item");
      var img = creer("img", "galerie-img");
      img.src = photo.src;
      img.alt = photo.alt;
      img.width = photo.w;
      img.height = photo.h;
      img.loading = "lazy";
      fig.appendChild(img);
      frag.appendChild(fig);
    });
    conteneur.appendChild(frag);
  }

  function rendreTemoignages() {
    var conteneur = document.getElementById("temoignages");
    if (!conteneur) return;
    var frag = document.createDocumentFragment();
    D.temoignages.forEach(function (tem) {
      var figure = creer("figure", "temoignage");
      var citation = creer("blockquote", "temoignage-texte", tem.texte);
      var legende = creer("figcaption", "temoignage-auteur", tem.attribution);
      figure.appendChild(citation);
      figure.appendChild(legende);
      frag.appendChild(figure);
    });
    conteneur.appendChild(frag);
  }

  function rendreCartesCadeaux() {
    var conteneur = document.getElementById("cartes-cadeaux");
    if (!conteneur) return;
    var frag = document.createDocumentFragment();
    D.cartesCadeaux.forEach(function (carte) {
      var article = creer("article", "carte-cadeau");
      article.appendChild(creer("p", "carte-cadeau-montant", carte.montant));
      article.appendChild(creer("p", "carte-cadeau-desc", carte.description));
      frag.appendChild(article);
    });
    conteneur.appendChild(frag);
  }

  function rendreHeures() {
    var conteneur = document.getElementById("heures");
    if (!conteneur) return;
    var frag = document.createDocumentFragment();
    var liste = creer("ul", "heures-liste");
    D.heures.forEach(function (ligne) {
      var li = creer("li", "heures-ligne");
      li.appendChild(creer("span", "heures-jour", ligne.jour));
      li.appendChild(creer("span", "heures-valeur", ligne.heures));
      liste.appendChild(li);
    });
    frag.appendChild(liste);
    conteneur.appendChild(frag);
  }

  function rendrePolitique() {
    var annulation = document.getElementById("politique-annulation");
    var retard = document.getElementById("politique-retard");
    var sansRdv = document.getElementById("sans-rendez-vous");
    if (annulation) annulation.textContent = D.politique.annulation;
    if (retard) retard.textContent = D.politique.retard;
    if (sansRdv) sansRdv.textContent = D.politique.sansRdv;
  }

  /* --- Formulaire de demande ---------------------------------------------- */

  function initFormulaire() {
    var form = document.getElementById("formulaire-demande");
    if (!form) return;
    var statut = document.getElementById("formulaire-statut");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var nom = form.querySelector("[name=nom]").value.trim();
      var courriel = form.querySelector("[name=courriel]").value.trim();
      var message = form.querySelector("[name=message]").value.trim();
      if (!nom || !courriel || !message) {
        statut.textContent = "Veuillez remplir tous les champs obligatoires.";
        statut.setAttribute("role", "alert");
        return;
      }
      if (!/.+@.+\..+/.test(courriel)) {
        statut.textContent = "Veuillez entrer une adresse courriel valide.";
        statut.setAttribute("role", "alert");
        return;
      }
      var sujet = encodeURIComponent("Demande de rendez-vous — " + nom);
      var corps = encodeURIComponent(
        "Nom : " + nom + "\nCourriel : " + courriel + "\n\n" + message
      );
      statut.textContent = "Votre demande est prête à être envoyée par courriel.";
      statut.removeAttribute("role");
      window.location.href = "mailto:" + D.site.courriel + "?subject=" + sujet + "&body=" + corps;
    });
  }

  /* --- Démarrage ----------------------------------------------------------- */

  function demarrer() {
    initNav();
    rendreServicesResume();
    rendreServicesComplets();
    rendreEquipe();
    rendreGalerie();
    rendreTemoignages();
    rendreCartesCadeaux();
    rendreHeures();
    rendrePolitique();
    initFormulaire();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", demarrer);
  } else {
    demarrer();
  }
})();
