let video;
let faceMesh;
let faces = [];
let mic;
let audioContextStarted = false;
let bgMusic;
let sirenSound;

function preload() {
    // Renamed to bgMusic for global usage
    bgMusic = loadSound('assets/processing.mp3');
    sirenSound = loadSound('assets/siren.wav');
}

// ... (State Machine constants remain)

// ... (Logic Variables remain)

// ... (UI References remain)

function setup() {
    // ... (setup code remains)

    // Interactions
    select('#btn-yes').mousePressed(() => triggerRejection('YES'));
    select('#btn-no').mousePressed(() => triggerRejection('NO'));
}

// ... (windowResized, modelReady remain)

// ... (speak, playSystemSound remain)

// ... (draw, drawFaceMesh remain)

function checkFaceProximity() {
    if (faces.length > 0) {
        if (!audioContextStarted && mouseIsPressed) {
            userStartAudio();
            mic.start();
            audioContextStarted = true;

            // Start Global Music
            if (bgMusic && bgMusic.isLoaded()) {
                bgMusic.setVolume(0.5);
                bgMusic.loop();
            }

            transitionTo(STATE_MOUTH);
        } else if (audioContextStarted) {
            transitionTo(STATE_MOUTH);
        }
    }
}

function transitionTo(state) {
    currentState = state;

    // Hide all
    attractScreen.addClass('hidden');
    mouthOverlay.addClass('hidden');
    oathOverlay.addClass('hidden');
    voteInterface.addClass('hidden');
    rejectionOverlay.addClass('hidden');

    // Show target
    if (state === STATE_MOUTH) {
        mouthOverlay.removeClass('hidden');
        stepMouth.addClass('active');
        playSystemSound('ALERT');
        speak(FACE_TASKS[0].text);
    } else if (state === STATE_OATH) {
        oathOverlay.removeClass('hidden');
        stepMouth.removeClass('active');
        stepVoice.addClass('active');
        playSystemSound('ALERT');
        speak("REPEAT THE OATH LOUDLY");
    } else if (state === STATE_PROCESSING) {
        oathOverlay.removeClass('hidden');
        // Music is now global, no specific trigger needed here
        speak("PROCESSING VOICE PRINT");
    } else if (state === STATE_VOTE) {
        voteInterface.removeClass('hidden');
        voteInterface.style('opacity', '1');
        stepVoice.removeClass('active');
        stepVote.addClass('active');
        playSystemSound('ALERT');
        speak("DOES PINEAPPLE BELONG ON PIZZA?");
    } else if (state === STATE_REJECTION) {
        rejectionOverlay.removeClass('hidden');
        playSystemSound('ALERT');
    }
}

// State Machine
// State Machine
const STATE_START = 0;
const STATE_MOUTH = 1;
const STATE_OATH = 2;
const STATE_PROCESSING = 5;
const STATE_VOTE = 3;
const STATE_VOTE_PROCESSING = 6;
const STATE_REJECTION = 4;
const STATE_TRANSITION = 7;
const STATE_WARNING = 8; // New State
let currentState = STATE_START;

// Logic Variables
let mouthOpenTimer = 0;
let oathAttempts = 0;
let oathTimer = 0;
let processingTimer = 0;
let voteProcessingTimer = 0;
let warningTimer = 0;
let userVote = "";

// Transition Variables
let transitionTargetState = 0;
let transitionTimer = 0;
let transitionMessage = "";

// Typewriter Variables
let typewriterTargetText = "";
let typewriterCurrentText = "";
let typewriterIndex = 0;
let typewriterFrameCount = 0;

// UI References
let startScreen, mouthOverlay, oathOverlay, voteInterface, rejectionOverlay;
let stepMouth, stepVoice, stepVote;
let mouthStatus, voiceBar, rejectionText, oathText, processingText, privacyAlert;

