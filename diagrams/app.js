/**
 * Enterprise AML Platform — Diagrams & Architecture Hub
 * Interactive Controller (Vanilla JS)
 */

// Active SVG State tracking
let currentActiveSvg = 'assets/system_architecture_8layers.svg';

const tabTitles = {
  architecture: 'System Architecture & Topologies',
  dfd: 'Data Flow Diagrams (DFD) — Levels 0, 1 & 2',
  uml: 'Unified Modeling Language (UML) Specifications',
  literature: 'Literature Survey & Evolutionary Typology'
};

/**
 * Switch primary navigation tab
 * @param {string} tabId - 'architecture' | 'dfd' | 'uml' | 'literature'
 */
function switchTab(tabId) {
  // 1. Update Sidebar Nav Active State
  const navItems = document.querySelectorAll('.sidebar-nav .nav-item[data-tab]');
  navItems.forEach(item => {
    if (item.getAttribute('data-tab') === tabId) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  // 2. Update Tab Pane Active State
  const tabPanes = document.querySelectorAll('.tab-pane');
  tabPanes.forEach(pane => {
    if (pane.id === `tab-${tabId}`) {
      pane.classList.add('active');
    } else {
      pane.classList.remove('active');
    }
  });

  // 3. Update Page Title
  const titleElem = document.getElementById('pageTitle');
  if (titleElem && tabTitles[tabId]) {
    titleElem.textContent = tabTitles[tabId];
  }

  // 4. Update current active SVG for raw viewer button
  if (tabId === 'architecture') {
    currentActiveSvg = document.getElementById('arch-viewer')?.getAttribute('src') || 'assets/system_architecture_8layers.svg';
  } else if (tabId === 'dfd') {
    currentActiveSvg = document.getElementById('dfd-viewer')?.getAttribute('src') || 'assets/dfd_level_0_context.svg';
  } else if (tabId === 'uml') {
    currentActiveSvg = document.getElementById('uml-viewer')?.getAttribute('src') || 'assets/uml_use_case_diagram.svg';
  } else if (tabId === 'literature') {
    currentActiveSvg = document.getElementById('lit-viewer')?.getAttribute('src') || 'assets/aml_evolution_timeline.svg';
  }

  // Close mobile drawer if open
  const sidebar = document.getElementById('sidebar');
  if (sidebar && sidebar.classList.contains('open')) {
    sidebar.classList.remove('open');
  }
}

/**
 * Switch sub-diagram within a section
 * @param {string} viewerPrefix - 'arch' | 'dfd' | 'uml' | 'lit'
 * @param {string} svgPath - relative path to SVG
 * @param {HTMLElement} btn - button clicked
 * @param {string} titleDesc - optional description
 */
function switchSubDiagram(viewerPrefix, svgPath, btn, titleDesc) {
  const viewer = document.getElementById(`${viewerPrefix}-viewer`);
  if (!viewer) return;

  // Add subtle fade animation
  viewer.style.opacity = '0.3';
  setTimeout(() => {
    viewer.src = svgPath;
    viewer.alt = titleDesc || 'Architecture Diagram';
    viewer.style.opacity = '1';
    currentActiveSvg = svgPath;
  }, 120);

  // Update button active state within parent subnav
  const parentSubnav = btn.parentElement;
  if (parentSubnav) {
    const buttons = parentSubnav.querySelectorAll('.subnav-btn');
    buttons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  }
}

/**
 * Open currently viewed SVG directly in browser tab
 */
function openSvgInNewTab() {
  if (currentActiveSvg) {
    window.open(currentActiveSvg, '_blank');
  }
}

/**
 * Toggle responsive mobile sidebar
 */
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (sidebar) {
    sidebar.classList.toggle('open');
  }
}

/**
 * Show component details modal
 */
function showComponentDetails(title, contentHtml) {
  const modal = document.getElementById('detailModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalBody = document.getElementById('modalBody');

  if (modal && modalTitle && modalBody) {
    modalTitle.textContent = title;
    modalBody.innerHTML = contentHtml;
    modal.classList.add('active');
  }
}

/**
 * Close modal
 */
function closeModal() {
  const modal = document.getElementById('detailModal');
  if (modal) {
    modal.classList.remove('active');
  }
}

// Modal event listeners (Escape key & backdrop click)
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

document.addEventListener('click', (e) => {
  const modal = document.getElementById('detailModal');
  if (e.target === modal) {
    closeModal();
  }
});

/**
 * Ping backend health API to display live server status
 */
async function checkBackendHealth() {
  const statusDot = document.getElementById('statusDot');
  const statusText = document.getElementById('statusText');

  try {
    const response = await fetch('/api/v1/health', { method: 'GET', cache: 'no-cache' });
    if (response.ok) {
      const data = await response.json();
      if (statusDot) {
        statusDot.style.background = '#10b981';
        statusDot.style.boxShadow = '0 0 8px #10b981';
      }
      if (statusText) {
        statusText.textContent = 'API Live (200 OK)';
        statusText.style.color = '#34d399';
      }
    } else {
      throw new Error(`HTTP ${response.status}`);
    }
  } catch (err) {
    if (statusDot) {
      statusDot.style.background = '#f59e0b';
      statusDot.style.boxShadow = '0 0 8px #f59e0b';
    }
    if (statusText) {
      statusText.textContent = 'Offline / Standalone';
      statusText.style.color = '#fbbf24';
    }
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  checkBackendHealth();
  // Poll health every 15 seconds
  setInterval(checkBackendHealth, 15000);
});
