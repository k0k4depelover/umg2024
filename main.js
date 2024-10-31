// Variables globales
let posSunX = canvasWidth / 2;
let posSunY = canvasHeight / 2;
let posEarthX = posSunX + earthOrbitRadius;
let posEarthY = posSunY;
let posMoonX = posEarthX + moonOrbitRadius;
let posMoonY = posEarthY;
let isAnimating = false; 
let earthAngle = 0;
let moonAngle = 0;

const canvas = document.getElementById("simulator");
const dim = canvas.getContext("2d");
canvas.width = canvasWidth;
canvas.height = canvasHeight;
let currentSpeed = 1;
let isPaused = false; 
let earthTrail = [];
let moonTrail = [];
const fadeDuration = 50; // Duración máxima de la vida de un punto

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

// Función para agregar un punto a la estela
function addPointTrialMoon(x, y) {
    moonTrail.push({ x: x, y: y, life: 0 });

}

function addPointTrialEarth(x, y){
    earthTrail.push({ x: x, y: y, life: 0 })
}

// Función para actualizar la longevidad de los puntos de la estela
function updateTrials() {
    // Filtrar puntos que han alcanzado su fadeDuration

    earthTrail= earthTrail.filter(function(point){
        return point.life< fadeDuration;
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
    for(let point of earthTrail){
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
        const earthAngleInput = document.getElementById("earthAngle").value;
        const moonAngleInput = document.getElementById("moonAngle").value;

        earthAngle = (earthAngleInput * Math.PI) / 180;
        moonAngle = (moonAngleInput * Math.PI) / 180;

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

            currentSpeed = 0;

            
            break;
        case "increaseSpeed":
                if(currentSpeed == 0){
                    currentSpeed = 1
                }
                else{
                    currentSpeed *= 1.5; // Aumentar velocidad
                }

            break;
        case "decreaseSpeed":
            if(currentSpeed == 0){
                currentSpeed = 1
            }
            else{
                currentSpeed *= 0.666667; 
            }
            break;
        case "normalSpeed":
            currentSpeed = 1; // Restablecer a velocidad normal
            break;
    }
});
