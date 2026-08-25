import { state } from '../state.js';
import { escapeHtml, getInitials, getAvatarColor } from '../utils/helpers.js';
import { sounds } from '../sound.js';

class ModalController {
  constructor() {
    this.container = null;
    this.activeCallInterval = null;
  }

  init(containerEl) {
    this.container = containerEl;
  }

  showToast(message, duration = 2500) {
    const toast = document.createElement('div');
    toast.className = 'clock-toast';
    toast.innerHTML = `<span class="toast-text">${escapeHtml(message)}</span>`;
    document.body.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add('visible'));

    setTimeout(() => {
      toast.classList.remove('visible');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  showNewChatModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-backdrop';
    modal.innerHTML = `
      <div class="modal-dialog">
        <div class="modal-header">
          <h3>Новый диалог</h3>
          <button class="icon-btn close-btn" title="Закрыть">✕</button>
        </div>
        <form id="new-chat-form" class="modal-body">
          <div class="form-group">
            <label>Имя контакта или группы</label>
            <input type="text" id="new-chat-name" class="form-input" placeholder="Например: Иван Петров" required autofocus />
          </div>
          <div class="form-group">
            <label>Юзернейм (необязательно)</label>
            <div class="input-with-prefix">
              <span class="prefix">@</span>
              <input type="text" id="new-chat-username" class="form-input" placeholder="ivan_dev" />
            </div>
          </div>
          <div class="form-group">
            <label>О себе / Описание</label>
            <input type="text" id="new-chat-bio" class="form-input" placeholder="Статус или описание" />
          </div>
          <div class="form-group checkbox-group">
            <label class="custom-checkbox">
              <input type="checkbox" id="new-chat-isgroup" />
              <span class="checkmark"></span>
              Создать как групповой чат
            </label>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn btn-secondary cancel-btn">Отмена</button>
            <button type="submit" class="btn btn-primary">Создать чат</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modal);
    requestAnimationFrame(() => modal.classList.add('visible'));

    const close = () => {
      modal.classList.remove('visible');
      setTimeout(() => modal.remove(), 250);
    };

    modal.querySelector('.close-btn').addEventListener('click', close);
    modal.querySelector('.cancel-btn').addEventListener('click', close);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) close();
    });

    const form = modal.querySelector('#new-chat-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = modal.querySelector('#new-chat-name').value.trim();
      const username = modal.querySelector('#new-chat-username').value.trim();
      const bio = modal.querySelector('#new-chat-bio').value.trim();
      const isGroup = modal.querySelector('#new-chat-isgroup').checked;

      if (!name) return;

      state.createNewChat({ name, username, bio, isGroup });
      this.showToast(isGroup ? `Группа "${name}" создана` : `Чат с ${name} создан`);
      close();
    });
  }

  showForwardModal(messageId) {
    const modal = document.createElement('div');
    modal.className = 'modal-backdrop';
    
    const chatsList = state.chats
      .map(chat => {
        const initials = getInitials(chat.name);
        const bg = getAvatarColor(chat.name);
        return `
          <div class="forward-chat-item" data-chat-id="${escapeHtml(chat.id)}">
            <div class="avatar avatar-sm" style="background: ${bg};">${initials}</div>
            <div class="forward-chat-info">
              <span class="forward-chat-name">${escapeHtml(chat.name)}</span>
              <span class="forward-chat-sub">${chat.isGroup ? 'Группа' : '@' + escapeHtml(chat.username)}</span>
            </div>
            <button class="btn btn-sm btn-primary forward-action-btn">Отправить</button>
          </div>
        `;
      })
      .join('');

    modal.innerHTML = `
      <div class="modal-dialog">
        <div class="modal-header">
          <h3>Переслать сообщение</h3>
          <button class="icon-btn close-btn" title="Закрыть">✕</button>
        </div>
        <div class="modal-body modal-scrollable">
          <div class="forward-chats-container">
            ${chatsList}
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    requestAnimationFrame(() => modal.classList.add('visible'));

    const close = () => {
      modal.classList.remove('visible');
      setTimeout(() => modal.remove(), 250);
    };

    modal.querySelector('.close-btn').addEventListener('click', close);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) close();
    });

    modal.querySelectorAll('.forward-chat-item').forEach(item => {
      item.addEventListener('click', () => {
        const targetChatId = item.dataset.chatId;
        state.forwardMessage(messageId, targetChatId);
        this.showToast('Сообщение переслано');
        close();
      });
    });
  }

  showDeleteMessageConfirm(messageId) {
    const modal = document.createElement('div');
    modal.className = 'modal-backdrop';
    modal.innerHTML = `
      <div class="modal-dialog modal-dialog-sm">
        <div class="modal-header">
          <h3>Удалить сообщение?</h3>
          <button class="icon-btn close-btn" title="Закрыть">✕</button>
        </div>
        <div class="modal-body">
          <p class="modal-desc">Вы действительно хотите удалить это сообщение? Это действие нельзя отменить.</p>
          <div class="modal-actions">
            <button type="button" class="btn btn-secondary cancel-btn">Отмена</button>
            <button type="button" class="btn btn-danger confirm-btn">Удалить</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    requestAnimationFrame(() => modal.classList.add('visible'));

    const close = () => {
      modal.classList.remove('visible');
      setTimeout(() => modal.remove(), 250);
    };

    modal.querySelector('.close-btn').addEventListener('click', close);
    modal.querySelector('.cancel-btn').addEventListener('click', close);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) close();
    });

    modal.querySelector('.confirm-btn').addEventListener('click', () => {
      state.deleteMessage(messageId);
      this.showToast('Сообщение удалено');
      close();
    });
  }

  showDeleteChatConfirm(chatId) {
    const chat = state.chats.find(c => c.id === chatId);
    const chatName = chat ? chat.name : 'этот чат';

    const modal = document.createElement('div');
    modal.className = 'modal-backdrop';
    modal.innerHTML = `
      <div class="modal-dialog modal-dialog-sm">
        <div class="modal-header">
          <h3>Удалить чат?</h3>
          <button class="icon-btn close-btn" title="Закрыть">✕</button>
        </div>
        <div class="modal-body">
          <p class="modal-desc">Вы уверены, что хотите удалить историю чата «${escapeHtml(chatName)}»?</p>
          <div class="modal-actions">
            <button type="button" class="btn btn-secondary cancel-btn">Отмена</button>
            <button type="button" class="btn btn-danger confirm-btn">Удалить чат</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    requestAnimationFrame(() => modal.classList.add('visible'));

    const close = () => {
      modal.classList.remove('visible');
      setTimeout(() => modal.remove(), 250);
    };

    modal.querySelector('.close-btn').addEventListener('click', close);
    modal.querySelector('.cancel-btn').addEventListener('click', close);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) close();
    });

    modal.querySelector('.confirm-btn').addEventListener('click', () => {
      state.deleteChat(chatId);
      this.showToast('Чат удален');
      close();
    });
  }

  showAttachMenu(anchorEl, onSelect) {
    const existing = document.querySelector('.attach-popup-menu');
    if (existing) {
      existing.remove();
      return;
    }

    const rect = anchorEl.getBoundingClientRect();
    const menu = document.createElement('div');
    menu.className = 'attach-popup-menu';
    
    // Position above anchor
    menu.style.bottom = `${window.innerHeight - rect.top + 8}px`;
    menu.style.left = `${Math.max(16, rect.left - 40)}px`;

    menu.innerHTML = `
      <button class="attach-item" data-type="photo">
        <span class="attach-icon">📷</span>
        <span class="attach-label">Фото или видео</span>
      </button>
      <button class="attach-item" data-type="file">
        <span class="attach-icon">📄</span>
        <span class="attach-label">Документ / Файл</span>
      </button>
      <button class="attach-item" data-type="voice">
        <span class="attach-icon">🎙</span>
        <span class="attach-label">Голосовое сообщение</span>
      </button>
      <button class="attach-item" data-type="poll">
        <span class="attach-icon">📊</span>
        <span class="attach-label">Опрос</span>
      </button>
      <button class="attach-item" data-type="error-test">
        <span class="attach-icon">⚠️</span>
        <span class="attach-label">Тест ошибки отправки</span>
      </button>
    `;

    document.body.appendChild(menu);
    requestAnimationFrame(() => menu.classList.add('visible'));

    const cleanup = (e) => {
      if (!menu.contains(e.target) && e.target !== anchorEl) {
        menu.classList.remove('visible');
        setTimeout(() => menu.remove(), 200);
        document.removeEventListener('click', cleanup);
      }
    };
    setTimeout(() => document.addEventListener('click', cleanup), 10);

    menu.querySelectorAll('.attach-item').forEach(item => {
      item.addEventListener('click', () => {
        const type = item.dataset.type;
        menu.remove();
        document.removeEventListener('click', cleanup);
        onSelect(type);
      });
    });
  }

  showCallModal(type = 'audio', interlocutor) {
    if (this.activeCallInterval) {
      clearInterval(this.activeCallInterval);
    }

    sounds.playCalling();

    const name = interlocutor ? interlocutor.name : 'Собеседник';
    const initials = getInitials(name);
    const bg = getAvatarColor(name);

    const modal = document.createElement('div');
    modal.className = 'modal-backdrop call-modal-backdrop';
    modal.innerHTML = `
      <div class="call-dialog">
        <div class="call-header">
          <span class="call-type-badge">${type === 'video' ? '📹 Видеозвонок Clock' : '📞 Аудиозвонок Clock'}</span>
          <span class="call-status" id="call-timer-status">Вызов...</span>
        </div>
        <div class="call-avatar-wrapper">
          <div class="call-avatar-pulse pulse-1"></div>
          <div class="call-avatar-pulse pulse-2"></div>
          <div class="call-avatar" style="background: ${bg};">${initials}</div>
        </div>
        <h2 class="call-user-name">${escapeHtml(name)}</h2>
        <p class="call-sub-status">Соединение защищено сквозным шифрованием</p>

        <div class="call-actions">
          <button class="call-action-btn mute-btn" id="call-btn-mute" title="Микрофон">
            <span>🎤</span>
          </button>
          ${type === 'video' ? `
            <button class="call-action-btn video-btn active" id="call-btn-video" title="Камера">
              <span>📹</span>
            </button>
          ` : ''}
          <button class="call-action-btn hangup-btn" id="call-btn-hangup" title="Завершить">
            <span>📞</span>
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    requestAnimationFrame(() => modal.classList.add('visible'));

    let seconds = 0;
    const timerStatus = modal.querySelector('#call-timer-status');
    
    // Simulate connection after 2 seconds
    const connectTimeout = setTimeout(() => {
      timerStatus.textContent = '00:00';
      this.activeCallInterval = setInterval(() => {
        seconds++;
        const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
        const secs = String(seconds % 60).padStart(2, '0');
        timerStatus.textContent = `${mins}:${secs}`;
      }, 1000);
    }, 2000);

    const endCall = () => {
      clearTimeout(connectTimeout);
      if (this.activeCallInterval) {
        clearInterval(this.activeCallInterval);
        this.activeCallInterval = null;
      }
      modal.classList.remove('visible');
      setTimeout(() => modal.remove(), 250);
      this.showToast('Звонок завершен');
    };

    modal.querySelector('#call-btn-hangup').addEventListener('click', endCall);

    const muteBtn = modal.querySelector('#call-btn-mute');
    muteBtn.addEventListener('click', () => {
      muteBtn.classList.toggle('disabled');
      this.showToast(muteBtn.classList.contains('disabled') ? 'Микрофон отключен' : 'Микрофон включен');
    });
  }

  showImageZoom(imageUrl, caption = '') {
    const modal = document.createElement('div');
    modal.className = 'modal-backdrop image-zoom-backdrop';
    modal.innerHTML = `
      <div class="image-zoom-container">
        <button class="icon-btn image-zoom-close" title="Закрыть">✕</button>
        <img src="${escapeHtml(imageUrl)}" alt="Zoomed preview" class="zoomed-image" />
        ${caption ? `<div class="image-zoom-caption">${escapeHtml(caption)}</div>` : ''}
      </div>
    `;

    document.body.appendChild(modal);
    requestAnimationFrame(() => modal.classList.add('visible'));

    const close = () => {
      modal.classList.remove('visible');
      setTimeout(() => modal.remove(), 250);
    };

    modal.querySelector('.image-zoom-close').addEventListener('click', close);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) close();
    });
  }

  showEditProfileModal() {
    const user = state.user;
    const modal = document.createElement('div');
    modal.className = 'modal-backdrop';
    modal.innerHTML = `
      <div class="modal-dialog">
        <div class="modal-header">
          <h3>Редактировать профиль</h3>
          <button class="icon-btn close-btn" title="Закрыть">✕</button>
        </div>
        <form id="edit-profile-form" class="modal-body">
          <div class="form-group">
            <label>Ваше имя</label>
            <input type="text" id="edit-profile-name" class="form-input" value="${escapeHtml(user.name)}" required />
          </div>
          <div class="form-group">
            <label>Имя пользователя (username)</label>
            <div class="input-with-prefix">
              <span class="prefix">@</span>
              <input type="text" id="edit-profile-username" class="form-input" value="${escapeHtml(user.username)}" required />
            </div>
          </div>
          <div class="form-group">
            <label>Телефон</label>
            <input type="text" id="edit-profile-phone" class="form-input" value="${escapeHtml(user.phone || '')}" />
          </div>
          <div class="form-group">
            <label>О себе (Bio)</label>
            <textarea id="edit-profile-bio" class="form-textarea" rows="3">${escapeHtml(user.bio || '')}</textarea>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn btn-secondary cancel-btn">Отмена</button>
            <button type="submit" class="btn btn-primary">Сохранить</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modal);
    requestAnimationFrame(() => modal.classList.add('visible'));

    const close = () => {
      modal.classList.remove('visible');
      setTimeout(() => modal.remove(), 250);
    };

    modal.querySelector('.close-btn').addEventListener('click', close);
    modal.querySelector('.cancel-btn').addEventListener('click', close);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) close();
    });

    const form = modal.querySelector('#edit-profile-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = modal.querySelector('#edit-profile-name').value.trim();
      const username = modal.querySelector('#edit-profile-username').value.trim();
      const phone = modal.querySelector('#edit-profile-phone').value.trim();
      const bio = modal.querySelector('#edit-profile-bio').value.trim();

      if (!name) return;

      state.updateUserProfile({ name, username, phone, bio });
      modalController.showToast('Профиль успешно обновлен');
      close();
    });
  }
}

export const modalController = new ModalController();
