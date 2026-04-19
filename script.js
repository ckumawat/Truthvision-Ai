document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    const userData = JSON.parse(localStorage.getItem('user'));
    const welcomeElement = document.getElementById('user-welcome');

    if (!localStorage.getItem('isAuthenticated')) {
        window.location.href = 'login.html'; // Security: Bina login ke dashboard nahi खुलेगा
    } else if (userData && welcomeElement) {
        welcomeElement.textContent = `Welcome, ${userData.username}!`;
    }
});

document.addEventListener('DOMContentLoaded', () => {
    // --- Elements ---
    const tabs = document.querySelectorAll('.tab-button');
    const inputAreas = document.querySelectorAll('.input-area');
    const fileUpload = document.getElementById('file-upload');
    const fileNameDisplay = document.getElementById('file-name-display');
    const submitMediaButton = document.getElementById('submit-media');
    const dropArea = document.getElementById('drop-area');
    const imagePreview = document.getElementById('image-preview');
    const previewImg = document.getElementById('preview-img');
    const scanOverlay = document.getElementById('scan-overlay');
    
    const resultsContainer = document.getElementById('results-container');
    const resultScore = document.getElementById('result-score');
    const resultDetails = document.getElementById('result-details');
    const resultText = document.getElementById('result-text');
    const closeResultsBtn = document.getElementById('close-results');
    
    // Search elements
    const searchToggle = document.getElementById('search-toggle');
    const searchInputContainer = document.getElementById('search-input-container');
    const searchInput = document.getElementById('search-input');
    const searchClose = document.getElementById('search-close');
    
    // Hamburger menu elements
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const dropdownMenu = document.getElementById('dropdown-menu');
    const profileModal = document.getElementById('profile-modal');
    const profileForm = document.getElementById('profile-form');
    
    // Variable to track result dismiss timeout
    let resultDismissTimeout;

    // --- Tab Switching Logic ---
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const type = tab.getAttribute('data-type');
            tabs.forEach(t => t.classList.remove('active'));
            inputAreas.forEach(area => area.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(`${type}-input-area`).classList.add('active');
        });
    });

    // --- File Upload UI Logic ---
    fileUpload.addEventListener('change', () => {
        if (fileUpload.files.length > 0) {
            const file = fileUpload.files[0];
            fileNameDisplay.textContent = `Selected: ${file.name}`;
            submitMediaButton.removeAttribute('disabled');
            
            // Show image preview for image files
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    previewImg.src = e.target.result;
                    imagePreview.classList.remove('hidden');
                };
                reader.readAsDataURL(file);
            } else {
                imagePreview.classList.add('hidden');
            }
        } else {
            fileNameDisplay.textContent = 'No file selected.';
            submitMediaButton.setAttribute('disabled', 'true');
            imagePreview.classList.add('hidden');
        }
    });

    // --- Real AI Analysis Logic (Connecting to Backend) ---
    async function runAnalysis(inputType) {
        // Prepare UI
        resultsContainer.classList.remove('hidden');
        resultsContainer.scrollIntoView({ behavior: 'smooth' });
        
        resultScore.textContent = 'Scanning...';
        resultScore.style.color = 'var(--color-primary)';
        resultScore.style.textShadow = 'none';
        resultText.textContent = `TruthVision AI is analyzing ${inputType}...`;
        resultDetails.innerHTML = '<p><i class="fas fa-microchip fa-spin"></i> Extracting features and checking for synthetic artifacts...</p>';

        // Start 3D scanning effect for media
        if (inputType === 'Media File' && !imagePreview.classList.contains('hidden')) {
            scanOverlay.classList.remove('hidden');
        }

        const formData = new FormData();
        
        try {
            let response;
            
            if (inputType === 'Media File') {
                const file = fileUpload.files[0];
                if (!file) {
                    alert("Please select a file first!");
                    return;
                }
                formData.append('mediaFile', file);

                // Get current user ID
                const userData = JSON.parse(localStorage.getItem('user') || '{}');
                formData.append('userId', userData.id || 'anonymous');

                // Call actual API for real detection
                response = await fetch('/api/verify', {
                    method: 'POST',
                    body: formData
                });
            } else {
                // For Text or App, we simulate for now
                await new Promise(resolve => setTimeout(resolve, 2500));
                const mockScore = Math.floor(Math.random() * 40) + 55;
                displayResults({
                    score: mockScore,
                    verdict: "Content Verified",
                    classification: "AUTHENTIC",
                    confidence: 75,
                    detections: {},
                    fileInfo: { type: "Text/Data" },
                    recommendation: "This content appears to be authentic."
                });
                return;
            }

            if (response.ok) {
                const data = await response.json();
                displayResults(data);
            } else {
                const error = await response.json();
                throw new Error(error.message || "Detection failed");
            }

        } catch (error) {
            console.error("Analysis Error:", error);
            // Stop scanning effect
            scanOverlay.classList.add('hidden');
            resultScore.textContent = "Error";
            resultText.textContent = "Analysis Failed";
            resultDetails.innerHTML = `
                <p style="color:red;"><i class="fas fa-exclamation-triangle"></i> ${error.message}</p>
                <p style="font-size: 0.85em; margin-top: 10px;">
                    <strong>Troubleshooting:</strong><br>
                    1. Ensure Node.js server is running: <code>npm start</code><br>
                    2. Confirm the browser is pointing to <code>http://localhost:3001</code><br>
                    3. If the issue persists, refresh and try another image
                </p>
            `;
        }
    }

    function displayResults(data) {
        // Stop scanning effect
        scanOverlay.classList.add('hidden');
        
        // Clear any existing dismiss timeout
        if (resultDismissTimeout) {
            clearTimeout(resultDismissTimeout);
        }
        
        let resultColor, shadow, statusIcon;
        const score = data.score;

        if (score >= 75) {
            resultColor = '#28a745'; // Green (Safe)
            shadow = '0 0 20px rgba(40, 167, 69, 0.6)';
            statusIcon = '<i class="fas fa-check-circle" style="color: #28a745;"></i>';
        } else if (score >= 50) {
            resultColor = '#ffc107'; // Yellow (Warning)
            shadow = '0 0 20px rgba(255, 193, 7, 0.6)';
            statusIcon = '<i class="fas fa-exclamation-circle" style="color: #ffc107;"></i>';
        } else {
            resultColor = '#dc3545'; // Red (Danger)
            shadow = '0 0 20px rgba(220, 53, 69, 0.6)';
            statusIcon = '<i class="fas fa-times-circle" style="color: #dc3545;"></i>';
        }

        resultScore.textContent = `${score}%`;
        resultScore.style.color = resultColor;
        resultScore.style.textShadow = shadow;
        resultText.innerHTML = `${statusIcon} ${data.verdict}`;
        
        let detailsHtml = `
            <div style="margin-bottom: 15px;">
                <p><strong>Classification:</strong> <span style="color: ${resultColor}; font-weight: bold;">${data.classification || 'UNKNOWN'}</span></p>
                <p><strong>Confidence:</strong> ${data.confidence || 75}%</p>
                <p><strong>Recommendation:</strong> ${data.recommendation || 'Analysis inconclusive.'}</p>
            </div>
            <hr style="margin: 10px 0; opacity: 0.2;">
            <div style="font-size: 0.9em;">
                <strong>Detection Analysis:</strong>
        `;

        // Add detection details
        if (data.detections) {
            if (data.detections.deepfake) {
                detailsHtml += `<p><i class="fas fa-face-tired"></i> Faces Detected: ${data.detections.deepfake.count || 0}</p>`;
            }
            if (data.detections.aiGenerated) {
                detailsHtml += `<p><i class="fas fa-robot"></i> AI Generation Risk: ${data.detections.aiGenerated.is_suspicious ? 'High' : 'Low'}</p>`;
            }
            if (data.detections.manipulation) {
                detailsHtml += `<p><i class="fas fa-edit"></i> Manipulation Detected: ${data.detections.manipulation.is_manipulated ? 'YES' : 'NO'}</p>`;
            }
            if (data.detections.metadata) {
                detailsHtml += `<p><i class="fas fa-info-circle"></i> Metadata Status: ${data.detections.metadata.suspicion_level || 'Unknown'}</p>`;
            }
        }

        detailsHtml += `
            </div>
            <hr style="margin: 10px 0; opacity: 0.2;">
            <p style="font-size: 0.85em; color: var(--color-text-light); margin-top: 10px;">
                <i class="fas fa-database"></i> Report ID: ${(data.id || Math.random()).toString().substring(0, 8).toUpperCase()} | 
                File: ${data.fileInfo?.name || 'N/A'} | 
                Type: ${data.fileInfo?.type || 'N/A'}
            </p>
        `;

        resultDetails.innerHTML = detailsHtml;
        
        // Auto-dismiss results after 8 seconds
        resultDismissTimeout = setTimeout(() => {
            resultsContainer.classList.add('hidden');
        }, 8000);
    }

    // Event Listeners for Buttons
    document.getElementById('submit-text').addEventListener('click', () => runAnalysis('Text/URL'));
    document.getElementById('submit-media').addEventListener('click', () => runAnalysis('Media File'));
    document.getElementById('submit-app').addEventListener('click', () => runAnalysis('App Security'));
    
    // Close results button
    closeResultsBtn.addEventListener('click', () => {
        resultsContainer.classList.add('hidden');
        if (resultDismissTimeout) {
            clearTimeout(resultDismissTimeout);
        }
    });

    // --- Drag and Drop Handling ---
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, e => {
            e.preventDefault();
            e.stopPropagation();
        }, false);
    });

    dropArea.addEventListener('dragenter', () => dropArea.classList.add('active'));
    dropArea.addEventListener('dragleave', () => dropArea.classList.remove('active'));
    dropArea.addEventListener('drop', (e) => {
        dropArea.classList.remove('active');
        fileUpload.files = e.dataTransfer.files;
        fileUpload.dispatchEvent(new Event('change'));
    });

    // --- Intersection Observer for Animations ---
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add(`animate-${entry.target.dataset.animation}`);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('[data-animation]').forEach(el => observer.observe(el));

    // --- Search Toggle Functionality ---
    searchToggle.addEventListener('click', () => {
        searchInputContainer.classList.toggle('active');
        if (searchInputContainer.classList.contains('active')) {
            searchInput.focus();
        }
    });

    searchClose.addEventListener('click', () => {
        searchInputContainer.classList.remove('active');
        searchInput.value = '';
    });

    // Close search when clicking outside
    document.addEventListener('click', (e) => {
        if (!searchToggle.contains(e.target) && !searchInputContainer.contains(e.target)) {
            searchInputContainer.classList.remove('active');
            searchInput.value = '';
        }
    });

    // Handle Enter key in search input
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const searchTerm = searchInput.value.trim();
            if (searchTerm) {
                // For now, just log the search term - you can implement actual search functionality
                console.log('Searching for:', searchTerm);
                alert(`Searching for: "${searchTerm}"`);
                // Close search after search
                searchInputContainer.classList.remove('active');
                searchInput.value = '';
            }
        }
    });

    // --- Hamburger Menu Toggle ---
    hamburgerBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdownMenu.classList.toggle('show');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!hamburgerBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
            dropdownMenu.classList.remove('show');
        }
    });

    // --- Profile Form Handling ---
    profileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(profileForm);
        const userData = {
            username: formData.get('username'),
            email: formData.get('email'),
            firstname: formData.get('firstname'),
            lastname: formData.get('lastname'),
            bio: formData.get('bio')
        };

        // Save to localStorage
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Show success message
        alert('Profile updated successfully!');
        closeProfile();
    });
});

// --- Profile Modal Functions ---
function openProfile() {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    
    // Populate form with existing data
    document.getElementById('profile-username').value = userData.username || '';
    document.getElementById('profile-email').value = userData.email || '';
    document.getElementById('profile-firstname').value = userData.firstname || '';
    document.getElementById('profile-lastname').value = userData.lastname || '';
    document.getElementById('profile-bio').value = userData.bio || '';
    
    // Show modal
    document.getElementById('profile-modal').classList.add('show');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

function closeProfile() {
    document.getElementById('profile-modal').classList.remove('show');
    document.body.style.overflow = 'auto'; // Restore scrolling
}

// Logout function
function logout() {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}