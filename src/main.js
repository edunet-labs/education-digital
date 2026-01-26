/* ======================================
   Boetoenux Main JavaScript
   Core functionality for the website
   ====================================== */

// ===== Theme Toggle =====
// Initialize theme immediately to prevent flash
(function () {
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = savedTheme || (prefersDark ? 'dark' : 'dark'); // Default to dark
  document.documentElement.setAttribute('data-theme', theme);
})();

// Theme toggle functionality
const themeToggle = document.getElementById('themeToggle');

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  });
}

// Navigation Toggle
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');

if (navToggle && navMenu) {
  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navMenu.classList.toggle('active');
  });

  // Close menu when clicking on a link
  const navLinks = navMenu.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navToggle.classList.remove('active');
      navMenu.classList.remove('active');
    });
  });
}

// Search Modal
const searchBtn = document.getElementById('searchBtn');
const searchModal = document.getElementById('searchModal');
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');

// Search data - all materials
const searchData = [
  // Kelas 10
  { title: 'K3LH & Keselamatan Kerja', category: 'Kelas 10', url: '/kelas-10.html#k3lh', keywords: 'keselamatan kesehatan lingkungan kerja' },
  { title: 'Perakitan & Perawatan PC', category: 'Kelas 10', url: '/kelas-10.html#perakitan', keywords: 'komputer merakit komponen' },
  { title: 'Dasar-Dasar Jaringan', category: 'Kelas 10', url: '/kelas-10.html#jaringan', keywords: 'network topologi osi tcp ip' },
  { title: 'Sistem Operasi', category: 'Kelas 10', url: '/kelas-10.html#os', keywords: 'windows linux ubuntu debian' },

  // Kelas 11
  { title: 'Dasar Routing & Switching', category: 'Kelas 11', url: '/kelas-11.html#routing', keywords: 'router switch gateway' },
  { title: 'VLAN Configuration', category: 'Kelas 11', url: '/kelas-11.html#vlan', keywords: 'virtual lan trunk access' },
  { title: 'Manajemen Bandwidth', category: 'Kelas 11', url: '/kelas-11.html#bandwidth', keywords: 'qos queue traffic shaping' },
  { title: 'Wireless Network', category: 'Kelas 11', url: '/kelas-11.html#wireless', keywords: 'wifi hotspot access point' },

  // AIJ
  { title: 'Konfigurasi MikroTik', category: 'AIJ', url: '/aij.html#mikrotik', keywords: 'routerboard routeros winbox' },
  { title: 'Routing OSPF', category: 'AIJ', url: '/aij.html#ospf', keywords: 'dynamic routing protocol area' },
  { title: 'Routing BGP', category: 'AIJ', url: '/aij.html#bgp', keywords: 'border gateway autonomous system' },
  { title: 'Firewall Filter Rules', category: 'AIJ', url: '/aij.html#firewall', keywords: 'nat mangle chain accept drop' },
  { title: 'Queue Tree', category: 'AIJ', url: '/aij.html#queue', keywords: 'bandwidth management htb pcq' },

  // ASJ
  { title: 'Instalasi Linux Server', category: 'ASJ', url: '/asj.html#linux', keywords: 'debian ubuntu centos server' },
  { title: 'Web Server Apache/Nginx', category: 'ASJ', url: '/asj.html#webserver', keywords: 'http https virtual host' },
  { title: 'DNS Server', category: 'ASJ', url: '/asj.html#dns', keywords: 'bind domain name resolution' },
  { title: 'Mail Server', category: 'ASJ', url: '/asj.html#mail', keywords: 'postfix dovecot smtp imap' },
  { title: 'Database Server', category: 'ASJ', url: '/asj.html#database', keywords: 'mysql mariadb postgresql' },
  { title: 'FTP Server', category: 'ASJ', url: '/asj.html#ftp', keywords: 'proftpd vsftpd file transfer' },

  // KJ
  { title: 'Cyber Security Fundamentals', category: 'KJ', url: '/kj.html#fundamental', keywords: 'keamanan siber dasar' },
  { title: 'Iptables Firewall', category: 'KJ', url: '/kj.html#iptables', keywords: 'linux firewall rules chain' },
  { title: 'IDS/IPS Systems', category: 'KJ', url: '/kj.html#ids', keywords: 'snort suricata intrusion detection' },
  { title: 'VPN Configuration', category: 'KJ', url: '/kj.html#vpn', keywords: 'openvpn wireguard tunnel' },
  { title: 'Server Hardening', category: 'KJ', url: '/kj.html#hardening', keywords: 'security audit fail2ban' },

  // Lab Virtual
  { title: 'Cisco Packet Tracer', category: 'Lab Virtual', url: '/lab-virtual.html#packet-tracer', keywords: 'simulator cisco network' },
  { title: 'GNS3', category: 'Lab Virtual', url: '/lab-virtual.html#gns3', keywords: 'emulator router' },
  { title: 'PNETLab', category: 'Lab Virtual', url: '/lab-virtual.html#pnetlab', keywords: 'eve-ng lab virtual' },
];

