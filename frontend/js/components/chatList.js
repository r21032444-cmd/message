import { state } from '../state.js';
import { escapeHtml, debounce, getInitials, getAvatarColor } from '../utils/helpers.js';
import { formatChatListDate } from '../utils/dateUtils.js';
import { modalController } from './modals.js';

export class ChatListComponent {
  constructor(container) {
    this.container = container;
    this.activeContextMenu = null;
    this.init();
  }

  init() {
    this.render();
    this.bindEvents();

    state.on('chatUpdated', () => this.renderListOnly());
    state.on('chatDeleted', () => this.renderListOnly());
    state.on('stateUpdated', () => this.renderListOnly());
    state.on('typingChanged', () => this.renderListOnly());
  }

  render() {
    this.container.innerHTML = `
      <div class="chat-list-panel">
        <header class="chat-list-header">
          <div class="header-top-row">
            <div class="brand-wrapper">
              <button class="icon-btn menu-toggle-btn" id="btn-open-settings" title="Настройки">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
              </button>
              <div class="brand-title">
                <svg class="brand-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <span>Clock</span>
              </div>
            </div>
            <div class="header-actions">
              <button class="icon-btn desktop-only" id="btn-desktop-new-chat" title="Новый чат">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 5v14M5 12h14"></path>
                </svg>
              </button>
            </div>
          </div>

          <div class="search-bar-wrapper">
            <div class="search-input-box">
              <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input type="text" id="chat-search-input" class="search-input" placeholder="Поиск по чатам и сообщениям..." value="${escapeHtml(state.searchQuery)}" />
              <button class="search-clear-btn ${state.searchQuery ? 'visible' : ''}" id="btn-clear-search" title="Очистить">✕</button>
            </div>
          </div>

          <div class="chat-filter-tabs">
            <button class="filter-tab ${state.activeFilter === 'all' ? 'active' : ''}" data-filter="all">Все чаты</button>
            <button class="filter-tab ${state.activeFilter === 'archived' ? 'active' : ''}" data-filter="archived">
              Архив ${state.chats.filter(c => c.isArchived).length > 0 ? `(${state.chats.filter(c => c.isArchived).length})` : ''}
            </button>
          </div>
        </header>

        <div class="chat-items-container custom-scrollbar" id="chat-items-list">
          <!-- Rendered items -->
        </div>

        <button class="fab-new-chat mobile-only" id="btn-mobile-new-chat" title="Новый чат">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
      </div>
    `;

    this.renderListOnly();
  }

