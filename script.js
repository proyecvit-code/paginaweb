// ==========================================
// CONFIGURACIÓN DE DISCORD (LANYARD API)
// ==========================================
const DISCORD_ID = "1234356150862872676"; 

// ==========================================
// VARIABLES DE ESTADO GLOBALES
// ==========================================
let currentTrack = 0;
let isPlaying = false;

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
        cover: "assets/music/cover1.jpg"
    },
    {
        title: "Mercury",
        artist: "GHOSTEMANE",
        audio: "assets/music/mercury.mp3",
        video: "assets/videos/MERCURY.mp4",
        cover: "assets/music/cover3.jpg"
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
        // Reproducir en paralelo, no secuencial
        await Promise.all([video.play(), audio.play()]);
        isPlaying = true;
        playButton.innerHTML = '<i class="fa-solid fa-pause"></i>';
    } catch (error) {
        console.log("Error al reproducir:", error);
        isPlaying = false;
        playButton.innerHTML = '<i class="fa-solid fa-play"></i>';
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

// Espera a que el audio esté listo antes de reproducir
function waitForCanPlay(mediaElement) {
    return new Promise((resolve) => {
        if (mediaElement.readyState >= 3) {
            resolve();
        } else {
            mediaElement.addEventListener("canplay", resolve, { once: true });
        }
    });
}

async function nextTrack() {
    currentTrack = (currentTrack + 1) % tracks.length;
    loadTrack(currentTrack);
    await waitForCanPlay(audio);
    playTrack();
}

async function previousTrack() {
    currentTrack = (currentTrack - 1 + tracks.length) % tracks.length;
    loadTrack(currentTrack);
    await waitForCanPlay(audio);
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
document.addEventListener("visibilitychange", () => {
    if (!document.hidden && isPlaying) {
        if (audio.paused) {
            audio.play().catch(e => console.log("Reanudando audio al enfocar ventana:", e));
        }
        if (video.paused) {
            video.play().catch(e => console.log("Reanudando video al enfocar ventana:", e));
        }
        // Resincroniza el video con el audio al volver a la pestaña
        video.currentTime = audio.currentTime;
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

    // Corrige la deriva entre audio y video si se desincronizan más de 0.3s
    if (Math.abs(video.currentTime - audio.currentTime) > 0.3) {
        video.currentTime = audio.currentTime;
    }
});

audio.addEventListener("loadedmetadata", () => {
    duration.textContent = formatTime(audio.duration);
});

progressBar.addEventListener("input", () => {
    if (!audio.duration) return;
    const newTime = (progressBar.value / 100) * audio.duration;
    audio.currentTime = newTime;
    video.currentTime = newTime; // mantiene el video sincronizado al buscar
});

function formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return "0:00";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60).toString().padStart(2, "0");
    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, "0")}:${secs}`;
    }
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
        const hasVisited = localStorage.getItem("page_visited");

        if (!hasVisited) {
            const response = await fetch("/api/views", { method: "POST" });
            if (response.ok) {
                const data = await response.json();
                viewsSpan.textContent = data.views;
                localStorage.setItem("page_visited", "true");
            }
        } else {
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

            document.getElementById("discordUsername").textContent = data.discord_user.username;
            
            if (data.discord_user.avatar) {
                const avatarUrl = `https://cdn.discordapp.com/avatars/${data.discord_user.id}/${data.discord_user.avatar}.png`;
                document.getElementById("discordAvatar").src = avatarUrl;
            }

            const statusDot = document.getElementById("discordStatusDot");
            statusDot.className = `discord-status ${data.discord_status}`;

            const activitySpan = document.getElementById("discordActivity");
            
            if (data.activities && data.activities.length > 0) {
                const customStatus = data.activities.find(act => act.type === 4);
                const activity = data.activities.find(act => act.type !== 4);

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

fetchDiscordStatus();
setInterval(fetchDiscordStatus, 15000);

// ==========================================
// ANIMACIÓN TÍTULO PESTAÑA (HASTA EL @)
// ==========================================
(function animateTitle() {
    const base = "@";
    const name = "AhMyHack";
    let isDeleting = true;
    let index = name.length;

    function type() {
        // Mantiene siempre el @ visible para no mostrar la URL en la pestaña
        document.title = base + name.substring(0, index);

        if (isDeleting && index === 0) {
            isDeleting = false;
            setTimeout(type, 800);
            return;
        }

        if (!isDeleting && index === name.length) {
            isDeleting = true;
            setTimeout(type, 2000);
            return;
        }

        index += isDeleting ? -1 : 1;
        const speed = isDeleting ? 120 : 180;
        setTimeout(type, speed);
    }

    type();
})();

// ==========================================
// INICIALIZACIÓN DE LA PRIMERA CANCIÓN
// ==========================================
loadTrack(0);