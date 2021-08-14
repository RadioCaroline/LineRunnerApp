// Координаты меток, полученные по нажатию кнопки мыши
let points = new Array();
// Текущие координаты
let x = 0, y = 0;
let pointX = -7, pointY = -7;
let nextPointX = -7, nextPointY = -7;

// Область изображения и контекст
var canvas = document.getElementById('PaintPad');
var context = canvas.getContext('2d');

// По нажатию кнопки на область прорисовки,
// полученные координаты вписываем в коллекцию координат меток
function addPoint(x, y) {
    points.push([x, y]);

    // Если в коллекции еще не было координат, 
    // то ставим начальные координаты точки координаты первого маркера
    if (points.length == 1) {
        pointX = x;
        pointY = y;
    }
    // Если в коллекции есть одна координата, 
    // то ставим следующую координату точки координаты второго маркера
    if (points.length == 2) {
        nextPointX = x;
        nextPointY = y;
    }
}

// События на нажатие кнопки мыши 
function mouseDownEvent(e) {
    switch (e.which) {
        // События будут отслеживаться только по нажатию левой кнопки
        case 1:
            // Получяем координаты мыши и 
            // отправляем в коллекцию координат меток
            x = e.offsetX;
            y = e.offsetY;
            addPoint(x, y);
            break;
    }
}

// Фиксируем события нажатия кнопки мыши
canvas.addEventListener('mousedown', mouseDownEvent);

function getPointPosition(x1, y1, x2, y2) {
    let percentage = 0.1;
    return {
        dx: x1 * (1.0 - percentage) + x2 * percentage,
        dy: y1 * (1.0 - percentage) + y2 * percentage
    };
}

// Рисуем точку, которая будет двигаться от одного маркера к другому
function drawPoint() {
    context.beginPath();
    // Параметры точки
    context.arc(pointX, pointY, 7, 0, Math.PI * 2);
    // Цвет точки
    context.fillStyle = "gray";
    context.fill();
    context.closePath();
}

function refreshPoint() {
    if (points.length >= 2) {
        let point = getPointPosition(pointX, pointY, nextPointX, nextPointY);
        pointX = point.dx;
        pointY = point.dy;
        drawPoint();
    } 
}

// Рисуем маркер в области нажатия левой кнопки мыши
function drawMarkerPoint(mx, my) {
    context.beginPath();
    // Параметры маркера
    context.arc(mx, my, 10, 0, Math.PI * 2);
    // Цвет маркера
    context.fillStyle = "red";
    context.fill();
    context.closePath();
}

// Рисуем линию между маркерами
function drawMarkerLine(x1, y1, x2, y2) {
    // Параметры линий между маркерами
    context.lineWidth = 2;
    context.strokeStyle = 'yellow';
    context.beginPath();
    // Рисуем линию
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.stroke();

    // После линий рисуем уже сами маркеры
    drawMarkerPoint(x1, y1);
    drawMarkerPoint(x2, y2);
}

// Функция прорисовки маркеров на области изображения
function drawMarkersPath() {
    // Проходим по всем координатам и рисуем точки
    for (let i = 0; i < points.length; i++) {
        let next = i + 1;
        // Если текущая точка не последняя, то рисуем маршрут от нее до следующей точки,
        // если последняя, что рисуем маршрут от неё до начальной точки
        let startX = points[i][0], startY = points[i][1];
        let finishX = 0, finishY = 0;
        if (next != points.length) {
            finishX = points[next][0];
            finishY = points[next][1];
        }
        else {
            finishX = points[0][0];
            finishY = points[0][1];
        }
        drawMarkerLine(startX, startY, finishX, finishY);

        if (points.length >= 2) {
            if (Math.trunc(pointX) == finishX ||
                Math.trunc(pointX) + 1 == finishX ||
                Math.trunc(pointX) - 1 == finishX ||
                Math.trunc(pointY) == finishY ||
                Math.trunc(pointY) + 1== finishY ||
                Math.trunc(pointY) - 1 == finishY) {

                pointX = finishX;
                pointY = finishY;

                if (next + 1 != points.length) {
                    nextPointX = points[next + 1][0];
                    nextPointY = points[next + 1][1];
                }
                else {
                    nextPointX = points[0][0];
                    nextPointY = points[0][1];
                }
            }
        }
    }
}

// Функция прорисовки элементов
function draw() {
    // Очистка изображения
    context.clearRect(0, 0, canvas.width, canvas.height);

    refreshPoint();

    // Прорисовка маркеров для перемещения точек
    drawMarkersPath();

    
}
// Интервал обновления изображения
setInterval(draw, 100);