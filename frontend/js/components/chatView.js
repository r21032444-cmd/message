import { state } from '../state.js';
import { escapeHtml, getInitials, getAvatarColor } from '../utils/helpers.js';
import { formatTime, formatDayDivider, formatLastSeen } from '../utils/dateUtils.js';
import { modalController } from './modals.js';

export class ChatViewComponent {
  constructor(container) {
    this.container = container;
    this.isUserScrolledUp = false;
    this.activeVoiceAudios = new Map();
    this.activeContextMenu = null;
    this.init();
  }

  init() {
    this.render();
    this.bindEvents();

    state.on('messageAdded', (payload) => {
      if (state.activeChatId === payload.chatId) {
        this.appendSingleMessage(payload.message);
        if (!this.isUserScrolledUp) {
          this.scrollToBottom();
        } else {
          this.updateScrollBottomButton();
        }
      }
    });

    state.on('messageStatusChanged', (payload) => {
      if (state.activeChatId === payload.chatId) {
        this.updateMessageStatusInDOM(payload.messageId, payload.status);
      }
    });

    state.on('messageDeleted', (payload) => {
      if (state.activeChatId === payload.chatId) {
        const msgEl = this.container.querySelector(`[data-message-id="${payload.messageId}"]`);
        if (msgEl) msgEl.remove();
      }
    });

    state.on('typingChanged', (payload) => {
      if (state.activeChatId === payload.chatId) {
        this.updateTypingIndicator(payload.typing);
      }
    });

    state.on('screenChanged', ({ screen }) => {
      if (screen === 'chat') {
        this.render();
        this.scrollToBottom(false);
      }
    });
  }

  render() {
    const chat = state.getActiveChat();
    if (!chat) {
      this.container.innerHTML = `
        <div class="chat-placeholder-view">
          <div class="placeholder-content">
            <div class="clock-big-logo">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <h2>Выберите чат для начала общения</h2>
            <p>Clock — быстрый и стильный мессенджер с защитой данных и поддержкой мультимедиа</p>
          </div>
        </div>
      `;
      return;
    }

    const initials = getInitials(chat.name);
    const bg = getAvatarColor(chat.name);
    const statusText = chat.typing ? 'печатает...' : formatLastSeen(chat.status);

    this.container.innerHTML = `
      <div class="chat-view-panel">
        <header class="chat-view-header">
          <div class="header-left">
            <button class="icon-btn back-to-chats-btn mobile-only" id="btn-back-chats" title="Назад">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
            </button>
            <div class="chat-header-profile-btn" id="btn-open-profile" title="Открыть профиль">
              <div class="avatar-wrapper">
                <div class="avatar avatar-sm" style="background: ${bg};">${initials}</div>
                ${chat.status === 'online' ? '<span class="online-badge"></span>' : ''}
              </div>
              <div class="header-user-info">
                <h3 class="header-user-name">${escapeHtml(chat.name)}</h3>
                <span class="header-user-status ${chat.typing ? 'is-typing' : ''}" id="header-status-text">
                  ${escapeHtml(statusText)}
                </span>
              </div>
            </div>
          </div>

          <div class="header-actions">
            <button class="icon-btn" id="btn-call-audio" title="Позвонить">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
            </button>
            <button class="icon-btn" id="btn-call-video" title="Видеозвонок">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="23 7 16 12 23 17 23 7"></polygon>
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
              </svg>
            </button>
            <button class="icon-btn" id="btn-chat-options" title="Параметры">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="5" r="2"></circle>
                <circle cx="12" cy="12" r="2"></circle>
                <circle cx="12" cy="19" r="2"></circle>
              </svg>
            </button>
          </div>
        </header>

        <div class="chat-messages-container custom-scrollbar" id="messages-scroll-area">
          <div class="messages-list-inner" id="messages-list">
            ${this.renderMessagesGroupedByDay(chat.messages)}
          </div>
          <div class="typing-bubble-container ${chat.typing ? 'visible' : ''}" id="typing-indicator-bubble">
            <div class="typing-bubble">
              <span></span><span></span><span></span>
            </div>
            <span class="typing-name">${escapeHtml(chat.name.split(' ')[0])} печатает...</span>
          </div>
        </div>

        <button class="scroll-bottom-btn" id="btn-scroll-bottom" title="Вниз">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>

        <div class="reply-preview-bar" id="reply-preview-bar" style="display: none;">
          <div class="reply-line"></div>
          <div class="reply-info">
            <span class="reply-author" id="reply-author-name"></span>
            <span class="reply-snippet" id="reply-snippet-text"></span>
          </div>
          <button class="icon-btn reply-cancel-btn" id="btn-cancel-reply" title="Отменить ответ">✕</button>
        </div>

        <div class="chat-input-area">
          <button class="icon-btn attach-btn" id="btn-attach" title="Прикрепить файл">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
            </svg>
          </button>

          <div class="input-text-wrapper">
            <textarea id="message-textarea" class="message-input" placeholder="Напишите сообщение..." rows="1"></textarea>
          </div>

          <button class="icon-btn voice-record-btn" id="btn-voice-record" title="Записать голосовое">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
              <line x1="12" y1="19" x2="12" y2="23"></line>
              <line x1="8" y1="23" x2="16" y2="23"></line>
            </svg>
          </button>

          <button class="icon-btn send-message-btn" id="btn-send-message" title="Отправить">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      </div>
    `;

    this.bindMessageInteractions();
  }