function setup() {
    let cnv = createCanvas(windowWidth, windowHeight);
    cnv.parent('canvas-container');

    video = createCapture(VIDEO);
    video.size(width, height);
    video.hide();

    faceMesh = ml5.facemesh(video, modelReady);
    faceMesh.on('predict', results => {
        faces = results;
    });

    mic = new p5.AudioIn();

    // UI Refs
    startScreen = select('#start-screen');
    mouthOverlay = select('#mouth-overlay');
    oathOverlay = select('#oath-overlay');
    voteInterface = select('#vote-interface');
    rejectionOverlay = select('#rejection-overlay');

    stepMouth = select('#step-mouth');
    stepVoice = select('#step-voice');
    stepVote = select('#step-vote');

    mouthStatus = select('#mouth-status');
    voiceBar = select('#voice-bar');
    rejectionText = select('#rejection-text');
    oathText = select('#oath-text');
    processingText = select('#processing-text');
    privacyAlert = select('#privacy-alert');

    // Fixed Oath
    let selectedOath = "\"USELESS MACHINES IS THE BEST CLASS IN TISCH!\"";
    oathText.html(selectedOath);

    // Interactions
    select('#btn-yes').mousePressed(() => triggerRejection('YES'));
    select('#btn-no').mousePressed(() => triggerRejection('NO'));

    let btnStart = select('#btn-start');
    btnStart.mousePressed(startGame);

    // Terms Logic
    // Terms Logic
    let terms = [];
    for (let i = 1; i <= 10; i++) {
        let t = select('#term-' + i);
        terms.push(t);
        t.changed(checkTerms);
    }

    function checkTerms() {
        let allChecked = terms.every(t => t.elt.checked);

        if (allChecked) {
            btnStart.removeAttribute('disabled');
            btnStart.style('opacity', '1');
            btnStart.style('cursor', 'pointer');
        } else {
            btnStart.attribute('disabled', '');
            btnStart.style('opacity', '0.5');
            btnStart.style('cursor', 'not-allowed');
        }
    }

    // Attempt to start audio on first interaction
    document.addEventListener('click', startGlobalAudio);
    document.addEventListener('keydown', startGlobalAudio);
}

function startGlobalAudio() {
    if (!audioContextStarted) {
        userStartAudio();
        mic.start();
        audioContextStarted = true;
    }

    if (bgMusic && bgMusic.isLoaded() && !bgMusic.isPlaying()) {
        bgMusic.setVolume(0.5);
        bgMusic.loop();
    }
}

function startGlobalAudio() {
    if (!audioContextStarted) {
        userStartAudio();
        mic.start();
        audioContextStarted = true;
    }

    if (bgMusic && bgMusic.isLoaded() && !bgMusic.isPlaying()) {
        bgMusic.setVolume(0.5);
        bgMusic.loop();
    }
}

function startGame() {
    // Ensure audio is running
    startGlobalAudio();

    triggerTransition(STATE_WARNING, "INITIALIZING SYSTEM...");
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    video.size(width, height);
}

function modelReady() {
    console.log("Model Ready!");
}

// --- AI Voice & SFX ---
function speak(text) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel(); // Stop previous
        let msg = new SpeechSynthesisUtterance(text);
        msg.rate = 0.9;
        msg.pitch = 0.6; // Cold, low pitch
        // Try to find a robotic voice if possible, otherwise default
        let voices = window.speechSynthesis.getVoices();
        let robotVoice = voices.find(v => v.name.includes('Google US English') || v.name.includes('Samantha'));
        if (robotVoice) msg.voice = robotVoice;

        window.speechSynthesis.speak(msg);
    }
}

function playSystemSound(type) {
    let osc = new p5.Oscillator('sine');
    let env = new p5.Envelope();

    if (type === 'ALERT') {
        osc.freq(800);
        env.setADSR(0.01, 0.1, 0.1, 0.1);
        env.setRange(0.5, 0);
    } else if (type === 'SUCCESS') {
        osc.freq(1200);
        env.setADSR(0.01, 0.1, 0.1, 0.1);
        env.setRange(0.3, 0);
    } else if (type === 'PROCESSING') {
        osc.freq(400);
        env.setADSR(0.01, 0.05, 0.1, 0.05);
        env.setRange(0.2, 0);
    }

    osc.start();
    env.play(osc, 0, 0.1);
    setTimeout(() => osc.stop(), 200);
}

function triggerPrivacyAlert(dataType) {
    privacyAlert.html("⚠️ DATA CAPTURED:<br>" + dataType);
    privacyAlert.removeClass('hidden');
    playSystemSound('SUCCESS');
    speak("Biometric data captured.");

    setTimeout(() => {
        privacyAlert.addClass('hidden');
    }, 2000);
}

function updateTypewriter() {
    if (typewriterIndex < typewriterTargetText.length) {
        typewriterFrameCount++;
        // Speed: 1 char every 3 frames
        if (typewriterFrameCount % 3 === 0) {
            typewriterCurrentText += typewriterTargetText.charAt(typewriterIndex);
            rejectionText.html(typewriterCurrentText.replace(/\n/g, '<br>'));
            typewriterIndex++;

            // Optional: Typing sound
            // playSystemSound('PROCESSING');
        }
    }
}

