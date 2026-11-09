/* ==========================================================================
   Contenu du site — toutes les chaînes éditables sont ici.
   Ce fichier est un simple script (pas un module) : il charge les données sur
   window.SITE_DATA pour que le site fonctionne aussi en file://.
   ========================================================================== */

window.SITE_DATA = {
  site: {
    nom: "Votre salon",
    tagline: "Coiffure et couleur, à votre image.",
    description:
      "Salon de coiffure à Montréal : coupe, couleur, balayage et mèches. Prenez rendez-vous en ligne.",
    telephone: "(555) 010-0100",
    courriel: "hello@example.com",
    adresse: "123 Example Street",
    ville: "Montréal (Québec)",
    stationnement: "Stationnement gratuit sur place, à l'arrière du salon.",
    instagram: "@yourhandle",
    instagramUrl: "https://www.instagram.com/yourhandle",
    bookingUrl: "https://cal.com/example",
    url: "https://example.com"
  },

  services: [
    {
      group: "Coupe",
      items: [
        { nom: "Coupe et finition", description: "Shampoing, coupe sur mesure et mise en plis.", duree: "45 min", prix: "45 $" },
        { nom: "Coupe courte", description: "Coupe de précision pour cheveux courts.", duree: "40 min", prix: "40 $" },
        { nom: "Coupe avec brushing", description: "Coupe, séchage et brushing de finition.", duree: "60 min", prix: "60 $" }
      ]
    },
    {
      group: "Couleur",
      items: [
        { nom: "Coloration complète", description: "Couleur permanente des racines aux pointes.", duree: "2 h", prix: "120 $" },
        { nom: "Balayage", description: "Éclaircissement doux et naturel, travaillé main levée.", duree: "2 h 30", prix: "150 $" },
        { nom: "Mèches", description: "Mèches fines pour un effet lumineux et nuancé.", duree: "2 h", prix: "140 $" },
        { nom: "Retouche racines", description: "Rafraîchissement de la couleur entre deux rendez-vous.", duree: "1 h 15", prix: "80 $" }
      ]
    },
    {
      group: "Soins",
      items: [
        { nom: "Soin profond", description: "Traitement nourrissant et réparateur.", duree: "30 min", prix: "35 $" },
        { nom: "Lissage à la kératine", description: "Assouplissement et contrôle des frisottis.", duree: "1 h 30", prix: "90 $" }
      ]
    },
    {
      group: "Homme",
      items: [
        { nom: "Coupe homme", description: "Coupe aux ciseaux ou à la tondeuse.", duree: "30 min", prix: "30 $" },
        { nom: "Coupe et barbe", description: "Coupe accompagnée de la taille de barbe.", duree: "45 min", prix: "45 $" }
      ]
    }
  ],

  noteCheveuxLongs:
    "Les cheveux longs ou très épais peuvent demander plus de temps : un supplément peut s'appliquer. Parlez-en à votre coiffeuse lors de la réservation.",

  equipe: [
    { nom: "Prénom Nom", role: "Coiffeur·euse", specialite: "Spécialité" },
    { nom: "Prénom Nom", role: "Coiffeur·euse", specialite: "Spécialité" },
    { nom: "Prénom Nom", role: "Coiffeur·euse", specialite: "Spécialité" }
  ],

  galerie: [
    { src: "assets/placeholder/galerie-1.svg", alt: "Balayage blond sur cheveux longs", w: 800, h: 1000 },
    { src: "assets/placeholder/galerie-2.svg", alt: "Coupe courte avec frange", w: 800, h: 1000 },
    { src: "assets/placeholder/galerie-3.svg", alt: "Coloration auburn et brillance", w: 800, h: 1000 },
    { src: "assets/placeholder/galerie-4.svg", alt: "Chignon tressé pour une occasion", w: 800, h: 1000 },
    { src: "assets/placeholder/galerie-5.svg", alt: "Coupe dégradée pour homme", w: 800, h: 1000 },
    { src: "assets/placeholder/galerie-6.svg", alt: "Mèches caramel sur cheveux mi-longs", w: 800, h: 1000 },
    { src: "assets/placeholder/galerie-7.svg", alt: "Lissage soyeux et brillant", w: 800, h: 1000 },
    { src: "assets/placeholder/galerie-8.svg", alt: "Coupe bob avec mèches douces", w: 800, h: 1000 }
  ],

  temoignages: [
    {
      texte: "Un accueil chaleureux et un résultat impeccable à chaque visite. Je recommande sans hésiter !",
      attribution: "Cliente depuis 2019"
    },
    {
      texte: "Le balayage est superbe et tient longtemps. L'équipe écoute vraiment ce qu'on veut.",
      attribution: "Cliente fidèle"
    },
    {
      texte: "Toujours satisfait, autant pour la coupe que pour les conseils d'entretien.",
      attribution: "Client depuis 2021"
    }
  ],

  cartesCadeaux: [
    { montant: "75 $", description: "Une coupe et un soin, le cadeau parfait." },
    { montant: "150 $", description: "Une coloration ou un balayage complet." },
    { montant: "250 $", description: "Un après-midi complet de soins et de couleur." }
  ],

  heures: [
    { jour: "Lundi", heures: "Fermé" },
    { jour: "Mardi", heures: "9 h à 18 h" },
    { jour: "Mercredi", heures: "9 h à 18 h" },
    { jour: "Jeudi", heures: "9 h à 20 h" },
    { jour: "Vendredi", heures: "9 h à 18 h" },
    { jour: "Samedi", heures: "9 h à 16 h" },
    { jour: "Dimanche", heures: "Fermé" }
  ],

  politique: {
    annulation:
      "Vous pouvez annuler ou déplacer un rendez-vous jusqu'à 24 h à l'avance, sans frais.",
    retard:
      "Un retard de plus de 15 minutes peut entraîner le report du rendez-vous.",
    sansRdv:
      "Les rendez-vous sont recommandés. Nous accueillons les clients sans rendez-vous selon les disponibilités du moment."
  }
};
