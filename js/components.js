// js/components.js

class CyberdeckNavbar extends HTMLElement {
    connectedCallback() {
        const page = window.location.pathname.split('/').pop() || 'index.html';
        
        this.innerHTML = `
            <nav>
                <a href="index.html" class="nav-brand">
                    <span class="nav-logo">[CD] CYBERDECK</span>
                </a>
                
                <button class="mobile-menu-btn" aria-label="Toggle menu">[☰]</button>
                
                <div class="nav-links" id="nav-links">
                    <a href="index.html" class="${page === 'index.html' || page === '' ? 'active' : ''}">[hub]</a>
                    <a href="tools.html" class="${page === 'tools.html' ? 'active' : ''}">[tools]</a>
                    <a href="wiki.html" class="${page === 'wiki.html' ? 'active' : ''}">[wiki]</a>
                    <a href="blueteam.html" class="${page === 'blueteam.html' ? 'active' : ''}">[blueteam]</a>
                    <a href="tools.html" class="nav-cta">▶ Launch</a>
                </div>
            </nav>
        `;
        
        this.setupMobileMenu();
    }
    
    setupMobileMenu() {
        const menuBtn = this.querySelector('.mobile-menu-btn');
        const navLinks = this.querySelector('#nav-links');
        
        menuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            menuBtn.textContent = navLinks.classList.contains('active') ? '[×]' : '[☰]';
        });
        
        const links = this.querySelectorAll('.nav-links a');
        links.forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                menuBtn.textContent = '[☰]';
            });
        });
    }
}

customElements.define('cyberdeck-navbar', CyberdeckNavbar);

class CyberdeckFooter extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <footer>
                <div class="container">
                    <!-- SOCIAL MEDIA SECTION -->
                    <div class="footer-social">
                        <div class="footer-social-title">CONNECT WITH ME</div>
                        <div class="footer-social-links">
                            <a href="https://www.instagram.com/dzaki_maulid/" target="_blank" rel="noopener" class="footer-social-link" title="Instagram">
                                <i class="fa-brands fa-instagram"></i>
                                <span>Instagram</span>
                            </a>
                            <a href="https://web.facebook.com/dzakimaulid.hidayat.50/" target="_blank" rel="noopener" class="footer-social-link" title="Facebook">
                                <i class="fa-brands fa-facebook"></i>
                                <span>Facebook</span>
                            </a>
                            <a href="https://www.linkedin.com/in/dzaki-maulid-hidayat-a05172220/" target="_blank" rel="noopener" class="footer-social-link" title="LinkedIn">
                                <i class="fa-brands fa-linkedin"></i>
                                <span>LinkedIn</span>
                            </a>
                        </div>
                    </div>

                    <!-- QUICK LINKS -->
                    <div class="footer-links">
                        <a href="wiki.html">Documentation</a>
                        <a href="tools.html">Tools</a>
                        <a href="blueteam.html">Blue Team</a>
                        <a href="#changelog" onclick="showToast('Changelog coming soon!', 'info'); return false;">Changelog</a>
                        <a href="mailto:dzakif073@gmail.com" onclick="window.open('https://mail.google.com/mail/?view=cm&fs=1&to=dzakif073@gmail.com');">
    Contact
</a>
                    </div>

                    <!-- BOTTOM -->
                    <div class="footer-bottom">
                        <span>©2026 CyberDeck · Blue Team Edition v2.4.1</span>
                    </div>
                </div>
            </footer>
        `;
    }
}

customElements.define('cyberdeck-footer', CyberdeckFooter);