function updateWarning() {
    warningTimer--;

    if (warningTimer <= 0) {
        transitionTo(STATE_MOUTH);
    }
}

function triggerTransition(targetState, message) {
    currentState = STATE_TRANSITION;
    transitionTargetState = targetState;
    transitionMessage = message;
    transitionTimer = 300; // 5 seconds at 60fps

    // Hide all overlays
    startScreen.addClass('hidden');
    mouthOverlay.addClass('hidden');
    oathOverlay.addClass('hidden');
    voteInterface.addClass('hidden');
    rejectionOverlay.addClass('hidden');
    processingText.removeClass('hidden'); // Use this for message

    processingText.html(transitionMessage);
    playSystemSound('PROCESSING');
}

function updateTransition() {
    transitionTimer--;

    // Update loading text or bar
    let dots = ".".repeat(floor(frameCount / 20) % 4);
    processingText.html(transitionMessage + "<br><br>" + dots);

    if (transitionTimer <= 0) {
        transitionTo(transitionTargetState);
    }
}

function draw() {
    background(26, 5, 0); // Burnt Crust Black

    push();
    translate(width, 0);
    scale(-1, 1);

    if (currentState === STATE_VOTE || currentState === STATE_VOTE_PROCESSING || currentState === STATE_REJECTION || currentState === STATE_TRANSITION || currentState === STATE_WARNING) {
        // 2D Contour Projection Mode
        noStroke();
        fill(0);
        rect(0, 0, width, height);

        // Draw Face Mesh (Green Digital Style)
        if (currentState !== STATE_TRANSITION && currentState !== STATE_WARNING) {
            drawFaceMesh(true);
        }
    } else {
        // Normal Video Mode
        tint(255, 100, 100);
        image(video, 0, 0, width, height);

        // Draw Face Mesh (Red Overlay Style)
        drawFaceMesh(false);
    }
    pop();

    // State Logic
    if (currentState === STATE_START) {
        // Waiting
    } else if (currentState === STATE_MOUTH) {
        checkFaceBiometrics();
    } else if (currentState === STATE_OATH) {
        checkOath();
    } else if (currentState === STATE_PROCESSING) {
        updateProcessing();
    } else if (currentState === STATE_VOTE_PROCESSING) {
        updateVoteProcessing();
    } else if (currentState === STATE_REJECTION && userVote === 'NO') {
        updateTypewriter();
    } else if (currentState === STATE_TRANSITION) {
        updateTransition();
    } else if (currentState === STATE_WARNING) {
        updateWarning();
    }

    // Draw Loading Bar for Transition
    if (currentState === STATE_TRANSITION) {
        let barWidth = map(transitionTimer, 300, 0, 0, width * 0.8);
        fill(0, 255, 0);
        rect(width * 0.1, height * 0.6, barWidth, 10);
        noFill();
        stroke(0, 255, 0);
        rect(width * 0.1, height * 0.6, width * 0.8, 10);
    }

    // Draw Loading Bar for Warning (Moved to end)
    if (currentState === STATE_WARNING) {
        let barWidth = map(warningTimer, 480, 0, 0, width * 0.8);
        fill(255, 50, 0); // Red-Orange Warning Color
        rect(width * 0.1, height * 0.75, barWidth, 20);
        noFill();
        stroke(255, 50, 0);
        rect(width * 0.1, height * 0.75, width * 0.8, 20);
    }
}

function drawFaceMesh(isDigital) {
    noFill();
    strokeWeight(2);

    if (isDigital) {
        stroke(0, 255, 0); // Matrix Green
    } else {
        stroke(255, 51, 0, 150); // Tomato Red
    }

    for (let i = 0; i < faces.length; i++) {
        const keypoints = faces[i].scaledMesh;
        beginShape(POINTS);
        for (let j = 0; j < keypoints.length; j++) {
            let [x, y] = keypoints[j];
            vertex(x, y);
        }
        endShape();
    }
}


// Removed checkFaceProximity as we use button now

