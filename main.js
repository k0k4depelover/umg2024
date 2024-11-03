// Variables globales
const canvasHeight = 800;
const canvasWidth = 1000;
const earthColor = "#4A90E2";
const sunColor = "#FFD700";
const moonColor = "#B0C4DE";
const earthRadius = 20;
const moonRadius = 9;
const sunRadius = 40;
const earthOrbitRadius = 200;
const moonOrbitRadius = 50;
const orbitSpeedEarth = 0.0062832;
const orbitSpeedMoonEarth = 0.08168141;
let i = 1;
let showVectors = false;
let earthAngleT;
let moonAngleT;
let posSunX = canvasWidth / 2;
let posSunY = canvasHeight / 2;
let posEarthX = posSunX + earthOrbitRadius;
let posEarthY = posSunY;
let posMoonX = posEarthX + moonOrbitRadius;
let posMoonY = posEarthY;
let isAnimating = false;
let earthAngle = 0; // Ángulo inicial de la Tierra
let moonAngle = 0; // Ángulo inicial de la Luna

const canvas = document.getElementById("simulator");
const dim = canvas.getContext("2d");
canvas.width = canvasWidth;
canvas.height = canvasHeight;
let currentSpeed = 1;
let isPaused = false;
let earthTrail = [];
let moonTrail = [];
let radiusOrbitFixed;
let massPlanetFixed;
const fadeDuration = 50; // Duración máxima de la vida de un punto
let G= 6.674e-11;

let periodOrbit;
// Funciones para dibujar el Sol, la Tierra y la Luna
function drawSun() {
    dim.beginPath();
    dim.arc(posSunX, posSunY, sunRadius, 0, Math.PI * 2);
    dim.fillStyle = sunColor;
    dim.fill();
}

function drawEarth() {
    dim.beginPath();
    dim.arc(posEarthX, posEarthY, earthRadius, 0, Math.PI * 2);
    dim.fillStyle = earthColor;
    dim.fill();
}

function drawMoon() {
    dim.beginPath();
    dim.arc(posMoonX, posMoonY, moonRadius, 0, Math.PI * 2);
    dim.fillStyle = moonColor;
    dim.fill();
}

// Inicializa posiciones de la Tierra y la Luna
function initializePositions() {
    posEarthX = posSunX + earthOrbitRadius * Math.cos(earthAngle);
    posEarthY = posSunY + earthOrbitRadius * Math.sin(earthAngle);
    
    posMoonX = posEarthX + moonOrbitRadius * Math.cos(moonAngle);
    posMoonY = posEarthY + moonOrbitRadius * Math.sin(moonAngle);
}

// Función para actualizar las posiciones
function updatePosition() {
    earthAngle += orbitSpeedEarth * currentSpeed;
    moonAngle += orbitSpeedMoonEarth * currentSpeed;
    
    posEarthX = posSunX + earthOrbitRadius * Math.cos(earthAngle);
    posEarthY = posSunY + earthOrbitRadius * Math.sin(earthAngle);
    
    posMoonX = posEarthX + moonOrbitRadius * Math.cos(moonAngle);
    posMoonY = posEarthY + moonOrbitRadius * Math.sin(moonAngle);

    // Agregar puntos a las estelas
    addPointTrialMoon(posMoonX, posMoonY);
    addPointTrialEarth(posEarthX, posEarthY);
}

function drawVector() {
    // Normaliza el ángulo para que esté en el rango [0, 2π]
    earthAngleT = normalizeAngle(earthAngle);
    moonAngleT = normalizeAngle(moonAngle);

    dim.beginPath();
    dim.moveTo(posSunX, posSunY);
    dim.lineTo(posEarthX, posEarthY);
    dim.strokeStyle = "red";
    dim.stroke();

    const midEarthX = (posSunX + posEarthX) / 2;
    const midEarthY = (posSunY + posEarthY) / 2;
    dim.fillStyle = "red";
    dim.font = "12px Arial";
    dim.fillText(`${(earthAngleT * (180 / Math.PI)).toFixed(2)}°`, midEarthX, midEarthY);

    dim.beginPath();
    dim.moveTo(posEarthX, posEarthY);
    dim.lineTo(posMoonX, posMoonY);
    dim.strokeStyle = "red";
    dim.stroke();

    const midMoonX = (posMoonX + posEarthX) / 2;
    const midMoonY = (posMoonY + posEarthY) / 2;
    dim.fillStyle = "red";
    dim.font = "12px Arial";
    dim.fillText(`${(moonAngleT * (180 / Math.PI)).toFixed(2)}°`, midMoonX, midMoonY);
}

