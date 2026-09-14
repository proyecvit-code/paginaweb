// ==========================================
// CONFIGURACIÓN DE DISCORD (LANYARD API)
// ==========================================
// Reemplaza esta ID con tu ID de usuario de Discord real
const DISCORD_ID = "1234356150862872676"; 

// ==========================================
// ELEMENTOS DEL DOM
// ==========================================
const video = document.getElementById("backgroundVideo");
const audio = document.getElementById("audioPlayer");
const playButton = document.getElementById("playButton");
const nextButton = document.getElementById("nextButton");
const previousButton = document.getElementById("previousButton");
const soundButton = document.getElementById("soundButton");
const progressBar = document.getElementById("progressBar");
const currentTime = document.getElementById("currentTime");
const duration = document.getElementById("duration");
const musicTitle = document.getElementById("musicTitle");
const musicArtist = document.getElementById("musicArtist");
const musicCover = document.getElementById("musicCover");
const volumeSlider = document.getElementById("volumeSlider");
const startScreen = document.getElementById("startScreen");
const enterButton = document.getElementById("enterButton");
const viewsSpan = document.getElementById("views");

// ==========================================
// CANCIONES + VIDEOS + PORTADAS
// ==========================================
const tracks = [
    {
        title: "Moonlight",
        artist: "XXXTentacion",
        audio: "assets/music/carro.mp3",
        video: "assets/videos/CARRO.mp4",
        cover: "assets/music/cover1.jpg"  // Portada canción 1
    },
    {
        title: "Mercury",
        artist: "GHOSTEMANE",
        audio: "assets/music/mercury.mp3",
        video: "assets/videos/MERCURY.mp4",
        cover: "assets/music/cover3.jpg"  // Portada canción 2
    },
    {
        title: "Goth",
        artist: "Sidewalks and Skeletons",
        audio: "assets/music/moto.mp3",
        video: "assets/videos/MOTO.mp4",
        cover: "assets/music/cover2.jpg"  // Portada canción 3
    }
];

// ==========================================
// CARGAR TRACK
// ==========================================
function loadTrack(index) {
    currentTrack = index;
    const track = tracks[currentTrack];

    // Cargar Audio
    audio.src = track.audio;
    audio.load();

    // Cargar Video
    video.src = track.video;
    video.loop = true;
    video.load();

    // Actualizar Texto
    musicTitle.textContent = track.title;
    musicArtist.textContent = track.artist;

    // Actualizar Imagen de la portada si existe
    if (track.cover) {
        musicCover.src = track.cover;
    }

    // Reset progreso
    progressBar.value = 0;
    currentTime.textContent = "0:00";
    duration.textContent = "0:00";
}

// ==========================================
// REPRODUCCIÓN Y CONTROLES
// ==========================================

async function playTrack() {
    try {
        await video.play();
        await audio.play();
        isPlaying = true;
        playButton.innerHTML = '<i class="fa-solid fa-pause"></i>';
    } catch (error) {
        console.log("Error al reproducir:", error);
    }
}

function pauseTrack() {
    audio.pause();
    video.pause();
    isPlaying = false;
    playButton.innerHTML = '<i class="fa-solid fa-play"></i>';
}

playButton.addEventListener("click", () => {
    if (isPlaying) pauseTrack();
    else playTrack();
});

function nextTrack() {
    currentTrack = (currentTrack + 1) % tracks.length;
    loadTrack(currentTrack);
    playTrack();
}

function previousTrack() {
    currentTrack = (currentTrack - 1 + tracks.length) % tracks.length;
    loadTrack(currentTrack);
    playTrack();
}

nextButton.addEventListener("click", nextTrack);
previousButton.addEventListener("click", previousTrack);

// Al terminar la canción, pasa automáticamente a la siguiente
audio.addEventListener("ended", () => {
    nextTrack();
});

// ==========================================
// SOLUCIÓN PARA SEGUNDO PLANO (PESTAÑA INACTIVA)
// ==========================================
// Cuando regresas a la pestaña, reanuda el audio si el navegador lo congeló en segundo plano
document.addEventListener("visibilitychange", () => {
    if (!document.hidden && isPlaying) {
        if (audio.paused) {
            audio.play().catch(e => console.log("Reanudando audio al enfocar ventana:", e));
        }
        if (video.paused) {
            video.play().catch(e => console.log("Reanudando video al enfocar ventana:", e));
        }
    }
});

// ==========================================
// BARRA DE PROGRESO Y TIEMPO
// ==========================================

audio.addEventListener("timeupdate", () => {
    if (!audio.duration) return;
    const progress = (audio.currentTime / audio.duration) * 100;
    progressBar.value = progress;
    currentTime.textContent = formatTime(audio.currentTime);
});

audio.addEventListener("loadedmetadata", () => {
    duration.textContent = formatTime(audio.duration);
});

progressBar.addEventListener("input", () => {
    if (!audio.duration) return;
    audio.currentTime = (progressBar.value / 100) * audio.duration;
});

function formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60).toString().padStart(2, "0");
    return `${minutes}:${secs}`;
}
// ==========================================
// VOLUMEN
// ==========================================
audio.volume = 0.5;
audio.muted = false;

volumeSlider.addEventListener("input", () => {
    audio.volume = parseFloat(volumeSlider.value);
    audio.muted = false;
    updateVolumeIcon();
});

soundButton.addEventListener("click", () => {
    audio.muted = !audio.muted;
    updateVolumeIcon();
});

function updateVolumeIcon() {
    const icon = soundButton.querySelector("i");
    if (audio.muted || audio.volume === 0) icon.className = "fa-solid fa-volume-xmark";
    else if (audio.volume < 0.5) icon.className = "fa-solid fa-volume-low";
    else icon.className = "fa-solid fa-volume-high";
}

// ==========================================
// CLICK TO ENTER
// ==========================================
enterButton.addEventListener("click", async () => {
    startScreen.classList.add("hidden");
    document.querySelector(".profile-card").classList.add("show");
    audio.muted = false;
    updateVolumeIcon();
    await playTrack();
    fetchViews();
});

// ==========================================
// CONTADOR DE VISITAS ÚNICAS (LOCALSTORAGE)
// ==========================================
async function fetchViews() {
    try {
        // Verificar si este usuario ya visitó la página antes
        const hasVisited = localStorage.getItem("page_visited");

        if (!hasVisited) {
            // Primera vez que entra: Hacemos un POST para sumar +1
            const response = await fetch("/api/views", { method: "POST" });
            if (response.ok) {
                const data = await response.json();
                viewsSpan.textContent = data.views;
                // Guardamos en el navegador que ya contó su visita
                localStorage.setItem("page_visited", "true");
            }
        } else {
            // Ya visitó antes: Hacemos un GET para solo ver el número sin sumar
            const response = await fetch("/api/views");
            if (response.ok) {
                const data = await response.json();
                viewsSpan.textContent = data.views;
            }
        }
    } catch (error) {
        console.log("Error al conectar con el contador de vistas:", error);
    }
}

// ==========================================
// CONEXIÓN DISCORD EN VIVO (LANYARD)
// ==========================================
async function fetchDiscordStatus() {
    if (!DISCORD_ID) return;

    try {
        const res = await fetch(`https://api.lanyard.rest/v1/users/${DISCORD_ID}`);
        const responseData = await res.json();

        if (responseData.success && responseData.data) {
            const data = responseData.data;

            // Nombre y Avatar
            document.getElementById("discordUsername").textContent = data.discord_user.username;
            
            if (data.discord_user.avatar) {
                const avatarUrl = `https://cdn.discordapp.com/avatars/${data.discord_user.id}/${data.discord_user.avatar}.png`;
                document.getElementById("discordAvatar").src = avatarUrl;
            }

            // Estado (online, idle, dnd, offline)
            const statusDot = document.getElementById("discordStatusDot");
            statusDot.className = `discord-status ${data.discord_status}`;

            // Actividad / Juego / Tiempo
            const activitySpan = document.getElementById("discordActivity");
            
            if (data.activities && data.activities.length > 0) {
                // Busca si estás jugando o escuchando algo
                const customStatus = data.activities.find(act => act.type === 4); // Custom Status
                const activity = data.activities.find(act => act.type !== 4); // Juego o Spotify

                if (activity) {
                    if (activity.type === 0) activitySpan.textContent = `playing ${activity.name}`;
                    else if (activity.type === 2) activitySpan.textContent = `listening to ${activity.details || activity.name}`;
                    else activitySpan.textContent = activity.name;
                } else if (customStatus && customStatus.state) {
                    activitySpan.textContent = customStatus.state;
                } else {
                    activitySpan.textContent = data.discord_status;
                }
            } else {
                activitySpan.textContent = data.discord_status === "offline" ? "offline" : "online";
            }
        }
    } catch (e) {
        console.log("No se pudo cargar la API de Discord:", e);
    }
}

// Ejecutar al cargar
fetchDiscordStatus();
setInterval(fetchDiscordStatus, 15000); // Actualiza cada 15 segundos

// ==========================================
// ANIMACIÓN TÍTULO PESTAÑA
// ==========================================
const titles = ["@AhM", "@AhMyHA", "@AhMyHack"];
let titleIndex = 0, charIndex = 0, isDeleting = false;

function animateTitle() {
    const currentText = titles[titleIndex];
    charIndex = isDeleting ? charIndex - 1 : charIndex + 1;
    document.title = currentText.substring(0, charIndex);

    let typeSpeed = isDeleting ? 100 : 150;
    if (!isDeleting && charIndex === currentText.length) {
        typeSpeed = 1500;
        isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        titleIndex = (titleIndex + 1) % titles.length;
        typeSpeed = 500;
    }
    setTimeout(animateTitle, typeSpeed);
}

animateTitle();
loadTrack(0);