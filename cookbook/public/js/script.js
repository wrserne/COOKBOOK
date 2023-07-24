// Get all carousel items and buttons
let carouselItems = document.querySelectorAll('.carousel-item');
const carouselButtons = document.querySelectorAll('.carousel-button');

// Set the index of the currently displayed item
let currentIndex = 0;

// Function to show the current item
function showCurrentItem() {
    carouselItems.forEach((item, index) => {
        if (index === currentIndex) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

// Function to scroll the carousel
function scrollCarousel(direction) {
    currentIndex += direction;
    if (currentIndex < 0) {
        currentIndex = carouselItems.length - 1;
    } else if (currentIndex >= carouselItems.length) {
        currentIndex = 0;
    }
    showCurrentItem();
}

// Start the carousel by showing the first item
showCurrentItem();

// Add event listeners to buttons for scrolling
carouselButtons.forEach((button, index) => {
    button.addEventListener('click', () => scrollCarousel(index === 0 ? -1 : 1));
});

// Function to automatically scroll the carousel every 6 seconds
function autoScrollCarousel() {
    scrollCarousel(1);
}

// Set an interval to automatically scroll the carousel every 6 seconds
setInterval(autoScrollCarousel, 6000);

// After form submission, update the carousel with the new recipe
const form = document.querySelector('form');
form.addEventListener('submit', (event) => {
    event.preventDefault();

    // Get the form data
    const formData = new FormData(form);
    const title = formData.get('title');
    const ingredients = formData.get('ingredients');
    const instructions = formData.get('instructions');
    const imageUrl = formData.get('imageUrl');

    // Make a POST request to add the new recipe
    fetch('/add', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title, ingredients, instructions, imageUrl })
    })
    .then((response) => response.json())
    .then((data) => {
        // Create a new carousel item
        const carouselItem = document.createElement('div');
        carouselItem.classList.add('carousel-item');
        carouselItem.innerHTML = `
            <img src="${data.image_url}" alt="${data.title}">
            <h2>${data.title}</h2>
        `;

        // Insert the new carousel item at the beginning
        const carouselContainer = document.querySelector('.carousel');
        carouselContainer.insertBefore(carouselItem, carouselContainer.firstChild);

        // Reset the form input fields
        form.reset();

        // Update carouselItems array with the new item and adjust the currentIndex
        carouselItems = document.querySelectorAll('.carousel-item');
        currentIndex = carouselItems.length - 1;
    })
    .catch((error) => {
        console.error('Error adding recipe:', error);
    });
});
