// Définir un objet Work pour stocker les informations de chaque travail
class Work {
    constructor(id, title, imageUrl, categoryId, userId) {
        this.id = id;
        this.title = title;
        this.imageUrl = imageUrl;
        this.categoryId = categoryId;
        this.userId = userId;
    }
};

// Définir les variables
const worksData = new Set();
const workIds = []; // Tableau pour stocker les ID des travaux
const categoryButtons = [];

// Fonction pour gérer le clic sur les boutons de catégorie
const handleCategoryButtonClick = (clickedButton) => {
    // Mettre à jour les classes des boutons de catégorie
    categoryButtons.forEach(button => {
        button.classList.toggle('active', button === clickedButton);
    });

    const selectedCategory = clickedButton.id;
    filterWorks(selectedCategory);
};

// Fonction pour créer un bouton avec du texte et un ID
const createButton = (text, id) => {
    const button = document.createElement('button');
    button.className = 'category-filter';
    button.textContent = text;
    button.id = id;
    return button;
};

// Fonction pour filtrer et afficher les works en fonction de la catégorie sélectionnée
const filterWorks = (selectedCategory) => {
    const galleryContainer = document.getElementById('gallery-container');
    galleryContainer.innerHTML = '';

    for (const work of worksData) {
        if (selectedCategory === 'all' || work.categoryId === Number(selectedCategory)) {
            const figure = document.createElement('figure');

            const img = new Image();
            img.src = work.imageUrl;
            img.alt = work.title;

            const figcaption = document.createElement('figcaption');
            figcaption.textContent = work.title;

            figure.appendChild(img);
            figure.appendChild(figcaption);
            galleryContainer.appendChild(figure);
        }
    }

    // Mettre à jour les classes des boutons de catégorie (peut rester inchangée)
    categoryButtons.forEach(button => {
        const categoryId = button.id;
        const isActive = categoryId === selectedCategory;
        button.classList.toggle('active', isActive);
    });

    // Mettre à jour la classe "active" du bouton "Tous" (peut rester inchangée)
    const allButton = document.getElementById('all');
    const isAnyButtonActive = categoryButtons.some(button => button.classList.contains('active'));
    allButton.classList.toggle('active', !isAnyButtonActive);
};

