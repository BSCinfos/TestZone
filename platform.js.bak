/*
 * BSCinfos - Navegação lateral global + estilos PC / TABLET / CELULAR
 * CSS permanece em style.css; este arquivo cuida somente do comportamento.
 */
(function () {
    "use strict";

    const PLATFORM_KEY = "bscinfos_platform";
    const NAV_KEY = "bscinfos_nav_open";
    const VALID = ["pc", "tablet", "mobile"];

    function detectPlatform() {
        const width = window.innerWidth || document.documentElement.clientWidth || 1200;
        if (width <= 700) return "mobile";
        if (width <= 1100) return "tablet";
        return "pc";
    }

    function getSavedPlatform() {
        try {
            const saved = localStorage.getItem(PLATFORM_KEY);
            return VALID.includes(saved) ? saved : null;
        } catch (e) { return null; }
    }

    function setPlatform(platform, save = true) {
        if (!VALID.includes(platform)) return;
        document.documentElement.setAttribute("data-platform", platform);
        if (save) {
            try { localStorage.setItem(PLATFORM_KEY, platform); } catch (e) {}
        }
        document.querySelectorAll(".platform-switch-btn").forEach(btn => {
            const active = btn.dataset.platform === platform;
            btn.classList.toggle("active", active);
            btn.setAttribute("aria-pressed", active ? "true" : "false");
        });
        window.dispatchEvent(new CustomEvent("bscinfosPlatformChanged", { detail: { platform } }));
    }

    function currentPage() {
        return (location.pathname.split("/").pop() || "index.html").toLowerCase();
    }

    function setupDraftMobileWarning() {
        if (currentPage() !== "draft.html") return;
        if (document.querySelector(".draft-mobile-warning")) return;

        const overlay = document.createElement("div");
        overlay.className = "draft-mobile-warning";
        overlay.setAttribute("role", "dialog");
        overlay.setAttribute("aria-modal", "true");
        overlay.setAttribute("aria-label", "Aviso para usar o Draft no celular");
        overlay.innerHTML = `
            <div class="draft-mobile-warning-card">
                <div class="draft-mobile-warning-icon">↔</div>
                <h2>Melhor experiência no celular</h2>
                <p>Para usar o draft no dispositivo móvel vire seu aparelho na horizontal para uma melhor experiência da função.</p>
                <button type="button" class="draft-mobile-warning-close">ENTENDI</button>
            </div>
        `;

        document.body.appendChild(overlay);

        const closeButton = overlay.querySelector(".draft-mobile-warning-close");
        closeButton.addEventListener("click", function () {
            overlay.classList.add("hidden");
        });

        function updateDraftWarning() {
            const isMobile = document.documentElement.getAttribute("data-platform") === "mobile";
            const isLandscape = window.matchMedia("(orientation: landscape)").matches;

            if (isMobile && !isLandscape) {
                overlay.classList.remove("hidden");
            } else {
                overlay.classList.add("hidden");
            }
        }

        window.addEventListener("resize", updateDraftWarning);
        window.addEventListener("orientationchange", updateDraftWarning);
        window.addEventListener("bscinfosPlatformChanged", updateDraftWarning);
        updateDraftWarning();
    }

    function regionFromPage() {
        return ({
            "sa.html": "SA", "na.html": "NA", "emea.html": "EMEA",
            "ea.html": "EA", "geral.html": "ALL"
        })[currentPage()] || null;
    }

    function getNickname() {
        try {
            if (typeof window.BSC_USER === "function") {
                const user = window.BSC_USER();
                if (user) return user;
            }
        } catch (e) {}
        try {
            const raw = sessionStorage.getItem("bsc_auth_user");
            if (raw) {
                const obj = JSON.parse(raw);
                if (obj && obj.username) return obj.username;
            }
        } catch (e) {}
        return "Visitante";
    }

    function getNavOpenDefault() {
        try {
            const saved = localStorage.getItem(NAV_KEY);
            if (saved === "0") return false;
            if (saved === "1") return true;
        } catch (e) {}
        // No celular o menu começa fechado; PC e tablet começam aberto.
        return (document.documentElement.getAttribute("data-platform") !== "mobile");
    }

    function saveNavState(open) {
        try { localStorage.setItem(NAV_KEY, open ? "1" : "0"); } catch (e) {}
    }

    function createLink(href, text, cls = "") {
        const a = document.createElement("a");
        a.href = href;
        a.className = "side-nav-link" + (cls ? " " + cls : "");
        a.textContent = text;
        return a;
    }

    function createSectionTitle(text) {
        const div = document.createElement("div");
        div.className = "side-nav-section-title";
        div.textContent = text;
        return div;
    }

    function createSideNav() {
        if (document.querySelector(".bsc-side-nav")) return;
        if (currentPage() === "login.html") return;

        document.querySelectorAll("body > nav, body > .navbar").forEach(nav => nav.classList.add("legacy-top-navbar"));
        document.body.classList.add("has-side-navigation");

        const backdrop = document.createElement("div");
        backdrop.className = "side-nav-backdrop";
        backdrop.setAttribute("aria-hidden", "true");

        const toggle = document.createElement("button");
        toggle.type = "button";
        toggle.className = "side-nav-toggle";
        toggle.setAttribute("aria-label", "Abrir menu");
        toggle.innerHTML = '<span></span><span></span><span></span>';

        const aside = document.createElement("aside");
        aside.className = "bsc-side-nav";
        aside.setAttribute("aria-label", "Navegação principal");

        const header = document.createElement("div");
        header.className = "side-nav-header";
        header.innerHTML = '<a href="index.html" class="side-nav-brand"><strong>BSC</strong><span>Infos</span></a>';

        const close = document.createElement("button");
        close.type = "button";
        close.className = "side-nav-close";
        close.setAttribute("aria-label", "Fechar menu");
        close.innerHTML = "×";
        header.appendChild(close);
        aside.appendChild(header);

        // Nickname fica acima da seção MENU.
        const userBox = document.createElement("div");
        userBox.className = "side-nav-user";
        userBox.innerHTML = '<span class="side-nav-user-label">USUÁRIO</span><strong class="side-nav-user-name"></strong>';
        userBox.querySelector(".side-nav-user-name").textContent = getNickname();
        aside.appendChild(userBox);

        const nav = document.createElement("div");
        nav.className = "side-nav-scroll";

        const mainSection = document.createElement("div");
        mainSection.className = "side-nav-section";
        mainSection.appendChild(createSectionTitle("MENU"));
        [
            ["index.html", "MENU"], ["regioes.html", "META"], ["draft.html", "DRAFT"],
            ["vivo.html", "AO VIVO"], ["found.html", "FOUND"]
        ].forEach(([href, text]) => mainSection.appendChild(createLink(href, text)));
        nav.appendChild(mainSection);

        const regionsSection = document.createElement("div");
        regionsSection.className = "side-nav-section";
        regionsSection.appendChild(createSectionTitle("REGIÕES"));
        [
            ["sa.html", "SA", "element/sa.png"], ["na.html", "NA", "element/na.png"],
            ["emea.html", "EMEA", "element/emea.png"], ["ea.html", "EA", "element/ea.png"],
            ["geral.html", "GERAL", null]
        ].forEach(([href, text, image]) => {
            const a = createLink(href, text);
            a.classList.add("side-region-link");
            if (image) {
                const img = document.createElement("img");
                img.src = image; img.alt = "";
                img.onerror = function () { this.style.display = "none"; };
                a.prepend(img);
            }
            if (regionFromPage() === text || (text === "GERAL" && regionFromPage() === "ALL")) a.classList.add("active");
            regionsSection.appendChild(a);
        });
        nav.appendChild(regionsSection);

        const region = regionFromPage();
        if (region) {
            const section = document.createElement("div");
            section.className = "side-nav-section side-current-region";
            section.appendChild(createSectionTitle("SEÇÕES"));
            [["meta", "META"], ["brawlers", "BRAWLERS"], ["mapas", "MAPAS"], ["times", "TIMES"], ["scrims", "SCRIMS"]]
                .forEach(([value, label]) => {
                    const a = document.createElement("a");
                    a.href = "#";
                    a.className = "side-nav-link side-screen-link";
                    a.dataset.screen = value;
                    a.textContent = label;
                    a.addEventListener("click", function (event) {
                        event.preventDefault();
                        if (typeof window.mudarTela === "function") window.mudarTela(value);
                        else if (typeof mudarTela === "function") mudarTela(value);
                        closeMenu();
                    });
                    section.appendChild(a);
                });
            nav.appendChild(section);
        }

        const statsSection = document.createElement("div");
        statsSection.className = "side-nav-section";
        statsSection.appendChild(createSectionTitle("ESTATÍSTICAS"));
        statsSection.appendChild(createLink("player.html", "PLAYER"));
        statsSection.appendChild(createLink("coach.html", "COACH"));
        nav.appendChild(statsSection);

        const styleSection = document.createElement("div");
        styleSection.className = "side-nav-section side-style-section";
        styleSection.appendChild(createSectionTitle("ESTILO DA INTERFACE"));
        const switcher = document.createElement("div");
        switcher.className = "platform-switcher";
        switcher.setAttribute("aria-label", "Escolher tipo de interface");

        [
            ["pc", "PC", "element/pc.png"],
            ["tablet", "TABLET", "element/tablet.png"],
            ["mobile", "CELULAR", "element/smart.png"]
        ].forEach(([value, text, icon]) => {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "platform-switch-btn";
            btn.dataset.platform = value;
            btn.setAttribute("aria-label", "Usar interface " + text);
            btn.innerHTML = '<img src="' + icon + '" alt=""><span>' + text + '</span>';
            btn.addEventListener("click", function () { setPlatform(value, true); });
            switcher.appendChild(btn);
        });
        styleSection.appendChild(switcher);
        nav.appendChild(styleSection);

        aside.appendChild(nav);
        document.body.appendChild(backdrop);
        document.body.appendChild(toggle);
        document.body.appendChild(aside);

        function updateState(open, save = true) {
            document.body.classList.toggle("side-nav-open", open);
            document.body.classList.toggle("side-nav-closed", !open);
            toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
            toggle.title = open ? "Fechar menu" : "Abrir menu";
            if (save) saveNavState(open);
        }
        function openMenu() { updateState(true); }
        function closeMenu() { updateState(false); }

        toggle.addEventListener("click", function () {
            updateState(!document.body.classList.contains("side-nav-open"));
        });
        close.addEventListener("click", closeMenu);
        backdrop.addEventListener("click", closeMenu);
        aside.querySelectorAll("a:not(.side-screen-link)").forEach(a => a.addEventListener("click", closeMenu));

        // Estado inicial.
        updateState(getNavOpenDefault(), false);
    }

    function init() {
        const saved = getSavedPlatform();
        setPlatform(saved || detectPlatform(), false);
        if (document.body) {
            createSideNav();
            setupDraftMobileWarning();
        } else {
            document.addEventListener("DOMContentLoaded", function () {
                createSideNav();
                setupDraftMobileWarning();
            }, { once: true });
        }
    }

    init();

    window.BSCInfosPlatform = {
        get: function () { return document.documentElement.getAttribute("data-platform"); },
        set: function (platform) { setPlatform(platform, true); },
        reset: function () {
            try { localStorage.removeItem(PLATFORM_KEY); localStorage.removeItem(NAV_KEY); } catch (e) {}
            setPlatform(detectPlatform(), false);
        },
        openNav: function () {
            document.body.classList.add("side-nav-open");
            document.body.classList.remove("side-nav-closed");
            saveNavState(true);
        },
        closeNav: function () {
            document.body.classList.remove("side-nav-open");
            document.body.classList.add("side-nav-closed");
            saveNavState(false);
        }
    };
})();
