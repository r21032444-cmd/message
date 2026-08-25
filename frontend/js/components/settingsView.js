import { state } from '../state.js';
import { escapeHtml, getInitials, getAvatarColor } from '../utils/helpers.js';
import { modalController } from './modals.js';
import { sounds } from '../sound.js';

export class SettingsViewComponent {
  constructor(container) {
    this.container = container;
    this.init();
  }

  init() {
    this.render();
    state.on('screenChanged', ({ screen }) => {
      if (screen === 'settings') {
        this.render();
      }
    });
    state.on('userUpdated', () => this.render());
    state.on('settingsUpdated', () => this.render());
  }

  render() {
    const user = state.user;
    const settings = state.settings;
    const initials = getInitials(user.name);
    const bg = getAvatarColor(user.name);

    this.container.innerHTML = `
      <div class="settings-view-panel custom-scrollbar">
        <header class="settings-header-bar">
          <button class="icon-btn" id="btn-back-from-settings" title="Назад">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
          </button>
          <h3>Настройки</h3>
          <div style="width: 36px;"></div>
        </header>

        <div class="settings-content-wrapper">
          <!-- Account Section -->
          <div class="settings-section">
            <div class="settings-account-card">
              <div class="settings-avatar-large" style="background: ${bg};">
                ${initials}
              </div>
              <div class="settings-user-info">
                <h3 class="settings-user-name">${escapeHtml(user.name)}</h3>
                <span class="settings-user-phone">${escapeHtml(user.phone || '+7 (912) 345-67-89')}</span>
                <span class="settings-user-handle">@${escapeHtml(user.username)}</span>
              </div>
              <button class="btn btn-secondary btn-sm" id="btn-edit-my-profile">Редактировать</button>
            </div>
            ${user.bio ? `<p class="settings-bio-text">${escapeHtml(user.bio)}</p>` : ''}
          </div>

          <!-- Theme & Appearance -->
          <div class="settings-section">
            <div class="settings-section-title">Оформление</div>
            
            <div class="settings-row">
              <div class="settings-row-text">
                <span class="row-label">Тёмная тема (Clock Dark)</span>
                <span class="row-sub">Графитово-синяя палитра интерфейса</span>
              </div>
              <label class="switch">
                <input type="checkbox" id="setting-theme-switch" ${settings.theme === 'dark' ? 'checked' : ''} />
                <span class="slider round"></span>
              </label>
            </div>

            <div class="settings-row flex-column">
              <div class="settings-row-text">
                <span class="row-label">Размер шрифта</span>
                <span class="row-sub">Масштабирование текста сообщений</span>
              </div>
              <div class="font-size-picker">
                <button class="font-size-btn ${settings.fontSize === '14px' ? 'active' : ''}" data-size="14px">Маленький</button>
                <button class="font-size-btn ${settings.fontSize === '15px' ? 'active' : ''}" data-size="15px">Стандартный</button>
                <button class="font-size-btn ${settings.fontSize === '17px' ? 'active' : ''}" data-size="17px">Крупный</button>
              </div>
            </div>
          </div>

          <!-- Privacy -->
          <div class="settings-section">
            <div class="settings-section-title">Конфиденциальность и звуки</div>

            <div class="settings-row">
              <div class="settings-row-text">
                <span class="row-label">Показывать статус «В сети»</span>
                <span class="row-sub">Другие пользователи видят, когда вы онлайн</span>
              </div>
              <label class="switch">
                <input type="checkbox" id="setting-online-switch" ${settings.showOnlineStatus ? 'checked' : ''} />
                <span class="slider round"></span>
              </label>
            </div>

            <div class="settings-row">
              <div class="settings-row-text">
                <span class="row-label">Звук уведомлений</span>
                <span class="row-sub">Звуковые эффекты при отправке и получении</span>
              </div>
              <label class="switch">
                <input type="checkbox" id="setting-sound-switch" ${settings.soundEnabled ? 'checked' : ''} />
                <span class="slider round"></span>
              </label>
            </div>

            <div class="settings-row">
              <div class="settings-row-text">
                <span class="row-label">Автозагрузка медиа</span>
                <span class="row-sub">Автоматически скачивать фото и аудио</span>
              </div>
              <label class="switch">
                <input type="checkbox" id="setting-media-switch" ${settings.autoDownloadMedia ? 'checked' : ''} />
                <span class="slider round"></span>
              </label>
            </div>
          </div>

          <!-- Interface & Language -->
          <div class="settings-section">
            <div class="settings-section-title">Интерфейс и язык</div>

            <div class="settings-row">
              <div class="settings-row-text">
                <span class="row-label">Язык приложения</span>
                <span class="row-sub">Текущий язык отображения</span>
              </div>
              <select id="setting-lang-select" class="form-select">
                <option value="ru" ${settings.language === 'ru' ? 'selected' : ''}>Русский (RU)</option>
                <option value="en" ${settings.language === 'en' ? 'selected' : ''}>English (EN)</option>
              </select>
            </div>
          </div>

          <!-- Actions -->
          <div class="settings-section">
            <button class="btn-settings-action text-danger" id="btn-logout-session">
              <span class="action-icon">🚪</span>
              <span>Выйти из аккаунта</span>
            </button>
            <button class="btn-settings-action" id="btn-reset-demo-data">
              <span class="action-icon">🔄</span>
              <span>Сбросить данные к начальным</span>
            </button>
          </div>

          <div class="settings-footer-info">
            <p>Clock Messenger Prototype v2.4</p>
            <p>Native ES Modules • No Frameworks • Pure Web</p>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    const backBtn = this.container.querySelector('#btn-back-from-settings');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        state.setScreen('chats');
      });
    }

    const editProfileBtn = this.container.querySelector('#btn-edit-my-profile');
    if (editProfileBtn) {
      editProfileBtn.addEventListener('click', () => {
        modalController.showEditProfileModal();
      });
    }

    const themeSwitch = this.container.querySelector('#setting-theme-switch');
    if (themeSwitch) {
      themeSwitch.addEventListener('change', (e) => {
        const theme = e.target.checked ? 'dark' : 'light';
        state.updateSettings({ theme });
        modalController.showToast(theme === 'dark' ? 'Включена тёмная тема' : 'Включена светлая тема');
      });
    }

    const fontSizeBtns = this.container.querySelectorAll('.font-size-btn');
    fontSizeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const size = btn.dataset.size;
        state.updateSettings({ fontSize: size });
        modalController.showToast(`Размер шрифта: ${btn.textContent}`);
      });
    });

    const onlineSwitch = this.container.querySelector('#setting-online-switch');
    if (onlineSwitch) {
      onlineSwitch.addEventListener('change', (e) => {
        state.updateSettings({ showOnlineStatus: e.target.checked });
        modalController.showToast(e.target.checked ? 'Статус «В сети» отображается' : 'Статус «В сети» скрыт');
      });
    }

    const soundSwitch = this.container.querySelector('#setting-sound-switch');
    if (soundSwitch) {
      soundSwitch.addEventListener('change', (e) => {
        state.updateSettings({ soundEnabled: e.target.checked });
        if (e.target.checked) {
          sounds.playSent();
          modalController.showToast('Звуки уведомлений включены');
        } else {
          modalController.showToast('Звуки уведомлений выключены');
        }
      });
    }

    const mediaSwitch = this.container.querySelector('#setting-media-switch');
    if (mediaSwitch) {
      mediaSwitch.addEventListener('change', (e) => {
        state.updateSettings({ autoDownloadMedia: e.target.checked });
        modalController.showToast(e.target.checked ? 'Автозагрузка медиа включена' : 'Автозагрузка медиа выключена');
      });
    }

    const langSelect = this.container.querySelector('#setting-lang-select');
    if (langSelect) {
      langSelect.addEventListener('change', (e) => {
        state.updateSettings({ language: e.target.value });
        modalController.showToast(`Язык изменен на ${e.target.value.toUpperCase()}`);
      });
    }

    const logoutBtn = this.container.querySelector('#btn-logout-session');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        modalController.showToast('Сессия завершена. Возврат к чатам...');
        setTimeout(() => {
          state.setScreen('chats');
        }, 500);
      });
    }

    const resetBtn = this.container.querySelector('#btn-reset-demo-data');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        state.resetAllData();
        modalController.showToast('Данные сброшены к исходным');
      });
    }
  }
}
