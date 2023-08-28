// Initialisation des variables
let worksData = new Set();
let categoriesData = [];
let categoryButtons = [];

// Fonction pour gérer le clic sur les boutons de catégorie
function handleCategoryButtonClick(clickedButton) {
    // Mettre à jour les classes des boutons de catégorie
    categoryButtons.forEach(button => {
        if (button === clickedButton) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });

    const selectedCategory = clickedButton.id;
    filterWorks(selectedCategory);
}

// Fonction pour créer un bouton avec du texte et un ID
function createButton(text, id) {
    const button = document.createElement('button');
    button.className = 'category-filter';
    button.textContent = text;
    button.id = id;
    return button;
}

// Fonction pour filtrer et afficher les works en fonction de la catégorie sélectionnée
function filterWorks(selectedCategory) {
    const galleryContainer = document.getElementById('gallery-container');
    galleryContainer.innerHTML = '';

    for (const work of worksData) {
        if (selectedCategory === 'all' || work.categoryId === Number(selectedCategory)) {
            const figure = document.createElement('figure');
            const img = document.createElement('img');
            img.src = work.imageUrl;
            img.alt = work.title;

            const figcaption = document.createElement('figcaption');
            figcaption.textContent = work.title;

            figure.appendChild(img);
            figure.appendChild(figcaption);
            galleryContainer.appendChild(figure);
        }
    }

    // Mettre à jour les classes des boutons de catégorie
    categoryButtons.forEach(button => {
        const categoryId = button.id;
        const isActive = categoryId === selectedCategory;

        // Ajouter ou retirer la classe "active" en fonction de la catégorie sélectionnée
        button.classList.toggle('active', isActive);
    });

    // Mettre à jour la classe "active" du bouton "Tous"
    const allButton = document.getElementById('all');
    const isAnyButtonActive = categoryButtons.some(button => button.classList.contains('active'));
    allButton.classList.toggle('active', !isAnyButtonActive);
}

// Fonction pour récupérer les catégories depuis l'API
async function fetchCategories() {
    try {
        const response = await fetch('http://localhost:5678/api/categories', {
            method: 'GET',
            headers: {
                'accept': 'application/json'
            }
        });

        if (response.ok) {
            // Si la réponse est réussie, convertir les données en JSON
            const categories = await response.json();
            categoriesData = categories;

            // Appeler la fonction pour créer les boutons de filtre de catégorie
            createCategoryButtons(categories);

            // Appeler la fonction pour récupérer les données des works
            await fetchWorksData();
        } else {
            // Si la réponse n'est pas réussie, afficher une erreur dans la console
            console.error('Error fetching categories:', response.statusText);
        }
    } catch (error) {
        // En cas d'erreur, afficher une erreur dans la console
        console.error('Error fetching categories:', error);
    }
}

// Fonction pour créer les boutons de filtre de catégorie
function createCategoryButtons(categories) {
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
        button.addEventListener('click', function (event) {
            handleCategoryButtonClick(event.target);
        });
    }

    // Ajouter un écouteur d'événements pour le filtrage par catégorie
    categoryFiltersContainer.addEventListener('click', function (event) {
        if (event.target.classList.contains('category-filter')) {
            const selectedCategory = event.target.id;
            filterWorks(selectedCategory);
        }
    });
}

// Fonction pour récupérer les données des works depuis l'API
async function fetchWorksData() {
    try {
        const response = await fetch('http://localhost:5678/api/works', {
            method: 'GET',
            headers: {
                'accept': 'application/json'
            }
        });

        if (response.ok) {
            // Si la réponse est réussie, convertir les données en JSON
            const data = await response.json();
            data.forEach(work => worksData.add(work));
            // Filtrer les works pour afficher "Tous"
            filterWorks('all');
        } else {
            // Si la réponse n'est pas réussie, afficher une erreur dans la console
            console.error('Error fetching data:', response.statusText);
        }
    } catch (error) {
        // En cas d'erreur, afficher une erreur dans la console
        console.error('Error fetching data:', error);
    }
}

// Appel initial pour récupérer les catégories depuis l'API
fetchCategories();

document.addEventListener('DOMContentLoaded', () => {
    const actionsContainer = document.querySelector('#actions-container');
    if (actionsContainer) {

        const editButton = actionsContainer.querySelector('.edit-site');

        // Vérifier si l'utilisateur est connecté en vérifiant l'état de connexion dans localStorage
        const loggedInInfo = JSON.parse(localStorage.getItem('loggedIn'));
        const loggedIn = loggedInInfo && loggedInInfo.authenticated;

        if (editButton) {
            if (loggedIn) {
                editButton.style.display = 'flex'; // Afficher le bouton edit-site
            } else {
                editButton.style.display = 'none'; // Cacher le bouton edit-site
            }
        }
    }
});

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
    }

    function handleLoginFormSubmit(event) {
        event.preventDefault();

        // Supprimer les messages d'erreur précédents
        const errorMessages = loginForm.querySelectorAll('.error-message');
        errorMessages.forEach(message => message.remove());

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        fetch('http://localhost:5678/api/users/login', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        })
            .then(response => {
                if (response.status === 200) {
                    // Authentification réussie, enregistrer l'état dans le localStorage
                    localStorage.setItem('loggedIn', JSON.stringify({ email, authenticated: true }));
                    window.location.replace('index.html'); // Rediriger vers index.html
                    return response.json();
                } else if (response.status === 401) {
                    const errorMessage = 'Erreur dans l’identifiant ou le mot de passe';
                    displayErrorMessage(errorMessage);
                    throw new Error(errorMessage);
                } else {
                    console.error('Échec de la connexion:', response.statusText);
                    throw new Error('Échec de la connexion');
                }
            })
            .catch(error => {
                console.error('Erreur:', error);
                const errorMessage = 'Une erreur est survenue lors de la connexion.';
                displayErrorMessage(errorMessage);
            });
    }
});