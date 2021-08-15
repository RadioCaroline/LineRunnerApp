// Координаты меток, полученные по нажатию кнопки мыши
let points = new Array();
// Текущие координаты
let x = 0, y = 0;
// Начальные координаты маршрута точки на заданному отрезке
let pointX = -7, pointY = -7;
// Координаты окончания маршрута точки по заданному отрезку
let nextMarkerIndex = 0;
let speed = 5;

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
        nextMarkerIndex = 1;
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
    let dx = x2 - x1;
    let dy = y2 - y1;

    let d = Math.sqrt(dx * dx + dy * dy);

    return {
        dx: dx / d * speed,
        dy: dy / d * speed
    };
}

// Рисуем точку, которая будет двигаться от одного маркера к другому
function drawPoint(x, y) {
    context.beginPath();
    // Параметры точки
    context.arc(x, y, 7, 0, Math.PI * 2);
    // Цвет точки
    context.fillStyle = "gray";
    context.fill();
    context.closePath();
}

function refreshPoint() {
    if (points.length >= 2) {
        // Получаем необходимые изменения для передвижения точки
        let nextPointX = points[nextMarkerIndex][0];
        let nextPointY = points[nextMarkerIndex][1];
        let point = getPointPosition(pointX, pointY, nextPointX, nextPointY);
        // Применяем изменения координат
        pointX += point.dx;
        pointY += point.dy;
        // Рисуем точку
        drawPoint(pointX, pointY);

        // Пока не очень понимаю, что принять признаком достижения маршрута
        /* Пока что если текущая Х или У точки достигают Х или У координаты конца текущего маршрута, 
         * то в зависимости от того, есть ли в коллекции маркеров еще маркер или это был последний, 
         * назначаем значению nextMarkerIndex индекс следующего маркера.*/
        if (Math.trunc(pointX) == points[nextMarkerIndex][0] ||
            Math.trunc(pointX) + 1 == points[nextMarkerIndex][0] ||
            Math.trunc(pointX) - 1 == points[nextMarkerIndex][0] ||
            Math.trunc(pointY) == points[nextMarkerIndex][1] ||
            Math.trunc(pointY) + 1 == points[nextMarkerIndex][1] ||
            Math.trunc(pointY) - 1 == points[nextMarkerIndex][1]) {

            pointX = points[nextMarkerIndex][0];
            pointY = points[nextMarkerIndex][1];

            if (nextMarkerIndex + 1 >= points.length) {
                nextMarkerIndex = 0;
            }
            else {
                nextMarkerIndex += 1;
            }
        }
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
    }
}

// Функция прорисовки элементов
function draw() {
    // Очистка изображения
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Обновление движущейся точки
    refreshPoint();

    // Прорисовка маркеров для перемещения точек
    drawMarkersPath();
}
// Интервал обновления изображения
setInterval(draw, 100);