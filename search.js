/**
 * CSE AlumniConnect - Global Search Engine Module
 */

import { db } from '../db.js';

export class SearchModule {
  constructor(app) {
    this.app = app;
  }

  renderSearchResults(query = '') {
    const q = query.trim().toLowerCase();
    if (!q) {
      return `
        <div class="card text-center" style="padding: 3rem;">
          <div style="font-size: 3rem; margin-bottom: 1rem;">🔍</div>
          <h2>Search CSE AlumniConnect</h2>
          <p style="color: var(--text-muted);">Enter a name, batch (e.g., "2023-2027"), technical skill (e.g., "Java", "React", "AWS"), company, or job role.</p>
        </div>
      `;
    }

    const users = db.getCollection('users');
    const jobs = db.getCollection('jobs');
    const posts = db.getCollection('posts');

    // Filter Users
    const matchedUsers = users.filter(u => 
      u.fullName.toLowerCase().includes(q) ||
      u.batchName.toLowerCase().includes(q) ||
      u.company.toLowerCase().includes(q) ||
      u.designation.toLowerCase().includes(q) ||
      u.location.toLowerCase().includes(q) ||
      (u.skills || []).some(s => s.toLowerCase().includes(q))
    );

    // Filter Jobs
    const matchedJobs = jobs.filter(j => 
      j.title.toLowerCase().includes(q) ||
      j.company.toLowerCase().includes(q) ||
      (j.skillsRequired || []).some(s => s.toLowerCase().includes(q))
    );

    // Filter Posts
    const matchedPosts = posts.filter(p => 
      p.content.toLowerCase().includes(q) ||
      p.authorName.toLowerCase().includes(q) ||
      p.postType.toLowerCase().includes(q)
    );

    const userCardsHTML = matchedUsers.map(u => `
      <div class="card" style="display: flex; justify-content: space-between; align-items: center;">
        <div style="display: flex; gap: 12px; align-items: center;">
          <img src="${u.avatar}" class="avatar-md" alt="${u.fullName}">
          <div>
            <h4 style="font-weight: 700; color: #fff;">${u.fullName} <span class="role-badge ${u.role}">${u.role}</span></h4>
            <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 2px;">
              ${u.designation} at <strong style="color: var(--text-main);">${u.company}</strong> • <span style="color: var(--primary);">${u.batchName}</span>
            </div>
            <div class="job-skills-tags" style="margin-top: 4px;">
              ${(u.skills || []).slice(0, 5).map(s => `<span class="skill-tag">${s}</span>`).join('')}
            </div>
          </div>
        </div>

        <div style="display: flex; gap: 8px;">
          <button class="btn btn-secondary btn-sm" onclick="app.viewProfile('${u.id}')">View Profile</button>
          <button class="btn btn-primary btn-sm" onclick="app.messaging.openChatWith('${u.id}')">Message</button>
        </div>
      </div>
    `).join('');

    return `
      <div style="display: flex; flex-direction: column; gap: 1.5rem;">
        <div>
          <h1 style="font-size: 1.6rem; font-weight: 800;">Search Results for "${query}"</h1>
          <p style="color: var(--text-muted);">Found ${matchedUsers.length} members, ${matchedJobs.length} jobs, and ${matchedPosts.length} posts</p>
        </div>

        <!-- Members Section -->
        <div>
          <h3 style="margin-bottom: 0.75rem; color: var(--primary);">👥 Matching CSE Members (${matchedUsers.length})</h3>
          <div style="display: flex; flex-direction: column; gap: 0.75rem;">
            ${matchedUsers.length ? userCardsHTML : '<p style="color: var(--text-muted);">No members found matching query.</p>'}
          </div>
        </div>

        <!-- Jobs Section -->
        <div>
          <h3 style="margin-bottom: 0.75rem; color: var(--emerald);">💼 Matching Job Listings (${matchedJobs.length})</h3>
          <div style="display: flex; flex-direction: column; gap: 0.75rem;">
            ${matchedJobs.length ? matchedJobs.map(j => `
              <div class="card" style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <h4 style="font-weight: 700; color: #fff;">${j.title} @ ${j.company}</h4>
                  <div style="font-size: 0.8rem; color: var(--text-muted);">📍 ${j.location} • Deadline: ${j.lastDate}</div>
                </div>
                <a href="${j.applicationLink}" target="_blank" class="btn btn-emerald btn-sm">Apply 🚀</a>
              </div>
            `).join('') : '<p style="color: var(--text-muted);">No job listings found.</p>'}
          </div>
        </div>

        <!-- Posts Section -->
        <div>
          <h3 style="margin-bottom: 0.75rem; color: var(--rose);">📝 Matching Posts (${matchedPosts.length})</h3>
          <div style="display: flex; flex-direction: column; gap: 1rem;">
            ${matchedPosts.length ? matchedPosts.map(p => this.app.feed.renderPostCard(p, db.getCurrentUser())).join('') : '<p style="color: var(--text-muted);">No posts found.</p>'}
          </div>
        </div>
      </div>
    `;
  }
}
