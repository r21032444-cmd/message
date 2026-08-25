import { state } from '../state.js';
import { escapeHtml, getInitials, getAvatarColor } from '../utils/helpers.js';
import { formatLastSeen } from '../utils/dateUtils.js';
import { modalController } from './modals.js';

export class ProfileViewComponent {
  constructor(container) {
    this.container = container;
    this.activeTab = 'about'; // 'about' | 'media' | 'files' | 'links'
    this.inContacts = true;
    this.notificationsMuted = false;
    this.init();
  }

  init() {
    this.render();
    state.on('screenChanged', ({ screen }) => {
      if (screen === 'profile') {
        this.render();
      }
    });
  }

  render() {
    const chat = state.getActiveChat();
    if (!chat) {
      this.container.innerHTML = `
        <div class="empty-state">
          <h4>Профиль не выбран</h4>
          <button class="btn btn-secondary" id="btn-profile-to-chats">Вернуться к чатам</button>
        </div>
      `;
      const btn = this.container.querySelector('#btn-profile-to-chats');
      if (btn) btn.addEventListener('click', () => state.setScreen('chats'));
      return;
    }

    const initials = getInitials(chat.name);
    const bg = getAvatarColor(chat.name);
    const statusText = formatLastSeen(chat.status);

    this.container.innerHTML = `
      <div class="profile-view-panel custom-scrollbar">
        <header class="profile-header-bar">
          <button class="icon-btn" id="btn-back-to-chat" title="Назад к чату">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
          </button>
          <h3>Информация</h3>
          <button class="icon-btn" id="btn-profile-more" title="Параметры">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="5" r="2"></circle>
              <circle cx="12" cy="12" r="2"></circle>
              <circle cx="12" cy="19" r="2"></circle>
            </svg>
          </button>
        </header>

        <div class="profile-hero-section">
          <div class="profile-avatar-large" style="background: ${bg};">
            ${initials}
            ${chat.status === 'online' ? '<span class="online-ring"></span>' : ''}
          </div>
          <h2 class="profile-user-name">${escapeHtml(chat.name)}</h2>
          <span class="profile-user-status ${chat.status === 'online' ? 'status-online' : ''}">${escapeHtml(statusText)}</span>

          <div class="profile-quick-actions">
            <button class="profile-action-btn" id="btn-profile-call">
              <div class="action-icon-circle">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
              </div>
              <span>Позвонить</span>
            </button>

            <button class="profile-action-btn" id="btn-profile-video">
              <div class="action-icon-circle">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polygon points="23 7 16 12 23 17 23 7"></polygon>
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                </svg>
              </div>
              <span>Видеозвонок</span>
            </button>

            <button class="profile-action-btn ${this.inContacts ? 'active' : ''}" id="btn-profile-contact">
              <div class="action-icon-circle">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="8.5" cy="7" r="4"></circle>
                  <line x1="20" y1="8" x2="20" y2="14"></line>
                  <line x1="23" y1="11" x2="17" y2="11"></line>
                </svg>
              </div>
              <span id="label-contact-btn">${this.inContacts ? 'В контактах' : 'Добавить'}</span>
            </button>
          </div>
        </div>

        <div class="profile-tabs-nav">
          <button class="profile-tab ${this.activeTab === 'about' ? 'active' : ''}" data-tab="about">О себе</button>
          <button class="profile-tab ${this.activeTab === 'media' ? 'active' : ''}" data-tab="media">
            Медиа (${(chat.mediaList || []).length})
          </button>
          <button class="profile-tab ${this.activeTab === 'files' ? 'active' : ''}" data-tab="files">
            Файлы (${(chat.filesList || []).length})
          </button>
          <button class="profile-tab ${this.activeTab === 'links' ? 'active' : ''}" data-tab="links">
            Ссылки (${(chat.linksList || []).length})
          </button>
        </div>

        <div class="profile-tab-content" id="profile-tab-body">
          ${this.renderTabContent(chat)}
        </div>
      </div>
    `;

    this.bindEvents(chat);
  }

