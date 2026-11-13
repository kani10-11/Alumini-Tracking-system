/**
 * CSE AlumniConnect - Batch Community & Google Classroom-style Group Module
 */

import { db } from '../db.js';

export class BatchesModule {
  constructor(app) {
    this.app = app;
    this.activeTab = 'Posts'; // Posts, Members, Announcements, Events
  }

  renderAllBatches() {
    const batches = db.getCollection('batches');
    const users = db.getCollection('users');

    const batchCardsHTML = batches.map(b => {
      const batchMembers = users.filter(u => u.batchId === b.id);
      return `
        <div class="card" style="display: flex; flex-direction: column; justify-content: space-between; gap: 1rem; border-top: 4px solid var(--primary);">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
              <h3 style="font-size: 1.2rem; font-weight: 800; color: #fff;">${b.name}</h3>
              <span class="pill" style="background: rgba(59, 130, 246, 0.15); color: var(--primary); font-weight: 700;">
                👥 ${batchMembers.length} Members
              </span>
            </div>
            <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.75rem;">${b.description}</p>
            <div style="font-size: 0.8rem; color: #cbd5e1;">
              <strong>Batch Mentor:</strong> ${b.mentor}
            </div>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-color); padding-top: 0.75rem;">
            <div style="display: flex; margin-left: 10px;">
              ${batchMembers.slice(0, 4).map(m => `
                <img src="${m.avatar}" class="avatar-sm" style="margin-left: -10px; border: 2px solid var(--bg-surface);" title="${m.fullName}">
              `).join('')}
            </div>
            <button class="btn btn-primary btn-sm" onclick="app.openBatch('${b.id}')">
              Enter Batch Hub →
            </button>
          </div>
        </div>
      `;
    }).join('');

    return `
      <div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
          <div>
            <h1 style="font-size: 1.6rem; font-weight: 800;">CSE Batches Directory</h1>
            <p style="color: var(--text-muted);">Explore Computer Science & Engineering batch communities from 2020 through 2030</p>
          </div>
          ${db.getCurrentUser().role === 'Admin' ? `
            <button class="btn btn-emerald" onclick="app.admin.openAddBatchModal()">+ Add New Batch</button>
          ` : ''}
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.25rem;">
          ${batchCardsHTML}
        </div>
      </div>
    `;
  }

  renderBatchGroup(batchId, activeTab = 'Posts') {
    this.activeTab = activeTab;
    const batch = db.getItem('batches', batchId);
    if (!batch) return `<div>Batch not found</div>`;

    const currentUser = db.getCurrentUser();
    const allUsers = db.getCollection('users');
    const batchMembers = allUsers.filter(u => u.batchId === batch.id);
    const teachers = allUsers.filter(u => u.role === 'Teacher');

    let tabContentHTML = '';

    if (this.activeTab === 'Posts') {
      tabContentHTML = this.app.feed.renderFeed(batch.id);
    } else if (this.activeTab === 'Members') {
      tabContentHTML = this.renderMembersTab(batchMembers, teachers);
    } else if (this.activeTab === 'Announcements') {
      tabContentHTML = this.renderAnnouncementsTab(batch.id);
    } else if (this.activeTab === 'Events') {
      tabContentHTML = this.renderEventsTab(batch.name);
    }

    return `
      <div style="display: flex; flex-direction: column; gap: 1.5rem;">
        <!-- Batch Banner Header -->
        <div class="batch-header-banner">
          <div>
            <div style="font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px; color: var(--primary); font-weight: 800;">
              Google Classroom-style Batch Hub
            </div>
            <div class="batch-title-group">
              <h1>🎓 ${batch.name}</h1>
            </div>
            <p>${batch.description}</p>
            <div class="batch-meta-pills">
              <span class="pill">👥 ${batchMembers.length} Members</span>
              <span class="pill">👨‍🏫 Mentor: ${batch.mentor}</span>
              <span class="pill">💻 Dept: Computer Science & Engineering</span>
            </div>
          </div>

          <div>
            ${currentUser.batchId === batch.id ? `
              <span class="btn btn-emerald btn-sm" style="cursor: default;">✓ My Designated Batch</span>
            ` : `
              <span class="role-badge Teacher">Browsing Batch</span>
            `}
          </div>
        </div>

        <!-- Group Navigation Tabs -->
        <div class="card" style="padding: 0.5rem 1rem;">
          <div class="tabs-header" style="margin-bottom: 0;">
            <button class="tab-btn ${this.activeTab === 'Posts' ? 'active' : ''}" onclick="app.openBatch('${batch.id}', 'Posts')">
              📝 Batch Feed & Posts
            </button>
            <button class="tab-btn ${this.activeTab === 'Members' ? 'active' : ''}" onclick="app.openBatch('${batch.id}', 'Members')">
              👥 Classmates & Teachers (${batchMembers.length})
            </button>
            <button class="tab-btn ${this.activeTab === 'Announcements' ? 'active' : ''}" onclick="app.openBatch('${batch.id}', 'Announcements')">
              📢 Announcements
            </button>
            <button class="tab-btn ${this.activeTab === 'Events' ? 'active' : ''}" onclick="app.openBatch('${batch.id}', 'Events')">
              📅 Batch Events
            </button>
          </div>
        </div>

        <!-- Active Tab Content -->
        <div>
          ${tabContentHTML}
        </div>
      </div>
    `;
  }

