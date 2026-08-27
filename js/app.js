import { state } from './state.js';
import { ChatListComponent } from './components/chatList.js';
import { ChatViewComponent } from './components/chatView.js';
import { ProfileViewComponent } from './components/profileView.js';
import { SettingsViewComponent } from './components/settingsView.js';
import { modalController } from './components/modals.js';

class ClockApp {
  constructor() {
    this.appRoot = document.getElementById('app');
    this.chatListComponent = null;
    this.chatViewComponent = null;
    this.profileViewComponent = null;
    this.settingsViewComponent = null;
  }

  async init() {
    state.applySettingsToDOM();
    if (state.token && state.currentUser) {
      this.showMainUI();
    } else {
      this.renderAuthScreen();
    }
  }

  renderAuthScreen() {
    const isLogin = this.appRoot.querySelector('.auth-screen') !== null;
    const mode = isLogin ? 'login' : 'register';
    this.appRoot.innerHTML = `
      <div class="auth-screen">
        <div class="auth-card">
          <div class="brand-row">
            <div class="brand-badge">C</div>
            <div>
              <h1>Clock</h1>
              <p>Онлайн-мессенджер</p>
            </div>
          </div>
          <form class="auth-form" id="auth-form">
            <input id="auth-username" type="text" placeholder="Логин" required autocomplete="username" />
            <input id="auth-password" type="password" placeholder="Пароль" required autocomplete="current-password" />
            ${mode === 'register' ? '<input id="auth-avatar" type="file" accept="image/*" />' : ''}
            <div class="auth-error" id="auth-error"></div>
            <button type="submit" class="btn btn-primary auth-submit-btn">${mode === 'login' ? 'Войти' : 'Регистрация'}</button>
          </form>
          <button class="btn btn-secondary auth-toggle-btn" id="auth-toggle">
            ${mode === 'login' ? 'Создать аккаунт' : 'Уже есть аккаунт'}
          </button>
        </div>
      </div>
    `;

    const form = document.getElementById('auth-form');
    const errorEl = document.getElementById('auth-error');
    const isRegister = mode === 'register';

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      errorEl.textContent = '';
      const username = document.getElementById('auth-username').value.trim();
      const password = document.getElementById('auth-password').value;
      if (!username || !password) { errorEl.textContent = 'Заполните все поля'; return; }
      const submitBtn = form.querySelector('.auth-submit-btn');
      submitBtn.disabled = true;
      submitBtn.textContent = '...';
      try {
        if (isRegister) {
          const avatarFile = document.getElementById('auth-avatar')?.files?.[0];
          await state.createUser(username, password, avatarFile);
        } else {
          await state.loginUser(username, password);
        }
        this.showMainUI();
      } catch (err) {
        errorEl.textContent = err.message || 'Ошибка';
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = isRegister ? 'Регистрация' : 'Войти';
      }
    });

    document.getElementById('auth-toggle').addEventListener('click', () => {
      this.renderAuthScreen();
    });
  }

  showMainUI() {
    this.renderBaseLayout();
    this.initComponents();
    state.on('screenChanged', ({ screen }) => this.updateScreenVisibility(screen));
    window.addEventListener('resize', () => this.updateScreenVisibility(state.currentScreen));
    this.updateScreenVisibility('chats');
    if (window.innerWidth > 900 && !state.activeChatId && state.chats.length > 0) {
      state.setScreen('chat', state.chats[0].id);
    }
  }

  renderBaseLayout() {
    this.appRoot.innerHTML = `
      <div class="clock-app-layout" id="clock-layout">
        <aside class="app-sidebar screen-panel" id="screen-chats"></aside>
        <main class="app-main screen-panel" id="screen-main">
          <div class="view-container" id="chat-view-container">
            <div class="chat-placeholder-view">
              <div class="placeholder-content">
                <svg class="clock-big-logo" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                <h2>Clock Messenger</h2>
                <p>Выберите чат или создайте новый</p>
              </div>
            </div>
          </div>
          <div class="view-container" id="profile-view-container" style="display:none;"></div>
          <div class="view-container" id="settings-view-container" style="display:none;"></div>
        </main>
      </div>
      <div id="modal-portal"></div>
    `;
    modalController.init(document.getElementById('modal-portal'));
  }

  initComponents() {
    this.chatListComponent = new ChatListComponent(document.getElementById('screen-chats'));
    this.chatViewComponent = new ChatViewComponent(document.getElementById('chat-view-container'));
    this.profileViewComponent = new ProfileViewComponent(document.getElementById('profile-view-container'));
    this.settingsViewComponent = new SettingsViewComponent(document.getElementById('settings-view-container'));
  }

  updateScreenVisibility(screen) {
    const layout = document.getElementById('clock-layout');
    const sidebar = document.getElementById('screen-chats');
    const main = document.getElementById('screen-main');
    const chatEl = document.getElementById('chat-view-container');
    const profileEl = document.getElementById('profile-view-container');
    const settingsEl = document.getElementById('settings-view-container');
    const isMobile = window.innerWidth <= 900;
    [chatEl, profileEl, settingsEl].forEach(el => el.style.display = 'none');
    if (screen === 'chat') chatEl.style.display = 'flex';
    if (screen === 'profile') profileEl.style.display = 'flex';
    if (screen === 'settings') settingsEl.style.display = 'flex';
    if (isMobile) {
      if (screen === 'chats') { sidebar.style.display = 'flex'; main.style.display = 'none'; }
      else { sidebar.style.display = 'none'; main.style.display = 'flex'; }
      layout.setAttribute('data-active-view', screen);
    } else {
      sidebar.style.display = 'flex'; main.style.display = 'flex';
      if (screen === 'chats') chatEl.style.display = 'flex';
      layout.setAttribute('data-active-view', 'desktop');
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const app = new ClockApp();
  app.init();
});