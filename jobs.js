/**
 * CSE AlumniConnect - Job Opportunity Module
 */

import { db } from '../db.js';

export class JobsModule {
  constructor(app) {
    this.app = app;
  }

  renderJobs(searchFilter = '') {
    const jobs = db.getCollection('jobs');
    const currentUser = db.getCurrentUser();

    let filtered = jobs;
    if (searchFilter) {
      const q = searchFilter.toLowerCase();
      filtered = jobs.filter(j => 
        j.title.toLowerCase().includes(q) ||
        j.company.toLowerCase().includes(q) ||
        j.location.toLowerCase().includes(q) ||
        (j.skillsRequired || []).some(s => s.toLowerCase().includes(q))
      );
    }

    const jobCardsHTML = filtered.length ? filtered.map(j => `
      <div class="job-card">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <span class="pill" style="font-size: 0.75rem; background: rgba(16, 185, 129, 0.15); color: var(--emerald); font-weight: 700; margin-bottom: 6px; display: inline-block;">
              ${j.jobType}
            </span>
            <h3 style="font-size: 1.15rem; font-weight: 800; color: #fff;">${j.title}</h3>
            <div style="font-size: 0.9rem; color: var(--primary); font-weight: 700;">🏢 ${j.company}</div>
          </div>
          ${j.salary ? `<span style="font-size: 0.9rem; font-weight: 800; color: #34d399; background: rgba(52, 211, 153, 0.1); padding: 4px 10px; border-radius: var(--radius-full);">${j.salary}</span>` : ''}
        </div>

        <div style="display: flex; gap: 1rem; font-size: 0.82rem; color: var(--text-muted); margin-top: 4px;">
          <span>📍 ${j.location}</span>
          <span>💼 Experience: ${j.experienceRequired}</span>
          <span>⏰ Deadline: ${j.lastDate}</span>
        </div>

        <p style="font-size: 0.88rem; color: #cbd5e1; line-height: 1.5;">${j.description}</p>

        <div class="job-skills-tags">
          ${(j.skillsRequired || []).map(s => `<span class="skill-tag">${s}</span>`).join('')}
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-color); padding-top: 0.75rem; margin-top: 0.5rem;">
          <div style="font-size: 0.78rem; color: var(--text-muted);">
            Posted by: <strong style="color: var(--text-main);">${j.postedBy}</strong>
          </div>
          
          <div style="display: flex; gap: 8px;">
            <a href="${j.applicationLink}" target="_blank" class="btn btn-emerald btn-sm">
              Apply Now 🚀
            </a>
          </div>
        </div>
      </div>
    `).join('') : `
      <div class="card text-center" style="padding: 3rem;">
        <h3>No Job Opportunities found</h3>
        <p style="color: var(--text-muted);">Try adjusting your search query or post a job opportunity from your organization.</p>
      </div>
    `;

    return `
      <div style="display: flex; flex-direction: column; gap: 1.25rem;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h1 style="font-size: 1.6rem; font-weight: 800;">CSE Alumni & Student Job Portal</h1>
            <p style="color: var(--text-muted);">Exclusive referral listings and career opportunities posted by CSE graduates and hiring partners</p>
          </div>
          <button class="btn btn-primary" onclick="app.jobs.openPostJobModal()">
            + Post Job Opportunity
          </button>
        </div>

        <!-- Filter Bar -->
        <div class="card" style="padding: 0.75rem 1.25rem; display: flex; gap: 1rem; align-items: center;">
          <div style="flex: 1; position: relative;">
            <input type="text" placeholder="Search by role, company, or skill (e.g., Java, React, Google)..." 
                   value="${searchFilter}"
                   oninput="app.jobs.handleJobSearch(this.value)"
                   style="width: 100%; background: var(--bg-input); border: 1px solid var(--border-color); padding: 0.6rem 1rem 0.6rem 2.2rem; border-radius: var(--radius-full); color: white;">
            <span style="position: absolute; left: 0.8rem; top: 50%; transform: translateY(-50%); color: var(--text-muted);">🔍</span>
          </div>
        </div>

        <!-- Job Cards Grid -->
        <div style="display: flex; flex-direction: column; gap: 1.25rem;">
          ${jobCardsHTML}
        </div>
      </div>
    `;
  }

  handleJobSearch(val) {
    document.getElementById('mainContainer').innerHTML = this.renderJobs(val);
  }

