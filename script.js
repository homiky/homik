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
const saveAsMapButton = document.getElementById('saveAsMap')

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

saveAsMapButton.addEventListener('click', () => {
    const pixels = document.querySelectorAll('.pixel');
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    const width = uploadedImageDimensions.width || (parseInt(document.getElementById('gridWidth').value, 10) || 16);
    const height = uploadedImageDimensions.height || (parseInt(document.getElementById('gridHeight').value, 10) || 16);
    
    const pixelSize = 20; // Размер пикселя
    canvas.width = width * pixelSize + 20; // Увеличиваем ширину для координат
    canvas.height = height * pixelSize + 20; // Увеличиваем высоту для координат

    // Рисуем пиксели
    pixels.forEach((pixel, index) => {
        const x = (index % width) * pixelSize + 20; // Сдвигаем для координат
        const y = Math.floor(index / width) * pixelSize + 20; // Сдвигаем для координат
        ctx.fillStyle = pixel.style.backgroundColor || '#ffffff';
        ctx.fillRect(x, y, pixelSize, pixelSize);
    });
    
    // Рисуем сетку
    ctx.strokeStyle = '#aaaaaa';
    ctx.lineWidth = 1; 
    for (let x = 0; x <= width; x++) {
        ctx.moveTo(x * pixelSize + 20, 20);
        ctx.lineTo(x * pixelSize + 20, height * pixelSize + 20);
    }
    for (let y = 0; y <= height; y++) {
        ctx.moveTo(20, y * pixelSize + 20);
        ctx.lineTo(width * pixelSize + 20, y * pixelSize + 20);
    }
    ctx.stroke();

    // Добавляем белые пиксели под координатами по оси X
    for (let x = -1; x < width; x++) {
        ctx.fillStyle = '#2a2a2a'; // Белый цвет
        ctx.fillRect(x * pixelSize + 20, 20 - pixelSize, pixelSize, pixelSize); // Позиция под текстом
    }

    // Рисуем сетку на белых пикселях по оси X
    ctx.strokeStyle = '#aaaaaa';
    for (let x = 0; x < width; x++) {
        ctx.moveTo(x * pixelSize + 20, 20 - pixelSize);
        ctx.lineTo(x * pixelSize + 20, 20);
    }
    ctx.stroke();

    // Добавляем белые пиксели под координатами по оси Y
    for (let y = 0; y < height; y++) {
        ctx.fillStyle = '#2a2a2a'; // Белый цвет
        ctx.fillRect(0, y * pixelSize + 20, pixelSize, pixelSize); // Позиция под текстом
    }

    // Рисуем сетку на белых пикселях по оси Y
    for (let y = 0; y < height; y++) {
        ctx.moveTo(0, y * pixelSize + 20);
        ctx.lineTo(pixelSize, y * pixelSize + 20);
    }
    ctx.stroke();

    // Добавляем текстовые координаты на изображение
    ctx.fillStyle = '#ffffff'; // Светлый цвет текста
    ctx.font = '12px Bahnschrift'; // Шрифт текста
    ctx.textAlign = 'center'; // Центрируем текст по X
    ctx.textBaseline = 'middle'; // Центрируем текст по Y

    // Координаты по оси X
    for (let x = 0; x < width; x++) {
        const coordX = startXInput.value ? parseInt(startXInput.value) + x : x + 1; // Устанавливаем значение
        ctx.fillText(coordX, x * pixelSize + 20 + pixelSize / 2, 20 - 12); // Позиция текста приподнята
    }

    // Координаты по оси Y
    for (let y = 0; y < height; y++) {
        const coordY = startYInput.value ? parseInt(startYInput.value) + y : y + 1; // Устанавливаем значение
        ctx.fillText(coordY, 10, y * pixelSize + 20 + pixelSize / 2); // Центрируем текст по Y
    }

    // Ссылка для скачивания
    const link = document.createElement('a');
    link.download = 'pixel-map.png';
    link.href = canvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});


// Создание палитры и сетки при загрузке страницы
createColorPalette();
createGrid();
uploadImageInput.addEventListener('change', handleImageUpload);