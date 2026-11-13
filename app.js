/**
 * CSE AlumniConnect - Main Application Controller & Router
 */

import { db } from './db.js';
import { AuthModule } from './components/auth.js';
import { FeedModule } from './components/feed.js';
import { BatchesModule } from './components/batches.js';
import { ProfileModule } from './components/profile.js';
import { JobsModule } from './components/jobs.js';
import { AchievementsModule } from './components/achievements.js';
import { EventsModule } from './components/events.js';
import { MessagingModule } from './components/messaging.js';
import { SearchModule } from './components/search.js';
import { AdminModule } from './components/admin.js';

class App {
  constructor() {
    this.currentPage = 'feed'; // feed, mybatch, batches, batchGroup, profile, jobs, achievements, events, messages, search, admin
    this.selectedBatchId = null;

    // Initialize sub-modules
    this.auth = new AuthModule(this);
    this.feed = new FeedModule(this);
    this.batches = new BatchesModule(this);
    this.profile = new ProfileModule(this);
    this.jobs = new JobsModule(this);
    this.achievements = new AchievementsModule(this);
    this.events = new EventsModule(this);
    this.messaging = new MessagingModule(this);
    this.search = new SearchModule(this);
    this.admin = new AdminModule(this);

    this.init();
  }

  init() {
    const user = db.getCurrentUser();
    // Default initial page routing based on user role
    this.routeUserAfterLogin(user, false);
  }

  routeUserAfterLogin(user, showToastMsg = true) {
    if (user.role === 'Student' || user.role === 'Alumni') {
      // Auto-route to designated CSE batch hub
      this.selectedBatchId = user.batchId || 'b-2023-2027';
      this.currentPage = 'batchGroup';
      if (showToastMsg) {
        this.showToast(`Auto-routed to My Batch (${user.batchName})`, 'info');
      }
    } else if (user.role === 'Teacher') {
      this.currentPage = 'batches';
    } else if (user.role === 'Admin') {
      this.currentPage = 'admin';
    }
    this.render();
  }

