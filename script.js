(function() {
  // Configure environment
  const keyboardRadius = 400; // 800px diameter / 2
  const innerRingRadius = keyboardRadius * 0.25; // Inner ring for vowels
  const middleRingRadius = keyboardRadius * 0.38; // Middle ring for consonants (increased gap)
  const outerRingRadius = keyboardRadius * 0.51; // Outer ring for numbers/symbols
  
  // Keys configuration
  const innerRingKeys = "AEIOU⌫".split(""); // Vowels + backspace in the center ring
  const consonantKeys = "BCDFGHJKLMNPQRSTVWXYZ".split(""); // Consonants for middle ring
  const middleRingKeys = "1234567890.,?!'-_@#$%&()".split(""); // Numbers and special chars for outer ring
  
  // Dictionary for word suggestions
  const dictionary = {
    "a": ["and", "are", "about"],
    "b": ["but", "because", "by"],
    "c": ["can", "come", "could"],
    "d": ["do", "day", "did"],
    "e": ["even", "ever", "every"],
    "f": ["for", "from", "find"],
    "g": ["get", "give", "good"],
    "h": ["have", "had", "how"],
    "i": ["in", "it", "if"],
    "j": ["just", "job", "join"],
    "k": ["know", "key", "keep"],
    "l": ["like", "look", "little"],
    "m": ["make", "more", "my"],
    "n": ["not", "new", "now"],
    "o": ["of", "on", "one"],
    "p": ["people", "part", "place"],
    "q": ["question", "quick", "quiet"],
    "r": ["right", "really", "read"],
    "s": ["so", "see", "some"],
    "t": ["the", "to", "that"],
    "u": ["up", "use", "us"],
    "v": ["very", "view", "value"],
    "w": ["with", "what", "when"],
    "x": ["example", "extra", "extreme"],
    "y": ["you", "year", "your"],
    "z": ["zero", "zoom", "zone"]
  };
  
  // Utility functions
  function polarToXY(radius, angle) {
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    return { x, y };
  }
  
  // Create audio context for beep sound
  let audioCtx;
  
  function initAudio() {
    // Create audio context on user interaction to comply with autoplay policies
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  
  function beep() {
    if (!audioCtx) initAudio();
    
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.value = 800;
    gainNode.gain.value = 0.1;
    
    oscillator.start();
    setTimeout(() => oscillator.stop(), 100);
  }
  
  // DOM Elements
  const keyboard = document.getElementById('keyboard');
  const ring1 = document.getElementById('ring1');
  const ring2 = document.getElementById('ring2');
  const ring3 = document.getElementById('ring3');
  const output = document.getElementById('output');
  const statusIndicator = document.getElementById('status-indicator');
  const statusIcon = document.getElementById('status-icon');
  const statusText = document.getElementById('status-text');
  const clearBtn = document.getElementById('clear');
  const spaceBtn = document.getElementById('space');
  const backspaceBtn = document.getElementById('backspace');
  const webcamContainer = document.getElementById('webcam-container');
  const toggleWebcamBtn = document.getElementById('toggle-webcam');
  
  // Create SVG progress ring
  function createProgressRing() {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.classList.add('progress-ring');
    svg.setAttribute('viewBox', '0 0 60 60');
    
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.classList.add('progress-ring__circle');
    circle.setAttribute('stroke-width', '4');
    circle.setAttribute('stroke', '#007BFF');
    circle.setAttribute('fill', 'transparent');
    circle.setAttribute('r', '28');
    circle.setAttribute('cx', '30');
    circle.setAttribute('cy', '30');
    circle.setAttribute('stroke-dasharray', '175.9');
    circle.setAttribute('stroke-dashoffset', '175.9');
    
    svg.appendChild(circle);
    return svg;
  }
  
  // Create a key element
  function createKey(keyChar, radius, angle, ringIndex) {
    const key = document.createElement('div');
    const { x, y } = polarToXY(radius, angle);
    
    key.classList.add('key');
    
    // Position the key (centering with the keyboard)
    key.style.left = `calc(50% + ${x}px - 30px)`;
    key.style.top = `calc(50% + ${y}px - 30px)`;
    
    const keyText = document.createElement('span');
    keyText.textContent = keyChar;
    
    key.appendChild(keyText);
    key.dataset.key = keyChar;
    
    // Add the key to the appropriate ring
    if (ringIndex === 1) ring1.appendChild(key);
    else if (ringIndex === 2) ring2.appendChild(key);
    
    return key;
  }
  
  // Create keys in rings
  function createRings() {
    // Create inner ring keys (vowels)
    const innerKeysCount = innerRingKeys.length;
    for (let i = 0; i < innerKeysCount; i++) {
      const angle = ((2 * Math.PI) / innerKeysCount) * i - Math.PI/2;
      const key = createKey(innerRingKeys[i], innerRingRadius, angle, 1);
      
      // Make vowels more visible
      if (innerRingKeys[i] === '⌫') {
        // Style backspace key
        key.style.backgroundColor = '#D32F2F'; // Red background
        key.style.fontSize = '1.3rem';
      } else {
        // Style vowels
        key.style.backgroundColor = '#444';
        key.style.fontSize = '1.4rem';
      }
    }
    
    // Create consonant keys in the middle ring
    const consonantCount = consonantKeys.length;
    const consonantCircumference = 2 * Math.PI;
    const spacing = consonantCircumference / consonantCount;
    
    for (let i = 0; i < consonantCount; i++) {
      const angle = spacing * i - Math.PI/2;
      const key = createKey(consonantKeys[i], middleRingRadius, angle, 2);
      key.style.fontSize = '1.25rem';
    }
    
    // Create number and special character keys in outer ring
    const specialKeysCount = middleRingKeys.length;
    for (let i = 0; i < specialKeysCount; i++) {
      const angle = ((2 * Math.PI) / specialKeysCount) * i - Math.PI/2;
      const key = createKey(middleRingKeys[i], outerRingRadius, angle, 2);
    }
  }
  
  // Create suggestion elements
  function createSuggestions(suggestions) {
    // Clear existing suggestions
    ring3.innerHTML = '';
    
    if (!suggestions || suggestions.length === 0) {
      ring3.classList.remove('visible');
      return;
    }
    
    ring3.classList.add('visible');
    
    // Create suggestion elements
    const suggestionCount = Math.min(suggestions.length, 3);
    for (let i = 0; i < suggestionCount; i++) {
      const angle = ((2 * Math.PI) / suggestionCount) * i - Math.PI/2;
      const { x, y } = polarToXY(outerRingRadius, angle);
      
      const suggestion = document.createElement('div');
      suggestion.classList.add('suggestion');
      
      suggestion.style.left = `calc(50% + ${x}px)`;
      suggestion.style.top = `calc(50% + ${y}px)`;
      
      suggestion.textContent = suggestions[i];
      suggestion.dataset.suggestion = suggestions[i];
      
      suggestion.addEventListener('click', () => {
        selectSuggestion(suggestions[i]);
      });
      
      ring3.appendChild(suggestion);
    }
  }
  
  // Handle key selection
  function selectKey(keyChar) {
    if (!keyChar) return;
    
    // Special handling for backspace key
    if (keyChar === '⌫') {
      output.value = output.value.slice(0, -1);
      updateSuggestions();
    } else {
      // Add the character to the output
      output.value += keyChar;
      
      // Update suggestions based on the current word
      updateSuggestions();
    }
    
    // Beep for auditory feedback
    beep();
  }
  
  // Handle suggestion selection
  function selectSuggestion(word) {
    // Get the current text and find the last word
    const currentText = output.value;
    const words = currentText.split(' ');
    const lastWord = words.pop() || '';
    
    // Replace the last word with the suggestion
    words.push(word);
    output.value = words.join(' ') + ' ';
    
    // Clear suggestions
    createSuggestions([]);
    
    // Beep for auditory feedback
    beep();
  }
  
  // Update suggestions based on current text
  function updateSuggestions() {
    const currentText = output.value;
    if (!currentText) {
      createSuggestions([]);
      return;
    }
    
    const words = currentText.split(' ');
    const lastWord = words[words.length - 1].toLowerCase();
    
    if (lastWord.length === 0) {
      createSuggestions([]);
      return;
    }
    
    // Find suggestions based on the first letter
    const firstLetter = lastWord[0];
    let suggestions = dictionary[firstLetter] || [];
    
    // Filter suggestions that start with the current word
    suggestions = suggestions.filter(word => 
      word.toLowerCase().startsWith(lastWord)
    );
    
    createSuggestions(suggestions);
  }
  
  // Handle key gazing
  let gazeTimer = null;
  let currentKey = null;
  
  function startGaze(key) {
    if (currentKey === key) return;
    
    // Stop any ongoing gaze
    stopGaze();
    
    currentKey = key;
    
    // Add progress ring
    const progressRing = createProgressRing();
    key.appendChild(progressRing);
    
    // Animate the progress
    const circle = progressRing.querySelector('circle');
    circle.style.transition = 'stroke-dashoffset 800ms linear';
    setTimeout(() => {
      circle.style.strokeDashoffset = '0';
    }, 50);
    
    // Highlight the key
    key.classList.add('selected');
    
    // Set timer for key selection
    gazeTimer = setTimeout(() => {
      const keyChar = key.dataset.key;
      const suggestion = key.dataset.suggestion;
      
      if (suggestion) {
        selectSuggestion(suggestion);
      } else if (keyChar) {
        selectKey(keyChar);
      }
      
      stopGaze();
    }, 800);
  }
  
  function stopGaze() {
    if (!currentKey) return;
    
    // Remove progress ring
    const progressRing = currentKey.querySelector('.progress-ring');
    if (progressRing) currentKey.removeChild(progressRing);
    
    // Remove highlight
    currentKey.classList.remove('selected');
    
    // Clear timer
    if (gazeTimer) {
      clearTimeout(gazeTimer);
      gazeTimer = null;
    }
    
    currentKey = null;
  }
  
  // Handle mouse events (for testing without eye tracking)
  function setupMouseEvents() {
    // Handle key hover events
    keyboard.addEventListener('mouseover', (e) => {
      const key = e.target.closest('.key');
      const suggestion = e.target.closest('.suggestion');
      
      if (key) {
        startGaze(key);
      } else if (suggestion) {
        startGaze(suggestion);
      }
    });
    
    keyboard.addEventListener('mouseout', (e) => {
      const key = e.target.closest('.key');
      const suggestion = e.target.closest('.suggestion');
      
      if ((key && key === currentKey) || 
          (suggestion && suggestion === currentKey)) {
        stopGaze();
      }
    });
    
    // Handle click events
    keyboard.addEventListener('click', (e) => {
      const key = e.target.closest('.key');
      const suggestion = e.target.closest('.suggestion');
      
      if (key) {
        const keyChar = key.dataset.key;
        if (keyChar) selectKey(keyChar);
      } else if (suggestion) {
        const word = suggestion.dataset.suggestion;
        if (word) selectSuggestion(word);
      }
    });
  }
  
  // Handle keyboard events
  function setupKeyboardEvents() {
    document.addEventListener('keydown', (e) => {
      // Convert key to uppercase for consistency
      const key = e.key.toUpperCase();
      
      // Check if the key is in our keyboard layout
      if (innerRingKeys.includes(key) || consonantKeys.includes(key) || middleRingKeys.includes(key)) {
        selectKey(key);
        e.preventDefault();
      } else if (e.key === 'Backspace') {
        selectKey('⌫');
        e.preventDefault();
      } else if (e.key === ' ') {
        selectKey(' ');
        e.preventDefault();
      }
    });
    
    // Setup button handlers
    clearBtn.addEventListener('click', () => {
      output.value = '';
      createSuggestions([]);
    });
    
    spaceBtn.addEventListener('click', () => {
      selectKey(' ');
    });
    
    backspaceBtn.addEventListener('click', () => {
      selectKey('⌫');
    });
  }
  
  // Setup webcam toggle
  function setupWebcamToggle() {
    toggleWebcamBtn.addEventListener('click', () => {
      const videoElements = document.querySelectorAll('video');
      videoElements.forEach(video => {
        if (video.style.display === 'none') {
          video.style.display = 'block';
          toggleWebcamBtn.textContent = 'Hide';
        } else {
          video.style.display = 'none';
          toggleWebcamBtn.textContent = 'Show';
        }
      });
    });
    
    // Move video elements to the webcam container and hide WebGazer overlays
    function setupVideoElements() {
      const videoElements = document.querySelectorAll('video');
      videoElements.forEach(video => {
        if (!video.parentElement.id || video.parentElement.id !== 'webcam-container') {
          webcamContainer.appendChild(video);
          video.style.width = '100%';
        }
      });
      
      // Hide WebGazer overlay elements
      const overlays = document.querySelectorAll('.webgazerGazeDot, canvas');
      overlays.forEach(overlay => {
        if (overlay.style) {
          overlay.style.display = 'none';
        }
      });
    }
    
    // We need to wait for WebGazer to insert its elements
    setTimeout(setupVideoElements, 3000);
  }
  
  // Initialize WebGazer
  function initializeWebGazer() {
    webgazer.setGazeListener((data, timestamp) => {
      if (!data) return;
      
      const { x, y } = data;
      
      // Find the element at gaze point
      const element = document.elementFromPoint(x, y);
      if (!element) return;
      
      // Check if the element is a key or suggestion
      const key = element.closest('.key');
      const suggestion = element.closest('.suggestion');
      
      if (key) {
        startGaze(key);
      } else if (suggestion) {
        startGaze(suggestion);
      } else {
        stopGaze();
      }
    })
    .showVideoPreview(false) // Hide the preview by default
    .showPredictionPoints(false) // Hide prediction points
    .begin()
    .then(() => {
      // Update status indicator
      statusIcon.style.backgroundColor = '#4CAF50'; // Green
      statusText.textContent = 'Eye tracking active';
      
      // Hide status after 5 seconds
      setTimeout(() => {
        statusIndicator.style.opacity = '0';
      }, 5000);
    })
    .catch(err => {
      console.error('WebGazer error:', err);
      statusText.textContent = 'Eye tracking failed. Using mouse mode.';
      statusIcon.style.backgroundColor = '#FFC107'; // Yellow for warning
    });
  }
  
  // Initialize the application
  function init() {
    createRings();
    setupMouseEvents();
    setupKeyboardEvents();
    setupWebcamToggle();
    initializeWebGazer();
    
    // Initialize empty suggestions
    createSuggestions([]);
    
    // Set initial focus to the output for keyboard interactions
    output.focus();
    
    // Handle window resizing
    window.addEventListener('resize', () => {
      // Update suggestions layout if they're visible
      if (ring3.classList.contains('visible')) {
        const currentSuggestions = Array.from(ring3.querySelectorAll('.suggestion'))
          .map(el => el.dataset.suggestion);
        
        if (currentSuggestions.length > 0) {
          createSuggestions(currentSuggestions);
        }
      }
    });
    
    // Setup user interaction listeners for audio context initialization
    document.addEventListener('click', initAudio, { once: true });
    document.addEventListener('keydown', initAudio, { once: true });
  }
  
  // Start the app
  init();
})();
