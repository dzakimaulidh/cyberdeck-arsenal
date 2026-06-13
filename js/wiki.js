



// SEARCH PLAYBOOKS
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('wiki-search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            filterPlaybooks(query, getCurrentFilter());
        });
    }

    // Load read status
    loadReadStatus();
    updateReadCount();
});

// FILTER PLAYBOOKS
let currentFilter = 'all';

document.addEventListener('click', (e) => {
    if (e.target.classList.contains('wiki-filter-btn')) {
        // Remove active from all
        document.querySelectorAll('.wiki-filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        // Add active to clicked
        e.target.classList.add('active');
        
        currentFilter = e.target.dataset.filter;
        const searchInput = document.getElementById('wiki-search-input');
        const query = searchInput ? searchInput.value.toLowerCase() : '';
        filterPlaybooks(query, currentFilter);
    }
});

function getCurrentFilter() {
    const activeBtn = document.querySelector('.wiki-filter-btn.active');
    return activeBtn ? activeBtn.dataset.filter : 'all';
}

function filterPlaybooks(query, filter) {
    const playbooks = document.querySelectorAll('.playbook-item');
    let visibleCount = 0;

    playbooks.forEach(playbook => {
        const title = playbook.dataset.title.toLowerCase();
        const category = playbook.dataset.category;
        const content = playbook.querySelector('.playbook-content').textContent.toLowerCase();

        const matchesSearch = !query || title.includes(query) || content.includes(query);
        const matchesFilter = filter === 'all' || category === filter;

        if (matchesSearch && matchesFilter) {
            playbook.style.display = '';
            visibleCount++;
        } else {
            playbook.style.display = 'none';
        }
    });

    // Show/hide no results message
    const noResults = document.getElementById('wiki-no-results');
    if (noResults) {
        noResults.style.display = visibleCount === 0 ? 'block' : 'none';
    }
}

// EXPAND/COLLAPSE ALL
function expandAllPlaybooks() {
    document.querySelectorAll('.playbook-item').forEach(item => {
        const content = item.querySelector('.playbook-content');
        const toggle = item.querySelector('.playbook-toggle');
        if (content && toggle) {
            content.classList.add('open');
            toggle.textContent = '[-]';
        }
    });
    showToast('All playbooks expanded', 'success');
}

function collapseAllPlaybooks() {
    document.querySelectorAll('.playbook-item').forEach(item => {
        const content = item.querySelector('.playbook-content');
        const toggle = item.querySelector('.playbook-toggle');
        if (content && toggle) {
            content.classList.remove('open');
            toggle.textContent = '[+]';
        }
    });
    showToast('All playbooks collapsed', 'info');
}

// MARK AS READ
function markAsRead(event, btn) {
    event.stopPropagation();
    
    const playbookItem = btn.closest('.playbook-item');
    const title = playbookItem.dataset.title;
    
    // Toggle read status
    const isRead = playbookItem.classList.toggle('read');
    btn.classList.toggle('read');
    
    // Update icon
    const icon = btn.querySelector('i');
    if (isRead) {
        icon.className = 'fa-solid fa-circle-check';
        showToast(`"${title}" marked as read`, 'success');
    } else {
        icon.className = 'fa-regular fa-circle';
        showToast(`"${title}" marked as unread`, 'info');
    }
    
    // Save to localStorage
    saveReadStatus();
    updateReadCount();
}

function saveReadStatus() {
    const readPlaybooks = [];
    document.querySelectorAll('.playbook-item.read').forEach(item => {
        readPlaybooks.push(item.dataset.title);
    });
    localStorage.setItem('wiki_read_playbooks', JSON.stringify(readPlaybooks));
}

function loadReadStatus() {
    const readPlaybooks = JSON.parse(localStorage.getItem('wiki_read_playbooks') || '[]');
    
    readPlaybooks.forEach(title => {
        const playbook = document.querySelector(`.playbook-item[data-title="${title}"]`);
        if (playbook) {
            playbook.classList.add('read');
            const btn = playbook.querySelector('.playbook-read-btn');
            if (btn) {
                btn.classList.add('read');
                const icon = btn.querySelector('i');
                if (icon) icon.className = 'fa-solid fa-circle-check';
            }
        }
    });
}

function updateReadCount() {
    const count = document.querySelectorAll('.playbook-item.read').length;
    const countElement = document.getElementById('read-count');
    if (countElement) {
        countElement.textContent = count;
    }
}

// COPY CODE BLOCK
function copyCodeBlock(btn) {
    const codeBlock = btn.closest('.code-block');
    const code = codeBlock.querySelector('code').textContent;
    
    navigator.clipboard.writeText(code).then(() => {
        const originalHTML = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
        btn.style.background = 'var(--success)';
        btn.style.borderColor = 'var(--success)';
        
        setTimeout(() => {
            btn.innerHTML = originalHTML;
            btn.style.background = '';
            btn.style.borderColor = '';
        }, 2000);
        
        showToast('Code copied to clipboard', 'success');
    }).catch(() => {
        showToast('Failed to copy code', 'error');
    });
}

// TOAST NOTIFICATION (Fallback)
function showToast(message, type = 'info') {
    if (typeof window.showToast === 'function') {
        window.showToast(message, type);
    } else {
        console.log(`[${type.toUpperCase()}] ${message}`);
    }
}