  renderTabContent(chat) {
    if (this.activeTab === 'about') {
      return `
        <div class="profile-info-card">
          <div class="info-row">
            <span class="info-label">О себе</span>
            <span class="info-value">${escapeHtml(chat.bio || 'Информация не указана')}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Имя пользователя</span>
            <span class="info-value info-link">@${escapeHtml(chat.username || 'unknown')}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Телефон / Статус связи</span>
            <span class="info-value">${escapeHtml(chat.phone || 'Не указан')}</span>
          </div>
          <div class="info-row info-row-toggle">
            <div class="toggle-text">
              <span class="info-label">Уведомления</span>
              <span class="toggle-sub">${this.notificationsMuted ? 'Выключены' : 'Включены'}</span>
            </div>
            <label class="switch">
              <input type="checkbox" id="profile-notif-switch" ${this.notificationsMuted ? '' : 'checked'} />
              <span class="slider round"></span>
            </label>
          </div>
        </div>
      `;
    }

    if (this.activeTab === 'media') {
      const media = chat.mediaList || [];
      if (media.length === 0) {
        return '<div class="empty-tab-hint">Нет медиафайлов в этом чате</div>';
      }
      return `
        <div class="profile-media-grid">
          ${media.map(m => `
            <div class="media-thumb-item" data-url="${escapeHtml(m.url)}">
              <img src="${escapeHtml(m.url)}" alt="Фото" loading="lazy" />
              <span class="media-date-badge">${escapeHtml(m.date)}</span>
            </div>
          `).join('')}
        </div>
      `;
    }

    if (this.activeTab === 'files') {
      const files = chat.filesList || [];
      if (files.length === 0) {
        return '<div class="empty-tab-hint">Нет прикрепленных файлов</div>';
      }
      return `
        <div class="profile-files-list">
          ${files.map(f => `
            <div class="file-item-row">
              <div class="file-icon-box">📁</div>
              <div class="file-details">
                <span class="file-name">${escapeHtml(f.name)}</span>
                <span class="file-meta">${escapeHtml(f.size)} • ${escapeHtml(f.date)}</span>
              </div>
              <button class="icon-btn download-file-btn" title="Скачать">⬇</button>
            </div>
          `).join('')}
        </div>
      `;
    }

    if (this.activeTab === 'links') {
      const links = chat.linksList || [];
      if (links.length === 0) {
        return '<div class="empty-tab-hint">Нет общих ссылок</div>';
      }
      return `
        <div class="profile-links-list">
          ${links.map(l => `
            <a href="${escapeHtml(l.url)}" target="_blank" rel="noopener noreferrer" class="link-item-row">
              <div class="link-icon-box">🔗</div>
              <div class="link-details">
                <span class="link-title">${escapeHtml(l.title)}</span>
                <span class="link-domain">${escapeHtml(l.domain || l.url)}</span>
              </div>
            </a>
          `).join('')}
        </div>
      `;
    }

    return '';
  }

  bindEvents(chat) {
    const backBtn = this.container.querySelector('#btn-back-to-chat');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        state.setScreen('chat', chat.id);
      });
    }

    const callAudio = this.container.querySelector('#btn-profile-call');
    if (callAudio) {
      callAudio.addEventListener('click', () => {
        modalController.showCallModal('audio', chat);
      });
    }

    const callVideo = this.container.querySelector('#btn-profile-video');
    if (callVideo) {
      callVideo.addEventListener('click', () => {
        modalController.showCallModal('video', chat);
      });
    }

    const contactBtn = this.container.querySelector('#btn-profile-contact');
    if (contactBtn) {
      contactBtn.addEventListener('click', () => {
        this.inContacts = !this.inContacts;
        contactBtn.classList.toggle('active', this.inContacts);
        const label = this.container.querySelector('#label-contact-btn');
        if (label) label.textContent = this.inContacts ? 'В контактах' : 'Добавить';
        modalController.showToast(this.inContacts ? 'Контакт сохранен' : 'Контакт удален из списка');
      });
    }

    const tabs = this.container.querySelectorAll('.profile-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.activeTab = tab.dataset.tab;
        const tabBody = this.container.querySelector('#profile-tab-body');
        if (tabBody) {
          tabBody.innerHTML = this.renderTabContent(chat);
          this.bindTabBodyEvents();
        }
      });
    });

    this.bindTabBodyEvents();
  }

  bindTabBodyEvents() {
    const notifSwitch = this.container.querySelector('#profile-notif-switch');
    if (notifSwitch) {
      notifSwitch.addEventListener('change', (e) => {
        this.notificationsMuted = !e.target.checked;
        const sub = this.container.querySelector('.toggle-sub');
        if (sub) sub.textContent = this.notificationsMuted ? 'Выключены' : 'Включены';
        modalController.showToast(this.notificationsMuted ? 'Уведомления отключены' : 'Уведомления включены');
      });
    }

    this.container.querySelectorAll('.media-thumb-item').forEach(item => {
      item.addEventListener('click', () => {
        const url = item.dataset.url;
        modalController.showImageZoom(url, 'Медиа из диалога');
      });
    });

    this.container.querySelectorAll('.download-file-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        modalController.showToast('Загрузка файла начата...');
      });
    });
  }
}
