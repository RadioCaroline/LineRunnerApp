"use strict";

//////////////////////////////////////
// Данные авторизации пользователя
let login = '';
let token = '';
// Координаты меток, полученные по нажатию кнопки мыши
let markers = new Array();
let events = new Array();
// Текущие координаты
let x = 0, y = 0;
// Начальные координаты маршрута точки на заданному отрезке
let pointX = -7, pointY = -7;
// Индекс маркера из коллекции 
let nextMarkerIndex = 0;
// Скорость передвижения точки между маркерами
let speed = 3;
// Индекс маркера на удаление
let selectedRemoveValue = 0;
//////////////////////////////////////

const connection = new signalR.HubConnectionBuilder()
    .withUrl("/hubs", { accessTokenFactory: () => token })
    .build();

// Область изображения и контекст
var canvas = document.getElementById('PaintPad');
var context = canvas.getContext('2d');

connection.on("updateTableEvents", function (tableEvents) {
    updateTableEvents(tableEvents);
});

function updateTableEvents(tableEvents) {
    if (tableEvents.length > 0) {
        events = tableEvents;
    }
}

connection.on("addMarker", function (x, y) {
    addMarker(x, y, true);
});

// По нажатию кнопки на область прорисовки,
// полученные координаты вписываем в коллекцию координат меток
function addMarker(x, y, fill = false) {
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

    fillMarkerSelection();

    if (fill == true) {
        let eventMessage = 'Пользователь ' + login + ' добавил новый маркер с координатами {' + x + '; ' + y + '}';
        connection.invoke("RecordEvent", eventMessage);
    }
    connection.send("UpdateEvents");
}

// Заполнение коллекции маркеров при загрузке страницы
function fillMarkers(savedMarkers) {
    // Если есть маркеры, грузим в markers
    if (savedMarkers.length > 0) {
        markers = savedMarkers;
    }
    else {
        markers = new Array();
    }
}

