
// Fetch data from the API
fetch('http://localhost:5678/api/works', {
    method: 'GET',
    headers: {
        'accept': 'application/json'
    }
})
.then(response => {
    if (!response.ok) {
        // Crée une erreur si la réponse n'est pas "ok"
        throw new Error('Unexpected Error'); 
    }
    return response.json();
})
.then(data => {
    data.forEach(work => {
        const galleryContainer = document.getElementById('gallery-container');
        const figure = document.createElement('figure');
        const img = document.createElement('img');
        img.src = work.imageUrl;
        img.alt = work.title;

        const figcaption = document.createElement('figcaption');
        figcaption.textContent = work.title;

        figure.appendChild(img);
        figure.appendChild(figcaption);
        galleryContainer.appendChild(figure);
    });
})
.catch(error => {console.error('Error fetching data:', error);
});