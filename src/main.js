/* ======================================
   Edunet Main JavaScript
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

// Search data - all materials from curriculum
const searchData = [
  // Kelas 10 - Dasar TKJ (8 materi sesuai kurikulum)
  { title: 'K3LH', category: 'Kelas 10', url: '/pages/kelas-10.html', keywords: 'k3lh keselamatan kesehatan lingkungan kerja safety prosedur aman' },
  { title: 'Subnetting', category: 'Kelas 10', url: '/pages/kelas-10.html', keywords: 'subnet mask ip address network cidr vlsm pembagian jaringan' },
  { title: 'Perakitan PC', category: 'Kelas 10', url: '/pages/kelas-10.html', keywords: 'merakit komputer hardware komponen motherboard cpu ram psu' },
  { title: 'Crimping Cable Straight-Cross', category: 'Kelas 10', url: '/pages/kelas-10.html', keywords: 'crimping kabel utp rj45 straight crossover t568a t568b' },
  { title: 'Gerbang Logika', category: 'Kelas 10', url: '/pages/kelas-10.html', keywords: 'gerbang logika and or not nand nor xor digital' },
  { title: 'Konversi Bilangan', category: 'Kelas 10', url: '/pages/kelas-10.html', keywords: 'konversi bilangan biner oktal desimal heksadesimal binary' },
  { title: 'Pemrograman Dasar', category: 'Kelas 10', url: '/pages/kelas-10.html', keywords: 'pemrograman algoritma flowchart pseudocode logika coding' },
  { title: 'Sistem Operasi', category: 'Kelas 10', url: '/pages/kelas-10.html', keywords: 'sistem operasi windows linux ubuntu debian instalasi os partisi' },

  // AIJ Kelas 11
  { title: 'VLAN Trunking', category: 'AIJ Kelas 11', url: '/pages/kelas-11/aij.html#vlan', keywords: 'vlan virtual lan trunk access port switch cisco managed' },
  { title: 'Routing Statis', category: 'AIJ Kelas 11', url: '/pages/kelas-11/aij.html#routing', keywords: 'routing statis static route gateway hop router mikrotik cisco' },
  { title: 'Subnetting Lanjut', category: 'AIJ Kelas 11', url: '/pages/kelas-11/aij.html#subnetting', keywords: 'subnetting vlsm supernet cidr network address broadcast' },
  { title: 'Konfigurasi Wireless', category: 'AIJ Kelas 11', url: '/pages/kelas-11/aij.html#wireless', keywords: 'wifi wireless hotspot access point wlan ssid wpa2 wpa3' },
  { title: 'InterVLAN Routing', category: 'AIJ Kelas 11', url: '/pages/kelas-11/aij.html#intervlan', keywords: 'intervlan router on stick layer 3 switch svi' },

  // ASJ Kelas 11
  { title: 'Remote Server', category: 'ASJ Kelas 11', url: '/pages/kelas-11/asj.html#remote', keywords: 'remote server ssh telnet putty vnc rdp' },
  { title: 'DHCP Server', category: 'ASJ Kelas 11', url: '/pages/kelas-11/asj.html#dhcp', keywords: 'dhcp server dynamic host configuration protocol ip otomatis lease' },
  { title: 'DNS Server', category: 'ASJ Kelas 11', url: '/pages/kelas-11/asj.html#dns', keywords: 'dns domain name system bind resolusi forward reverse zone' },
  { title: 'FTP Server', category: 'ASJ Kelas 11', url: '/pages/kelas-11/asj.html#ftp', keywords: 'ftp server file transfer protocol proftpd vsftpd upload download' },

  // KJ Kelas 11
  { title: 'Dasar Firewall', category: 'KJ Kelas 11', url: '/pages/kelas-11/kj.html#firewall', keywords: 'firewall packet filtering stateful inspection iptables windows' },
  { title: 'Pengenalan Cyber Security', category: 'KJ Kelas 11', url: '/pages/kelas-11/kj.html#cyber', keywords: 'cyber security keamanan siber cia triad awareness ancaman' },
  { title: 'Tingkatan Cyber Security', category: 'KJ Kelas 11', url: '/pages/kelas-11/kj.html#level', keywords: 'defense in depth network endpoint application security layer' },
  { title: 'Jenis Ancaman Online', category: 'KJ Kelas 11', url: '/pages/kelas-11/kj.html#threats', keywords: 'malware virus trojan ransomware phishing ddos mitm social engineering' },

  // AIJ Kelas 12
  { title: 'MikroTik RouterOS', category: 'AIJ Kelas 12', url: '/pages/kelas-12/aij.html#mikrotik', keywords: 'mikrotik routerboard routeros winbox webfig terminal' },
  { title: 'OSPF Routing', category: 'AIJ Kelas 12', url: '/pages/kelas-12/aij.html#ospf', keywords: 'ospf open shortest path first dynamic routing protocol area backbone' },
  { title: 'BGP Basics', category: 'AIJ Kelas 12', url: '/pages/kelas-12/aij.html#bgp', keywords: 'bgp border gateway protocol autonomous system ebgp ibgp isp' },
  { title: 'NAT & PAT', category: 'AIJ Kelas 12', url: '/pages/kelas-12/aij.html#nat', keywords: 'nat pat network address translation masquerade port forwarding srcnat dstnat' },
  { title: 'Bandwidth Management', category: 'AIJ Kelas 12', url: '/pages/kelas-12/aij.html#bandwidth', keywords: 'bandwidth management simple queue queue tree pcq limiter htb qos' },

  // ASJ Kelas 12
  { title: 'Instalasi Linux Server', category: 'ASJ Kelas 12', url: '/pages/kelas-12/asj.html#linux', keywords: 'linux server debian ubuntu centos rocky alma instalasi cli' },
  { title: 'Web Server Apache/Nginx', category: 'ASJ Kelas 12', url: '/pages/kelas-12/asj.html#webserver', keywords: 'web server apache nginx http https virtual host ssl' },
  { title: 'Mail Server', category: 'ASJ Kelas 12', url: '/pages/kelas-12/asj.html#mail', keywords: 'mail server postfix dovecot smtp imap pop3 email roundcube squirrelmail' },
  { title: 'Database Server MySQL', category: 'ASJ Kelas 12', url: '/pages/kelas-12/asj.html#database', keywords: 'database server mysql mariadb sql phpmyadmin query table' },
  { title: 'Samba File Server', category: 'ASJ Kelas 12', url: '/pages/kelas-12/asj.html#samba', keywords: 'samba smb cifs file sharing windows linux network drive' },
  { title: 'NFS Server', category: 'ASJ Kelas 12', url: '/pages/kelas-12/asj.html#nfs', keywords: 'nfs network file system linux unix mount share' },
  { title: 'Proxy Server Squid', category: 'ASJ Kelas 12', url: '/pages/kelas-12/asj.html#proxy', keywords: 'proxy squid cache transparent filtering acl' },
  { title: 'VPN Server', category: 'ASJ Kelas 12', url: '/pages/kelas-12/asj.html#vpn', keywords: 'vpn virtual private network openvpn pptp l2tp ipsec wireguard' },
  { title: 'Network Monitoring Zabbix', category: 'ASJ Kelas 12', url: '/pages/kelas-12/asj.html#monitoring', keywords: 'monitoring zabbix nagios grafana prometheus snmp log' },

  // KJ Kelas 12
  { title: 'Firewall Lanjutan', category: 'KJ Kelas 12', url: '/pages/kelas-12/kj.html#firewall-adv', keywords: 'firewall advanced iptables nftables rules chain policy' },
  { title: 'UFW Uncomplicated Firewall', category: 'KJ Kelas 12', url: '/pages/kelas-12/kj.html#ufw', keywords: 'ufw uncomplicated firewall ubuntu blokir ip port allow deny' },
  { title: 'Autentikasi & Otorisasi', category: 'KJ Kelas 12', url: '/pages/kelas-12/kj.html#auth', keywords: 'autentikasi otorisasi mfa radius ldap active directory pam' },
  { title: 'Kriptografi & Enkripsi', category: 'KJ Kelas 12', url: '/pages/kelas-12/kj.html#crypto', keywords: 'kriptografi enkripsi aes rsa hashing md5 sha ssl tls certificate' },
  { title: 'CIA Triad', category: 'KJ Kelas 12', url: '/pages/kelas-12/kj.html#cia', keywords: 'cia triad confidentiality integrity availability keamanan informasi' },
  { title: 'Server Hardening', category: 'KJ Kelas 12', url: '/pages/kelas-12/kj.html#hardening', keywords: 'hardening server vulnerability scanning patch management selinux apparmor' },
  { title: 'Penetration Testing', category: 'KJ Kelas 12', url: '/pages/kelas-12/kj.html#pentest', keywords: 'pentest penetration testing kali linux nmap metasploit vulnerability' },

  // Lab Virtual
  { title: 'Cisco Packet Tracer', category: 'Lab Virtual', url: '/pages/lab-virtual.html#packet-tracer', keywords: 'cisco packet tracer simulator network jaringan simulasi' },
  { title: 'GNS3', category: 'Lab Virtual', url: '/pages/lab-virtual.html#gns3', keywords: 'gns3 emulator router network virtualisasi' },
  { title: 'VirtualBox / VMware', category: 'Lab Virtual', url: '/pages/lab-virtual.html#virtualbox', keywords: 'virtualbox vmware virtual machine vm mesin virtual hypervisor' },
  { title: 'Download ISO', category: 'Lab Virtual', url: '/pages/lab-virtual.html#iso', keywords: 'iso download windows linux debian ubuntu server image' },

  // Quiz
  { title: 'Quiz Jaringan', category: 'Quiz', url: '/pages/quiz.html', keywords: 'quiz kuis latihan soal jaringan network ulangan' },

  // Forum
  { title: 'Forum Diskusi', category: 'Forum', url: '/pages/forum.html', keywords: 'forum diskusi tanya jawab komunitas help bantuan' },
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
console.log('%c⌘ Edunet', 'font-size: 24px; font-weight: bold; color: #00ffc8;');
console.log('%cKuasai Jaringan, Taklukkan Masa Depan!', 'font-size: 14px; color: #9ca3af;');
console.log('%cBuilt with 💚 for Indonesian students', 'font-size: 12px; color: #6b7280;');
