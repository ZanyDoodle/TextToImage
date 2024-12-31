const imageInput = document.getElementById('imageInput');
const canvas = document.getElementById('canvas');
const output = document.getElementById('output');

if (!imageInput || !canvas || !output) {
    console.error('Missing DOM element references');
    alert('Critical error: Some required elements are missing from the page.');
}

imageInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) {
        console.error('No file selected');
        return;
    }
    processImageFile(file);
});

document.addEventListener('paste', (event) => {
    const items = event.clipboardData && event.clipboardData.items;
    if (!items) {
        console.error('No clipboard data available');
        return;
    }
    for (const item of items) {
        if (item.type.startsWith('image/')) {
            const file = item.getAsFile();
            if (!file) {
                console.error('Pasted data is not an image');
                return;
            }
            processImageFile(file);
            break;
        }
    }
});

function processImageFile(file) {
    const img = new Image();
    img.onload = () => {
        preprocessImage(img);
    };
    img.onerror = () => {
        console.error('Failed to load image');
        alert('Error: Unable to load the selected image.');
    };
    img.src = URL.createObjectURL(file);
}

function preprocessImage(img) {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error('Failed to get canvas context');
        alert('Critical error: Unable to process the image.');
        return;
    }

    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        const red = data[i];
        const green = data[i + 1];
        const blue = data[i + 2];
        const brightness = (red + green + blue) / 3;

        if (brightness > 100) {
            data[i] = 255;
            data[i + 1] = 255; 
            data[i + 2] = 255; 
        } else {
            data[i] = 0;
            data[i + 1] = 0;
            data[i + 2] = 0;
        }
    }

    ctx.putImageData(imageData, 0, 0);
    extractTextFromCanvas();
}

function extractTextFromCanvas() {
    output.textContent = 'Processing image...';
    output.classList.add('loading');

    Tesseract.recognize(canvas, 'eng', {
        logger: (info) => console.log(info),
    }).then(({ data: { text } }) => {
        output.textContent = text.trim() || 'No text detected.';
        output.classList.remove('loading');
    }).catch((err) => {
        console.error('Tesseract error:', err);
        output.textContent = 'Error: ' + err.message;
        output.classList.remove('loading');
    });
}

function reloadPage() {
    location.reload();
}
