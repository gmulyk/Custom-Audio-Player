document.addEventListener('DOMContentLoaded', function() {
    const volumeSliders = document.querySelectorAll('.volume-slider');
    const volumeActives = document.querySelectorAll('.volume-active');
    const volumeIndicators = document.querySelectorAll('.volume-indicator');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const progressBar = document.getElementById('progressBar');
    let isDragging = false;
    let currentSlider = null;

    // Create audio elements
    const audioElement1 = new Audio('audio/night-crickets.mp3');
    const audioElement2 = new Audio('audio/campfire.mp3');

    // Variables for audio contexts, tracks, and gain nodes
    let audioContext1, audioContext2;
    let track1, track2;
    let gainNode1, gainNode2;
    let isInitialized = false;

    // Function to initialize the audio contexts and nodes
    function initializeAudio() {
        // Initialize audio contexts
        audioContext1 = new (window.AudioContext || window.webkitAudioContext)();
        audioContext2 = new (window.AudioContext || window.webkitAudioContext)();

        // Create media element sources
        track1 = audioContext1.createMediaElementSource(audioElement1);
        track2 = audioContext2.createMediaElementSource(audioElement2);

        // Create gain nodes
        gainNode1 = audioContext1.createGain();
        gainNode2 = audioContext2.createGain();

        // Set initial gain to 50%
        gainNode1.gain.value = 0.5;
        gainNode2.gain.value = 0.5;

        // Connect tracks to gain nodes and then to the audio context destination
        track1.connect(gainNode1).connect(audioContext1.destination);
        track2.connect(gainNode2).connect(audioContext2.destination);

        // Attach gain nodes to audio players
        audioPlayers[0].gainNode = gainNode1;
        audioPlayers[1].gainNode = gainNode2;

        // Update the volume slider active width to reflect the initial volume
        volumeActives[0].style.width = '50%';
        volumeActives[1].style.width = '50%';

        // Update the volume indicators to reflect the initial volume
        volumeIndicators[0].textContent = '50%';
        volumeIndicators[1].textContent = '50%';

        isInitialized = true;
    }

    function updateProgress() {
        const totalBuffered = audioElement1.buffered.end(0) + audioElement2.buffered.end(0);
        const totalDuration = audioElement1.duration + audioElement2.duration;
        const percentage = (totalBuffered / totalDuration) * 100;
        progressBar.style.width = `${percentage}%`;
    
        // Hide progress bar if fully loaded
        if (percentage >= 100) {
            progressBar.style.display = 'none';
        }
    }

    audioElement1.addEventListener('canplaythrough', () => {
        updateProgress();
        if (audioElement2.readyState >= 4) {
            progressBar.style.width = '100%';
            progressBar.style.display = 'none'; // Hide progress bar
        }
    });
    
    audioElement2.addEventListener('canplaythrough', () => {
        updateProgress();
        if (audioElement1.readyState >= 4) {
            progressBar.style.width = '100%';
            progressBar.style.display = 'none'; // Hide progress bar
        }
    });

    let audioPlayers = [
        { element: audioElement1 },
        { element: audioElement2 }
    ];

    function updateVolume(clientX, volumeSlider, volumeActive, volumeIndicator, gainNode) {
        const rect = volumeSlider.getBoundingClientRect();
        const offsetX = Math.min(Math.max(0, clientX - rect.left), volumeSlider.offsetWidth);
        const percentage = offsetX / volumeSlider.offsetWidth;
        volumeActive.style.width = `${percentage * 100}%`;
        gainNode.gain.value = percentage;
        volumeIndicator.textContent = `${Math.round(percentage * 100)}%`;

        // Debugging: Log volume changes (remove comment from line below if needed)
        // console.log(`Volume: ${gainNode.gain.value}`);
    }

    function handleStart(event, volumeSlider, volumeActive, volumeIndicator, gainNode) {
        isDragging = true;
        currentSlider = volumeSlider;
        volumeIndicator.classList.add('show');
        const clientX = event.touches ? event.touches[0].clientX : event.clientX;
        updateVolume(clientX, volumeSlider, volumeActive, volumeIndicator, gainNode);
        event.preventDefault();
    }

    function handleMove(event) {
        if (isDragging && currentSlider) {
            const clientX = event.touches ? event.touches[0].clientX : event.clientX;
            const index = Array.from(volumeSliders).indexOf(currentSlider);
            const volumeActive = volumeActives[index];
            const volumeIndicator = volumeIndicators[index];

            // Ensure gainNode is defined
            const gainNode = audioPlayers[index] && audioPlayers[index].gainNode;
            if (gainNode) {
                updateVolume(clientX, currentSlider, volumeActive, volumeIndicator, gainNode);
            }

            event.preventDefault();
        }
    }

    function handleEnd(event) {
        if (isDragging && currentSlider) {
            isDragging = false;
            const index = Array.from(volumeSliders).indexOf(currentSlider);
            const volumeIndicator = volumeIndicators[index];
            volumeIndicator.classList.remove('show');
            currentSlider = null;
            event.preventDefault();
        }
    }

    volumeSliders.forEach((volumeSlider, index) => {
        const volumeActive = volumeActives[index];
        const volumeIndicator = volumeIndicators[index];

        volumeSlider.addEventListener('mousedown', (event) => handleStart(event, volumeSlider, volumeActive, volumeIndicator, audioPlayers[index].gainNode));
        volumeSlider.addEventListener('touchstart', (event) => handleStart(event, volumeSlider, volumeActive, volumeIndicator, audioPlayers[index].gainNode));

        document.addEventListener('mousemove', handleMove);
        document.addEventListener('touchmove', handleMove);

        document.addEventListener('mouseup', handleEnd);
        document.addEventListener('touchend', handleEnd);

        volumeSlider.addEventListener('touchend', function(event) {
            const clientX = event.changedTouches[0].clientX;
            updateVolume(clientX, volumeSlider, volumeActive, volumeIndicator, gainNode);
        });
    });

    playPauseBtn.addEventListener('click', function() {
        if (!isInitialized) {
            initializeAudio();
        }

        if (audioElement1.paused) {
            audioElement1.play();
            audioElement2.play();
            playPauseBtn.textContent = 'Pause';
        } else {
            audioElement1.pause();
            audioElement2.pause();
            playPauseBtn.textContent = 'Play';
        }
    });

    // Update the progress bar
    audioElement1.addEventListener('progress', updateProgress);
    audioElement2.addEventListener('progress', updateProgress);

    function updateProgress() {
        const totalBuffered = audioElement1.buffered.end(0) + audioElement2.buffered.end(0);
        const totalDuration = audioElement1.duration + audioElement2.duration;
        const percentage = (totalBuffered / totalDuration) * 100;
        progressBar.style.width = `${percentage}%`;
    }

    audioElement1.addEventListener('canplaythrough', () => {
        updateProgress();
        if (audioElement2.readyState >= 4) {
            progressBar.style.width = '100%';
        }
    });

    audioElement2.addEventListener('canplaythrough', () => {
        updateProgress();
        if (audioElement1.readyState >= 4) {
            progressBar.style.width = '100%';
        }
    });
});
