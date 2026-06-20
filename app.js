const appFolders = [
    'grade12_assist',
    'music_app',
    'study_app'
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
            return {
                ...data,
                folder: folder,
                iconPath: `download/${folder}/icon.png`,
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
    document.getElementById('detail-icon').src = app.iconPath;
    document.getElementById('detail-icon').onerror = function() {
        this.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzMzIi8+PC9zdmc+';
    };

    document.getElementById('detail-name').textContent = app.name;
    document.getElementById('detail-developer').textContent = app.developer;
    document.getElementById('detail-version').textContent = `v${app.version}`;
    document.getElementById('detail-description').textContent = app.description;

    const downloadBtn = document.getElementById('detail-download-btn');
    downloadBtn.href = app.apkPath;
    downloadBtn.setAttribute('download', `${app.folder}.apk`);

    // Load Screenshots
    const gallery = document.getElementById('screenshots-gallery');
    gallery.innerHTML = '';

    let picIndex = 1;
    let foundMore = true;

    while (foundMore) {
        const picUrl = `download/${app.folder}/pic${picIndex}.png`;
        const exists = await checkImageExists(picUrl);

        if (exists) {
            const img = document.createElement('img');
            img.src = picUrl;
            img.className = 'screenshot';
            img.alt = `${app.name} screenshot ${picIndex}`;
            gallery.appendChild(img);
            picIndex++;
        } else {
            foundMore = false;
        }

        // Safety break
        if(picIndex > 20) break;
    }

    if (gallery.innerHTML === '') {
        gallery.innerHTML = '<p class="text-muted">No screenshots available.</p>';
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

// Helper to check if an image URL returns a valid image without errors
function checkImageExists(url) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = url;
    });
}