  renderMessagesGroupedByDay(messages) {
    if (!messages || messages.length === 0) {
      return '<div class="empty-chat-hint">Здесь пока нет сообщений. Напишите первым!</div>';
    }

    let html = '';
    let lastDateLabel = null;

    messages.forEach(msg => {
      const dateLabel = formatDayDivider(msg.timestamp);
      if (dateLabel !== lastDateLabel) {
        html += `<div class="day-divider"><span>${escapeHtml(dateLabel)}</span></div>`;
        lastDateLabel = dateLabel;
      }
      html += this.renderMessageItemHTML(msg);
    });

    return html;
  }

  renderMessageItemHTML(msg) {
    const isMe = msg.senderId === state.user.id;
    const timeStr = formatTime(msg.timestamp);

    let statusHtml = '';
    if (isMe) {
      if (msg.status === 'read') {
        statusHtml = '<span class="status-ticks status-read" title="Прочитано">✓✓</span>';
      } else if (msg.status === 'delivered') {
        statusHtml = '<span class="status-ticks status-delivered" title="Доставлено">✓✓</span>';
      } else if (msg.status === 'error') {
        statusHtml = `
          <span class="status-error-badge" title="Ошибка отправки">
            <span class="error-mark">!</span>
            <button class="retry-send-btn" data-retry-id="${escapeHtml(msg.id)}">Повторить</button>
          </span>
        `;
      } else {
        statusHtml = '<span class="status-ticks status-sent" title="Отправлено">✓</span>';
      }
    }

    let replyHtml = '';
    if (msg.replyTo) {
      replyHtml = `
        <div class="message-reply-quote" data-quote-id="${escapeHtml(msg.replyTo.id || '')}">
          <div class="quote-bar"></div>
          <div class="quote-body">
            <span class="quote-sender">${escapeHtml(msg.replyTo.senderName || 'Пользователь')}</span>
            <span class="quote-text">${escapeHtml(msg.replyTo.text || 'Вложение')}</span>
          </div>
        </div>
      `;
    }

    let forwardHtml = '';
    if (msg.forwardedFrom) {
      forwardHtml = `
        <div class="message-forward-label">
          <span>Переслано от <b>${escapeHtml(msg.forwardedFrom)}</b></span>
        </div>
      `;
    }

    let bodyHtml = '';
    if (msg.type === 'image') {
      bodyHtml = `
        <div class="message-image-wrapper">
          <img src="${escapeHtml(msg.mediaUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80')}" alt="Изображение" class="message-preview-img" />
        </div>
        ${msg.text ? `<p class="message-text-caption">${escapeHtml(msg.text)}</p>` : ''}
      `;
    } else if (msg.type === 'voice') {
      const dur = msg.duration || 24;
      const mins = Math.floor(dur / 60);
      const secs = String(dur % 60).padStart(2, '0');
      bodyHtml = `
        <div class="voice-message-player" data-duration="${dur}">
          <button class="voice-play-btn" title="Воспроизвести">
            <svg class="play-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
            <svg class="pause-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="display:none;">
              <rect x="6" y="4" width="4" height="16"></rect>
              <rect x="14" y="4" width="4" height="16"></rect>
            </svg>
          </button>
          <div class="voice-waveform-container">
            <div class="voice-wave-bars">
              <span style="height: 35%"></span><span style="height: 60%"></span><span style="height: 90%"></span>
              <span style="height: 45%"></span><span style="height: 75%"></span><span style="height: 100%"></span>
              <span style="height: 55%"></span><span style="height: 80%"></span><span style="height: 40%"></span>
              <span style="height: 70%"></span><span style="height: 95%"></span><span style="height: 50%"></span>
              <span style="height: 85%"></span><span style="height: 30%"></span><span style="height: 65%"></span>
              <span style="height: 90%"></span><span style="height: 40%"></span><span style="height: 60%"></span>
            </div>
            <div class="voice-progress-fill"></div>
          </div>
          <span class="voice-duration">${mins}:${secs}</span>
        </div>
        ${msg.text ? `<p class="message-voice-caption">${escapeHtml(msg.text)}</p>` : ''}
      `;
    } else {
      bodyHtml = `<p class="message-text-content">${escapeHtml(msg.text)}</p>`;
    }

    return `
      <div class="message-row ${isMe ? 'message-outgoing' : 'message-incoming'}" data-message-id="${escapeHtml(msg.id)}">
        <div class="message-bubble ${msg.type === 'image' ? 'bubble-image' : ''} ${msg.status === 'error' ? 'bubble-error' : ''}">
          ${forwardHtml}
          ${replyHtml}
          ${bodyHtml}
          <div class="message-meta-row">
            <span class="message-time">${timeStr}</span>
            ${statusHtml}
          </div>
        </div>
      </div>
    `;
  }