  openPostJobModal() {
    const currentUser = db.getCurrentUser();
    const modalHTML = `
      <div class="modal-overlay" id="postJobModal">
        <div class="modal-content animate-fade-in" style="max-width: 600px;">
          <div class="modal-header">
            <h3>Post Job Opportunity</h3>
            <button class="close-btn" onclick="app.closeModal('postJobModal')">&times;</button>
          </div>

          <form onsubmit="app.jobs.handleSaveJob(event)">
            <div class="form-row">
              <div class="form-group">
                <label>Job Title *</label>
                <input type="text" id="jobTitle" placeholder="e.g. Software Engineer / Intern" required>
              </div>
              <div class="form-group">
                <label>Company Name *</label>
                <input type="text" id="jobCompany" placeholder="e.g. Google, Amazon, Startup" required>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Location *</label>
                <input type="text" id="jobLocation" placeholder="e.g. Bengaluru, India (Remote)" required>
              </div>
              <div class="form-group">
                <label>Job Type *</label>
                <select id="jobType">
                  <option value="Full-time">Full-time</option>
                  <option value="Internship">Internship</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract / Freelance">Contract / Freelance</option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Experience Required *</label>
                <input type="text" id="jobExp" placeholder="e.g. 0–2 years" required>
              </div>
              <div class="form-group">
                <label>Salary Package (Optional)</label>
                <input type="text" id="jobSalary" placeholder="e.g. ₹12 LPA - ₹18 LPA">
              </div>
            </div>

            <div class="form-group">
              <label>Skills Required (Comma separated) *</label>
              <input type="text" id="jobSkills" placeholder="e.g. Java, Spring Boot, MySQL, AWS" required>
            </div>

            <div class="form-group">
              <label>Job Description & Responsibilities *</label>
              <textarea id="jobDesc" rows="4" placeholder="Detail the role requirements, eligibility, team structure..." required></textarea>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Application Link / Form URL *</label>
                <input type="url" id="jobLink" placeholder="https://company.com/careers/job123" required>
              </div>
              <div class="form-group">
                <label>Application Deadline</label>
                <input type="date" id="jobDeadline" required>
              </div>
            </div>

            <button type="submit" class="btn btn-primary w-full" style="padding: 0.75rem;">
              Post Opportunity & Broadcast to CSE Feed
            </button>
          </form>
        </div>
      </div>
    `;

    document.getElementById('modalContainer').innerHTML = modalHTML;
  }

  handleSaveJob(e) {
    e.preventDefault();
    const currentUser = db.getCurrentUser();
    const skillsInput = document.getElementById('jobSkills').value;
    const skillsArr = skillsInput ? skillsInput.split(',').map(s => s.trim()).filter(Boolean) : [];

    const newJob = {
      id: 'job-' + Date.now(),
      title: document.getElementById('jobTitle').value,
      company: document.getElementById('jobCompany').value,
      location: document.getElementById('jobLocation').value,
      jobType: document.getElementById('jobType').value,
      experienceRequired: document.getElementById('jobExp').value,
      skillsRequired: skillsArr,
      salary: document.getElementById('jobSalary').value,
      description: document.getElementById('jobDesc').value,
      applicationLink: document.getElementById('jobLink').value,
      lastDate: document.getElementById('jobDeadline').value || '2026-12-31',
      postedBy: `${currentUser.fullName} (${currentUser.role} ${currentUser.batchName})`,
      postedByUserId: currentUser.id,
      createdAt: new Date().toISOString()
    };

    db.addItem('jobs', newJob);

    // Broadcast as job post in feed
    db.addItem('posts', {
      id: 'p-' + Date.now(),
      authorId: currentUser.id,
      authorName: currentUser.fullName,
      authorAvatar: currentUser.avatar,
      authorBatch: currentUser.batchName,
      authorRole: currentUser.role,
      authorDesignation: `${currentUser.designation} at ${currentUser.company}`,
      postType: 'Job Opportunity',
      batchId: currentUser.batchId,
      isOfficial: false,
      content: `💼 NEW JOB OPPORTUNITY: ${newJob.title} at ${newJob.company} (${newJob.location})\n\nSkills: ${skillsArr.join(', ')}\nExperience: ${newJob.experienceRequired}\n\n${newJob.description}`,
      createdAt: new Date().toISOString(),
      reactions: { like: 0, celebrate: 0, support: 0, insightful: 0 },
      comments: []
    });

    this.app.closeModal('postJobModal');
    this.app.showToast('Job opportunity published & broadcasted!', 'success');
    this.app.renderMainContent();
  }
}
