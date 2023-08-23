
// Récupération des données depuis l'API
fetch('http://localhost:5678/api/works', {
    method: 'GET',
    headers: {
        'accept': 'application/json'
    }
})
.then(response => {
    // Vérifier si la réponse n'est pas réussie
    if (!response.ok) {
        throw new Error('Unexpected Error'); 
    }
    // Analyser les données JSON de la réponse
    return response.json();
})
.then(data => {
    // Itérer à travers chaque objet "work" dans le tableau de données
    data.forEach(work => {
        // Créer des éléments HTML pour chaque "work"
        const galleryContainer = document.getElementById('gallery-container');
        const figure = document.createElement('figure');
        const img = document.createElement('img');
        img.src = work.imageUrl;
        img.alt = work.title;

        const figcaption = document.createElement('figcaption');
        figcaption.textContent = work.title;

        // Ajouter l'élément "img" et "figcaption" à l'élément "figure"
        figure.appendChild(img);
        figure.appendChild(figcaption);
        galleryContainer.appendChild(figure);
    });
})

    // Gérer les erreurs lors de la récupération des données ou de l'analyse JSON
.catch(error => {console.error('Error fetching data:', error);
});