// События на нажатие кнопки мыши 
function mouseDownEvent(e) {
    switch (e.which) {
        // События будут отслеживаться только по нажатию левой кнопки
        case 1:
            // Получяем координаты мыши и отправляем в коллекцию координат меток
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

// Перерисовка изображения
function refreshPoint() {
    if (markers.length >= 2) {
        // Получаем необходимые изменения для передвижения точки
        let nextPointX = markers[nextMarkerIndex][0];
        let nextPointY = markers[nextMarkerIndex][1];
        let point = getPointPosition(pointX, pointY, nextPointX, nextPointY);
        // Применяем изменения координат
        pointX += point.dx;
        pointY += point.dy;

        // Рисуем точку
        drawPoint(pointX, pointY);

        // Пока не очень понимаю, что принять признаком достижения маршрута
        /* Пока что если текущая Х или У точки достигают Х или У координаты конца текущего отрезка, 
         * то в зависимости от того, есть ли в коллекции маркеров еще маркер или это был последний, 
         * назначаем значению nextMarkerIndex индекс следующего маркера. Нужно учитывать, что 
         * координаты являются вещественными числами, поэтому сложно принять в сравнение какое-то точное число,
         * так что отсекаем дробную часть от координат точки.*/
        if ((Math.trunc(pointX) == markers[nextMarkerIndex][0] ||
             Math.trunc(pointX) + 1 == markers[nextMarkerIndex][0] ||
             Math.trunc(pointX) - 1 == markers[nextMarkerIndex][0]) &&
            (Math.trunc(pointY) == markers[nextMarkerIndex][1] ||
             Math.trunc(pointY) + 1 == markers[nextMarkerIndex][1] ||
             Math.trunc(pointY) - 1 == markers[nextMarkerIndex][1])) {

            // Началом нового отрезка будут координаты конца предыдущего
            pointX = markers[nextMarkerIndex][0];
            pointY = markers[nextMarkerIndex][1];

            // В зависимости от того, будут ли еще маркеры и это был последний,
            // назначаем индекс следующего маркера
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
    selectedRemoveValue = parseInt(document.getElementById('markerSelect').value);
    context.beginPath();
    // Если выбран какой-то маркер на удаление, 
    // он выделяется красным цветом и бОльшим размером
    if (selectedRemoveValue > 0 &&
        markers[selectedRemoveValue - 1][0] == mx &&
        markers[selectedRemoveValue - 1][1] == my) {
        // Параметры удаляемого маркера
        context.arc(mx, my, 15, 0, Math.PI * 2);
        // Цвет удаляемого маркера
        context.fillStyle = "red";
    }
    else {
        // Параметры маркера
        context.arc(mx, my, 10, 0, Math.PI * 2);
        // Цвет маркера
        context.fillStyle = "green";
    }
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

        // После линий рисуем уже сами маркеры   
        drawMarker(startX, startY);
        drawMarker(finishX, finishY);
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
setInterval(draw, 10);

connection.on("removeMarkerFromCanvas", function (markerIndex) {
    removeMarkerFromCanvas(markerIndex);
});

/**************************** Удаление маркеров ****************************/
// Функция заполнения комбобокса с координатами маркеров для удаления
function fillMarkerSelection(flush = false) {
    // Получаем нужный селектор
    var selectMarker = document.getElementById('markerSelect');

    // Полностью его очищаем
    while (selectMarker.childNodes.length > 0) {
        selectMarker.removeChild(selectMarker.lastChild);
    }

    // Поумолчанию первым должен быть выбор все объектов
    var option = document.createElement('option');
    option.setAttribute("Value", 0);
    let optionId = 'sdMarker' + 0;
    option.setAttribute("id", optionId);
    option.text = 'Выбрать все';
    selectMarker.appendChild(option);

    // Далее идем по коллекции маркеров и добавляем существущие маркеры 
    if (markers.length != 0) {
        for (let i = 0; i < markers.length; i++) {
            let mlen = i + 1;

            var option = document.createElement('option');
            option.setAttribute("Value", mlen);
            let optionId = 'sdMarker' + mlen;
            option.setAttribute("id", optionId);
            option.text = '{' + markers[i][0] + ';' + markers[i][1] + '}';
            selectMarker.appendChild(option);
        }
    }
}

function removeMarkerFromCanvas(markerIndex) {
    let eventMessage = '';
    // Действия на тот случай, если следующим маркером, к которому движется точка, удаляется.
    if (markerIndex == 0) {
        eventMessage = 'Пользователь ' + login + ' удалил все маркеры';
        for (let index = markers.length; index > 0; index--) {
            markers.pop();
        }
        pointX = -7;
        pointY = -7;

        nextMarkerIndex = 0;
    }
    else {
        if (nextMarkerIndex == markerIndex - 1) {
            if (nextMarkerIndex != markers.length) {
                nextMarkerIndex += 1;
            }
            else {
                nextMarkerIndex = 0;
            }
        }

        markers.splice(markerIndex - 1, 1);
        eventMessage = 'Пользователь ' + login
            + ' удалил маркер с координатами {' + markers[selectedRemoveValue - 1][0]
            + '; ' + markers[selectedRemoveValue - 1][1] + '}';
    }
    fillMarkerSelection(true);
    connection.send("RecordEvent", eventMessage);
    connection.send("UpdateEvents");
}

connection.on("updateEvents", function (tableEvents) {
    updateEvents(tableEvents);
});

function updateEvents(tableEvents) {
    if (tableEvents.length > 0) {
        events = tableEvents;
    }
    updateEventTable();
}

function updateEventTable() {
    var eventRows = document.getElementById('tableEventRows');

    // Полностью очищаем таблицу
    while (eventRows.childNodes.length > 0) {
        eventRows.removeChild(eventRows.lastChild);
    }

    for (let i = 0; i < events.length; i++) {
        var tr = document.createElement('tr');

        var tdNameCell = document.createElement('td');
        var tdNameText = document.createTextNode(events[0].userName);
        tdNameCell.appendChild(tdNameText);

        var tdDescCell = document.createElement('td');
        var tdDescText = document.createTextNode(events[0].description);
        tdDescCell.appendChild(tdDescText);

        var tdTimeCell = document.createElement('td');
        var tdTimeText = document.createTextNode(events[0].eventTime);
        tdTimeCell.appendChild(tdTimeText);

        tr.appendChild(tdNameCell);
        tr.appendChild(tdDescCell);
        tr.appendChild(tdTimeCell);

        eventRows.appendChild(tr);
    }
}

/**************************** Удаление маркеров ****************************/
// Нажатие кнопки Удалить маркер
document.getElementById('removeMarker').addEventListener('click', function (e) {
    if (selectedRemoveValue == 0) {
        connection.invoke("RemoveMarker", selectedRemoveValue, 0.0, 0.0);
    }
    else {
        connection.invoke("RemoveMarker",
            selectedRemoveValue,
            markers[selectedRemoveValue - 1][0],
            markers[selectedRemoveValue - 1][1]);
    }
});

// Нажатие кнопки Войти запускает механизм авторизации
document.getElementById('sendLogin').addEventListener('click', function (e) {
    login = document.getElementById('login').value;
    // Запрос на форму авторизации 
    var request = new XMLHttpRequest();
    // Запрос идет на /token
    request.open("POST", "/token", true);
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    request.addEventListener("load", function () {
        // Смотрим нет ли ошибок
        if (request.status < 400) {
            // Парсим ответ
            let data = JSON.parse(request.response);
            // При авторизации нам возвращаются логин, токен и коллекция маркеров
            token = data.access_token;
            login = data.username;

            // Включаем скрытые элементы на форме
            // Выключаем форму для авторизации
            document.getElementById('login').disabled = true;                           
            document.getElementById('sendLogin').disabled = true;
            // Включаем форму с выбором координат маркеров на удаление
            document.getElementById('selectionMarker').style.visibility = "visible";
            // Включаем форму с таблицей событий
            document.getElementById('eventTableDiv').style.visibility = "visible";

            // Если есть существующие координаты, то тащим их коллекцию markers.
            if (data.axes.length > 0) {
                for (let i = 0; i < data.axes.length; i++) {
                    let currentX = data.axes[i].item1;
                    let currentY = data.axes[i].item2;
                    // Используем функцию addMarker 
                    // (флаг true нужен для того, чтобы отключить события занесения координат маркеров в базу данных)
                    addMarker(currentX, currentY, true);
                    // markers.push([currentX, currentY]);
                }
            }

            connection.start().then(function () {
                // Фиксируем события нажатия кнопки мыши
                canvas.addEventListener('mousedown', mouseDownEvent);
                connection.send("UpdateEvents");
            });
        }
    });
    // Отправляем запрос
    request.send("username=" + login);
});