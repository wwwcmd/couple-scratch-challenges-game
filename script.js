document.addEventListener('DOMContentLoaded', function () {
    const cardsContainer = document.getElementById('cards-container');
    const newCardsButton = document.getElementById('new-cards-btn');

    // Function to get a random image from 1 to 365 with your specific naming convention
    function getRandomImagePath() {
        const randomNum = Math.floor(Math.random() * 365) + 1; // Random number between 1 and 365
        const paddedNum = String(randomNum).padStart(4, '0'); // Ensure it is 4 digits
        return `images/DOC-20241229-WA0001[1]_page-${paddedNum}.jpg`; // Path to image with your naming convention
    }

    // Function to create and render scratchable cards
    function renderCards() {
        // Clear the current cards in the container
        cardsContainer.innerHTML = '';

        // Create 2 cards (updated from 3)
        for (let i = 0; i < 2; i++) {
            const cardDiv = document.createElement('div');
            cardDiv.classList.add('col-12', 'col-md-6', 'mb-3'); // Updated to show in column for mobile and row for desktop

            const card = document.createElement('div');
            card.classList.add('card');
            card.style.backgroundImage = `url(${getRandomImagePath()})`; // Set background image directly
            card.style.backgroundSize = 'cover';
            card.style.backgroundPosition = 'center';
            card.style.position = 'relative';
            card.style.cursor = 'pointer'; // Added a cursor to indicate interactivity

            // Create a canvas element for the scratch effect
            const canvas = document.createElement('canvas');
            canvas.width = 300;
            canvas.height = 450;
            canvas.style.position = 'absolute';
            canvas.style.top = '0';
            canvas.style.left = '0';
            card.appendChild(canvas);

            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#000'; // Color for the scratchable overlay
            ctx.fillRect(0, 0, canvas.width, canvas.height); // Fill the canvas with the scratch color

            // Add "Scratch Me" text at the center of the canvas
            ctx.fillStyle = '#fff'; // White text color
            ctx.font = 'bold 24px Poppins';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('Scratch Me...', canvas.width / 2, canvas.height / 2); // Position text in the center

            // Variable to track the scratch progress
            let clearPercentage = 0;
            let isMouseDown = false;

            // Function to handle both mouse and touch events
            function handleScratchEvent(e) {
                const rect = canvas.getBoundingClientRect();
                const x = (e.clientX || e.touches[0].clientX) - rect.left;
                const y = (e.clientY || e.touches[0].clientY) - rect.top;
                scratchEffect(x, y);
            }

            // Function for scratch effect
            function scratchEffect(x, y) {
                const radius = 30; // Increased size of the scratch pen

                // Clear the area to reveal the image
                ctx.globalCompositeOperation = 'destination-out'; // Makes scratched area transparent
                ctx.beginPath();
                ctx.arc(x, y, radius, 0, Math.PI * 2);
                ctx.fill();
                ctx.closePath();

                // Calculate percentage of the area cleared
                clearPercentage = calculateClearPercentage();
                updateImageOpacity(clearPercentage);
            }

            // Function to calculate the percentage of the area cleared
            function calculateClearPercentage() {
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                let clearedPixels = 0;
                let totalPixels = imageData.data.length / 4; // Each pixel has 4 values (RGBA)

                for (let i = 0; i < imageData.data.length; i += 4) {
                    // Check if the pixel is cleared (RGBA values close to black or transparent)
                    if (imageData.data[i + 3] < 128) { // Alpha channel value (opacity)
                        clearedPixels++;
                    }
                }

                return (clearedPixels / totalPixels) * 100;
            }

            // Function to update the opacity of the image based on the scratch progress
            function updateImageOpacity(percentage) {
                // The opacity is gradually increased as more of the scratchable area is cleared
                const imageOpacity = Math.min(1, percentage / 60); // Fully reveal after 60% scratch
                card.style.opacity = imageOpacity;

                // Flash effect if 30% of the image is revealed
                if (percentage >= 30 && !card.classList.contains('flash')) {
                    card.classList.add('flash');
                    setTimeout(() => {
                        card.classList.remove('flash'); // Remove the flash effect after a short time
                    }, 500); // Flash for 500ms
                }

                // Image Enlargement at 60% scratch completion
                if (percentage >= 60 && !card.classList.contains('enlarged')) {
                    card.classList.add('enlarged');
                    showEnlargedImage(card); // Call function to show enlarged image
                }

                // Automatically complete the scratch at 60%
                if (percentage >= 60) {
                    setTimeout(() => {
                        card.style.opacity = 1; // Ensure image is fully revealed
                        card.querySelector('.scratch-overlay').style.display = 'none'; // Hide the scratch overlay
                    }, 500);
                }
            }

            // Function to show the enlarged image in the center of the screen
            function showEnlargedImage(card) {
                const enlargedImage = document.createElement('img');
                enlargedImage.src = card.style.backgroundImage.slice(5, -2); // Extract the URL from backgroundImage
                enlargedImage.classList.add('enlarged-image');
                document.body.appendChild(enlargedImage);

                // Set the initial size of the enlarged image to be medium-sized
                enlargedImage.style.position = 'fixed';
                enlargedImage.style.top = '50%';
                enlargedImage.style.left = '50%';
                enlargedImage.style.transform = 'translate(-50%, -50%) scale(1.2)'; // Medium size
                enlargedImage.style.zIndex = '9999';
                enlargedImage.style.transition = 'transform 1s ease, opacity 0.5s ease';

                // After 5 seconds, transition back and fade out the image
                setTimeout(() => {
                    enlargedImage.style.transition = 'transform 1s ease, opacity 0.5s ease';
                    enlargedImage.style.transform = 'translate(-50%, -50%) scale(1.2)'; // Keep it medium-sized
                    enlargedImage.style.opacity = '0'; // Fade out the image

                    // Remove the image from the DOM after the transition
                    setTimeout(() => {
                        enlargedImage.remove();
                    }, 1000); // Wait for the transition to finish before removing
                }, 5000); // Wait 5 seconds before transitioning back
            }

            // Add event listeners for both mouse and touch events
            canvas.addEventListener('mousedown', (e) => {
                isMouseDown = true;
                handleScratchEvent(e);
            });
            canvas.addEventListener('mousemove', (e) => {
                if (isMouseDown) handleScratchEvent(e);
            });
            canvas.addEventListener('mouseup', () => {
                isMouseDown = false;
            });
            canvas.addEventListener('mouseleave', () => {
                isMouseDown = false;
            });

            // Touch events for mobile devices
            canvas.addEventListener('touchstart', (e) => {
                e.preventDefault(); // Prevent default scrolling behavior
                isMouseDown = true;
                handleScratchEvent(e);
            });
            canvas.addEventListener('touchmove', (e) => {
                e.preventDefault(); // Prevent default scrolling behavior
                if (isMouseDown) handleScratchEvent(e);
            });
            canvas.addEventListener('touchend', () => {
                isMouseDown = false;
            });
            canvas.addEventListener('touchcancel', () => {
                isMouseDown = false;
            });

            // Append card to the container
            cardDiv.appendChild(card);
            cardsContainer.appendChild(cardDiv);
        }
    }

    // Event listener for the "Reveal New Positions" button
    newCardsButton.addEventListener('click', renderCards);

    // Initial render
    renderCards();
});