  openPage(pageName, extraData = null) {
    this.currentPage = pageName;
    if (pageName === 'batchGroup' && extraData) {
      this.selectedBatchId = extraData;
    }
    this.render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  openBatch(batchId, tab = 'Posts') {
    this.selectedBatchId = batchId;
    this.currentPage = 'batchGroup';
    this.batchTab = tab;
    this.render();
  }

  viewProfile(userId) {
    this.currentPage = 'profile';
    this.viewUserId = userId;
    this.render();
  }

  render() {
    const user = db.getCurrentUser();
    const appEl = document.getElementById('app');

    // Header Navbar
    const navHTML = this.renderNavbar(user);

    // Left Sidebar Navigation
    const sidebarHTML = this.renderSidebar(user);

    // Right Sidebar Widgets
    const widgetsHTML = this.renderWidgetsSidebar();

    appEl.innerHTML = `
      ${navHTML}
      <div class="main-wrapper">
        <aside class="sidebar">
          ${sidebarHTML}
        </aside>

        <main class="content-area" id="mainContainer">
          <!-- Dynamic Main Content Views -->
        </main>

        <aside class="widgets-sidebar">
          ${widgetsHTML}
        </aside>
      </div>

      <!-- Toast Container -->
      <div id="toastContainer" style="position: fixed; bottom: 20px; right: 20px; z-index: 2000; display: flex; flex-direction: column; gap: 8px;"></div>
      
      <!-- Modal Container -->
      <div id="modalContainer"></div>
    `;

    this.renderMainContent();
  }

  renderMainContent() {
    const mainContainer = document.getElementById('mainContainer');
    if (!mainContainer) return;

    let contentHTML = '';

    switch (this.currentPage) {
      case 'feed':
        contentHTML = this.feed.renderFeed();
        break;
      case 'batches':
        contentHTML = this.batches.renderAllBatches();
        break;
      case 'mybatch':
        const currentUser = db.getCurrentUser();
        const batchId = currentUser.batchId || 'b-2023-2027';
        contentHTML = this.batches.renderBatchGroup(batchId, this.batchTab || 'Posts');
        break;
      case 'batchGroup':
        contentHTML = this.batches.renderBatchGroup(this.selectedBatchId || 'b-2023-2027', this.batchTab || 'Posts');
        break;
      case 'profile':
        contentHTML = this.profile.renderProfile(this.viewUserId);
        break;
      case 'jobs':
        contentHTML = this.jobs.renderJobs();
        break;
      case 'achievements':
        contentHTML = this.achievements.renderAchievements();
        break;
      case 'events':
        contentHTML = this.events.renderEvents();
        break;
      case 'messages':
        contentHTML = this.messaging.renderMessaging();
        break;
      case 'search':
        contentHTML = this.search.renderSearchResults(this.searchQuery || '');
        break;
      case 'admin':
        contentHTML = this.admin.renderDashboard();
        break;
      default:
        contentHTML = this.feed.renderFeed();
    }

    mainContainer.innerHTML = contentHTML;
  }

  renderNavbar(user) {
    const notifications = db.getCollection('notifications').filter(n => n.userId === user.id);
    const unreadNotifs = notifications.filter(n => !n.isRead).length;

    const messages = db.getCollection('messages');
    const unreadMsgs = messages.filter(m => m.receiverId === user.id && !m.isRead).length;

    return `
      <nav class="navbar">
        <div class="brand" onclick="app.openPage('feed')">
          <div class="brand-icon">🎓</div>
          <div class="brand-text">CSE <span>AlumniConnect</span></div>
          <span class="dept-tag">CSE Dept</span>
        </div>

        <div class="nav-search">
          <span class="nav-search-icon">🔍</span>
          <input type="text" placeholder="Search CSE members, skills, jobs..." 
                 onkeydown="if(event.key==='Enter') app.triggerSearch(this.value)">
        </div>

        <div class="nav-actions">
          <!-- Role Switcher -->
          <div class="role-switcher-badge">
            <span style="color: var(--text-muted);">View Mode:</span>
            <select onchange="app.auth.quickLogin(this.value)">
              <option value="u-1" ${user.id === 'u-1' ? 'selected' : ''}>Student (Arun 23-27)</option>
              <option value="u-2" ${user.id === 'u-2' ? 'selected' : ''}>Alumni (Sneha Google)</option>
              <option value="u-3" ${user.id === 'u-3' ? 'selected' : ''}>Alumni (Rahul AWS)</option>
              <option value="u-5" ${user.id === 'u-5' ? 'selected' : ''}>Teacher (Dr. Rajesh)</option>
              <option value="u-6" ${user.id === 'u-6' ? 'selected' : ''}>Admin (HOD Sundaram)</option>
            </select>
          </div>

          <!-- Notification Bell -->
          <button class="nav-icon-btn" title="Notifications" onclick="app.toggleNotificationDropdown()">
            🔔
            ${unreadNotifs > 0 ? `<span class="badge-dot"></span>` : ''}
          </button>

          <!-- User Profile Trigger -->
          <div class="user-profile-btn" onclick="app.viewProfile('${user.id}')">
            <img src="${user.avatar}" class="avatar-sm" alt="${user.fullName}">
            <div style="display: flex; flex-direction: column; text-align: left;">
              <span style="font-size: 0.85rem; font-weight: 700; color: #fff;">${user.fullName}</span>
              <span style="font-size: 0.72rem; color: var(--primary); font-weight: 700;">${user.role}</span>
            </div>
          </div>
        </div>
      </nav>
    `;
  }

  renderSidebar(user) {
    const messages = db.getCollection('messages');
    const unreadMsgs = messages.filter(m => m.receiverId === user.id && !m.isRead).length;

    return `
      <div class="sidebar-card">
        <div class="user-mini-profile">
          <img src="${user.avatar}" class="avatar-md" alt="${user.fullName}">
          <div class="name">${user.fullName}</div>
          <span class="role-badge ${user.role}">${user.role}</span>
          <div class="sub" style="margin-top: 4px;">${user.designation}</div>
          <div style="font-size: 0.75rem; color: var(--primary); font-weight: 700; margin-top: 2px;">
            ${user.batchName}
          </div>
        </div>

        <ul class="nav-menu">
          ${(user.role === 'Student' || user.role === 'Alumni') ? `
            <li class="nav-item ${this.currentPage === 'mybatch' || this.currentPage === 'batchGroup' ? 'active' : ''}">
              <button onclick="app.openPage('mybatch')">
                <span>🏫</span> My Batch
              </button>
            </li>
          ` : ''}

          <li class="nav-item ${this.currentPage === 'feed' ? 'active' : ''}">
            <button onclick="app.openPage('feed')">
              <span>📰</span> CSE Feed
            </button>
          </li>

          <li class="nav-item ${this.currentPage === 'batches' ? 'active' : ''}">
            <button onclick="app.openPage('batches')">
              <span>🎓</span> All Batches
            </button>
          </li>

          <li class="nav-item ${this.currentPage === 'jobs' ? 'active' : ''}">
            <button onclick="app.openPage('jobs')">
              <span>💼</span> Job Portal
            </button>
          </li>

          <li class="nav-item ${this.currentPage === 'achievements' ? 'active' : ''}">
            <button onclick="app.openPage('achievements')">
              <span>🏆</span> Achievements
            </button>
          </li>

          <li class="nav-item ${this.currentPage === 'events' ? 'active' : ''}">
            <button onclick="app.openPage('events')">
              <span>📅</span> Reunions & Events
            </button>
          </li>

          <li class="nav-item ${this.currentPage === 'messages' ? 'active' : ''}">
            <button onclick="app.openPage('messages')">
              <span>💬</span> Private Messages
              ${unreadMsgs > 0 ? `<span class="badge-count">${unreadMsgs}</span>` : ''}
            </button>
          </li>

          ${user.role === 'Admin' ? `
            <li class="nav-item ${this.currentPage === 'admin' ? 'active' : ''}">
              <button onclick="app.openPage('admin')" style="color: var(--rose);">
                <span>📊</span> Executive Dashboard
              </button>
            </li>
          ` : ''}
        </ul>
      </div>

      <div class="sidebar-card text-center" style="font-size: 0.78rem; color: var(--text-muted);">
        <div style="font-weight: 700; color: var(--text-main); margin-bottom: 4px;">Department of CSE</div>
        Exclusively for Computer Science & Engineering Students, Alumni & Faculty.
        <div style="margin-top: 8px;">
          <a href="#" onclick="app.openLoginModal()" style="color: var(--primary);">Login / Switch Account</a>
        </div>
      </div>
    `;
  }

  renderWidgetsSidebar() {
    const events = db.getCollection('events');
    const upcomingEvent = events[0];

    const users = db.getCollection('users').filter(u => u.role === 'Alumni');
    const featuredAlumni = users[0];

    return `
      <!-- Widget 1: Upcoming Reunion Spotlight -->
      ${upcomingEvent ? `
        <div class="card" style="border-top: 3px solid var(--emerald);">
          <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--emerald); font-weight: 800; letter-spacing: 0.5px;">
            🎉 Upcoming CSE Reunion
          </div>
          <h4 style="font-size: 1rem; font-weight: 800; color: #fff; margin-top: 4px;">${upcomingEvent.title}</h4>
          <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 4px;">📅 ${upcomingEvent.date} @ ${upcomingEvent.venue}</p>
          <button class="btn btn-emerald btn-sm w-full mt-4" onclick="app.openPage('events')">
            Register Delegate Pass →
          </button>
        </div>
      ` : ''}

      <!-- Widget 2: CSE Alumni Spotlight -->
      ${featuredAlumni ? `
        <div class="card" style="border-top: 3px solid var(--primary);">
          <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--primary); font-weight: 800;">
            🌟 CSE Alumni Spotlight
          </div>
          <div style="display: flex; gap: 10px; align-items: center; margin-top: 10px;">
            <img src="${featuredAlumni.avatar}" class="avatar-md" alt="${featuredAlumni.fullName}">
            <div>
              <strong style="font-size: 0.95rem; color: #fff;">${featuredAlumni.fullName}</strong>
              <div style="font-size: 0.8rem; color: var(--text-muted);">${featuredAlumni.designation} at <span style="color: var(--text-main);">${featuredAlumni.company}</span></div>
              <span class="role-badge Alumni">${featuredAlumni.batchName}</span>
            </div>
          </div>
          <p style="font-size: 0.82rem; color: #cbd5e1; margin-top: 8px;">"${featuredAlumni.bio}"</p>
          <button class="btn btn-secondary btn-sm w-full mt-4" onclick="app.messaging.openChatWith('${featuredAlumni.id}')">
            💬 Connect & Message
          </button>
        </div>
      ` : ''}
    `;
  }

  triggerSearch(query) {
    this.searchQuery = query;
    this.openPage('search');
  }

  toggleNotificationDropdown() {
    const user = db.getCurrentUser();
    const notifications = db.getCollection('notifications').filter(n => n.userId === user.id);

    const itemsHTML = notifications.map(n => `
      <div style="padding: 8px 12px; border-bottom: 1px solid var(--border-color); font-size: 0.82rem; cursor: pointer;" onclick="app.openPage('${n.link}')">
        <strong style="color: var(--primary); display: block;">${n.title}</strong>
        <span style="color: #cbd5e1;">${n.message}</span>
      </div>
    `).join('');

    const modalHTML = `
      <div class="modal-overlay" id="notifModal">
        <div class="modal-content animate-fade-in" style="max-width: 420px;">
          <div class="modal-header">
            <h3>Notifications</h3>
            <button class="close-btn" onclick="app.closeModal('notifModal')">&times;</button>
          </div>
          <div style="display: flex; flex-direction: column; max-height: 400px; overflow-y: auto;">
            ${itemsHTML.length ? itemsHTML : '<p style="padding: 16px; color: var(--text-muted); text-align: center;">No notifications.</p>'}
          </div>
        </div>
      </div>
    `;

    document.getElementById('modalContainer').innerHTML = modalHTML;
  }

  openLoginModal() {
    document.getElementById('modalContainer').innerHTML = this.auth.renderLoginModal();
  }

  openRegisterModal() {
    document.getElementById('modalContainer').innerHTML = this.auth.renderRegisterModal();
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.remove();
  }

  showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'card animate-fade-in';
    toast.style.padding = '0.75rem 1.25rem';
    toast.style.fontSize = '0.88rem';
    toast.style.fontWeight = '600';
    toast.style.color = '#fff';
    toast.style.borderLeft = type === 'success' ? '4px solid var(--emerald)' : (type === 'error' ? '4px solid var(--rose)' : '4px solid var(--primary)');
    toast.style.boxShadow = 'var(--shadow-lg)';
    toast.innerHTML = message;

    container.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
  }
}

// Global App Instance
window.app = new App();