function transitionTo(state) {
    currentState = state;

    // Hide all
    startScreen.addClass('hidden');
    mouthOverlay.addClass('hidden');
    oathOverlay.addClass('hidden');
    voteInterface.addClass('hidden');
    rejectionOverlay.addClass('hidden');
    processingText.addClass('hidden'); // Hide processing text by default

    // Show target
    if (state === STATE_START) {
        startScreen.removeClass('hidden');
    } else if (state === STATE_MOUTH) {
        mouthOverlay.removeClass('hidden');
        stepMouth.addClass('active');

        // Ensure Music is Playing
        if (bgMusic && bgMusic.isLoaded() && !bgMusic.isPlaying()) {
            bgMusic.setVolume(0.5);
            bgMusic.loop();
        }

        // Speak first task
        playSystemSound('ALERT');
        speak(FACE_TASKS[0].text);
    } else if (state === STATE_OATH) {
        oathOverlay.removeClass('hidden');
        stepMouth.removeClass('active');
        stepVoice.addClass('active');
        playSystemSound('ALERT');
        speak("REPEAT THE OATH LOUDLY");
    } else if (state === STATE_PROCESSING) {
        oathOverlay.addClass('hidden'); // Hide oath to prevent overlap
        processingText.removeClass('hidden'); // Show it here
        // Music is global, no need to trigger here
        speak("PROCESSING VOICE PRINT");
    } else if (state === STATE_VOTE) {
        voteInterface.removeClass('hidden');
        voteInterface.style('opacity', '1');
        stepVoice.removeClass('active');
        stepVote.addClass('active');
        playSystemSound('ALERT');
        speak("DOES PINEAPPLE BELONG ON PIZZA?");
    } else if (state === STATE_VOTE_PROCESSING) {
        // Reuse Oath Overlay for text display or just use processingText?
        // Let's use processingText centered
        oathOverlay.addClass('hidden'); // Ensure oath is hidden
        processingText.removeClass('hidden');
        processingText.html("CALCULATING POLITICAL ALIGNMENT...");
        voteProcessingTimer = 180; // 3 seconds
        playSystemSound('PROCESSING');
        speak("ANALYZING POLITICAL ALIGNMENT");
    } else if (state === STATE_REJECTION) {
        rejectionOverlay.removeClass('hidden');
        playSystemSound('ALERT');

        let icon = select('#rejection-icon');

        if (userVote === 'YES') {
            icon.html("✅");
            rejectionText.html("VOTE ACCEPTED.<br><br>POLITICAL ALIGNMENT CONFIRMED.");
            rejectionText.style('color', '#00AA00'); // Green
            speak("Vote accepted. Political alignment confirmed.");
        } else {
            icon.html("🚨");
            rejectionText.style('color', '#FF3300'); // Red

            // Play Siren
            if (sirenSound && sirenSound.isLoaded()) {
                sirenSound.play();
            }

            // Typewriter Setup
            typewriterTargetText = "VOTE REJECTED.\nYOUR POLITICAL STANCE DOES NOT ALIGN WITH THE SYSTEM.\n\nSTAY WHERE YOU ARE.\nSTATE POLICE ARE EN ROUTE.\nDO NOT RESIST.";
            typewriterCurrentText = "";
            typewriterIndex = 0;
            typewriterFrameCount = 0;
            rejectionText.html(""); // Clear initial

            speak("Vote rejected. Your political stance does not align with the system. Stay where you are. State police are en route. Do not resist.");
        }
    } else if (state === STATE_WARNING) {
        processingText.removeClass('hidden');
        processingText.html("SYSTEM READY.<br><br>WARNING:<br>INITIATING BIO-METRIC FEATURE ACQUISITION...");
        warningTimer = 480; // 8 seconds
        playSystemSound('ALERT');
        speak("Warning. Initiating bio-metric feature acquisition.");
    }
}

// Face Verification Tasks
const FACE_TASKS = [
    { type: 'CENTER', text: "CENTER YOUR FACE" },
    { type: 'LEFT', text: "TURN SLOWLY LEFT" },
    { type: 'RIGHT', text: "TURN SLOWLY RIGHT" },
    { type: 'UP', text: "TILT HEAD UP" },
    { type: 'MOUTH', text: "OPEN MOUTH WIDE" }
];
let currentFaceTask = 0;
let faceHoldTimer = 0;

