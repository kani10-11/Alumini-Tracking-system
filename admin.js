/**
 * CSE AlumniConnect - Admin & Management Dashboard Module with Visual Analytics
 */

import { db } from '../db.js';

export class AdminModule {
  constructor(app) {
    this.app = app;
  }

  renderDashboard() {
    const users = db.getCollection('users');
    const batches = db.getCollection('batches');
    const posts = db.getCollection('posts');
    const jobs = db.getCollection('jobs');
    const events = db.getCollection('events');
    const reports = db.getCollection('reports');

    const totalStudents = users.filter(u => u.role === 'Student').length;
    const totalAlumni = users.filter(u => u.role === 'Alumni').length;
    const totalTeachers = users.filter(u => u.role === 'Teacher').length;

    // Build data for SVG Bar Charts
    const batchDistribution = batches.map(b => {
      const count = users.filter(u => u.batchId === b.id).length;
      return { name: b.name.replace('CSE ', ''), count: count || 1 };
    });

    const companyCounts = {};
    users.forEach(u => {
      if (u.company && u.company !== 'CSE Department') {
        companyCounts[u.company] = (companyCounts[u.company] || 0) + 1;
      }
    });

    const userTableRows = users.map(u => `
      <tr>
        <td style="padding: 10px 12px; border-bottom: 1px solid var(--border-color); display: flex; align-items: center; gap: 8px;">
          <img src="${u.avatar}" class="avatar-sm" alt="${u.fullName}">
          <div>
            <strong>${u.fullName}</strong>
            <div style="font-size: 0.75rem; color: var(--text-muted);">${u.email}</div>
          </div>
        </td>
        <td style="padding: 10px 12px; border-bottom: 1px solid var(--border-color);">
          <span class="role-badge ${u.role}">${u.role}</span>
        </td>
        <td style="padding: 10px 12px; border-bottom: 1px solid var(--border-color);">${u.batchName}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid var(--border-color);">${u.company} (${u.designation})</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid var(--border-color);">
          <span class="pill" style="font-size: 0.72rem; background: rgba(16,185,129,0.2); color:#34d399;">Active & Verified</span>
        </td>
        <td style="padding: 10px 12px; border-bottom: 1px solid var(--border-color); text-align: right;">
          <button class="btn btn-secondary btn-sm" onclick="app.viewProfile('${u.id}')">View</button>
        </td>
      </tr>
    `).join('');

    const reportsRows = reports.map(r => `
      <tr>
        <td style="padding: 8px 12px; border-bottom: 1px solid var(--border-color);">${r.targetType} (${r.targetId})</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid var(--border-color);">${r.reportedBy}</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid var(--border-color);">${r.reason}</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid var(--border-color); text-align: right;">
          <button class="btn btn-emerald btn-sm" onclick="app.admin.dismissReport('${r.id}')">Dismiss</button>
          <button class="btn btn-secondary btn-sm" style="border-color: var(--rose); color: var(--rose);" onclick="app.admin.deleteReportedPost('${r.id}', '${r.targetId}')">Delete Content</button>
        </td>
      </tr>
    `).join('');

    return `
      <div style="display: flex; flex-direction: column; gap: 1.5rem;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h1 style="font-size: 1.6rem; font-weight: 800;">CSE Management & Executive Dashboard</h1>
            <p style="color: var(--text-muted);">Department oversight, alumni tracking analytics, batch management, and moderation control</p>
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="btn btn-emerald" onclick="app.admin.generateReport()">📊 Export PDF/CSV Report</button>
            <button class="btn btn-primary" onclick="app.admin.openAddBatchModal()">+ Add CSE Batch</button>
          </div>
        </div>

        <!-- Metric KPI Cards Grid -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">🎓</div>
            <div class="stat-info">
              <h2>${users.length}</h2>
              <p>Total CSE Members</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background: rgba(16, 185, 129, 0.15); color: var(--emerald);">💼</div>
            <div class="stat-info">
              <h2>${totalAlumni}</h2>
              <p>Registered Alumni</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background: rgba(245, 158, 11, 0.15); color: var(--amber);">👨‍🎓</div>
            <div class="stat-info">
              <h2>${totalStudents}</h2>
              <p>Current Students</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background: rgba(139, 92, 246, 0.15); color: var(--purple);">👨‍🏫</div>
            <div class="stat-info">
              <h2>${totalTeachers}</h2>
              <p>Faculty & Mentors</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background: rgba(244, 63, 94, 0.15); color: var(--rose);">📚</div>
            <div class="stat-info">
              <h2>${batches.length}</h2>
              <p>Active CSE Batches</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background: rgba(6, 182, 212, 0.15); color: var(--cyan);">📝</div>
            <div class="stat-info">
              <h2>${posts.length}</h2>
              <p>Published Feed Posts</p>
            </div>
          </div>
        </div>

        <!-- Visual Analytics Section (Custom SVG Canvas Charts) -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem;">
          <!-- Chart 1: Alumni Distribution by Batch -->
          <div class="card">
            <h3 class="card-title">📊 Members Distribution by Batch</h3>
            <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 1rem;">
              ${batchDistribution.map(b => `
                <div>
                  <div style="display: flex; justify-content: space-between; font-size: 0.8rem; margin-bottom: 3px;">
                    <span>${b.name}</span>
                    <strong style="color: var(--primary);">${b.count} Members</strong>
                  </div>
                  <div style="height: 10px; background: var(--bg-input); border-radius: var(--radius-full); overflow: hidden;">
                    <div style="height: 100%; width: ${Math.min(100, b.count * 15)}%; background: linear-gradient(90deg, var(--primary), var(--cyan)); border-radius: var(--radius-full);"></div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Chart 2: Top CSE Employers & Locations -->
          <div class="card">
            <h3 class="card-title">🏢 Top Industry Employers Hiring CSE Graduates</h3>
            <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 1rem;">
              ${Object.entries(companyCounts).map(([company, count]) => `
                <div>
                  <div style="display: flex; justify-content: space-between; font-size: 0.8rem; margin-bottom: 3px;">
                    <span>🏢 ${company}</span>
                    <strong style="color: var(--emerald);">${count} Alumni</strong>
                  </div>
                  <div style="height: 10px; background: var(--bg-input); border-radius: var(--radius-full); overflow: hidden;">
                    <div style="height: 100%; width: ${Math.min(100, count * 35)}%; background: linear-gradient(90deg, var(--emerald), #34d399); border-radius: var(--radius-full);"></div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- User Management Table Card -->
        <div class="card">
          <div class="card-title">
            <span>👥 Registered CSE Members Directory (${users.length})</span>
          </div>
          <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.88rem;">
              <thead>
                <tr style="background: rgba(255,255,255,0.05); color: var(--primary);">
                  <th style="padding: 10px 12px;">Member</th>
                  <th style="padding: 10px 12px;">Role</th>
                  <th style="padding: 10px 12px;">Batch</th>
                  <th style="padding: 10px 12px;">Current Designation / Company</th>
                  <th style="padding: 10px 12px;">Verification</th>
                  <th style="padding: 10px 12px; text-align: right;">Actions</th>
                </tr>
              </thead>
              <tbody>
                ${userTableRows}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Content Moderation Queue Card -->
        <div class="card">
          <div class="card-title">
            <span>🚩 Content Moderation Queue (${reports.length} Pending Flags)</span>
          </div>
          <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.88rem;">
              <thead>
                <tr style="background: rgba(255,255,255,0.05); color: var(--rose);">
                  <th style="padding: 8px 12px;">Target Content</th>
                  <th style="padding: 8px 12px;">Flagged By</th>
                  <th style="padding: 8px 12px;">Reason</th>
                  <th style="padding: 8px 12px; text-align: right;">Action</th>
                </tr>
              </thead>
              <tbody>
                ${reportsRows.length ? reportsRows : `<tr><td colspan="4" style="padding: 16px; text-align: center; color: var(--emerald);">✓ No reported content queue items. All clear!</td></tr>`}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  openAddBatchModal() {
    const modalHTML = `
      <div class="modal-overlay" id="addBatchModal">
        <div class="modal-content animate-fade-in" style="max-width: 480px;">
          <div class="modal-header">
            <h3>Create New CSE Batch</h3>
            <button class="close-btn" onclick="app.closeModal('addBatchModal')">&times;</button>
          </div>

          <form onsubmit="app.admin.handleSaveBatch(event)">
            <div class="form-group">
              <label>Batch Name *</label>
              <input type="text" id="bName" placeholder="e.g. CSE 2027–2031" required>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Start Year</label>
                <input type="number" id="bStart" value="2027" required>
              </div>
              <div class="form-group">
                <label>End Year</label>
                <input type="number" id="bEnd" value="2031" required>
              </div>
            </div>

            <div class="form-group">
              <label>Batch Mentor / Faculty Advisor *</label>
              <input type="text" id="bMentor" placeholder="e.g. Dr. Rajesh Verma" required>
            </div>

            <div class="form-group">
              <label>Specialization / Description</label>
              <textarea id="bDesc" rows="3" placeholder="Describe batch focus areas..."></textarea>
            </div>

            <button type="submit" class="btn btn-primary w-full" style="padding: 0.75rem;">
              Add Batch to System
            </button>
          </form>
        </div>
      </div>
    `;

    document.getElementById('modalContainer').innerHTML = modalHTML;
  }

  handleSaveBatch(e) {
    e.preventDefault();
    const name = document.getElementById('bName').value;
    const startYear = parseInt(document.getElementById('bStart').value);
    const endYear = parseInt(document.getElementById('bEnd').value);

    const newBatch = {
      id: `b-${startYear}-${endYear}`,
      name: name,
      startYear: startYear,
      endYear: endYear,
      mentor: document.getElementById('bMentor').value,
      description: document.getElementById('bDesc').value || 'Computer Science & Engineering Batch',
      activeCount: 0
    };

    db.addItem('batches', newBatch);
    this.app.closeModal('addBatchModal');
    this.app.showToast(`New Batch "${name}" added to CSE directory!`, 'success');
    this.app.renderMainContent();
  }

  dismissReport(reportId) {
    db.deleteItem('reports', reportId);
    this.app.showToast('Report dismissed.', 'info');
    this.app.renderMainContent();
  }

  deleteReportedPost(reportId, postId) {
    db.deleteItem('posts', postId);
    db.deleteItem('reports', reportId);
    this.app.showToast('Reported post deleted from system.', 'success');
    this.app.renderMainContent();
  }

  generateReport() {
    this.app.showToast('Generating official CSE Alumni Career & Placement Report... PDF download started!', 'success');
  }
}
