document.addEventListener('DOMContentLoaded', () => {
const user = localStorage.getItem("username");

if (user) {
    document.getElementById("user-name").textContent = user;
}
    // --- Layout Selectors ---
    const segmentBtns = document.querySelectorAll('.segment-btn');
    segmentBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            segmentBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // --- DOM Elements for Analysis ---
    const analyzeBtn = document.getElementById('analyze-btn');
    const citySelect = document.getElementById('city-select');

    const percentageText = document.querySelector('.percentage');
    const scoreCircle = document.querySelector('.circle');
    const riskBadge = document.getElementById('risk-badge');
    const daySafetyInfo = document.getElementById('day-safety');
    const nightSafetyInfo = document.getElementById('night-safety');
    const aiText = document.getElementById('ai-text');

    const safeRoutesList = document.getElementById('safe-routes-list');
    const unsafeRoutesList = document.getElementById('unsafe-routes-list');
    const nearbyPlacesList = document.getElementById('nearby-places-list');
    const verifiedContainer = document.getElementById('verified-items-container');

    // --- Fetch & Update UI ---
    if (analyzeBtn && citySelect) {
        analyzeBtn.addEventListener('click', async () => {
            const city = citySelect.value;
            if (!city) {
                alert("Please select a destination first.");
                return;
            }

            // Loading state
            const origBtnHtml = analyzeBtn.innerHTML;
            analyzeBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Analyzing';
            analyzeBtn.disabled = true;

            try {
                const response = await fetch('/analyze', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ city: city })
                });

                const result = await response.json();

                if (result.success) {
                    const data = result.data;

                    // 1. Circle & Score
                    scoreCircle.style.strokeDasharray = '0, 100'; // Reset
                    setTimeout(() => {
                        scoreCircle.style.strokeDasharray = `${data.score}, 100`;
                        if (data.score >= 80) scoreCircle.style.stroke = 'var(--safe-color)';
                        else if (data.score >= 60) scoreCircle.style.stroke = 'var(--warn-color)';
                        else scoreCircle.style.stroke = 'var(--danger-color)';

                        percentageText.textContent = `${data.score}%`;
                    }, 50);

                    // 2. Risk Badge
                    riskBadge.textContent = `${data.risk} Risk`;
                    riskBadge.className = 'risk-badge';
                    if (data.score >= 80) riskBadge.classList.add('badge-low');
                    else if (data.score >= 60) riskBadge.classList.add('badge-mod');
                    else riskBadge.classList.add('badge-high');

                    // 3. AI & Time Safety
                    aiText.textContent = data.ai_recommendation;
                    daySafetyInfo.textContent = data.day_safety;
                    nightSafetyInfo.textContent = data.night_safety;

                    // 4. Routes
                    safeRoutesList.innerHTML = data.safe_routes.map(r => `<li>${r}</li>`).join('');
                    unsafeRoutesList.innerHTML = data.unsafe_areas.map(r => `<li>${r}</li>`).join('');

                    // 5. Places
                    const iconMap = { 'Police': 'fa-building-shield', 'Hospital': 'fa-hospital' };
                    nearbyPlacesList.innerHTML = data.nearby_places.map(p => `
                        <div class="partner-card" style="padding: 0.8rem; background: rgba(255,255,255,0.03);">
                            <div class="partner-icon" style="width: 35px; height: 35px; font-size:1rem; border-radius: 8px;">
                                <i class="fa-solid ${iconMap[p.type] || 'fa-map-pin'}"></i>
                            </div>
                            <div style="flex:1;">
                                <strong style="font-size:0.9rem;">${p.name}</strong>
                            </div>
                            <span style="font-size:0.8rem; background:rgba(0,0,0,0.5); padding: 0.2rem 0.5rem; border-radius: 4px;">${p.distance}</span>
                        </div>
                    `).join('');

                    // 6. Verified Transport & Accommodation
                    let verifiedHtml = '';
                    data.verified_transport.forEach(t => {
                        verifiedHtml += `
                        <div class="partner-card">
                            <div class="partner-icon"><i class="fa-solid fa-taxi"></i></div>
                            <div>
                                <strong>${t.name}</strong>
                                <span>${t.desc}</span>
                            </div>
                        </div>`;
                    });
                    data.accommodations.forEach(a => {
                        verifiedHtml += `
                        <div class="partner-card">
                            <div class="partner-icon"><i class="fa-solid fa-bed"></i></div>
                            <div>
                                <strong>${a.name}</strong>
                                <span>${a.desc} · ${a.location}</span>
                            </div>
                        </div>`;
                    });
                    verifiedContainer.innerHTML = verifiedHtml;

                } else {
                    alert(result.message);
                }

            } catch (err) {
                console.error("Analysis failed:", err);
                alert("Server connection failed. Is app.py running?");
            } finally {
                analyzeBtn.innerHTML = origBtnHtml;
                analyzeBtn.disabled = false;
            }
        });
    }

    // --- SOS Interactivity ---
    const sosBtn = document.getElementById('sos-btn');
    const sosModal = document.getElementById('sos-modal');
    const cancelSosBtn = document.getElementById('btn-cancel-sos');
    const confirmSosBtn = document.getElementById('btn-confirm-sos');
    const lastSosTime = document.getElementById('last-sos-time');

    let countdownInterval;

    if (sosBtn && sosModal) {
        sosBtn.addEventListener('click', () => {
            sosModal.classList.add('active');
            let count = 10;
            cancelSosBtn.textContent = `Abort (${count}s)`;
            cancelSosBtn.disabled = false;

            countdownInterval = setInterval(() => {
                count--;
                cancelSosBtn.textContent = `Abort (${count}s)`;
                if (count <= 0) {
                    clearInterval(countdownInterval);
                    triggerEmergency();
                }
            }, 1000);
        });
    }

    if (cancelSosBtn) {
        cancelSosBtn.addEventListener('click', () => {
            clearInterval(countdownInterval);
            sosModal.classList.remove('active');
        });
    }

    if (confirmSosBtn) {
        confirmSosBtn.addEventListener('click', () => {
            clearInterval(countdownInterval);
            triggerEmergency();
        });
    }

    async function triggerEmergency() {
        confirmSosBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Dispatching...';
        confirmSosBtn.disabled = true;
        cancelSosBtn.disabled = true;

        try {
            const resp = await fetch('/sos', { method: 'POST' });
            const result = await resp.json();

            if (result.success) {
                const now = new Date();
                const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                lastSosTime.textContent = timeString;

                // Update Modal to Success State
                const modalDiv = document.querySelector('.modal-card');
                modalDiv.innerHTML = `
                    <div class="modal-icon-container" style="color: var(--safe-color); background: rgba(16, 185, 129, 0.1); animation: none; border: 1px solid var(--safe-color);">
                        <i class="fa-solid fa-check"></i>
                    </div>
                    <h2 class="modal-title" style="color: var(--safe-color);">SECURE SIGNAL SENT</h2>
                    <p class="modal-desc" style="margin-bottom:2rem;">${result.message}</p>
                    <button class="btn" style="width:100%; border:1px solid var(--border-light); background:rgba(255,255,255,0.05); color:#fff; padding:1rem;" onclick="document.getElementById('sos-modal').classList.remove('active'); setTimeout(()=>window.location.reload(),300)">Acknowledge</button>
                `;
            }
        } catch (err) {
            console.error(err);
            alert("Failed to send SOS. Check network.");
            confirmSosBtn.innerHTML = 'Confirm Immediate';
            confirmSosBtn.disabled = false;
            cancelSosBtn.disabled = false;
        }
    }
});
let map;
let marker;