function checkFaceBiometrics() {
    if (faces.length > 0) {
        let mesh = faces[0].scaledMesh;
        let nose = mesh[1];
        let leftCheek = mesh[234];
        let rightCheek = mesh[454];
        let leftEye = mesh[33];
        let rightEye = mesh[263];

        // Calculate Yaw Ratio (Horizontal Rotation)
        // 0.5 = Center, <0.5 = Left, >0.5 = Right (approx)
        let faceWidth = dist(leftCheek[0], leftCheek[1], rightCheek[0], rightCheek[1]);
        let noseRelX = (nose[0] - leftCheek[0]) / (rightCheek[0] - leftCheek[0]);

        // Calculate Pitch (Vertical Tilt) - Nose Y vs Eye Y
        let eyeY = (leftEye[1] + rightEye[1]) / 2;
        let noseEyeDist = nose[1] - eyeY; // Positive = Nose below eyes (Normal)

        // Mouth Dist
        let topLip = mesh[13];
        let bottomLip = mesh[14];
        let mouthDist = dist(topLip[0], topLip[1], bottomLip[0], bottomLip[1]);

        let task = FACE_TASKS[currentFaceTask];
        let passed = false;

        // Logic for each task
        if (task.type === 'CENTER') {
            if (noseRelX > 0.4 && noseRelX < 0.6) passed = true;
        } else if (task.type === 'LEFT') {
            // Swapped logic: > 0.6
            if (noseRelX > 0.6) passed = true;
        } else if (task.type === 'RIGHT') {
            // Swapped logic: < 0.4
            if (noseRelX < 0.4) passed = true;
        } else if (task.type === 'UP') {
            if (noseEyeDist < 15) passed = true;
        } else if (task.type === 'MOUTH') {
            if (mouthDist > 20) passed = true;
        }

        // Progress Logic
        if (passed) {
            faceHoldTimer++;
            let progress = floor((faceHoldTimer / 60) * 100);
            mouthStatus.html(`${task.text}<br><span style="color:#00AA00">HOLD... ${progress}%</span>`);

            if (faceHoldTimer > 60) { // Hold for 1 second
                playSystemSound('SUCCESS');
                triggerPrivacyAlert("FACE " + task.type); // Trigger Alert
                currentFaceTask++;
                faceHoldTimer = 0;

                // Check if all tasks done
                if (currentFaceTask >= FACE_TASKS.length) {
                    triggerTransition(STATE_OATH, "INITIATING VOICE PROTOCOL...");
                } else {
                    // Speak next task
                    speak(FACE_TASKS[currentFaceTask].text);
                }
            }
        } else {
            faceHoldTimer = 0;
            mouthStatus.html(task.text);
            mouthStatus.style('color', '#FF3300');
        }
    } else {
        mouthStatus.html("FACE NOT DETECTED");
    }
}

function checkOath() {
    let vol = mic.getLevel();

    // Debug log to see if mic is working
    if (frameCount % 60 === 0) console.log("Mic Vol:", vol);

    // Accumulate progress if ANY sound is detected (Threshold 0.01)
    if (vol > 0.01) {
        oathTimer += 0.3; // Slower progress (approx 5-6 sec of speech)
    }

    // Cap at 100
    if (oathTimer > 100) oathTimer = 100;

    // Visual feedback
    voiceBar.style('width', oathTimer + '%');

    // Trigger next state
    if (oathTimer >= 100) {
        triggerPrivacyAlert("VOICE PRINT"); // Trigger Alert
        triggerTransition(STATE_PROCESSING, "UPLOADING BIOMETRIC DATA...");
        processingTimer = 480; // 8 seconds at 60fps - starts NOW after voice input
        processingText.html("PROCESSING VOICE PRINT...");
    }
}

function updateProcessing() {
    // Only countdown if timer has been initialized (i.e., voice was completed)
    if (processingTimer > 0) {
        processingTimer--;

        // Blink effect
        if (frameCount % 30 < 15) {
            processingText.html("PROCESSING... " + ceil(processingTimer / 60) + "s");
        } else {
            processingText.html("ANALYZING... " + ceil(processingTimer / 60) + "s");
        }

        if (processingTimer <= 0) {
            triggerPrivacyAlert("PSYCH PROFILE"); // Trigger Alert
            triggerTransition(STATE_VOTE, "PREPARING BALLOT...");
        }
    }
}

function triggerRejection(choice) {
    userVote = choice;
    transitionTo(STATE_VOTE_PROCESSING);
}

function updateVoteProcessing() {
    voteProcessingTimer--;

    if (voteProcessingTimer <= 0) {
        transitionTo(STATE_REJECTION);
    }
}