  appendSingleMessage(msg) {
    const messagesList = this.container.querySelector('#messages-list');
    if (!messagesList) return;

    const emptyHint = messagesList.querySelector('.empty-chat-hint');
    if (emptyHint) emptyHint.remove();

    const dateLabel = formatDayDivider(msg.timestamp);
    const lastDivider = messagesList.querySelector('.day-divider:last-of-type');
    if (!lastDivider || lastDivider.textContent.trim() !== dateLabel) {
      const dividerEl = document.createElement('div');
      dividerEl.className = 'day-divider';
      dividerEl.innerHTML = `<span>${escapeHtml(dateLabel)}</span>`;
      messagesList.appendChild(dividerEl);
    }

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = this.renderMessageItemHTML(msg);
    const newMsgEl = tempDiv.firstElementChild;
    messagesList.appendChild(newMsgEl);

    this.bindSingleMessageEvents(newMsgEl);
  }

  updateMessageStatusInDOM(messageId, status) {
    const msgEl = this.container.querySelector(`[data-message-id="${messageId}"]`);
    if (!msgEl) return;

    const metaRow = msgEl.querySelector('.message-meta-row');
    const bubble = msgEl.querySelector('.message-bubble');
    if (!metaRow) return;

    const existingStatus = metaRow.querySelector('.status-ticks, .status-error-badge');
    if (existingStatus) existingStatus.remove();

    if (bubble) bubble.classList.remove('bubble-error');

    if (status === 'read') {
      metaRow.insertAdjacentHTML('beforeend', '<span class="status-ticks status-read" title="Прочитано">✓✓</span>');
    } else if (status === 'delivered') {
      metaRow.insertAdjacentHTML('beforeend', '<span class="status-ticks status-delivered" title="Доставлено">✓✓</span>');
    } else if (status === 'sent') {
      metaRow.insertAdjacentHTML('beforeend', '<span class="status-ticks status-sent" title="Отправлено">✓</span>');
    }
  }

  updateTypingIndicator(isTyping) {
    const bubble = this.container.querySelector('#typing-indicator-bubble');
    const statusText = this.container.querySelector('#header-status-text');
    const chat = state.getActiveChat();

    if (bubble) {
      bubble.classList.toggle('visible', isTyping);
    }
    if (statusText && chat) {
      if (isTyping) {
        statusText.textContent = 'печатает...';
        statusText.classList.add('is-typing');
      } else {
        statusText.textContent = formatLastSeen(chat.status);
        statusText.classList.remove('is-typing');
      }
    }
    if (isTyping && !this.isUserScrolledUp) {
      this.scrollToBottom();
    }
  }

  scrollToBottom(smooth = true) {
    const scrollArea = this.container.querySelector('#messages-scroll-area');
    if (!scrollArea) return;
    scrollArea.scrollTo({
      top: scrollArea.scrollHeight,
      behavior: smooth ? 'smooth' : 'auto'
    });
    this.isUserScrolledUp = false;
    this.updateScrollBottomButton();
  }

