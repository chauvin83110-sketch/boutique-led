# Thème Éclat Rubis (base Horizon 4.5.0)

Thème Shopify codé pour la boutique du masque LED, synchronisé avec Shopify via l'intégration GitHub
(Boutique en ligne › Thèmes › Ajouter un thème › Se connecter à partir de GitHub).
Produits, prix, pages légales et réglages restent dans l'admin Shopify. Seul le thème est ici.

## Ce qui a été ajouté à Horizon
| Fichier | Rôle |
|---|---|
| `assets/rubis.css` | Direction artistique : rose poudré #F7DEDA, rubis #A3122A, chocolat #3A1E19, rose clair #FBEDEA ; titres Cormorant Garamond, texte Montserrat |
| `assets/rubis-motion.js` | Animations GSAP + ScrollTrigger (voir plus bas) |
| `assets/gsap.min.js`, `assets/ScrollTrigger.min.js` | GSAP 3.12.5, hébergé avec le thème (pas de CDN externe) |
| `assets/eclat-rubis-logo-horizontal-*.svg`, `assets/eclat-rubis-icone.svg`, `assets/favicon-*.png` | Logo « Aube ». Affiché automatiquement dans l'en-tête et comme favicon tant qu'aucun logo n'est choisi dans les réglages du thème (`blocks/_header-logo.liquid`, `layout/theme.liquid`) |
| `sections/er-hero.liquid` | Héros sombre : la lumière rouge « s'allume », puis le titre apparaît ligne par ligne |
| `sections/er-signs.liquid` | « Ce n'est pas dans votre tête » : teint, ovale, cou |
| `sections/er-ritual.liquid` | Rituel de 10 minutes : section épinglée sur ordinateur, le cadran se remplit au défilement |
| `sections/er-compare.liquid` | Institut contre masque, chiffres qui défilent |
| `sections/er-guarantee.liquid` | Garantie 30 jours |
| `sections/er-faq.liquid` | Questions fréquentes (+ données structurées FAQPage) |
| `sections/er-cta.liquid` | Appel final |

`templates/index.json` et `templates/product.json` assemblent ces sections.

## Règles d'animation (skills motion-design + GSAP)
- Personnalité « Premium » : 0,35 / 0,6 / 1,2 s, courbe `power2.out`, aucun rebond.
- Un seul grand moment (le héros). Le reste apparaît sobrement au défilement, en lot (`ScrollTrigger.batch`).
- Uniquement `transform` et `opacity` ; `gsap.matchMedia()` coupe tout si `prefers-reduced-motion: reduce`.
- Sur mobile, pas d'épinglage : le cadran se remplit une fois.
- Si GSAP ne charge pas, tout le contenu reste visible.

## Règles de contenu
Pas de promesse médicale (« aspect », « éclat », pas « soigne »), pas de faux avis, pas de fausse urgence.