// Fonction pour récupérer les catégories depuis l'API
const fetchCategories = async () => {
    try {
        const response = await fetch('http://localhost:5678/api/categories', {
            method: 'GET',
            headers: {
                'accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Error fetching categories: ' + response.statusText);
        }

        // Si la réponse est réussie, convertir les données en JSON
        const categories = await response.json();

        // Créer les boutons de filtre de catégorie
        createCategoryButtons(categories);

        // Récupérer les données des works
        await fetchWorksData();
    } catch (error) {
        console.error('Error fetching categories:', error);
    }
};

// Fonction pour créer les boutons de filtre de catégorie
const createCategoryButtons = (categories) => {
    const categoryFiltersContainer = document.querySelector('.category-filters');

    // Créer un bouton "Tous" et le rendre actif par défaut
    const allButton = createButton('Tous', 'all');
    allButton.classList.add('active');
    categoryFiltersContainer.appendChild(allButton);

    // Créer des boutons pour chaque catégorie
    for (const category of categories) {
        const button = createButton(category.name, category.id);
        categoryFiltersContainer.appendChild(button);
        categoryButtons.push(button);
        button.addEventListener('click', event => {
            handleCategoryButtonClick(event.target);
        });
    }

    // Ajouter un écouteur d'événements pour le filtrage par catégorie
    categoryFiltersContainer.addEventListener('click', event => {
        if (event.target.classList.contains('category-filter')) {
            const selectedCategory = event.target.id;
            filterWorks(selectedCategory);
        }
    });
};

// Fonction pour récupérer les données des works depuis l'API
const fetchWorksData = async () => {
    try {
        const response = await fetch('http://localhost:5678/api/works', {
            method: 'GET',
            headers: {
                'accept': 'application/json'
            }
        });

        if (!response.ok) {
            // Gestion des erreurs réseau
            const statusText = response.statusText;
            let errorMessage = '';

            switch (response.status) {
                case 404:
                    errorMessage = 'Les données des works n\'ont pas été trouvées.';
                    break;
                case 500:
                    errorMessage = 'Une erreur interne du serveur s\'est produite.';
                    break;
                default:
                    errorMessage = `Erreur inattendue: ${statusText}`;
                    break;
            }

            throw new Error(errorMessage);
        }

        // Si la réponse est réussie, convertir les données en JSON
        const data = await response.json();

        // Parcourir les données et créer des objets Work, puis les ajouter à worksData et workIds
        data.forEach(work => {
            const workObject = new Work(
                work.id,
                work.title,
                work.imageUrl,
                work.categoryId,
                work.userId
            );
            worksData.add(workObject);
            workIds.push(workObject.id);
        });

        // Filtrer les works pour afficher la catégorie actuellement sélectionnée
        const selectedCategory = getSelectedCategory(); // Ajoutez une fonction pour obtenir la catégorie sélectionnée
        filterWorks(selectedCategory);
    } catch (error) {
        console.error('Erreur:', error);
        // Afficher le message d'erreur à l'utilisateur, en mettant à jour le p d'erreur.
        const errorContainer = document.getElementById('error-container');
        errorContainer.textContent = error.message;
    }
};

const getSelectedCategory = () => {
    const activeButton = categoryButtons.find(button => button.classList.contains('active'));
    return activeButton ? activeButton.id : 'all';
};

// Appel initial pour récupérer les catégories depuis l'API
fetchCategories();

// login.js - Module pour la page de connexion
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');

    // Ajouter un gestionnaire d'événement pour la soumission du formulaire
    loginForm.addEventListener('submit', handleLoginFormSubmit);

    // Fonction pour afficher un message d'erreur
    function displayErrorMessage(message) {
        const errorParagraph = document.createElement('p');
        errorParagraph.className = 'error-message';
        errorParagraph.textContent = message;

        const submitButton = loginForm.querySelector('input[type="submit"]');
        loginForm.insertBefore(errorParagraph, submitButton);
    };

    // Fonction pour réinitialiser les messages d'erreur
    function clearErrorMessages() {
        const errorMessages = loginForm.querySelectorAll('.error-message');
        errorMessages.forEach(errorMessage => errorMessage.remove());
    };

    // Fonction pour gérer la soumission du formulaire de connexion
    async function handleLoginFormSubmit(event) {
        event.preventDefault();

        // Effacer les anciens messages d'erreur
        clearErrorMessages();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('http://localhost:5678/api/users/login', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            });

            if (response.status === 200) {
                const responseData = await response.json(); // Convertir la réponse en JSON
                const token = responseData.token; // Extraire le token de la réponse

                // Stocker le token d'authentification dans le localStorage
                localStorage.setItem('loggedIn', JSON.stringify({ email, authenticated: true, token }));
                window.location.replace('index.html'); // Rediriger vers la page principale
            } else if (response.status === 401) {
                    const errorMessage = 'Erreur dans le mot de passe';
                    displayErrorMessage(errorMessage);
            } else if (response.status === 404) {
                    const errorMessage = 'Utilisateur introuvable';
                    displayErrorMessage(errorMessage);
            } else {
                console.error('Échec de la connexion:', response.statusText);
            }
        } catch (error) {
            console.error('Erreur:', error);
                const errorMessage = 'Une erreur est survenue lors de la connexion.';
                displayErrorMessage(errorMessage);
        }
    }
});

// Afficher le contenu administrateur
document.addEventListener('DOMContentLoaded', () => {
    const actionsContainers = document.querySelectorAll('.actions-container');
    const loggedInInfo = JSON.parse(localStorage.getItem('loggedIn'));

    if (loggedInInfo && loggedInInfo.authenticated) {
        // Retirer les filtres de catégories
        const categoryFiltersContainer = document.querySelector('.category-filters');
        categoryFiltersContainer.style.display = 'none';

        // Créer le div du bandeau d'administration
        const adminBanner = document.createElement('div');
        adminBanner.className = 'admin-banner';

        // Créer les éléments dans le bandeau administrateur
        const editIcon = document.createElement('img');
        editIcon.src = './assets/icons/edit_white.svg';
        editIcon.alt = 'Mode édition';

        const editModeText = document.createElement('span');
        editModeText.textContent = 'Mode édition';

        adminBanner.appendChild(editIcon);
        adminBanner.appendChild(editModeText);

        // Insérer le bandeau d'administration au-dessus de la balise header
        const header = document.querySelector('header');
        header.insertAdjacentElement('beforebegin', adminBanner);

        // Créer les éléments "Éditer site" dans chaque container d'actions
        actionsContainers.forEach(container => {
            const editSiteLink = document.createElement('a');
            editSiteLink.href = '#gallery-modal';
            editSiteLink.className = 'js-modal';

            const editIcon = document.createElement('img');
            editIcon.src = './assets/icons/edit.svg';
            editIcon.alt = 'Mode édition';

            const editText = document.createTextNode('modifier');
            editSiteLink.appendChild(editIcon);
            editSiteLink.appendChild(editText);

            container.appendChild(editSiteLink);
        });

        // Gérer la déconnexion
        const loginLink = document.getElementById('login');
        loginLink.textContent = 'logout';

        loginLink.addEventListener('click', () => {
            localStorage.removeItem('loggedIn'); // Supprimer les informations de connexion
        });
    }
});