if (searchBtn && searchModal) {
  // Open search
  searchBtn.addEventListener('click', () => {
    searchModal.classList.add('active');
    searchInput.focus();
  });

  // Close search on overlay click
  const searchOverlay = searchModal.querySelector('.search-overlay');
  searchOverlay.addEventListener('click', closeSearch);

  // Close on ESC key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && searchModal.classList.contains('active')) {
      closeSearch();
    }
    // Open with Ctrl+K
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      searchModal.classList.add('active');
      searchInput.focus();
    }
  });

  // Search functionality
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();

    if (query.length < 2) {
      searchResults.innerHTML = `
        <div class="search-hint">
          <p>Mulai ketik untuk mencari materi...</p>
        </div>
      `;
      return;
    }

    const results = searchData.filter(item =>
      item.title.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query) ||
      item.keywords.toLowerCase().includes(query)
    );

    if (results.length === 0) {
      searchResults.innerHTML = `
        <div class="search-hint">
          <p>Tidak ada hasil untuk "${query}"</p>
        </div>
      `;
      return;
    }

    searchResults.innerHTML = results.map(item => `
      <a href="${item.url}" class="search-result-item">
        <div class="result-info">
          <span class="result-title">${item.title}</span>
          <span class="result-category">${item.category}</span>
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </a>
    `).join('');
  });
}

function closeSearch() {
  searchModal.classList.remove('active');
  searchInput.value = '';
  searchResults.innerHTML = `
    <div class="search-hint">
      <p>Mulai ketik untuk mencari materi...</p>
    </div>
  `;
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (href === '#') return;

    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// Add animation on scroll
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('animate-in');
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

// Observe elements with animation classes
document.querySelectorAll('.feature-card, .class-card, .tool-card').forEach(el => {
  el.classList.add('animate-on-scroll');
  observer.observe(el);
});

// Code block copy functionality
function initCodeBlocks() {
  document.querySelectorAll('.code-block').forEach(block => {
    const code = block.querySelector('code');
    const copyBtn = block.querySelector('.copy-btn');

    if (copyBtn && code) {
      copyBtn.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(code.textContent);
          copyBtn.classList.add('copied');
          copyBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span>Copied!</span>
          `;
          setTimeout(() => {
            copyBtn.classList.remove('copied');
            copyBtn.innerHTML = `
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              <span>Copy</span>
            `;
          }, 2000);
        } catch (err) {
          console.error('Failed to copy:', err);
        }
      });
    }
  });
}

// Initialize code blocks
document.addEventListener('DOMContentLoaded', initCodeBlocks);

// Active nav link based on current page
const currentPath = window.location.pathname;
document.querySelectorAll('.nav-link').forEach(link => {
  const href = link.getAttribute('href');
  if (href === currentPath || (currentPath === '/' && href === '/') ||
    (currentPath.includes(href) && href !== '/')) {
    link.classList.add('active');
  } else if (currentPath !== '/' && href === '/') {
    link.classList.remove('active');
  }
});

// Console easter egg
console.log('%c⌘ Boetoenux', 'font-size: 24px; font-weight: bold; color: #00ffc8;');
console.log('%cKuasai Jaringan, Taklukkan Masa Depan!', 'font-size: 14px; color: #9ca3af;');
console.log('%cBuilt with 💚 for Indonesian students', 'font-size: 12px; color: #6b7280;');
