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

  init() {
    state.applySettingsToDOM();
    this.renderBaseLayout();
    this.initComponents();
    this.bindNavigation();
    this.updateScreenVisibility(state.currentScreen);

    // Initial chat selection on desktop
    if (window.innerWidth > 900 && !state.activeChatId && state.chats.length > 0) {
      state.setScreen('chat', state.chats[0].id);
    }
  }

  renderBaseLayout() {
    this.appRoot.innerHTML = `
      <div class="clock-app-layout" id="clock-layout">
        <!-- Sidebar: Chat List -->
        <aside class="app-sidebar screen-panel" id="screen-chats">
          <!-- Chat list component injected here -->
        </aside>

        <!-- Main Content Area -->
        <main class="app-main screen-panel" id="screen-main">
          <div class="view-container" id="chat-view-container">
            <!-- Chat view component injected here -->
          </div>
          <div class="view-container" id="profile-view-container" style="display: none;">
            <!-- Profile view component injected here -->
          </div>
          <div class="view-container" id="settings-view-container" style="display: none;">
            <!-- Settings view component injected here -->
          </div>
        </main>
      </div>
      <div id="modal-portal"></div>
    `;

    modalController.init(document.getElementById('modal-portal'));
  }

  initComponents() {
    const sidebarEl = document.getElementById('screen-chats');
    const chatViewEl = document.getElementById('chat-view-container');
    const profileViewEl = document.getElementById('profile-view-container');
    const settingsViewEl = document.getElementById('settings-view-container');

    this.chatListComponent = new ChatListComponent(sidebarEl);
    this.chatViewComponent = new ChatViewComponent(chatViewEl);
    this.profileViewComponent = new ProfileViewComponent(profileViewEl);
    this.settingsViewComponent = new SettingsViewComponent(settingsViewEl);
  }

  bindNavigation() {
    state.on('screenChanged', ({ screen }) => {
      this.updateScreenVisibility(screen);
    });

    window.addEventListener('resize', () => {
      this.updateScreenVisibility(state.currentScreen);
    });
  }

  updateScreenVisibility(screen) {
    const layout = document.getElementById('clock-layout');
    const sidebar = document.getElementById('screen-chats');
    const main = document.getElementById('screen-main');
    const chatContainer = document.getElementById('chat-view-container');
    const profileContainer = document.getElementById('profile-view-container');
    const settingsContainer = document.getElementById('settings-view-container');

    const isMobile = window.innerWidth <= 900;

    // Reset views inside main
    chatContainer.style.display = 'none';
    profileContainer.style.display = 'none';
    settingsContainer.style.display = 'none';

    if (screen === 'chat') {
      chatContainer.style.display = 'flex';
    } else if (screen === 'profile') {
      profileContainer.style.display = 'flex';
    } else if (screen === 'settings') {
      settingsContainer.style.display = 'flex';
    }

    if (isMobile) {
      if (screen === 'chats') {
        sidebar.style.display = 'flex';
        main.style.display = 'none';
        layout.setAttribute('data-active-view', 'chats');
      } else {
        sidebar.style.display = 'none';
        main.style.display = 'flex';
        layout.setAttribute('data-active-view', screen);
      }
    } else {
      // Desktop: both sidebar and main are always visible
      sidebar.style.display = 'flex';
      main.style.display = 'flex';
      if (screen === 'chats') {
        chatContainer.style.display = 'flex';
      }
      layout.setAttribute('data-active-view', 'desktop');
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const app = new ClockApp();
  app.init();
});
