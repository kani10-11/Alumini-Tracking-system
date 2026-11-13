/**
 * CSE AlumniConnect - Alumni & Student Professional Profile & Career Tracking Module
 */

import { db } from '../db.js';

export class ProfileModule {
  constructor(app) {
    this.app = app;
  }

  renderProfile(userId = null) {
    const currentUser = db.getCurrentUser();
    const targetUserId = userId || currentUser.id;
    const user = db.getItem('users', targetUserId) || currentUser;

    const isOwnProfile = (targetUserId === currentUser.id);

    // Get user's career history
    const allCareer = db.getCollection('career_history');
    const userCareer = allCareer.filter(c => c.userId === user.id);

    // Get user's achievements
    const allAch = db.getCollection('achievements');
    const userAch = allAch.filter(a => a.userId === user.id);

    // Get user's posts
    const allPosts = db.getCollection('posts');
    const userPosts = allPosts.filter(p => p.authorId === user.id);

    // Get user's jobs
    const allJobs = db.getCollection('jobs');
    const userJobs = allJobs.filter(j => j.postedByUserId === user.id);

    const careerItemsHTML = userCareer.length ? userCareer.map(ch => `
      <div class="timeline-item">
        <div class="timeline-dot"></div>
        <div class="timeline-content">
          <h4>${ch.designation} <span style="color: var(--primary);">@ ${ch.company}</span></h4>
          <p style="color: var(--text-muted); font-size: 0.82rem;">📅 ${ch.startDate} – ${ch.endDate} • 📍 ${ch.location}</p>
          <p style="margin-top: 4px; font-size: 0.88rem; color: #cbd5e1;">${ch.description || ''}</p>
        </div>
      </div>
    `).join('') : `
      <div class="timeline-item">
        <div class="timeline-dot"></div>
        <div class="timeline-content">
          <h4>${user.designation} @ ${user.company}</h4>
          <p style="color: var(--text-muted); font-size: 0.82rem;">Present • 📍 ${user.location}</p>
        </div>
      </div>
    `;

    const achievementsHTML = userAch.length ? userAch.map(a => `
      <div class="card" style="padding: 0.9rem; background: rgba(255,255,255,0.03); display: flex; gap: 12px; align-items: flex-start;">
        <div style="font-size: 1.8rem;">🏆</div>
        <div>
          <h4 style="font-size: 0.95rem; font-weight: 700;">${a.title}</h4>
          <div style="font-size: 0.78rem; color: var(--emerald); font-weight: 700;">${a.category} • ${a.organization} (${a.date})</div>
          <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 4px;">${a.description}</p>
        </div>
      </div>
    `).join('') : `<p style="color: var(--text-muted); font-size: 0.85rem;">No achievements added yet.</p>`;

    return `
      <div style="display: flex; flex-direction: column; gap: 1.5rem;">
        <!-- Header Banner Card -->
        <div class="card" style="padding: 0; overflow: hidden; position: relative;">
          <!-- Cover Background -->
          <div style="height: 140px; background: linear-gradient(135deg, #1e3a8a, #0f172a); border-bottom: 1px solid var(--border-color);"></div>

          <div style="padding: 1.5rem; display: flex; justify-content: space-between; align-items: flex-end; margin-top: -60px;">
            <div style="display: flex; gap: 1.25rem; align-items: flex-end;">
              <img src="${user.avatar}" class="avatar-lg" alt="${user.fullName}">
              <div>
                <h2 style="font-size: 1.5rem; font-weight: 800; color: #fff;">${user.fullName}</h2>
                <div style="display: flex; align-items: center; gap: 8px; margin-top: 2px;">
                  <span class="role-badge ${user.role}">${user.role}</span>
                  <span style="color: var(--primary); font-weight: 700; font-size: 0.88rem;">${user.batchName}</span>
                </div>
                <div style="font-size: 0.9rem; color: #cbd5e1; margin-top: 4px;">
                  💼 <strong>${user.designation}</strong> at <span style="color: #fff;">${user.company}</span>
                </div>
                <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 2px;">
                  📍 ${user.location} • 🎓 Dept: Computer Science & Engineering
                </div>
              </div>
            </div>

            <div style="display: flex; gap: 8px;">
              ${isOwnProfile ? `
                <button class="btn btn-primary btn-sm" onclick="app.profile.openEditProfileModal()">✏️ Edit Profile</button>
                <button class="btn btn-emerald btn-sm" onclick="app.profile.openAddCareerModal()">+ Add Career Experience</button>
              ` : `
                <button class="btn btn-primary btn-sm" onclick="app.messaging.openChatWith('${user.id}')">💬 Private Message</button>
              `}
            </div>
          </div>
        </div>

        <!-- Two Column Layout: Left Details, Right Career & Posts -->
        <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 1.5rem;">
          <!-- Left Column -->
          <div style="display: flex; flex-direction: column; gap: 1.25rem;">
            <!-- About Card -->
            <div class="card">
              <h3 class="card-title">About</h3>
              <p style="font-size: 0.9rem; color: #cbd5e1;">${user.bio || 'CSE Department Member.'}</p>
            </div>

            <!-- Skills Card -->
            <div class="card">
              <h3 class="card-title">Technical Skills</h3>
              <div class="job-skills-tags">
                ${(user.skills || []).map(s => `<span class="skill-tag">${s}</span>`).join('')}
              </div>
            </div>

            <!-- Education & Links -->
            <div class="card">
              <h3 class="card-title">Education & Social</h3>
              <div style="font-size: 0.85rem; color: #cbd5e1; display: flex; flex-direction: column; gap: 8px;">
                <div>🎓 <strong>Higher Studies:</strong> ${user.higherStudies || 'B.Tech Computer Science & Engineering'}</div>
                <div>📅 <strong>Graduation Year:</strong> ${user.graduationYear}</div>
                <div>🔗 <strong>LinkedIn:</strong> <a href="${user.linkedin || '#'}" target="_blank" style="color: var(--cyan);">${user.linkedin || 'Profile Link'}</a></div>
              </div>
            </div>
          </div>

          <!-- Right Column -->
          <div style="display: flex; flex-direction: column; gap: 1.25rem;">
            <!-- Career Tracking Timeline Card -->
            <div class="card">
              <div class="card-title">
                <span>📈 Career Progression History</span>
                ${isOwnProfile ? `<button class="btn btn-secondary btn-sm" onclick="app.profile.openAddCareerModal()">+ Add Position</button>` : ''}
              </div>
              <p style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 1rem;">
                Historical career log showing job transitions and professional milestones over time.
              </p>
              
              <div class="career-timeline">
                ${careerItemsHTML}
              </div>
            </div>

            <!-- Achievements Card -->
            <div class="card">
              <div class="card-title">
                <span>🏆 Achievements & Certifications</span>
                ${isOwnProfile ? `<button class="btn btn-secondary btn-sm" onclick="app.achievements.openAddAchievementModal()">+ Add Achievement</button>` : ''}
              </div>
              <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                ${achievementsHTML}
              </div>
            </div>

            <!-- User Posts Activity Card -->
            <div class="card">
              <h3 class="card-title">Activity (${userPosts.length} Posts, ${userJobs.length} Jobs Posted)</h3>
              <div style="display: flex; flex-direction: column; gap: 1rem;">
                ${userPosts.length ? userPosts.map(p => this.app.feed.renderPostCard(p, currentUser)).join('') : '<p style="color: var(--text-muted); font-size: 0.85rem;">No posts published yet.</p>'}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  openEditProfileModal() {
    const user = db.getCurrentUser();
    const modalHTML = `
      <div class="modal-overlay" id="editProfileModal">
        <div class="modal-content animate-fade-in" style="max-width: 550px;">
          <div class="modal-header">
            <h3>Edit Professional Profile</h3>
            <button class="close-btn" onclick="app.closeModal('editProfileModal')">&times;</button>
          </div>

          <form onsubmit="app.profile.handleSaveProfile(event)">
            <div class="form-group">
              <label>Full Name</label>
              <input type="text" id="editName" value="${user.fullName}" required>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Current Company / Workplace</label>
                <input type="text" id="editCompany" value="${user.company}" required>
              </div>
              <div class="form-group">
                <label>Current Designation / Job Title</label>
                <input type="text" id="editDesignation" value="${user.designation}" required>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Current City / Location</label>
                <input type="text" id="editLocation" value="${user.location}">
              </div>
              <div class="form-group">
                <label>LinkedIn Profile URL</label>
                <input type="url" id="editLinkedin" value="${user.linkedin || ''}">
              </div>
            </div>

            <div class="form-group">
              <label>About Bio</label>
              <textarea id="editBio" rows="3">${user.bio || ''}</textarea>
            </div>

            <div class="form-group">
              <label>Technical Skills (Comma separated)</label>
              <input type="text" id="editSkills" value="${(user.skills || []).join(', ')}">
            </div>

            <button type="submit" class="btn btn-primary w-full" style="padding: 0.75rem;">
              Save Profile Changes
            </button>
          </form>
        </div>
      </div>
    `;

    document.getElementById('modalContainer').innerHTML = modalHTML;
  }

  handleSaveProfile(e) {
    e.preventDefault();
    const currentUser = db.getCurrentUser();
    const skillsStr = document.getElementById('editSkills').value;
    const skillsArr = skillsStr ? skillsStr.split(',').map(s => s.trim()).filter(Boolean) : [];

    const updates = {
      fullName: document.getElementById('editName').value,
      company: document.getElementById('editCompany').value,
      designation: document.getElementById('editDesignation').value,
      location: document.getElementById('editLocation').value,
      linkedin: document.getElementById('editLinkedin').value,
      bio: document.getElementById('editBio').value,
      skills: skillsArr
    };

    const updated = db.updateItem('users', currentUser.id, updates);
    db.setCurrentUser(updated);
    this.app.closeModal('editProfileModal');
    this.app.showToast('Profile updated!', 'success');
    this.app.renderMainContent();
  }

  openAddCareerModal() {
    const modalHTML = `
      <div class="modal-overlay" id="addCareerModal">
        <div class="modal-content animate-fade-in" style="max-width: 500px;">
          <div class="modal-header">
            <h3>Add Career History Record</h3>
            <button class="close-btn" onclick="app.closeModal('addCareerModal')">&times;</button>
          </div>

          <form onsubmit="app.profile.handleSaveCareer(event)">
            <div class="form-group">
              <label>Company / Organization Name *</label>
              <input type="text" id="chCompany" placeholder="e.g. Google / Microsoft / ABC Tech" required>
            </div>

            <div class="form-group">
              <label>Job Designation / Role *</label>
              <input type="text" id="chDesignation" placeholder="e.g. Senior Software Engineer" required>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Start Date</label>
                <input type="text" id="chStartDate" placeholder="e.g. 2024-06" required>
              </div>
              <div class="form-group">
                <label>End Date</label>
                <input type="text" id="chEndDate" placeholder="e.g. Present or 2025-12" required>
              </div>
            </div>

            <div class="form-group">
              <label>Location</label>
              <input type="text" id="chLocation" placeholder="e.g. Bengaluru, India">
            </div>

            <div class="form-group">
              <label>Key Responsibilities & Highlights</label>
              <textarea id="chDesc" rows="3" placeholder="Describe projects, tech stack used, leadership roles..."></textarea>
            </div>

            <button type="submit" class="btn btn-primary w-full" style="padding: 0.75rem;">
              Add Career Record
            </button>
          </form>
        </div>
      </div>
    `;

    document.getElementById('modalContainer').innerHTML = modalHTML;
  }

  handleSaveCareer(e) {
    e.preventDefault();
    const currentUser = db.getCurrentUser();

    const newRecord = {
      id: 'ch-' + Date.now(),
      userId: currentUser.id,
      company: document.getElementById('chCompany').value,
      designation: document.getElementById('chDesignation').value,
      startDate: document.getElementById('chStartDate').value,
      endDate: document.getElementById('chEndDate').value,
      location: document.getElementById('chLocation').value || currentUser.location,
      description: document.getElementById('chDesc').value
    };

    db.addItem('career_history', newRecord);
    this.app.closeModal('addCareerModal');
    this.app.showToast('Career record added to timeline!', 'success');
    this.app.renderMainContent();
  }
}
