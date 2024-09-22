// Инициализация переменных
const grid = document.getElementById('grid');
const coordinatesDisplay = document.getElementById('coordinates');
const startXInput = document.getElementById('startX');
const startYInput = document.getElementById('startY');
const clearButton = document.getElementById('clearGrid');
const createButton = document.getElementById('createGrid');
const saveButton = document.getElementById('saveImage');
const colorPaletteContainer = document.getElementById('colorPaletteContainer');
const uploadImageInput = document.getElementById('uploadImage');

let uploadedImageDimensions = { width: 0, height: 0 }; // Хранит размеры загруженного изображения

// Задаем палитру цветов
const colorPalette = [
    "#e46e6e", "#ffd635", "#7eed56", "#00ccc0",
    "#51e9f4", "#94b3ff", "#e4abff", "#ff99aa",
    "#ffb470", "#ffffff", "#be0039", "#ff9600",
    "#00cc78", "#009eaa", "#3690ea", "#6a5cff",
    "#b44ac0", "#ff3881", "#9c6926", "#898d90",
    "#6d001a", "#bf4300", "#00a368", "#00756f", 
    "#2450a4", "#493ac1", "#811e9f", "#a00357", 
    "#6d482f", "#000000"
];

// Создание палитры цветов
function createColorPalette() {
    colorPalette.forEach(color => {
        const colorBox = document.createElement('div');
        colorBox.classList.add('color-box');
        colorBox.style.backgroundColor = color;

        // Обработчик выбора цвета
        colorBox.addEventListener('click', () => {
            document.getElementById('colorPicker').value = color; // Установка выбранного цвета в input
        });

        colorPaletteContainer.appendChild(colorBox);
    });
}

// Создание сетки пикселей
function createGrid() {
    const gridWidth = parseInt(document.getElementById('gridWidth').value, 10) || 16;
    const gridHeight = parseInt(document.getElementById('gridHeight').value, 10) || 16;

    // Сбрасываем размеры загруженного изображения, чтобы можно было создать новую сетку
    uploadedImageDimensions = { width: 0, height: 0 };

    grid.style.gridTemplateColumns = `repeat(${gridWidth}, 20px)`;
    grid.style.gridTemplateRows = `repeat(${gridHeight}, 20px)`;

    grid.innerHTML = '';

    for (let y = 0; y < gridHeight; y++) {
        for (let x = 0; x < gridWidth; x++) {
            const pixel = document.createElement('div');
            pixel.classList.add('pixel');

            pixel.addEventListener('click', () => {
                pixel.style.backgroundColor = document.getElementById('colorPicker').value;
            });

            pixel.addEventListener('mouseenter', () => {
                const startX = parseInt(startXInput.value, 10) || 1;
                const startY = parseInt(startYInput.value, 10) || 1;
                coordinatesDisplay.textContent = `(${startX + x}, ${startY + y})`;
            });

            grid.appendChild(pixel);
        }
    }
}

// Создание сетки пикселей из изображения
function createPixelGridFromImage(imageData, startX, startY, width, height) {
    grid.innerHTML = ''; // Очистим старую сетку

    // Устанавливаем сетку в соответствии с размером изображения
    grid.style.gridTemplateColumns = `repeat(${width}, 20px)`;
    grid.style.gridTemplateRows = `repeat(${height}, 20px)`;

    // Проходим по каждому пикселю изображения
    for (let row = 0; row < height; row++) {
        for (let col = 0; col < width; col++) {
            const pixel = document.createElement('div');
            pixel.classList.add('pixel');

            // Получаем индекс в массиве данных пикселей (каждый пиксель занимает 4 позиции: R, G, B, A)
            const index = (row * width + col) * 4;
            const r = imageData.data[index];
            const g = imageData.data[index + 1];
            const b = imageData.data[index + 2];

            // Устанавливаем цвет пикселя
            pixel.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;

            // Координаты пикселя с учётом заданных начальных координат
            const pixelX = startX + col;
            const pixelY = startY + row;

            // Добавляем обработчик наведения
            pixel.addEventListener('mouseenter', () => {
                coordinatesDisplay.textContent = `X: ${pixelX}, Y: ${pixelY}`;
            });

            // Обработчик клика для рисования
            pixel.addEventListener('click', () => {
                pixel.style.backgroundColor = document.getElementById('colorPicker').value;
            });

            grid.appendChild(pixel);
        }
    }
}

// Функция для загрузки изображения и получения его пиксельных данных
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const canvas = document.getElementById('imageCanvas');
    const ctx = canvas.getContext('2d');

    const img = new Image();
    img.onload = function() {
        const width = img.width;
        const height = img.height;

        // Сохраняем размеры изображения
        uploadedImageDimensions.width = width;
        uploadedImageDimensions.height = height;

        // Устанавливаем размеры canvas
        canvas.width = width;
        canvas.height = height;

        // Рисуем изображение на canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Получаем данные пикселей
        const imageData = ctx.getImageData(0, 0, width, height);

        // Обновляем сетку пикселей на основе изображения
        const startX = parseInt(startXInput.value, 10) || 1;
        const startY = parseInt(startYInput.value, 10) || 1;
        createPixelGridFromImage(imageData, startX, startY, width, height);
    };

    // Загружаем изображение из файла
    img.src = URL.createObjectURL(file);
}

// Обработчики событий
createButton.addEventListener('click', createGrid);
clearButton.addEventListener('click', () => {
    const pixels = document.querySelectorAll('.pixel');
    pixels.forEach(pixel => pixel.style.backgroundColor = '#ffffff');
});

saveButton.addEventListener('click', () => {
    const pixels = document.querySelectorAll('.pixel');
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    // Используем размеры загруженного изображения
    const width = uploadedImageDimensions.width || (parseInt(document.getElementById('gridWidth').value, 10) || 16);
    const height = uploadedImageDimensions.height || (parseInt(document.getElementById('gridHeight').value, 10) || 16);

    // Устанавливаем размеры холста
    canvas.width = width; 
    canvas.height = height; 

    // Рисуем каждый "пиксель" на холсте
    pixels.forEach((pixel, index) => {
        const x = index % width;
        const y = Math.floor(index / width);
        ctx.fillStyle = pixel.style.backgroundColor || '#ffffff';
        ctx.fillRect(x, y, 1, 1); // Рисуем с размером 1x1 пиксель
    });

    // Создание ссылки для скачивания изображения
    const link = document.createElement('a');
    link.download = 'pixel-art.png';
    link.href = canvas.toDataURL('image/png');
    document.body.appendChild(link); // Добавляем ссылку в DOM
    link.click(); // Кликаем по ссылке
    document.body.removeChild(link); // Удаляем ссылку
});

// Создание палитры и сетки при загрузке страницы
createColorPalette();
createGrid();
uploadImageInput.addEventListener('change', handleImageUpload);