  updateScrollBottomButton() {
    const scrollBtn = this.container.querySelector('#btn-scroll-bottom');
    if (scrollBtn) {
      scrollBtn.classList.toggle('visible', this.isUserScrolledUp);
    }
  }

  bindEvents() {
    const chat = state.getActiveChat();
    if (!chat) return;

    const backBtn = this.container.querySelector('#btn-back-chats');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        state.setScreen('chats');
      });
    }

    const profileBtn = this.container.querySelector('#btn-open-profile');
    if (profileBtn) {
      profileBtn.addEventListener('click', () => {
        state.setScreen('profile');
      });
    }

    const callAudio = this.container.querySelector('#btn-call-audio');
    if (callAudio) {
      callAudio.addEventListener('click', () => {
        modalController.showCallModal('audio', chat);
      });
    }

    const callVideo = this.container.querySelector('#btn-call-video');
    if (callVideo) {
      callVideo.addEventListener('click', () => {
        modalController.showCallModal('video', chat);
      });
    }

    const chatOptions = this.container.querySelector('#btn-chat-options');
    if (chatOptions) {
      chatOptions.addEventListener('click', (e) => {
        e.stopPropagation();
        const rect = chatOptions.getBoundingClientRect();
        this.openChatHeaderMenu(rect.left - 120, rect.bottom + 4, chat);
      });
    }

    const scrollArea = this.container.querySelector('#messages-scroll-area');
    if (scrollArea) {
      scrollArea.addEventListener('scroll', () => {
        const distanceFromBottom = scrollArea.scrollHeight - scrollArea.scrollTop - scrollArea.clientHeight;
        this.isUserScrolledUp = distanceFromBottom > 120;
        this.updateScrollBottomButton();
      });
    }

    const scrollBottomBtn = this.container.querySelector('#btn-scroll-bottom');
    if (scrollBottomBtn) {
      scrollBottomBtn.addEventListener('click', () => {
        this.scrollToBottom(true);
      });
    }

    const textarea = this.container.querySelector('#message-textarea');
    const sendBtn = this.container.querySelector('#btn-send-message');
    const attachBtn = this.container.querySelector('#btn-attach');
    const voiceBtn = this.container.querySelector('#btn-voice-record');
    const cancelReplyBtn = this.container.querySelector('#btn-cancel-reply');

    if (cancelReplyBtn) {
      cancelReplyBtn.addEventListener('click', () => {
        state.replyTo = null;
        this.updateReplyBar();
      });
    }

    const autoResize = () => {
      if (!textarea) return;
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 140)}px`;
    };

    if (textarea) {
      textarea.addEventListener('input', autoResize);
      textarea.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.handleSendMessage();
        }
      });
    }

    if (sendBtn) {
      sendBtn.addEventListener('click', () => {
        this.handleSendMessage();
      });
    }

    if (attachBtn) {
      attachBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        modalController.showAttachMenu(attachBtn, (selectedType) => {
          this.handleAttachment(selectedType);
        });
      });
    }

    if (voiceBtn) {
      voiceBtn.addEventListener('click', () => {
        this.handleVoiceRecord();
      });
    }
  }

  handleSendMessage() {
    const textarea = this.container.querySelector('#message-textarea');
    if (!textarea) return;
    const text = textarea.value.trim();
    if (!text) return;

    state.sendMessage({
      text,
      type: 'text',
      replyTo: state.replyTo
    });

    textarea.value = '';
    textarea.style.height = 'auto';
    state.replyTo = null;
    this.updateReplyBar();
    textarea.focus();
  }

  handleAttachment(type) {
    if (type === 'photo') {
      const sampleImages = [
        'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80'
      ];
      const randomImg = sampleImages[Math.floor(Math.random() * sampleImages.length)];
      state.sendMessage({
        text: 'Фотография из галереи',
        type: 'image',
        mediaUrl: randomImg,
        replyTo: state.replyTo
      });
    } else if (type === 'voice') {
      this.handleVoiceRecord();
    } else if (type === 'file') {
      state.sendMessage({
        text: '📄 Документ: Project_Specification_2025.pdf (3.4 МБ)',
        type: 'text',
        replyTo: state.replyTo
      });
    } else if (type === 'poll') {
      state.sendMessage({
        text: '📊 Опрос: Когда проводим релиз Clock Messenger?\n1) Сегодня в 18:00\n2) Завтра утром\n3) В понедельник',
        type: 'text',
        replyTo: state.replyTo
      });
    } else if (type === 'error-test') {
      state.sendMessage({
        text: 'Тестовое сообщение с ошибкой сети',
        type: 'text',
        simulateError: true,
        replyTo: state.replyTo
      });
    }
  }

  handleVoiceRecord() {
    modalController.showToast('Голосовое сообщение записано');
    const randomDuration = Math.floor(12 + Math.random() * 25);
    state.sendMessage({
      text: '',
      type: 'voice',
      duration: randomDuration,
      replyTo: state.replyTo
    });
  }

  setReplyTo(message) {
    state.replyTo = message;
    this.updateReplyBar();
    const textarea = this.container.querySelector('#message-textarea');
    if (textarea) textarea.focus();
  }

  updateReplyBar() {
    const bar = this.container.querySelector('#reply-preview-bar');
    const authorEl = this.container.querySelector('#reply-author-name');
    const textEl = this.container.querySelector('#reply-snippet-text');

    if (!bar) return;

    if (state.replyTo) {
      bar.style.display = 'flex';
      if (authorEl) authorEl.textContent = state.replyTo.senderName;
      if (textEl) {
        textEl.textContent = state.replyTo.type === 'voice' ? '🎙 Голосовое сообщение' : (state.replyTo.text || '📷 Фото');
      }
    } else {
      bar.style.display = 'none';
    }
  }

  bindMessageInteractions() {
    this.container.querySelectorAll('.message-row').forEach(row => {
      this.bindSingleMessageEvents(row);
    });
  }

  bindSingleMessageEvents(row) {
    const messageId = row.dataset.messageId;
    const chat = state.getActiveChat();
    const msg = chat ? chat.messages.find(m => m.id === messageId) : null;

    // Retry button on error
    const retryBtn = row.querySelector('.retry-send-btn');
    if (retryBtn) {
      retryBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        state.retryMessage(messageId);
      });
    }

    // Image click to zoom
    const imgEl = row.querySelector('.message-preview-img');
    if (imgEl && msg) {
      imgEl.addEventListener('click', () => {
        modalController.showImageZoom(imgEl.src, msg.text);
      });
    }

    // Voice player play/pause simulation
    const voicePlayer = row.querySelector('.voice-message-player');
    if (voicePlayer && msg) {
      const playBtn = voicePlayer.querySelector('.voice-play-btn');
      const progressFill = voicePlayer.querySelector('.voice-progress-fill');
      const waveBars = voicePlayer.querySelector('.voice-wave-bars');
      const durationEl = voicePlayer.querySelector('.voice-duration');
      const playIcon = playBtn.querySelector('.play-icon');
      const pauseIcon = playBtn.querySelector('.pause-icon');

      playBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isPlaying = playBtn.classList.toggle('playing');

        if (isPlaying) {
          playIcon.style.display = 'none';
          pauseIcon.style.display = 'block';
          waveBars.classList.add('animating');

          let elapsed = 0;
          const total = msg.duration || 20;
          progressFill.style.width = '0%';

          const interval = setInterval(() => {
            elapsed += 0.2;
            const pct = Math.min(100, (elapsed / total) * 100);
            progressFill.style.width = `${pct}%`;

            const currentSec = Math.floor(elapsed);
            durationEl.textContent = `${Math.floor(currentSec / 60)}:${String(currentSec % 60).padStart(2, '0')}`;

            if (elapsed >= total) {
              clearInterval(interval);
              playBtn.classList.remove('playing');
              playIcon.style.display = 'block';
              pauseIcon.style.display = 'none';
              waveBars.classList.remove('animating');
              progressFill.style.width = '0%';
              durationEl.textContent = `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
            }
          }, 200);

          this.activeVoiceAudios.set(messageId, interval);
        } else {
          if (this.activeVoiceAudios.has(messageId)) {
            clearInterval(this.activeVoiceAudios.get(messageId));
            this.activeVoiceAudios.delete(messageId);
          }
          playIcon.style.display = 'block';
          pauseIcon.style.display = 'none';
          waveBars.classList.remove('animating');
        }
      });
    }

    // Reply quote scroll to original
    const quoteEl = row.querySelector('.message-reply-quote');
    if (quoteEl) {
      quoteEl.addEventListener('click', (e) => {
        e.stopPropagation();
        const quoteId = quoteEl.dataset.quoteId;
        const targetMsg = this.container.querySelector(`[data-message-id="${quoteId}"]`);
        if (targetMsg) {
          targetMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
          targetMsg.classList.add('highlight-target');
          setTimeout(() => targetMsg.classList.remove('highlight-target'), 1500);
        }
      });
    }

    // Right-click or long-press context menu
    row.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      this.openMessageContextMenu(e.clientX, e.clientY, messageId);
    });
  }

  openMessageContextMenu(x, y, messageId) {
    if (this.activeContextMenu) {
      this.activeContextMenu.remove();
      this.activeContextMenu = null;
    }

    const chat = state.getActiveChat();
    if (!chat) return;
    const msg = chat.messages.find(m => m.id === messageId);
    if (!msg) return;

    const menu = document.createElement('div');
    menu.className = 'context-menu';
    menu.style.left = `${Math.min(x, window.innerWidth - 200)}px`;
    menu.style.top = `${Math.min(y, window.innerHeight - 200)}px`;

    menu.innerHTML = `
      <button class="context-item" data-action="reply">
        <span class="context-icon">↩️</span>
        <span>Ответить</span>
      </button>
      <button class="context-item" data-action="forward">
        <span class="context-icon">↗️</span>
        <span>Переслать</span>
      </button>
      ${msg.text ? `
        <button class="context-item" data-action="copy">
          <span class="context-icon">📋</span>
          <span>Копировать</span>
        </button>
      ` : ''}
      <div class="context-divider"></div>
      <button class="context-item text-danger" data-action="delete">
        <span class="context-icon">🗑</span>
        <span>Удалить</span>
      </button>
    `;

    document.body.appendChild(menu);
    this.activeContextMenu = menu;

    const cleanup = (e) => {
      if (!menu.contains(e.target)) {
        menu.remove();
        this.activeContextMenu = null;
        document.removeEventListener('click', cleanup);
      }
    };
    setTimeout(() => document.addEventListener('click', cleanup), 10);

    menu.querySelectorAll('.context-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        menu.remove();
        this.activeContextMenu = null;
        document.removeEventListener('click', cleanup);

        if (action === 'reply') {
          this.setReplyTo(msg);
        } else if (action === 'forward') {
          modalController.showForwardModal(msg.id);
        } else if (action === 'copy') {
          if (navigator.clipboard && msg.text) {
            navigator.clipboard.writeText(msg.text);
            modalController.showToast('Текст скопирован');
          }
        } else if (action === 'delete') {
          modalController.showDeleteMessageConfirm(msg.id);
        }
      });
    });
  }

  openChatHeaderMenu(x, y, chat) {
    const menu = document.createElement('div');
    menu.className = 'context-menu';
    menu.style.left = `${Math.min(x, window.innerWidth - 200)}px`;
    menu.style.top = `${Math.min(y, window.innerHeight - 180)}px`;

    menu.innerHTML = `
      <button class="context-item" data-action="profile">
        <span class="context-icon">👤</span>
        <span>Информация о чате</span>
      </button>
      <button class="context-item" data-action="pin">
        <span class="context-icon">${chat.isPinned ? '📌' : '📍'}</span>
        <span>${chat.isPinned ? 'Открепить' : 'Закрепить'}</span>
      </button>
      <button class="context-item" data-action="archive">
        <span class="context-icon">${chat.isArchived ? '📥' : '📦'}</span>
        <span>${chat.isArchived ? 'Разархивировать' : 'Архивировать'}</span>
      </button>
      <div class="context-divider"></div>
      <button class="context-item text-danger" data-action="delete">
        <span class="context-icon">🗑</span>
        <span>Удалить чат</span>
      </button>
    `;

    document.body.appendChild(menu);

    const cleanup = (e) => {
      if (!menu.contains(e.target)) {
        menu.remove();
        document.removeEventListener('click', cleanup);
      }
    };
    setTimeout(() => document.addEventListener('click', cleanup), 10);

    menu.querySelectorAll('.context-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        menu.remove();
        document.removeEventListener('click', cleanup);

        if (action === 'profile') {
          state.setScreen('profile');
        } else if (action === 'pin') {
          state.togglePinChat(chat.id);
        } else if (action === 'archive') {
          state.toggleArchiveChat(chat.id);
        } else if (action === 'delete') {
          modalController.showDeleteChatConfirm(chat.id);
        }
      });
    });
  }
}
