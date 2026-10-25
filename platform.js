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
            "ea.html": "EA", "cn.html": "CN", "geral.html": "ALL"
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
        if (currentPage() === "draft.html") document.body.classList.add("draft-page");

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
            ["index.html", "MENU"], ["draft.html", "DRAFT"],
            ["vivo.html", "AO VIVO"], ["found.html", "FOUND"]
        ].forEach(([href, text]) => mainSection.appendChild(createLink(href, text)));
        nav.appendChild(mainSection);

        const regionsSection = document.createElement("div");
        regionsSection.className = "side-nav-section side-regions-section";
        regionsSection.appendChild(createSectionTitle("REGIÕES"));

        const region = regionFromPage();
        if (region) document.body.classList.add("region-theme-" + region);
        const regionItems = [
            ["sa.html", "SA", "SA", "element/sa.png"],
            ["na.html", "NA", "NA", "element/na.png"],
            ["emea.html", "EMEA", "EMEA", "element/emea.png"],
            ["ea.html", "EA", "EA", "element/ea.png"],
            ["cn.html", "CN", "CN", "element/cn.png"],
            ["geral.html", "ALL", "ALL", "element/geral.png"]
        ];

        function appendRegionSections(parent, activeRegion) {
            if (!activeRegion) return;
            const section = document.createElement("div");
            section.className = "side-nav-section side-current-region region-context region-" + activeRegion;
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
            parent.appendChild(section);
        }

        // A região e suas SEÇÕES são montadas como um bloco único.
        // Assim as SEÇÕES ficam SEMPRE imediatamente abaixo da região aberta,
        // e não no final da lista de regiões.
        regionItems.forEach(([href, text, regionCode, image]) => {
            const isActive = region === regionCode;

            const regionBlock = document.createElement("div");
            regionBlock.className = "side-region-block region-block-" + regionCode;
            regionBlock.dataset.region = regionCode;

            const a = createLink(href, text);
            a.classList.add("side-region-link", "region-link-" + regionCode);
            a.dataset.region = regionCode;
            if (isActive) a.classList.add("active");

            if (image) {
                const img = document.createElement("img");
                img.src = image;
                img.alt = "";
                img.onerror = function () { this.style.display = "none"; };
                a.prepend(img);
            }

            regionBlock.appendChild(a);

            if (isActive) {
                appendRegionSections(regionBlock, regionCode);
                regionBlock.classList.add("is-open");
            }

            regionsSection.appendChild(regionBlock);
        });
        nav.appendChild(regionsSection);

        function showComingSoon() {
            let overlay = document.querySelector(".bsc-coming-soon-overlay");
            if (!overlay) {
                overlay = document.createElement("div");
                overlay.className = "bsc-coming-soon-overlay";
                overlay.innerHTML = `
                    <div class="bsc-coming-soon-card" role="dialog" aria-modal="true" aria-label="Coming Soon">
                        <div class="bsc-coming-soon-title">Coming Soon</div>
                        <button type="button" class="bsc-coming-soon-close">FECHAR</button>
                    </div>
                `;
                document.body.appendChild(overlay);
                overlay.addEventListener("click", function (event) {
                    if (event.target === overlay || event.target.closest(".bsc-coming-soon-close")) {
                        overlay.classList.remove("show");
                    }
                });
            }
            overlay.classList.add("show");
        }

        // Área de dados personalizados: cada usuário pode cadastrar até 3 times.
        // Os dados ficam separados por login no navegador atual.
        const statsSection = document.createElement("div");
        statsSection.className = "side-nav-section side-data-section";
        const dataHeading = document.createElement("div");
        dataHeading.className = "side-nav-section-title side-data-heading";
        const dataTitle = document.createElement("span");
        dataTitle.textContent = "DADOS";
        const dataCounter = document.createElement("span");
        dataCounter.className = "side-data-counter";
        dataHeading.append(dataTitle, dataCounter);
        statsSection.appendChild(dataHeading);

        const createTeamButton = document.createElement("button");
        createTeamButton.type = "button";
        createTeamButton.className = "side-nav-link side-create-team-button";
        createTeamButton.innerHTML = '<span class="side-create-team-plus" aria-hidden="true">+</span><span>Criar time</span>';
        statsSection.appendChild(createTeamButton);

        const teamList = document.createElement("div");
        teamList.className = "side-created-teams";
        teamList.setAttribute("aria-label", "Times criados por este usuário");
        statsSection.appendChild(teamList);
        nav.appendChild(statsSection);

        const TEAM_STORAGE_PREFIX = "bscinfos_custom_teams_";

        function getCurrentUsername() {
            return String(getNickname() || "Visitante").trim();
        }

        function isAdminLogin() {
            return getCurrentUsername().toLowerCase() === "admin";
        }

        function getTeamStorageKey(username) {
            const owner = String(username || getCurrentUsername()).trim().toLowerCase();
            return TEAM_STORAGE_PREFIX + owner;
        }

        function readTeamsForUser(username) {
            try {
                const parsed = JSON.parse(localStorage.getItem(getTeamStorageKey(username)) || "[]");
                return Array.isArray(parsed) ? parsed.slice(0, 3) : [];
            } catch (e) { return []; }
        }

        function readCreatedTeams() {
            return readTeamsForUser(getCurrentUsername());
        }

        function saveTeamsForUser(username, teams) {
            try {
                localStorage.setItem(getTeamStorageKey(username), JSON.stringify(teams.slice(0, 3)));
                return true;
            } catch (e) {
                alert("Não foi possível salvar o time. Tente uma logo menor.");
                return false;
            }
        }

        function saveCreatedTeams(teams) {
            return saveTeamsForUser(getCurrentUsername(), teams);
        }

        function readVisibleTeamRecords() {
            if (!isAdminLogin()) {
                return readCreatedTeams().map(function (team, index) {
                    return { owner: getCurrentUsername(), team: team, index: index };
                });
            }

            const records = [];
            try {
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (!key || !key.startsWith(TEAM_STORAGE_PREFIX)) continue;
                    const owner = key.slice(TEAM_STORAGE_PREFIX.length);
                    let parsed;
                    try { parsed = JSON.parse(localStorage.getItem(key) || "[]"); } catch (e) { parsed = []; }
                    if (!Array.isArray(parsed)) continue;
                    parsed.slice(0, 3).forEach(function (team, index) {
                        records.push({ owner: owner, team: team, index: index });
                    });
                }
            } catch (e) {}
            return records.sort(function (a, b) {
                return a.owner.localeCompare(b.owner) || String(a.team.name || "").localeCompare(String(b.team.name || ""));
            });
        }

        function updateCreatedTeams() {
            const ownTeams = readCreatedTeams();
            dataCounter.textContent = (3 - ownTeams.length) + "/3";
            dataCounter.setAttribute("aria-label", (3 - ownTeams.length) + " vagas restantes de 3 para este login");
            createTeamButton.disabled = ownTeams.length >= 3;
            createTeamButton.setAttribute("aria-disabled", ownTeams.length >= 3 ? "true" : "false");
            teamList.replaceChildren();

            const records = readVisibleTeamRecords();
            if (!records.length) {
                const empty = document.createElement("div");
                empty.className = "side-created-team-empty";
                empty.textContent = isAdminLogin() ? "Nenhum time cadastrado neste navegador." : "Você ainda não criou um time.";
                teamList.appendChild(empty);
                return;
            }

            records.forEach(function (record) {
                const team = record.team;
                const item = document.createElement("div");
                item.className = "side-created-team side-created-team-clickable";
                item.tabIndex = 0;
                item.setAttribute("role", "link");
                item.setAttribute("aria-label", "Abrir página do time " + (team.name || "Time"));
                const openTeamPage = function () {
                    const params = new URLSearchParams();
                    params.set("owner", record.owner);
                    if (team.createdAt) params.set("createdAt", team.createdAt);
                    else params.set("index", String(record.index));
                    window.location.href = "time.html?" + params.toString();
                };
                item.addEventListener("click", function (event) {
                    if (event.target.closest(".side-created-team-remove")) return;
                    openTeamPage();
                });
                item.addEventListener("keydown", function (event) {
                    if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        openTeamPage();
                    }
                });
                const logo = document.createElement("img");
                logo.className = "side-created-team-logo";
                logo.alt = "Logo de " + (team.name || "time");
                logo.src = team.logo || "";
                const info = document.createElement("div");
                info.className = "side-created-team-info";
                const name = document.createElement("strong");
                name.textContent = team.name || "Time sem nome";
                const details = document.createElement("span");
                const abbreviation = team.abbreviation ? team.abbreviation.toUpperCase() + " · " : "";
                details.textContent = abbreviation + (team.playerTag || "");
                info.append(name, details);
                if (isAdminLogin()) {
                    const ownerLabel = document.createElement("span");
                    ownerLabel.className = "side-created-team-owner";
                    ownerLabel.textContent = "Login: " + record.owner;
                    info.appendChild(ownerLabel);
                }
                const canManage = isAdminLogin() || record.owner === getCurrentUsername().trim().toLowerCase();
                if (canManage) {
                    const remove = document.createElement("button");
                    remove.type = "button";
                    remove.className = "side-created-team-remove";
                    remove.textContent = "×";
                    remove.title = "Excluir " + (team.name || "time");
                    remove.setAttribute("aria-label", "Excluir time " + (team.name || ""));
                    remove.addEventListener("click", function () {
                        const current = readTeamsForUser(record.owner);
                        const target = current[record.index];
                        if (!target) return;
                        current.splice(record.index, 1);
                        if (saveTeamsForUser(record.owner, current)) updateCreatedTeams();
                    });
                    item.append(logo, info, remove);
                } else {
                    item.append(logo, info);
                }
                teamList.appendChild(item);
            });
        }

        function openCreateTeamDialog() {
            if (readCreatedTeams().length >= 3) return;
            let dialog = document.querySelector(".side-create-team-overlay");
            if (!dialog) {
                dialog = document.createElement("div");
                dialog.className = "side-create-team-overlay";
                dialog.innerHTML = `
                    <section class="side-create-team-dialog" role="dialog" aria-modal="true" aria-labelledby="sideCreateTeamTitle">
                        <button type="button" class="side-create-team-close" aria-label="Fechar">×</button>
                        <h2 id="sideCreateTeamTitle">Criar time</h2>
                        <p>Cadastre até 3 times neste login. O administrador também pode visualizar este cadastro.</p>
                        <form class="side-create-team-form">
                            <label>Nome do time<input name="teamName" maxlength="50" required placeholder="Ex.: Titans01"></label>
                            <label>Logo do time<input name="teamLogo" type="file" accept="image/*" required></label>
                            <label>ID de 1 player<input name="playerTag" maxlength="30" required placeholder="Ex.: #ABC123"></label>
                            <label>Sigla do time<input name="teamAbbreviation" maxlength="10" required placeholder="Ex.: t01"></label>
                            <div class="side-create-team-error" role="alert"></div>
                            <button type="submit" class="side-create-team-submit">Salvar time</button>
                        </form>
                    </section>`;
                document.body.appendChild(dialog);
                dialog.addEventListener("click", function (event) {
                    if (event.target === dialog || event.target.closest(".side-create-team-close")) dialog.classList.remove("show");
                });
                dialog.querySelector(".side-create-team-form").addEventListener("submit", async function (event) {
                    event.preventDefault();
                    const form = event.currentTarget;
                    const error = form.querySelector(".side-create-team-error");
                    error.textContent = "";
                    const current = readCreatedTeams();
                    if (current.length >= 3) {
                        error.textContent = "Este login já atingiu o limite de 3 times.";
                        updateCreatedTeams();
                        return;
                    }
                    const name = form.elements.teamName.value.trim();
                    const playerTag = form.elements.playerTag.value.trim();
                    const abbreviation = form.elements.teamAbbreviation.value.trim();
                    const file = form.elements.teamLogo.files && form.elements.teamLogo.files[0];
                    if (!name || !playerTag || !abbreviation || !file) {
                        error.textContent = "Preencha todos os campos e escolha uma logo.";
                        return;
                    }
                    if (!file.type.startsWith("image/")) {
                        error.textContent = "Selecione um arquivo de imagem válido para a logo.";
                        return;
                    }
                    if (!playerTag.startsWith("#") || playerTag.length < 2) {
                        error.textContent = "O ID do player deve começar com # (ex.: #ABC123).";
                        return;
                    }
                    if (file.size > 400 * 1024) {
                        error.textContent = "A logo deve ter no máximo 400 KB para manter o armazenamento leve.";
                        return;
                    }
                    try {
                        const logo = await new Promise(function (resolve, reject) {
                            const reader = new FileReader();
                            reader.onload = function () { resolve(String(reader.result)); };
                            reader.onerror = reject;
                            reader.readAsDataURL(file);
                        });
                        current.push({ name, logo, playerTag, abbreviation, createdAt: new Date().toISOString() });
                        if (saveCreatedTeams(current)) {
                            form.reset();
                            dialog.classList.remove("show");
                            updateCreatedTeams();
                        }
                    } catch (e) {
                        error.textContent = "Não foi possível ler a logo. Tente outro arquivo.";
                    }
                });
            }
            const form = dialog.querySelector(".side-create-team-form");
            form.reset();
            form.querySelector(".side-create-team-error").textContent = "";
            dialog.classList.add("show");
            const firstInput = form.elements.teamName;
            if (firstInput) firstInput.focus();
        }

        createTeamButton.addEventListener("click", openCreateTeamDialog);
        updateCreatedTeams();

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


    function setupDraftResponsiveBoard() {
        if (currentPage() !== "draft.html") return;

        const fit = function () {
            const board = document.getElementById("draft-board-capture");
            const area = document.getElementById("draft-area");
            if (!board || !area || board.offsetWidth === 0 || area.offsetWidth === 0) return;

            const platform = document.documentElement.getAttribute("data-platform");
            if (platform !== "mobile") {
                board.style.zoom = "";
                return;
            }

            // No celular, o tabuleiro inteiro precisa caber na área visível.
            // Medimos o tamanho original e calculamos a escala necessária.
            board.style.zoom = "1";
            board.style.transform = "none";

            const naturalWidth = board.offsetWidth;
            const naturalHeight = board.offsetHeight;
            if (!naturalWidth || !naturalHeight) return;

            const availableWidth = Math.max(100, area.clientWidth - 12);
            const availableHeight = Math.max(100, area.clientHeight - 8);
            const scale = Math.min(
                availableWidth / naturalWidth,
                availableHeight / naturalHeight,
                1
            );

            board.style.zoom = String(Math.max(0.34, scale));
        };

        window.addEventListener("resize", fit);
        window.addEventListener("orientationchange", function () { setTimeout(fit, 120); });
        window.addEventListener("bscinfosPlatformChanged", function () { setTimeout(fit, 80); });

        // O Draft é montado dinamicamente depois do carregamento da página.
        const observer = new MutationObserver(function () {
            if (document.getElementById("draft-board-capture")) {
                setTimeout(fit, 50);
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
        setTimeout(fit, 150);
        setTimeout(fit, 500);
    }

    init();
    setupDraftResponsiveBoard();

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
