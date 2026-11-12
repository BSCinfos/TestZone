// =====================================================================
// AUTH BSCinfos — contas normais e teste temporário de 30 minutos.
// O bloqueio do teste é local ao navegador (localStorage), não é antifraude.
// =====================================================================
(function () {
    'use strict';
    var SESSION_KEY = 'bsc_auth_user';
    var TRIAL_USED_KEY = 'bsc_trial_device_used';
    var TRIAL_MS = 30 * 60 * 1000;
    var SESSION_HOURS = 8;

    function getSessao() {
        try {
            var raw = sessionStorage.getItem(SESSION_KEY);
            if (!raw) return null;
            var obj = JSON.parse(raw);
            if (!obj || !obj.username || !obj.exp) return null;
            if (Date.now() >= Number(obj.exp)) {
                sessionStorage.removeItem(SESSION_KEY);
                if (obj.isTrial && window.location.pathname.split('/').pop().toLowerCase() !== 'login.html') {
                    window.location.replace('login.html');
                }
                return null;
            }
            return obj;
        } catch (e) { return null; }
    }

    function saveSession(obj) {
        try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(obj)); return true; }
        catch (e) { return false; }
    }

    window.BSC_LOGIN = function (username, password) {
        var users = window.BSC_USERS || [];
        var found = null;
        for (var i = 0; i < users.length; i++) {
            if (users[i].username === String(username || '').trim() && users[i].password === password) {
                found = users[i]; break;
            }
        }
        if (!found) return false;
        return saveSession({ username: found.username, exp: Date.now() + SESSION_HOURS * 3600000, isTrial: false });
    };

    window.BSC_TRIAL_AVAILABLE = function () {
        try { return localStorage.getItem(TRIAL_USED_KEY) !== '1'; } catch (e) { return false; }
    };

    window.BSC_START_TRIAL = function () {
        if (!window.BSC_TRIAL_AVAILABLE()) return false;
        var now = Date.now();
        try { localStorage.setItem(TRIAL_USED_KEY, '1'); } catch (e) { return false; }
        return saveSession({ username: 'Teste grátis', exp: now + TRIAL_MS, isTrial: true, startedAt: now });
    };

    window.BSC_IS_TRIAL = function () {
        var s = getSessao(); return !!(s && s.isTrial);
    };

    window.BSC_TRIAL_REMAINING = function () {
        var s = getSessao();
        return s && s.isTrial ? Math.max(0, Number(s.exp) - Date.now()) : 0;
    };

    window.BSC_END_TRIAL = function () {
        var s = getSessao();
        if (s && s.isTrial) sessionStorage.removeItem(SESSION_KEY);
    };

    window.BSC_LOGOUT = function () {
        sessionStorage.removeItem(SESSION_KEY);
        window.location.href = 'login.html';
    };

    window.BSC_USER = function () {
        var s = getSessao(); return s ? s.username : null;
    };

    var pagina = window.location.pathname.split('/').pop().toLowerCase();
    if (pagina !== 'login.html' && pagina !== 'regioes.html' && !getSessao()) {
        try { sessionStorage.setItem('bsc_redirect', window.location.href); } catch (e) {}
        window.location.replace('login.html');
    }
})();
