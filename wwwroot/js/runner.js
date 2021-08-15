const connection = new signalR.HubConnectionBuilder()
    .withUrl("/hubs")
    .build();

// Координаты меток, полученные по нажатию кнопки мыши
let markers = new Array();
// Текущие координаты
let x = 0, y = 0;
// Начальные координаты маршрута точки на заданному отрезке
let pointX = -7, pointY = -7;
// Индекс маркера из коллекции 
let nextMarkerIndex = 0;
// Скорость передвижения точки между маркерами
let speed = 5;

// Область изображения и контекст
var canvas = document.getElementById('PaintPad');
var context = canvas.getContext('2d');

connection.on("addMarker", function (x, y) {
    addMarker(x, y);
});

// По нажатию кнопки на область прорисовки,
// полученные координаты вписываем в коллекцию координат меток
function addMarker(x, y) {
    markers.push([x, y]);

    // Если в коллекции еще не было координат, 
    // то ставим начальные координаты точки координаты первого маркера
    if (markers.length == 1) {
        pointX = x;
        pointY = y;
    }
    // Если в коллекции есть одна координата, 
    // то ставим следующую координату точки координаты второго маркера
    if (markers.length == 2) {
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
            // addMarker(x, y);
            connection.invoke("AddMarker", x, y);
            break;
    }
}

// Функция для изменения координат передвигающейся точки
function getPointPosition(x1, y1, x2, y2) {
    // Мои наилучшие пожелания Пифагору с его равными штанами
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
    if (markers.length >= 2) {
        // Получаем необходимые изменения для передвижения точки
        let nextPointX = markers[nextMarkerIndex][0];
        let nextPointY = markers[nextMarkerIndex][1];

        connection.invoke("GetPointPosition", pointX, pointY, nextPointX, nextPointY);
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
        if (Math.trunc(pointX) == markers[nextMarkerIndex][0] ||
            Math.trunc(pointX) + 1 == markers[nextMarkerIndex][0] ||
            Math.trunc(pointX) - 1 == markers[nextMarkerIndex][0] ||
            Math.trunc(pointY) == markers[nextMarkerIndex][1] ||
            Math.trunc(pointY) + 1 == markers[nextMarkerIndex][1] ||
            Math.trunc(pointY) - 1 == markers[nextMarkerIndex][1]) {

            pointX = markers[nextMarkerIndex][0];
            pointY = markers[nextMarkerIndex][1];

            if (nextMarkerIndex + 1 >= markers.length) {
                nextMarkerIndex = 0;
            }
            else {
                nextMarkerIndex += 1;
            }
        }
    } 
}

// Рисуем маркер в области нажатия левой кнопки мыши
function drawMarker(mx, my) {
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
    drawMarker(x1, y1);
    drawMarker(x2, y2);
}

// Функция прорисовки маркеров на области изображения
function drawMarkersRoute() {
    // Проходим по всем координатам и рисуем маркеры
    for (let i = 0; i < markers.length; i++) {
        let next = i + 1;
        // Если текущий маркер не последний, то рисуем маршрут от нее до следующего маркера,
        // если последний, что рисуем маршрут от него до начального маркера
        let startX = markers[i][0], startY = markers[i][1];
        let finishX = 0, finishY = 0;
        if (next != markers.length) {
            finishX = markers[next][0];
            finishY = markers[next][1];
        }
        else {
            finishX = markers[0][0];
            finishY = markers[0][1];
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
    drawMarkersRoute();

    // connection.invoke("draw");
}
// Интервал обновления изображения
setInterval(draw, 100);

connection.start().then(function () {
    // Фиксируем события нажатия кнопки мыши
    canvas.addEventListener('mousedown', mouseDownEvent);
});