function startTracking() {
    if (!navigator.geolocation) {
        alert("Geolocation not supported");
        return;
    }

    navigator.geolocation.getCurrentPosition(position => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        // If map already exists → just update
        if (map) {
            map.setView([lat, lon], 15);
            marker.setLatLng([lat, lon]);
            return;
        }

        // Create map
        map = L.map('map').setView([lat, lon], 15);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap'
        }).addTo(map);

        marker = L.marker([lat, lon]).addTo(map)
            .bindPopup("You are here")
            .openPopup();

    }, error => {
        alert("Location access denied");
        console.error(error);
    });
}
function showSection(section) {

    document.getElementById('home-section').style.display = 'none';
    document.getElementById('planner-section').style.display = 'none';
    document.getElementById('guide-section').style.display = 'none';

    document.getElementById(section + '-section').style.display = 'block';

    // Fix map issue
    if (section === 'planner') {
        setTimeout(() => {
            if (window.map) {
                map.invalidateSize();
            }
        }, 300);
    }
}
window.onload = function () {
    const user = localStorage.getItem("username");

    if (user) {
        const userElement = document.getElementById("user-name");
        if (userElement) {
            userElement.textContent = user;
        }
    }
};
function loginUser() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    if (username === "" || password === "") {
        alert("Please enter username and password");
        return;
    }

    // Save username in browser
    localStorage.setItem("username", username);

    alert("Successfully Logged In ✅");

    // Redirect to home page
    window.location.href = "/";
}