function switchPage(page) {
    document.getElementById('home-page').style.display = 'none';
    document.getElementById('dashboard-page').style.display = 'none';
    document.getElementById('account-page').style.display = 'none';
    document.getElementById('aliyun-page').style.display = 'none';
    document.getElementById('vtstudio-server-page').style.display = 'none';
    
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });
    
    const pageTitleElement = document.getElementById('page-title');
    
    if (page === 'home') {
        document.getElementById('home-page').style.display = 'flex';
        document.querySelector('[data-page="home"]').classList.add('active');
        document.title = 'VTStudio Workbench |  首页';
        pageTitleElement.textContent = '|  首页';
    } else if (page === 'dashboard') {
        document.getElementById('dashboard-page').style.display = 'block';
        document.querySelector('[data-page="dashboard"]').classList.add('active');
        document.title = 'VTStudio Workbench |  仪表盘';
        pageTitleElement.textContent = '|  仪表盘';
        loadDashboardData();
        startDashboardAutoUpdate();
    } else if (page === 'account') {
        document.getElementById('account-page').style.display = 'block';
        document.querySelector('[data-page="account"]').classList.add('active');
        document.title = 'VTStudio Workbench |  账号';
        pageTitleElement.textContent = '|  账号';
        updateAccountPage();
    } else if (page === 'aliyun') {
        document.getElementById('aliyun-page').style.display = 'block';
        document.querySelector('[data-page="aliyun"]').classList.add('active');
        document.title = 'VTStudio Workbench |  云服务';
        pageTitleElement.textContent = '|  云服务';
    } else if (page === 'vtstudio-server') {
        document.getElementById('vtstudio-server-page').style.display = 'block';
        document.getElementById('vtstudio-server-menu').classList.add('active');
        document.title = 'VTStudio Workbench |  VTStudio Server';
        pageTitleElement.textContent = '|  VTStudio Server';
    }
}


document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', function() {
        const page = this.getAttribute('data-page');
        switchPage(page);
    });
});

document.getElementById('toggleSidebar').addEventListener('click', function() {
    const sidebar = document.getElementById('sidebar');
    const toggleIcon = document.querySelector('.toggle-icon i');
    const toggleText = document.querySelector('.toggle-text');

    sidebar.classList.toggle('collapsed');

    if (sidebar.classList.contains('collapsed')) {
        toggleIcon.className = 'fas fa-chevron-right';
        toggleText.textContent = '展开';
    } else {
        toggleIcon.className = 'fas fa-chevron-left';
        toggleText.textContent = '折叠';
    }
});

const themeToggle = document.getElementById('themeToggle');
const themeIcon = themeToggle.querySelector('i');

let currentTheme = localStorage.getItem('theme');
if (!currentTheme) {
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)').matches;
    currentTheme = prefersDarkScheme ? 'dark' : 'light';
}

document.documentElement.setAttribute('data-theme', currentTheme);
updateThemeIcon(currentTheme);

function updateThemeIcon(theme) {
    if (theme === 'dark') {
        themeIcon.className = 'fas fa-sun';
    } else {
        themeIcon.className = 'fas fa-moon';
    }
}

themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
});

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (!localStorage.getItem('theme')) {
        const newTheme = e.matches ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        updateThemeIcon(newTheme);
    }
});

let dashboardUpdateInterval;

function startDashboardAutoUpdate() {
    if (dashboardUpdateInterval) {
        clearInterval(dashboardUpdateInterval);
    }
    
    dashboardUpdateInterval = setInterval(loadDashboardData, 5000);
}

