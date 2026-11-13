/**
 * CSE AlumniConnect - Achievement Module & Celebration System
 */

import { db } from '../db.js';

export class AchievementsModule {
  constructor(app) {
    this.app = app;
  }

  renderAchievements(categoryFilter = 'All') {
    const achievements = db.getCollection('achievements');
    const categories = ['All', 'Award', 'Certification', 'Promotion', 'Research', 'Publication', 'Entrepreneurship', 'Competition', 'Higher Studies'];

    let filtered = achievements;
    if (categoryFilter !== 'All') {
      filtered = achievements.filter(a => a.category === categoryFilter);
    }

    const cardsHTML = filtered.length ? filtered.map(a => `
      <div class="card" style="display: flex; gap: 1.25rem; align-items: flex-start;">
        <div style="width: 60px; height: 60px; border-radius: var(--radius-md); background: linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(239, 68, 68, 0.2)); border: 1px solid rgba(245, 158, 11, 0.4); display: flex; align-items: center; justify-content: center; font-size: 2rem;">
          ${this.getCategoryIcon(a.category)}
        </div>

        <div style="flex: 1;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div>
              <span class="pill" style="font-size: 0.72rem; background: rgba(245, 158, 11, 0.15); color: #fbbf24; font-weight: 700;">${a.category}</span>
              <h3 style="font-size: 1.1rem; font-weight: 800; color: #fff; margin-top: 4px;">${a.title}</h3>
              <div style="font-size: 0.82rem; color: var(--primary); font-weight: 700;">
                By <span style="cursor: pointer; text-decoration: underline;" onclick="app.viewProfile('${a.userId}')">${a.userName}</span> (${a.userBatch})
              </div>
            </div>
            <span style="font-size: 0.78rem; color: var(--text-muted);">📅 ${a.date}</span>
          </div>

          <div style="font-size: 0.85rem; color: #cbd5e1; margin-top: 6px; font-weight: 600;">
            🏢 Issuing Organization: ${a.organization}
          </div>
          <p style="font-size: 0.88rem; color: var(--text-muted); margin-top: 4px;">${a.description}</p>
        </div>
      </div>
    `).join('') : `
      <div class="card text-center" style="padding: 3rem;">
        <h3>No achievements recorded under "${categoryFilter}"</h3>
      </div>
    `;

    return `
      <div style="display: flex; flex-direction: column; gap: 1.25rem;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h1 style="font-size: 1.6rem; font-weight: 800;">CSE Achievements Showcase</h1>
            <p style="color: var(--text-muted);">Celebrating awards, publications, certifications, and entrepreneurship milestones of CSE students and alumni</p>
          </div>
          <button class="btn btn-primary" onclick="app.achievements.openAddAchievementModal()">
            🏆 Share Achievement
          </button>
        </div>

        <!-- Category Filters -->
        <div style="display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px;">
          ${categories.map(c => `
            <button class="btn ${categoryFilter === c ? 'btn-primary' : 'btn-secondary'} btn-sm" onclick="app.achievements.filterCategory('${c}')">
              ${c}
            </button>
          `).join('')}
        </div>

        <div style="display: flex; flex-direction: column; gap: 1rem;">
          ${cardsHTML}
        </div>
      </div>
    `;
  }

  filterCategory(cat) {
    document.getElementById('mainContainer').innerHTML = this.renderAchievements(cat);
  }

  openAddAchievementModal() {
    const modalHTML = `
      <div class="modal-overlay" id="addAchievementModal">
        <div class="modal-content animate-fade-in" style="max-width: 520px;">
          <div class="modal-header">
            <h3>Add Achievement / Award</h3>
            <button class="close-btn" onclick="app.closeModal('addAchievementModal')">&times;</button>
          </div>

          <form onsubmit="app.achievements.handleSaveAchievement(event)">
            <div class="form-group">
              <label>Achievement Title *</label>
              <input type="text" id="achTitle" placeholder="e.g. Winner - Smart India Hackathon 2026 / AWS Certification" required>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Category *</label>
                <select id="achCategory" required>
                  <option value="Award">Award / Competition</option>
                  <option value="Certification">Certification</option>
                  <option value="Promotion">Promotion / Career Milestone</option>
                  <option value="Research">Research Project</option>
                  <option value="Publication">Publication / Paper</option>
                  <option value="Entrepreneurship">Entrepreneurship / Startup</option>
                  <option value="Higher Studies">Higher Studies Admission</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div class="form-group">
                <label>Date Received *</label>
                <input type="date" id="achDate" required>
              </div>
            </div>

            <div class="form-group">
              <label>Organization / Issuer *</label>
              <input type="text" id="achOrg" placeholder="e.g. IEEE / Ministry of Education / Google / AWS" required>
            </div>

            <div class="form-group">
              <label>Description & Highlights</label>
              <textarea id="achDesc" rows="3" placeholder="Provide context about the achievement..." required></textarea>
            </div>

            <button type="submit" class="btn btn-emerald w-full" style="padding: 0.75rem;">
              Publish Achievement & Celebrate 🎉
            </button>
          </form>
        </div>
      </div>
    `;

    document.getElementById('modalContainer').innerHTML = modalHTML;
  }

  handleSaveAchievement(e) {
    e.preventDefault();
    const currentUser = db.getCurrentUser();

    const newAch = {
      id: 'ach-' + Date.now(),
      userId: currentUser.id,
      userName: currentUser.fullName,
      userBatch: currentUser.batchName,
      title: document.getElementById('achTitle').value,
      category: document.getElementById('achCategory').value,
      date: document.getElementById('achDate').value,
      organization: document.getElementById('achOrg').value,
      description: document.getElementById('achDesc').value
    };

    db.addItem('achievements', newAch);

    // Broadcast to feed
    db.addItem('posts', {
      id: 'p-' + Date.now(),
      authorId: currentUser.id,
      authorName: currentUser.fullName,
      authorAvatar: currentUser.avatar,
      authorBatch: currentUser.batchName,
      authorRole: currentUser.role,
      authorDesignation: `${currentUser.designation} at ${currentUser.company}`,
      postType: 'Achievement',
      batchId: currentUser.batchId,
      isOfficial: false,
      content: `🏆 NEW ACHIEVEMENT: ${newAch.title}\n\nIssuing Organization: ${newAch.organization}\nCategory: ${newAch.category}\n\n${newAch.description}`,
      createdAt: new Date().toISOString(),
      reactions: { celebrate: 5, like: 10 },
      comments: []
    });

    this.app.closeModal('addAchievementModal');
    this.app.showToast('Achievement published & broadcasted! 🎉', 'success');
    this.app.renderMainContent();
  }

  getCategoryIcon(cat) {
    switch (cat) {
      case 'Award': return '🥇';
      case 'Certification': return '📜';
      case 'Promotion': return '🚀';
      case 'Research': return '🔬';
      case 'Publication': return '📄';
      case 'Entrepreneurship': return '💡';
      case 'Higher Studies': return '🎓';
      default: return '🏆';
    }
  }
}