  renderListOnly() {
    const listContainer = this.container.querySelector('#chat-items-list');
    if (!listContainer) return;

    const visibleChats = state.getVisibleChats();

    if (visibleChats.length === 0) {
      listContainer.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">💬</div>
          <h4>Чаты не найдены</h4>
          <p>${state.searchQuery ? 'Попробуйте изменить поисковый запрос' : 'Создайте новый чат, нажав кнопку ниже'}</p>
        </div>
      `;
      return;
    }

    const pinnedChats = visibleChats.filter(c => c.isPinned);
    const unpinnedChats = visibleChats.filter(c => !c.isPinned);

    let html = '';

    if (pinnedChats.length > 0) {
      html += `<div class="chat-section-label"><span>Закрепленные сообщения</span></div>`;
      html += pinnedChats.map(c => this.renderChatItemHTML(c)).join('');
      if (unpinnedChats.length > 0) {
        html += `<div class="pinned-divider"></div>`;
        html += `<div class="chat-section-label"><span>Все сообщения</span></div>`;
      }
    }

    html += unpinnedChats.map(c => this.renderChatItemHTML(c)).join('');
    listContainer.innerHTML = html;
    this.bindItemEvents(listContainer);
  }

  renderChatItemHTML(chat) {
    const lastMsg = chat.messages[chat.messages.length - 1];
    const isSelected = state.activeChatId === chat.id;
    const initials = getInitials(chat.name);
    const bg = getAvatarColor(chat.name);
    const timeStr = lastMsg ? formatChatListDate(lastMsg.timestamp) : '';
    const isOnline = chat.status === 'online';

    let previewText = '';
    let statusIcon = '';

    if (chat.typing) {
      previewText = `<span class="typing-text-preview"><span class="dots-pulse">...</span> печатает...</span>`;
    } else if (lastMsg) {
      const isMe = lastMsg.senderId === state.user.id;
      const prefix = isMe ? '<span class="msg-prefix">Вы: </span>' : '';

      if (isMe) {
        if (lastMsg.status === 'read') {
          statusIcon = '<span class="status-ticks status-read" title="Прочитано">✓✓</span>';
        } else if (lastMsg.status === 'delivered') {
          statusIcon = '<span class="status-ticks status-delivered" title="Доставлено">✓✓</span>';
        } else if (lastMsg.status === 'error') {
          statusIcon = '<span class="status-ticks status-error" title="Ошибка">!</span>';
        } else {
          statusIcon = '<span class="status-ticks status-sent" title="Отправлено">✓</span>';
        }
      }

      if (lastMsg.type === 'voice') {
        previewText = `${prefix}<span class="preview-media-icon">🎙</span> Голосовое сообщение`;
      } else if (lastMsg.type === 'image') {
        previewText = `${prefix}<span class="preview-media-icon">📷</span> Фотография`;
      } else {
        previewText = `${prefix}${escapeHtml(lastMsg.text || '')}`;
      }
    } else {
      previewText = '<span class="empty-preview">Нет сообщений</span>';
    }

    return `
      <div class="chat-item ${isSelected ? 'active' : ''} ${chat.isPinned ? 'is-pinned' : ''}" data-chat-id="${escapeHtml(chat.id)}">
        <div class="chat-avatar-wrapper">
          <div class="avatar avatar-md" style="background: ${bg};">
            ${initials}
          </div>
          ${isOnline ? '<span class="online-badge"></span>' : ''}
        </div>

        <div class="chat-main-info">
          <div class="chat-top-line">
            <h4 class="chat-name">${escapeHtml(chat.name)}</h4>
            <div class="chat-meta">
              ${statusIcon}
              <span class="chat-time">${timeStr}</span>
            </div>
          </div>

          <div class="chat-bottom-line">
            <div class="chat-preview-text">${previewText}</div>
            <div class="chat-badges">
              ${chat.isPinned ? '<span class="pin-icon" title="Закреплено">📌</span>' : ''}
              ${chat.unreadCount > 0 ? `<span class="unread-badge">${chat.unreadCount}</span>` : ''}
            </div>
          </div>
        </div>

        <button class="chat-more-btn" data-chat-id="${escapeHtml(chat.id)}" title="Опции чата">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="5" r="2"></circle>
            <circle cx="12" cy="12" r="2"></circle>
            <circle cx="12" cy="19" r="2"></circle>
          </svg>
        </button>
      </div>
    `;
  }

  bindEvents() {
    const searchInput = this.container.querySelector('#chat-search-input');
    const clearBtn = this.container.querySelector('#btn-clear-search');

    const handleSearch = debounce((query) => {
      state.searchQuery = query;
      if (clearBtn) {
        clearBtn.classList.toggle('visible', !!query);
      }
      this.renderListOnly();
    }, 300);

    searchInput.addEventListener('input', (e) => {
      handleSearch(e.target.value);
    });

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        state.searchQuery = '';
        clearBtn.classList.remove('visible');
        this.renderListOnly();
        searchInput.focus();
      });
    }

    const tabs = this.container.querySelectorAll('.filter-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        state.activeFilter = tab.dataset.filter;
        this.renderListOnly();
      });
    });

    const openNewChat = () => modalController.showNewChatModal();
    const desktopNewChat = this.container.querySelector('#btn-desktop-new-chat');
    const mobileNewChat = this.container.querySelector('#btn-mobile-new-chat');
    if (desktopNewChat) desktopNewChat.addEventListener('click', openNewChat);
    if (mobileNewChat) mobileNewChat.addEventListener('click', openNewChat);

    const openSettings = this.container.querySelector('#btn-open-settings');
    if (openSettings) {
      openSettings.addEventListener('click', () => {
        state.setScreen('settings');
      });
    }

    // Global click listener to close context menu
    document.addEventListener('click', (e) => {
      if (this.activeContextMenu && !this.activeContextMenu.contains(e.target)) {
        this.activeContextMenu.remove();
        this.activeContextMenu = null;
      }
    });
  }

  bindItemEvents(listContainer) {
    listContainer.querySelectorAll('.chat-item').forEach(item => {
      const chatId = item.dataset.chatId;

      item.addEventListener('click', (e) => {
        if (e.target.closest('.chat-more-btn')) return;
        state.setScreen('chat', chatId);
      });

      item.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        this.openContextMenu(e.clientX, e.clientY, chatId);
      });

      const moreBtn = item.querySelector('.chat-more-btn');
      if (moreBtn) {
        moreBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const rect = moreBtn.getBoundingClientRect();
          this.openContextMenu(rect.left - 120, rect.bottom + 4, chatId);
        });
      }
    });
  }

  openContextMenu(x, y, chatId) {
    if (this.activeContextMenu) {
      this.activeContextMenu.remove();
      this.activeContextMenu = null;
    }

    const chat = state.chats.find(c => c.id === chatId);
    if (!chat) return;

    const menu = document.createElement('div');
    menu.className = 'context-menu';
    menu.style.left = `${Math.min(x, window.innerWidth - 200)}px`;
    menu.style.top = `${Math.min(y, window.innerHeight - 180)}px`;

    menu.innerHTML = `
      <button class="context-item" data-action="pin">
        <span class="context-icon">${chat.isPinned ? '📌' : '📍'}</span>
        <span>${chat.isPinned ? 'Открепить' : 'Закрепить'}</span>
      </button>
      <button class="context-item" data-action="archive">
        <span class="context-icon">${chat.isArchived ? '📥' : '📦'}</span>
        <span>${chat.isArchived ? 'Разархивировать' : 'Архивировать'}</span>
      </button>
      <button class="context-item" data-action="read">
        <span class="context-icon">✓</span>
        <span>${chat.unreadCount > 0 ? 'Отметить как прочитанное' : 'Отметить как непрочитанное'}</span>
      </button>
      <div class="context-divider"></div>
      <button class="context-item text-danger" data-action="delete">
        <span class="context-icon">🗑</span>
        <span>Удалить чат</span>
      </button>
    `;

    document.body.appendChild(menu);
    this.activeContextMenu = menu;

    menu.querySelectorAll('.context-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        menu.remove();
        this.activeContextMenu = null;

        if (action === 'pin') {
          state.togglePinChat(chatId);
          modalController.showToast(chat.isPinned ? 'Чат закреплен' : 'Чат откреплен');
        } else if (action === 'archive') {
          state.toggleArchiveChat(chatId);
          modalController.showToast(chat.isArchived ? 'Чат архивирован' : 'Чат возвращен из архива');
        } else if (action === 'read') {
          if (chat.unreadCount > 0) {
            state.markChatAsRead(chatId);
          } else {
            state.markChatAsUnread(chatId);
          }
        } else if (action === 'delete') {
          modalController.showDeleteChatConfirm(chatId);
        }
      });
    });
  }
}