  renderMembersTab(members, teachers) {
    const memberCards = members.map(m => `
      <div class="card" style="display: flex; flex-direction: column; justify-content: space-between; gap: 0.75rem;">
        <div style="display: flex; gap: 12px; align-items: flex-start;">
          <img src="${m.avatar}" class="avatar-md" alt="${m.fullName}">
          <div>
            <h4 style="font-weight: 700; color: #fff; font-size: 1rem;">${m.fullName}</h4>
            <span class="role-badge ${m.role}">${m.role}</span>
            <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 4px;">
              ${m.designation} at <strong style="color: var(--text-main);">${m.company}</strong>
            </div>
            <div style="font-size: 0.75rem; color: var(--text-dim); margin-top: 2px;">
              📍 ${m.location || 'Chennai, India'}
            </div>
          </div>
        </div>

        <div class="job-skills-tags">
          ${(m.skills || []).slice(0, 4).map(s => `<span class="skill-tag">${s}</span>`).join('')}
        </div>

        <div style="display: flex; gap: 8px; border-top: 1px solid var(--border-color); padding-top: 0.75rem;">
          <button class="btn btn-secondary btn-sm w-full" onclick="app.viewProfile('${m.id}')">View Profile</button>
          <button class="btn btn-primary btn-sm w-full" onclick="app.messaging.openChatWith('${m.id}')">💬 Message</button>
        </div>
      </div>
    `).join('');

    return `
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.25rem;">
        ${memberCards}
      </div>
    `;
  }

  renderAnnouncementsTab(batchId) {
    const posts = db.getCollection('posts').filter(p => p.isOfficial || p.postType === 'College Update' || p.postType === 'Event Announcement');
    return `
      <div style="display: flex; flex-direction: column; gap: 1rem;">
        <div class="card" style="background: rgba(239, 68, 68, 0.08); border-color: rgba(239, 68, 68, 0.3);">
          <h3>📢 Official CSE Department & Batch Announcements</h3>
          <p style="color: var(--text-muted);">Important academic dates, faculty notices, and department events.</p>
        </div>
        ${posts.length ? posts.map(p => this.app.feed.renderPostCard(p, db.getCurrentUser())).join('') : `<p>No official announcements posted yet.</p>`}
      </div>
    `;
  }

  renderEventsTab(batchName) {
    return this.app.events.renderEvents(batchName);
  }
}