// Afficher la modal de gestion des works
document.addEventListener('DOMContentLoaded', () => {
    const loggedInInfo = JSON.parse(localStorage.getItem('loggedIn'));
    const editSiteLinks = document.querySelectorAll('.js-modal');
    const modal = document.getElementById('gallery-modal');
    const warpperModal = document.getElementById('modal');
    const modalContent = document.getElementById('gallery-modal-content');
    const focusableSelector = 'button, select, input, a, img, option, label';
    let focusables = [];

    // Fonction ouverture modale galerie
    function openModal() {
        // Ouvrir la fenêtre modale
        focusables = Array.from(modal.querySelectorAll(focusableSelector));
        focusables[0].focus();
        modal.style.display = null;
        modal.setAttribute('aria-hidden', 'false');
        modal.setAttribute('aria-modal', 'true');
        warpperModal.style.display = null;
        modalContent.style.display = null;
        addPhotoModal.style.display = 'none';
        errorMessage.style.display = 'none';
        modalContent.innerHTML = ''; // Effacer le contenu de la fenêtre modale

        // Générer le contenu HTML pour les images dans la fenêtre modale
        let modalContentHTML = '';
        worksData.forEach(work => {
            modalContentHTML +=
                `<div data-work-id="${work.id}">
                    <div class="js-modal-image">
                        <img src="${work.imageUrl}" alt="${work.title}">
                        <img id="work-delete" src="./assets/icons/trash-can-solid.svg" alt="Supprimer">
                    </div>
                </div>
                `;
        });

        // Injecter le contenu HTML dans la fenêtre modale
        modalContent.innerHTML = modalContentHTML;
    };

    // Fonction fermeture modale
    function closeModal() {
        if (modal === null) return;
        window.setTimeout(function () {
            modal.style.display = 'none';
            modalContent.style.display = 'none';
            addPhotoModal.style.display = 'none';
            errorMessage.style.display = 'none';
            modalContent.innerHTML = ''; // Effacer le contenu de la fenêtre modale
        }, 500);
        modal.setAttribute('aria-hidden', 'true');
        modal.removeAttribute('aria-modal');
        window.location.replace('index.html'); // Rediriger vers la page principale
    };

    // Retour à la modale galerie "gallery"
    const returnGalleryModal = document.getElementById('return-gallery-modal');

    // Gestionnaire d'événements pour le clic sur retour à la modale galerie
    returnGalleryModal.addEventListener('click', openModal);

    // Ajoutez également l'écouteur d'événements pour les liens `.js-modal`
    editSiteLinks.forEach(link => {
        link.addEventListener('click', openModal);
    });

    // Focus dans la modale 
    const focusInModal = function (e) {
        e.preventDefault();
        let index = focusables.findIndex(f => f === modal.querySelector(':focus'));
        index++;
        if (e.shiftKey === true) {
            index--;
        } else {
            index++;
        }
        if (index >= focusables.length) {
            index = 0;
        }
        if (index < 0) {
            index = focusables.length - 1;
        }
        focusables[index].focus();
    };

    // Fermer la fenêtre modale au clavier
    window.addEventListener('keydown', function (e) {
        if (e.key === 'Esc' || e.key === 'Escape') {
            closeModal();
        }
        if (e.key === 'Tab' && modal !== null) {
            focusInModal(e);
        }
    });

    // Fermer la fenêtre modale en cliquant en dehors ou sur l'élément de fermeture
    modal.addEventListener('click', (event) => {
        if (event.target === modal || event.target.classList.contains('close-modal')) {
            closeModal();
        }
    });

    // Suppression de work dans la fenêtre modale
    modalContent.addEventListener('click', async (event) => {
        if (event.target.id === 'work-delete') {
            const workContainer = event.target.closest('div[data-work-id]');
            if (!workContainer) {
                return;
            }

            const workId = workContainer.getAttribute('data-work-id');

            try {
                const response = await fetch(`http://localhost:5678/api/works/${workId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${loggedInInfo.token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (response.status === 204) {
                    // Réponse 204 : Item Deleted
                    console.log('Item Deleted');
                    workContainer.remove(); // Supprimer l'élément du DOM
                    closeModal();
                } else if (response.status === 401) {
                    // Réponse 401 : Unauthorized
                    console.error('Unauthorized');
                } else if (response.status === 500) {
                    // Réponse 500 : Unexpected Behaviour
                    console.error('Unexpected Behaviour');
                }
            } catch (error) {
                console.error('Error:', error);
            }
        }
    });

    // Afficher la modal d'ajout des works
    const addPhotoModal = document.getElementById('add-modal');
    const addPhotoButton = document.getElementById('add-photo-modal');
    const submitButton = document.getElementById('submit-button');
    const errorMessage = document.getElementById('error-message');

    // Gérer l'ouverture de la fenêtre modale
    addPhotoButton.addEventListener('click', () => {
        focusables = Array.from(modal.querySelectorAll(focusableSelector));
        focusables[0].focus();
        warpperModal.style.display = 'none';
        modalContent.style.display = 'none';
        modalContent.innerHTML = ''; // Effacer le contenu de la fenêtre modale
        addPhotoModal.style.display = null;
        renderAddPhotoForm();
        submitButton.classList.remove('green-button');
        submitButton.classList.add('grey-submit-button');
    });

    function getLastWorkId() {
        // Parcourir la liste des works existants et trouver le dernier ID
        let lastId = 0;
        worksData.forEach(work => {
            if (work.id > lastId) {
                lastId = work.id;
            }
        });
        return lastId;
    }

    // Fonction pour afficher le formulaire dans la fenêtre modale
    function renderAddPhotoForm() {
        const formHTML = `
                <div class="image-input">
                <input type="hidden" id="work-id-input" value="">
                <img class="image-no-input" id="preview-image" src="./assets/icons/picture-svgrepo-com.svg" alt="Image preview">
                <label for="image-input" id="add-input" class="add-input">+ Ajouter</label>
                <input type="file" id="image-input" accept=".jpg, .png" name="+ Ajouter" required>
                <p>jpg, png ; 4 Mo maximum.</p>
                </div>
                <label for="title-input" class="title-input">Titre</label>
                <input type="text" id="title-input" required>
                <label for="category-input" class="title-input">Catégorie</label>
                <select id="category-input" required>
                <option value="" disabled selected></option>
                    <!-- Insérez ici les options de catégorie depuis les données -->
                </select>
                `;

        const modalContent = document.getElementById('add-photo-form');
        modalContent.innerHTML = formHTML;

        // Fonction preview photo modal "add-photo"
        const imageInput = document.getElementById('image-input');
        imageInput.addEventListener('change', handleImageInputChange);

        function handleImageInputChange(event) {
            const selectedFile = event.target.files[0];
            const label = event.target.parentElement; // Obtenir le label parent

            // Vérifier si un fichier a été sélectionné
            if (selectedFile) {
                // Vérifier la taille du fichier (4 Mo maximum)
                if (selectedFile.size > 4 * 1024 * 1024) { // 4 Mo en octets
                    displayErrorMessage('L\'image ne doit pas dépasser 4 Mo.');
                    event.target.value = ''; // Effacer la sélection de fichier
                    return;
                }

                // Vérifier le format du fichier (jpg ou png)
                const allowedFormats = ['image/jpeg', 'image/png'];
                if (!allowedFormats.includes(selectedFile.type)) {
                    displayErrorMessage('L\'image doit être au format JPG ou PNG.');
                    event.target.value = ''; // Effacer la sélection de fichier
                    return;
                }

                // Masquer les éléments input et p
                const previewImage = document.getElementById('preview-image');
                const labelledImage = document.getElementById('add-input');

                event.target.style.display = 'none';
                event.target.nextElementSibling.style.display = 'none'; // Le paragraphe p
                label.style.justifyContent = 'center'; // Centrer l'image dans le label
                previewImage.style.width = '129px'; // Agrandir l'image
                previewImage.style.height = '193px';
                labelledImage.style.display = 'none'; //Label preview image

                // Prévisualiser l'image à l'aide de FileReader
                const reader = new FileReader();
                reader.onload = function () {
                    const previewImage = document.getElementById('preview-image');
                    previewImage.src = reader.result;
                };
                reader.readAsDataURL(selectedFile);
            } else {
                // Si aucun fichier n'a été sélectionné, restaurer l'image par défaut
                previewImage.src = './assets/icons/picture-svgrepo-com.svg';

                // Réafficher les éléments input et p
                event.target.style.display = 'block';
                event.target.nextElementSibling.style.display = 'block'; // Le paragraphe p
                label.style.justifyContent = 'space-between'; // Rétablir l'alignement
            }
        }

        function displayErrorMessage(message) {
            const errorMessage = document.getElementById('error-message');
            errorMessage.textContent = message;
            errorMessage.style.display = 'block';
        }

        // Fonction pour charger les catégories depuis les données existantes
        const loadCategories = () => {
            const categoryInput = document.getElementById('category-input');

            // Remplir la liste déroulante des catégories à partir des catégories existantes
            categoryButtons.forEach(categoryButton => {
                const option = document.createElement('option');
                option.value = categoryButton.id; // L'ID de la catégorie
                option.textContent = categoryButton.textContent; // Afficher le nom de la catégorie
                categoryInput.appendChild(option);
            });
        };

        // Appelez cette fonction pour charger les catégories au chargement de la page
        loadCategories();

        // Fonction de vérification des champs
        function checkFieldsAndToggleButton() {
            const imageInput = document.getElementById('image-input');
            const titleInput = document.getElementById('title-input');
            const categoryInput = document.getElementById('category-input');
            const submitButton = document.getElementById('submit-button');
            const errorMessage = document.getElementById('error-message');

            const imageFile = imageInput.files[0];
            const title = titleInput.value;
            const categoryId = categoryInput.value;

            // Vérifier si tous les champs sont correctement remplis
            const allFieldsFilled = imageFile && title && categoryId;

            // Modifier la classe du bouton en fonction de l'état des champs
            if (allFieldsFilled) {
                submitButton.classList.remove('grey-submit-button'); // Retirer la classe 
                submitButton.classList.add('green-button'); // Ajouter la classe pour le bouton vert
                errorMessage.style.display = 'none'; // Cacher le message d'erreur s'il était affiché
            } else {
                submitButton.classList.remove('green-button'); // Retirer la classe 
                submitButton.classList.add('grey-submit-button'); // Ajouter la classe pour le bouton gris
                errorMessage.textContent = 'Tous les champs sont obligatoires.';
                errorMessage.style.display = 'block'; // Afficher le message d'erreur
            }
        }

        // Ajouter des gestionnaires d'événements "input" pour les champs du formulaire
        const titleInput = document.getElementById('title-input');
        const categoryInput = document.getElementById('category-input');
        const submitButton = document.getElementById('submit-button');

        imageInput.addEventListener('input', checkFieldsAndToggleButton);
        titleInput.addEventListener('input', checkFieldsAndToggleButton);
        categoryInput.addEventListener('input', checkFieldsAndToggleButton);

        // Gestionnaire d'événements pour la soumission du formulaire
        submitButton.addEventListener('click', async (event) => {
            event.preventDefault(); // Empêcher la soumission du formulaire si des erreurs subsistent

            // Récupérer les valeurs des champs du formulaire
            const imageFile = imageInput.files[0];
            const title = titleInput.value;
            const categoryId = categoryInput.value;

            // Vérifier à nouveau que tous les champs sont remplis
            if (!imageFile || !title || !categoryId) {
                submitButton.classList.remove('green-button');
                submitButton.classList.add('grey-submit-button');
                return; // Ne rien faire si tous les champs ne sont pas remplis
            }

            // Créer un objet FormData pour envoyer les données au format multipart/form-data
            const formData = new FormData();
            formData.append('id', getLastWorkId);
            formData.append('image', imageFile);
            formData.append('title', title);
            formData.append('category', categoryId);

            try {
                const response = await fetch('http://localhost:5678/api/works', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${loggedInInfo.token}`
                    },
                    body: formData,
                });

                if (response.status === 201) {
                    closeModal();
                    errorMessage.textContent = 'Le projet a été ajouté avec succès!';
                    console.log('Le work a été ajouté avec succès');
                    // Afficher le statut HTTP de la réponse
                    console.log('Statut HTTP :', response.status);

                } else {
                    // Afficher une erreur en cas d'échec de la requête
                    switch (response.status) {
                        case 400:
                        case 401:
                            // Afficher un message d'erreur spécifique pour les erreurs 400 et 401
                            errorMessage.textContent = 'Erreur de validation ou non autorisé.';
                            break;
                        case 403:
                            // Afficher un message d'erreur spécifique pour l'erreur 403
                            errorMessage.textContent = 'Accès interdit.';
                            break;
                        case 500:
                        case 501:
                        case 502:
                        case 503:
                            // Afficher un message d'erreur générique pour les erreurs 500+
                            errorMessage.textContent = 'Erreur interne du serveur.';
                            break;
                        default:
                            // Afficher un message d'erreur générique pour toutes les autres erreurs
                            errorMessage.textContent = 'Une erreur est survenue lors de l\'ajout du work.';
                            break;
                    }
                    errorMessage.style.display = 'block';
                }
            } catch (error) {
                // Gérer les erreurs non liées à la réponse HTTP
                console.error('Erreur:', error);
            }
        });
    }
});