function loadDashboardData() {
    fetch('/api/system-info')
        .then(response => response.json())
        .then(data => {
            if (data.hostname && data.hostname !== '无法获取') {
                document.getElementById('server-name').textContent = data.hostname;
            } else {
                if (data.system && data.system.name && data.system.name !== '无法获取') {
                    document.getElementById('server-name').textContent = data.system.name;
                } else {
                    document.getElementById('server-name').textContent = '未知服务器';
                }
            }
            
            if (data.system) {
                document.getElementById('system-info').innerHTML = `
                    <strong>系统名称:</strong> ${data.system.name || 'N/A'}<br>
                    <strong>系统版本:</strong> ${data.system.version || 'N/A'}<br>
                    <strong>Linux内核:</strong> ${data.system.kernel || 'N/A'}<br>
                    <strong>运行时间:</strong> ${data.system.uptime || 'N/A'}
                `;
            } else {
                document.getElementById('system-info').textContent = '获取失败';
            }
            
            if (data.cpu) {
                document.getElementById('cpu-info').innerHTML = `
                    <strong>CPU名称:</strong> ${data.cpu.model || 'N/A'}<br>
                    <strong>核心数:</strong> ${data.cpu.cores || 'N/A'}<br>
                    <strong>总占用:</strong> ${data.cpu.usage || 'N/A'}
                `;
            } else {
                document.getElementById('cpu-info').textContent = '获取失败';
            }
            
            if (data.memory) {
                document.getElementById('memory-info').innerHTML = `
                    <strong>已使用/总大小:</strong> ${data.memory.used}/${data.memory.total}<br>
                    <strong>使用率:</strong> ${data.memory.percent || 'N/A'}
                `;
            } else {
                document.getElementById('memory-info').textContent = '获取失败';
            }
            
            if (data.disks && data.disks.length > 0) {
                let diskInfo = '';
                data.disks.forEach(disk => {
                    diskInfo += `<strong>设备 ${disk.device}:</strong> ${disk.used}/${disk.total} (${disk.percent})<br>`;
                });
                document.getElementById('disk-info').innerHTML = diskInfo;
            } else {
                document.getElementById('disk-info').textContent = '获取失败';
            }
        })
        .catch(error => {
            console.error('获取系统信息失败:', error);
            document.getElementById('server-name').textContent = '获取服务器名称失败';
            document.getElementById('system-info').textContent = '获取失败: ' + error.message;
            document.getElementById('cpu-info').textContent = '获取失败: ' + error.message;
            document.getElementById('memory-info').textContent = '获取失败: ' + error.message;
            document.getElementById('disk-info').textContent = '获取失败: ' + error.message;
        });
}

function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash.toString(16);
}

function updateAccountPage() {
    const isAuthenticated = localStorage.getItem('vtstudio_authenticated') === 'true';
    const storedUsername = localStorage.getItem('vtstudio_username');
    
    if (isAuthenticated && storedUsername) {
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('userInfo').style.display = 'block';
        document.getElementById('welcomeMessage').textContent = storedUsername + '，您已登录';
        document.getElementById('loginMessage').className = 'login-message';
        document.getElementById('loginMessage').textContent = '';
        document.getElementById('loginMessage').style.display = 'none';
    } else {
        document.getElementById('loginForm').style.display = 'block';
        document.getElementById('userInfo').style.display = 'none';
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
        document.getElementById('loginMessage').className = 'login-message';
        document.getElementById('loginMessage').textContent = '';
        document.getElementById('loginMessage').style.display = 'none';
    }
}

function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const hashedPassword = simpleHash(password);
    const correctHashedPassword = simpleHash('Notepad233');
    
    if (username === 'VTStudio' && hashedPassword === correctHashedPassword) {
        localStorage.setItem('vtstudio_authenticated', 'true');
        localStorage.setItem('vtstudio_username', username);
        document.getElementById('vtstudio-server-menu').style.display = 'flex';
        document.getElementById('loginText').textContent = username;
        document.getElementById('loginMessage').className = 'login-message success';
        document.getElementById('loginMessage').textContent = '登录成功！';
        document.getElementById('loginMessage').style.display = 'block';
        
        setTimeout(() => {
            updateAccountPage();
        }, 1000);
    } else {
        document.getElementById('loginMessage').className = 'login-message error';
        document.getElementById('loginMessage').textContent = '用户名或密码错误！';
        document.getElementById('loginMessage').style.display = 'block';
    }
}

function logout() {
    localStorage.removeItem('vtstudio_authenticated');
    localStorage.removeItem('vtstudio_username');
    document.getElementById('vtstudio-server-menu').style.display = 'none';
    document.getElementById('loginText').textContent = '登录';
    document.getElementById('loginMessage').className = 'login-message success';
    document.getElementById('loginMessage').textContent = '已退出登录！';
    document.getElementById('loginMessage').style.display = 'block';
    
    setTimeout(() => {
        updateAccountPage();
    }, 1000);
}

document.getElementById('loginBtn').addEventListener('click', function() {
    switchPage('account');
});

document.getElementById('loginButton').addEventListener('click', login);

document.getElementById('logoutButton').addEventListener('click', logout);

document.getElementById('vtstudio-server-menu').addEventListener('click', function() {
    switchPage('vtstudio-server');
});

document.getElementById('password').addEventListener('keyup', function(event) {
    if (event.key === 'Enter') {
        login();
    }
});

window.addEventListener('load', function() {
    const isAuthenticated = localStorage.getItem('vtstudio_authenticated') === 'true';
    const storedUsername = localStorage.getItem('vtstudio_username');
    
    if (isAuthenticated && storedUsername) {
        document.getElementById('vtstudio-server-menu').style.display = 'flex';
        document.getElementById('loginText').textContent = storedUsername;
    } else {
        document.getElementById('vtstudio-server-menu').style.display = 'none';
        document.getElementById('loginText').textContent = '登录';
    }
});

switchPage('home');