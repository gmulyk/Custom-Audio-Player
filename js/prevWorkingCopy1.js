document.addEventListener('DOMContentLoaded', function() {
    const volumeSliders = document.querySelectorAll('.volume-slider');
    const volumeActives = document.querySelectorAll('.volume-active');
    const volumeIndicators = document.querySelectorAll('.volume-indicator');
    const playPauseBtn = document.getElementById('playPauseBtn');
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

        // Set initial gain to 75%
        gainNode1.gain.value = 0.75;
        gainNode2.gain.value = 0.75;

        // Connect tracks to gain nodes and then to the audio context destination
        track1.connect(gainNode1).connect(audioContext1.destination);
        track2.connect(gainNode2).connect(audioContext2.destination);

        // Attach gain nodes to audio players
        audioPlayers[0].gainNode = gainNode1;
        audioPlayers[1].gainNode = gainNode2;

        // Update the volume slider active width to reflect the initial volume
        volumeActives[0].style.width = '75%';
        volumeActives[1].style.width = '75%';

        // Update the volume indicators to reflect the initial volume
        volumeIndicators[0].textContent = '75%';
        volumeIndicators[1].textContent = '75%';

        isInitialized = true;
    }

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

        // Debugging: Log volume changes
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
            updateVolume(clientX, volumeSlider, volumeActive, volumeIndicator, audioPlayers[index].gainNode);
            handleEnd(event);
        });
    });

    const resumeAudioContext = (audioContext) => {
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }
    };

    const togglePlayPause = () => {
        let allPaused = audioPlayers.every(audioPlayer => audioPlayer.element.paused);

        if (!isInitialized) {
            initializeAudio(); // Initialize the audio contexts on the first user interaction
        }

        resumeAudioContext(audioContext1);
        resumeAudioContext(audioContext2);

        audioPlayers.forEach(audioPlayer => {
            if (allPaused) {
                audioPlayer.element.play();
                playPauseBtn.textContent = 'Pause';
            } else {
                audioPlayer.element.pause();
                playPauseBtn.textContent = 'Play';
            }
        });
    };

    playPauseBtn.addEventListener('click', togglePlayPause);
    playPauseBtn.addEventListener('touchstart', function(event) {
        togglePlayPause();
        event.preventDefault();
    });
});