// Función para normalizar el ángulo
function normalizeAngle(angle) {
    angle = angle % (2 * Math.PI);
    return angle >= 0 ? angle : angle + (2 * Math.PI);
}

// Función para agregar un punto a la estela
function addPointTrialMoon(x, y) {
    moonTrail.push({ x: x, y: y, life: 0 });
}

function addPointTrialEarth(x, y) {
    earthTrail.push({ x: x, y: y, life: 0 });
}

// Función para actualizar la longevidad de los puntos de la estela
function updateTrials() {
    // Filtrar puntos que han alcanzado su fadeDuration
    earthTrail = earthTrail.filter(function(point) {
        return point.life < fadeDuration;
    });

    moonTrail = moonTrail.filter(function(point) {
        return point.life < fadeDuration; // Solo mantener puntos con vida menor a fadeDuration
    });

    // Incrementar la vida de cada punto
    for (let point of earthTrail) {
        point.life++;
    }

    for (let point of moonTrail) {
        point.life++;
    }
}

// Función para dibujar la estela
function drawTrail() {
    for (let point of moonTrail) {
        const alpha = 1 - (point.life / fadeDuration); // Calcular opacidad
        dim.beginPath();
        dim.arc(point.x, point.y, moonRadius * 0.1, 0, Math.PI * 2);
        dim.fillStyle = `rgba(176, 196, 222, ${alpha})`; // Aplicar opacidad
        dim.fill();
    }
    for (let point of earthTrail) {
        const alpha = 1 - (point.life / fadeDuration); // Calcular opacidad
        dim.beginPath();
        dim.arc(point.x, point.y, earthRadius * 0.05, 0, Math.PI * 2);
        dim.fillStyle = `rgba(176, 196, 222, ${alpha})`; // Aplicar opacidad
        dim.fill();
    }
}

// Función de animación
function animate() {
    cleanCanvas();
    updatePosition();
    
    drawSun();
    drawEarth();
    drawMoon();
    
    updateTrials(); // Actualiza la longevidad de los puntos
    drawTrail();    // Dibuja la estela

    if (currentSpeed === 0 && showVectors) {
        drawVector();
    }

    if (isAnimating) { 
        requestAnimationFrame(animate); // Continuar animando
    }
}

// Limpia el canvas
function cleanCanvas() {
    dim.clearRect(0, 0, canvasWidth, canvasHeight);
}

// Evento para iniciar la simulación
document.getElementById("startSimulation").addEventListener("click", function() {
    if (!isAnimating) { 
        initializePositions();
        isAnimating = true;
        animate(); // Iniciar la animación
    }
});

// Evento para aplicar controles
document.getElementById("ApplyControls").addEventListener("click", function() {
    const selectedOption = document.getElementById("controls").value;
    switch (selectedOption) {
        case "pause":
            showVectors = true; // Mostrar vectores en pausa
            currentSpeed = 0;
            break;
        case "increaseSpeed":
            showVectors = false; // Ocultar vectores cuando se cambia la velocidad
            if (currentSpeed === 0) {
                currentSpeed = 1;
            } else {
                currentSpeed *= 1.5; // Aumentar velocidad
            }
            break;
        case "decreaseSpeed":
            showVectors = false;
            if (currentSpeed === 0) {
                currentSpeed = 1;
            } else {
                currentSpeed *= 0.666667;
            }
            break;
        case "normalSpeed":
            showVectors = false;
            currentSpeed = 1; // Restablecer a velocidad normal
            break;
    }
});


document.getElementById("calculateResult").addEventListener("click", function calculate() {
    // Obtener los valores de los inputs y convertirlos a número
    const radiusOrbit = parseFloat(document.getElementById("inputRadio").value); // radio en metros
    const massPlanet = parseFloat(document.getElementById("inputEarth").value); // masa en kg

    radiusOrbitFixed=radiusOrbit*10e11;
    massPlanetFixed=massPlanet*10e24;
    // Calcular el período de órbita
    const periodOrbit = 2*Math.PI*radiusOrbitFixed * Math.sqrt(radiusOrbitFixed / (massPlanetFixed * G));

    // Mostrar el resultado en el campo de texto
    document.getElementById("result").value = periodOrbit.toFixed(20); // Formato a dos decimales
    alert("El periodo ha sido calculado");
});


