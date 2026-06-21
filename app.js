const appFolders = [
    'grade12_assist',
    'music_app',
    'study_app',
    'nmu_books_market',
    'dtech_quizzes'
];

let appsData = [];

document.addEventListener('DOMContentLoaded', initApp);

async function initApp() {
    setupNavigation();
    await loadAppsData();
    renderHomepage();
}

function setupNavigation() {
    document.getElementById('home-link').addEventListener('click', showHomepage);
    document.getElementById('back-button').addEventListener('click', showHomepage);
}

async function loadAppsData() {
    const promises = appFolders.map(async (folder) => {
        try {
            const response = await fetch(`download/${folder}/details.json`);
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();

            let iconPath = await findExistingImage(`download/${folder}`, 'icon');
            if (!iconPath) {
                iconPath = `download/${folder}/icon.png`; // Fallback to trigger onerror
            }

            return {
                ...data,
                folder: folder,
                iconPath: iconPath,
                apkPath: `download/${folder}/${folder}.apk`
            };
        } catch (error) {
            console.error(`Failed to load data for ${folder}:`, error);
            return null;
        }
    });

    const results = await Promise.all(promises);
    appsData = results.filter(app => app !== null);
}

function renderHomepage() {
    const grid = document.getElementById('app-grid');
    grid.innerHTML = '';

    appsData.forEach(app => {
        const card = document.createElement('div');
        card.className = 'app-card';
        card.onclick = () => showAppDetails(app);

        card.innerHTML = `
            <div class="app-card-header">
                <img src="${app.iconPath}" alt="${app.name} icon" class="app-icon" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2NCIgaGVpZ2h0PSI2NCI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iIzMzMyIvPjwvc3ZnPg=='">
                <div>
                    <h3 class="app-card-title">${app.name}</h3>
                    <span class="app-card-version">v${app.version}</span>
                </div>
            </div>
            <p class="app-card-desc">${app.shortDescription}</p>
            <button class="btn btn-primary" onclick="event.stopPropagation(); window.location.href='${app.apkPath}'">Download</button>
        `;

        grid.appendChild(card);
    });
}

async function showAppDetails(app) {
    // Update Details Info
    const detailIcon = document.getElementById('detail-icon');
    detailIcon.src = app.iconPath;
    detailIcon.onerror = function() {
        this.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzMzIi8+PC9zdmc+';
    };
    detailIcon.style.cursor = 'pointer';
    detailIcon.onclick = () => openImageModal(detailIcon.src);

    document.getElementById('detail-name').textContent = app.name;
    document.getElementById('detail-developer').textContent = app.developer;
    document.getElementById('detail-version').textContent = `v${app.version}`;
    document.getElementById('detail-description').textContent = app.description;

    const categoryEl = document.getElementById('detail-category');
    if (app.category) {
        categoryEl.textContent = app.category;
        categoryEl.style.display = 'block';
    } else {
        categoryEl.style.display = 'none';
    }

    const downloadBtn = document.getElementById('detail-download-btn');
    downloadBtn.href = app.apkPath;
    downloadBtn.setAttribute('download', `${app.folder}.apk`);

    // Load Screenshots
    const gallery = document.getElementById('screenshots-gallery');
    gallery.innerHTML = '';

    let picIndex = 1;
    const maxSearchLimit = 30; // Search up to pic30
    let lastFoundIndex = 0;
    const foundImages = {};

    // First pass: find all existing images
    const searchPromises = [];
    for (let i = 1; i <= maxSearchLimit; i++) {
        searchPromises.push(
            findExistingImage(`download/${app.folder}`, `pic${i}`).then(picUrl => {
                if (picUrl) {
                    foundImages[i] = picUrl;
                    if (i > lastFoundIndex) {
                        lastFoundIndex = i;
                    }
                }
            })
        );
    }
    await Promise.all(searchPromises);

    // Second pass: render images and placeholders up to the last found index
    for (let i = 1; i <= lastFoundIndex; i++) {
        const img = document.createElement('img');
        img.className = 'screenshot';
        img.alt = `${app.name} screenshot ${i}`;

        if (foundImages[i]) {
            img.src = foundImages[i];
            img.style.cursor = 'pointer';
            img.onclick = () => openImageModal(img.src);
        } else {
            // Placeholder for missing numbers in sequence
            img.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMjAwIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzMzIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZpbGw9IiM3NzciIGZvbnQtc2l6ZT0iMjQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGFsaWdubWVudC1iYXNlbGluZT0ibWlkZGxlIj4/PC90ZXh0Pjwvc3ZnPg==';
            img.style.opacity = '0.5';
            img.alt = `Screenshot ${i} unavailable`;
        }
        gallery.appendChild(img);
    }

    if (lastFoundIndex === 0) {
        gallery.innerHTML = '<p class="text-muted">No screenshots available.</p>';
    }

    // Load Dynamic Sections
    const dynamicSections = document.getElementById('detail-dynamic-sections');
    dynamicSections.innerHTML = ''; // Clear previous sections

    if (app.whatsNew && app.whatsNew.length > 0) {
        dynamicSections.innerHTML += `
            <div class="dynamic-section my-4">
                <h3>What's New</h3>
                <ul>
                    ${app.whatsNew.map(item => `<li>${item}</li>`).join('')}
                </ul>
            </div>
        `;
    }

    if (app.keyFeatures && app.keyFeatures.length > 0) {
        dynamicSections.innerHTML += `
            <div class="dynamic-section my-4">
                <h3>Key Features</h3>
                <ul class="feature-list">
                    ${app.keyFeatures.map(item => `<li>${item}</li>`).join('')}
                </ul>
            </div>
        `;
    }

    if (app.permissions && app.permissions.length > 0) {
        dynamicSections.innerHTML += `
            <div class="dynamic-section my-4">
                <h3>Permissions</h3>
                <ul>
                    ${app.permissions.map(item => `<li>${item}</li>`).join('')}
                </ul>
            </div>
        `;
    }

    if (app.tags && app.tags.length > 0) {
        dynamicSections.innerHTML += `
            <div class="dynamic-section tags-section my-4">
                <h3>Tags</h3>
                <div class="tags-container">
                    ${app.tags.map(tag => `<span class="badge tag-badge">${tag}</span>`).join('')}
                </div>
            </div>
        `;
    }

    // Switch View
    document.getElementById('homepage').classList.remove('active');
    document.getElementById('app-details').classList.add('active');
    window.scrollTo(0, 0);

    // Update Document Title
    document.title = `${app.name} - DTECH Apps Store`;
}

function showHomepage() {
    document.getElementById('app-details').classList.remove('active');
    document.getElementById('homepage').classList.add('active');
    document.title = 'DTECH Apps Store';
    window.scrollTo(0, 0);
}

function openImageModal(src) {
    const modal = document.getElementById('image-modal');
    const modalImg = document.getElementById('modal-img');
    const closeBtn = document.getElementsByClassName('close-modal')[0];

    modal.style.display = 'flex';
    modalImg.src = src;

    closeBtn.onclick = function() {
        modal.style.display = 'none';
    }

    modal.onclick = function(e) {
        if (e.target !== modalImg) {
            modal.style.display = 'none';
        }
    }
}

// Helper to check if an image URL returns a valid image without errors
function checkImageExists(url) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = url;
    });
}

// Helper to find the first existing image from a list of extensions
async function findExistingImage(basePath, name) {
    const extensions = ['.png', '.jpg', '.jpeg', '.webp'];
    for (const ext of extensions) {
        const url = `${basePath}/${name}${ext}`;
        if (await checkImageExists(url)) {
            return url;
        }
    }
    return null;
}
