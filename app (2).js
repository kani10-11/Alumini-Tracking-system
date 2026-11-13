/**
 * CSE AlumniConnect - SPA Frontend Controller
 * Communicates with Flask Backend REST APIs & SQLite Database
 */

class App {
  constructor() {
    this.currentUser = null;
    this.currentPage = 'landing'; // landing, login, register, feed, mybatch, batches, batchGroup, profile, jobs, achievements, events, messages, search, admin
    this.selectedBatchId = null;
    this.activeChatUserId = null;
    this.pendingUpload = null;

    this.init();
  }

  async init() {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (res.ok && data.authenticated) {
        this.currentUser = data.user;
        this.routeUserAfterLogin(false);
      } else {
        this.currentPage = 'landing';
        this.render();
      }
    } catch (e) {
      console.error('Failed to check auth state', e);
      this.currentPage = 'landing';
      this.render();
    }
  }

  routeUserAfterLogin(showToastMsg = true) {
    if (!this.currentUser) return;

    if (this.currentUser.role === 'Student' || this.currentUser.role === 'Alumni') {
      this.selectedBatchId = this.currentUser.batch_id || 'b-2023-2027';
      this.currentPage = 'batchGroup';
      if (showToastMsg) this.showToast(`Logged in! Auto-routed to ${this.currentUser.batch_name}`, 'success');
    } else if (this.currentUser.role === 'Teacher') {
      this.currentPage = 'batches';
    } else if (this.currentUser.role === 'HOD' || this.currentUser.role === 'Admin') {
      this.currentPage = 'admin';
    }
    this.render();
  }

  render() {
    const appEl = document.getElementById('app');
    if (!this.currentUser || this.currentPage === 'landing' || this.currentPage === 'login' || this.currentPage === 'register') {
      appEl.innerHTML = this.renderUnauthenticatedView();
      return;
    }

    appEl.innerHTML = `
      ${this.renderNavbar()}
      <div class="main-wrapper">
        <aside class="sidebar">
          ${this.renderSidebar()}
        </aside>

        <main class="content-area" id="mainContainer">
          <!-- Dynamic Main Content Views -->
        </main>

        <aside class="widgets-sidebar">
          ${this.renderWidgetsSidebar()}
        </aside>
      </div>

      <div id="toastContainer" style="position: fixed; bottom: 20px; right: 20px; z-index: 2000; display: flex; flex-direction: column; gap: 8px;"></div>
      <div id="modalContainer"></div>
    `;

    this.renderMainContent();
  }

  renderUnauthenticatedView() {
    if (this.currentPage === 'login') {
      return this.renderLoginForm();
    } else if (this.currentPage === 'register') {
      return this.renderRegisterForm();
    }
    // Default: Clean White Landing Page
    return `
      <div style="min-height: 100vh; background: #ffffff; display: flex; flex-direction: column;">
        <nav style="height: 70px; border-bottom: 1px solid var(--border-color); display: flex; align-items: center; justify-content: space-between; padding: 0 3rem;">
          <div style="display: flex; align-items: center; gap: 10px; font-weight: 800; font-size: 1.3rem; color: var(--text-main);">
            <div class="brand-icon">🎓</div>
            <div>CSE <span>AlumniConnect</span></div>
          </div>
          <div style="display: flex; gap: 1rem;">
            <button class="btn btn-secondary" onclick="app.setPage('login')">Sign In</button>
            <button class="btn btn-primary" onclick="app.setPage('register')">Register Now</button>
          </div>
        </nav>

        <div style="flex: 1; max-width: 1000px; margin: 0 auto; padding: 5rem 2rem; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center;">
          <span style="background: var(--primary-light); color: var(--primary); border: 1px solid var(--primary-border); font-size: 0.85rem; padding: 4px 14px; border-radius: var(--radius-full); font-weight: 700; margin-bottom: 1.5rem;">
            EXCLUSIVELY FOR COMPUTER SCIENCE & ENGINEERING
          </span>

          <h1 style="font-size: 3rem; font-weight: 800; color: #0f172a; line-height: 1.25; max-width: 800px;">
            CSE Alumni Tracking & Professional Networking Platform
          </h1>

          <p style="font-size: 1.15rem; color: #475569; margin-top: 1.25rem; max-width: 680px; line-height: 1.7;">
            Connect current CSE students, alumni, and department faculty. Seamlessly manage batch communities, track career progressions over time, post tech referrals, and share department announcements.
          </p>

          <div style="display: flex; gap: 1.25rem; margin-top: 2.5rem;">
            <button class="btn btn-primary" style="padding: 0.85rem 2rem; font-size: 1rem;" onclick="app.setPage('register')">
              Join CSE Network →
            </button>
            <button class="btn btn-secondary" style="padding: 0.85rem 2rem; font-size: 1rem;" onclick="app.setPage('login')">
              Account Login
            </button>
          </div>

          <!-- Feature Cards Grid -->
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; width: 100%; margin-top: 4rem; text-align: left;">
            <div class="card">
              <div style="font-size: 2rem; margin-bottom: 0.5rem;">🏫</div>
              <h3 style="font-size: 1.1rem; font-weight: 700;">Google Classroom-Style Batches</h3>
              <p style="font-size: 0.88rem; color: var(--text-muted); margin-top: 4px;">Exclusive batch hubs for students/alumni from 2020 through 2030.</p>
            </div>
            <div class="card">
              <div style="font-size: 2rem; margin-bottom: 0.5rem;">💼</div>
              <h3 style="font-size: 1.1rem; font-weight: 700;">LinkedIn-Style Feed & Jobs</h3>
              <p style="font-size: 0.88rem; color: var(--text-muted); margin-top: 4px;">Share job referrals, technical insights, PDF circulars, and workplace updates.</p>
            </div>
            <div class="card">
              <div style="font-size: 2rem; margin-bottom: 0.5rem;">📈</div>
              <h3 style="font-size: 1.1rem; font-weight: 700;">Alumni Career History Tracking</h3>
              <p style="font-size: 0.88rem; color: var(--text-muted); margin-top: 4px;">Maintain multi-stage job history records and track career growth analytics.</p>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderLoginForm() {
    return `
      <div style="min-height: 100vh; background: #ffffff; display: flex; align-items: center; justify-content: center; padding: 2rem;">
        <div class="card" style="width: 100%; max-width: 440px; border: 1px solid var(--border-color); box-shadow: var(--shadow-lg);">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 1.5rem;">
            <div class="brand-icon">🎓</div>
            <div>
              <h2 style="font-size: 1.3rem; margin: 0;">CSE AlumniConnect</h2>
              <span style="font-size: 0.8rem; color: var(--primary); font-weight: 700;">Account Authentication</span>
            </div>
          </div>

          <form onsubmit="app.handleLoginSubmit(event)">
            <div class="form-group">
              <label>Username or Email</label>
              <input type="text" id="loginIdentifier" placeholder="e.g. kanishka_cse or user@alumni.cse.edu" required>
            </div>

            <div class="form-group">
              <label>Password</label>
              <input type="password" id="loginPassword" placeholder="••••••••" required>
            </div>

            <button type="submit" class="btn btn-primary w-full" style="padding: 0.75rem; margin-top: 0.5rem;">
              Sign In
            </button>

            <div class="text-center" style="margin-top: 1.25rem; font-size: 0.88rem; color: var(--text-muted);">
              Don't have an account? <a href="#" onclick="app.setPage('register')" style="font-weight: 700;">Register Now</a>
            </div>
            <div class="text-center" style="margin-top: 0.5rem;">
              <a href="#" onclick="app.setPage('landing')" style="font-size: 0.82rem; color: var(--text-muted);">← Back to Home Page</a>
            </div>
          </form>

          <div style="margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid var(--border-color); font-size: 0.8rem; color: var(--text-muted);">
            📌 <strong>HOD / Management System Login:</strong><br>
            Username: <code>hod_cse</code> | Password: <code>HOD@12345</code>
          </div>
        </div>
      </div>
    `;
  }

  renderRegisterForm() {
    return `
      <div style="min-height: 100vh; background: #ffffff; display: flex; align-items: center; justify-content: center; padding: 2rem;">
        <div class="card" style="width: 100%; max-width: 620px; border: 1px solid var(--border-color); box-shadow: var(--shadow-lg);">
          <div style="margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border-color);">
            <h2 style="font-size: 1.4rem;">Register for CSE AlumniConnect</h2>
            <p style="font-size: 0.85rem; color: var(--text-muted);">Exclusive for Computer Science & Engineering Students, Alumni, and Faculty</p>
          </div>

          <form onsubmit="app.handleRegisterSubmit(event)">
            <div class="form-row">
              <div class="form-group">
                <label>Full Name *</label>
                <input type="text" id="regName" placeholder="e.g. Kanishka R" required>
              </div>
              <div class="form-group">
                <label>Username *</label>
                <input type="text" id="regUsername" placeholder="e.g. kanishka_cse" required>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Email Address *</label>
                <input type="email" id="regEmail" placeholder="e.g. kanishka@alumni.cse.edu" required>
              </div>
              <div class="form-group">
                <label>Phone Number</label>
                <input type="text" id="regPhone" placeholder="+91 98765 43210">
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Password *</label>
                <input type="password" id="regPass" required placeholder="••••••••">
              </div>
              <div class="form-group">
                <label>Confirm Password *</label>
                <input type="password" id="regConfirmPass" required placeholder="••••••••">
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Role *</label>
                <select id="regRole" required>
                  <option value="Student">Student / Alumni</option>
                  <option value="Teacher">Teacher / Faculty</option>
                </select>
              </div>
              <div class="form-group">
                <label>CSE Batch *</label>
                <select id="regBatch" required>
                  <option value="b-2020-2024">CSE 2020–2024</option>
                  <option value="b-2021-2025">CSE 2021–2025</option>
                  <option value="b-2022-2026">CSE 2022–2026</option>
                  <option value="b-2023-2027" selected>CSE 2023–2027</option>
                  <option value="b-2024-2028">CSE 2024–2028</option>
                  <option value="b-2025-2029">CSE 2025–2029</option>
                  <option value="b-2026-2030">CSE 2026–2030</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label>Department</label>
              <input type="text" value="Computer Science and Engineering (CSE)" disabled style="background: var(--bg-subtle); color: var(--primary); font-weight: 700;">
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Current Company / Organization</label>
                <input type="text" id="regCompany" placeholder="e.g. Google / Microsoft / Student">
              </div>
              <div class="form-group">
                <label>Current Designation / Role</label>
                <input type="text" id="regDesignation" placeholder="e.g. Software Engineer / Intern">
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Current City / Location</label>
                <input type="text" id="regLocation" placeholder="e.g. Chennai, India">
              </div>
              <div class="form-group">
                <label>Technical Skills (Comma separated)</label>
                <input type="text" id="regSkills" placeholder="e.g. Java, Python, React, Cloud">
              </div>
            </div>

            <button type="submit" class="btn btn-primary w-full" style="padding: 0.75rem; margin-top: 0.5rem;">
              Complete Registration
            </button>

            <div class="text-center" style="margin-top: 1rem; font-size: 0.88rem; color: var(--text-muted);">
              Already registered? <a href="#" onclick="app.setPage('login')" style="font-weight: 700;">Sign In Here</a>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  async handleRegisterSubmit(e) {
    e.preventDefault();
    const pass = document.getElementById('regPass').value;
    const confirmPass = document.getElementById('regConfirmPass').value;

    if (pass !== confirmPass) {
      this.showToast('Passwords do not match!', 'error');
      return;
    }

    const payload = {
      fullName: document.getElementById('regName').value,
      username: document.getElementById('regUsername').value,
      email: document.getElementById('regEmail').value,
      password: pass,
      role: document.getElementById('regRole').value,
      batchId: document.getElementById('regBatch').value,
      phone: document.getElementById('regPhone').value,
      company: document.getElementById('regCompany').value,
      designation: document.getElementById('regDesignation').value,
      location: document.getElementById('regLocation').value,
      skills: document.getElementById('regSkills').value
    };

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        this.showToast('Registration successful! Please log in.', 'success');
        this.setPage('login');
      } else {
        this.showToast(data.error || 'Registration failed', 'error');
      }
    } catch (err) {
      this.showToast('Network error during registration', 'error');
    }
  }

  async handleLoginSubmit(e) {
    e.preventDefault();
    const identifier = document.getElementById('loginIdentifier').value;
    const password = document.getElementById('loginPassword').value;

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        this.currentUser = data.user;
        this.routeUserAfterLogin(true);
      } else {
        this.showToast(data.error || 'Invalid credentials', 'error');
      }
    } catch (err) {
      this.showToast('Network error during login', 'error');
    }
  }

  async handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    this.currentUser = null;
    this.currentPage = 'landing';
    this.render();
  }

  setPage(pageName) {
    this.currentPage = pageName;
    this.render();
  }

  renderNavbar() {
    return `
      <nav class="navbar">
        <div class="brand" onclick="app.setPage('feed')">
          <div class="brand-icon">🎓</div>
          <div class="brand-text">CSE <span>AlumniConnect</span></div>
          <span class="dept-badge">CSE Dept</span>
        </div>

        <div class="nav-search">
          <span class="nav-search-icon">🔍</span>
          <input type="text" placeholder="Search members, skills (e.g. Java), companies..." 
                 onkeydown="if(event.key==='Enter') app.triggerSearch(this.value)">
        </div>

        <div class="nav-actions">
          <button class="btn btn-secondary btn-sm" onclick="app.handleLogout()">Sign Out</button>

          <div class="user-profile-badge" onclick="app.viewProfile('${this.currentUser.id}')">
            <img src="${this.currentUser.profile_photo}" class="avatar-sm" alt="${this.currentUser.fullName}">
            <div style="display: flex; flex-direction: column; text-align: left;">
              <span style="font-size: 0.85rem; font-weight: 700; color: var(--text-main);">${this.currentUser.fullName}</span>
              <span style="font-size: 0.72rem; color: var(--primary); font-weight: 700;">${this.currentUser.role}</span>
            </div>
          </div>
        </div>
      </nav>
    `;
  }

  renderSidebar() {
    return `
      <div class="card" style="padding: 1.25rem;">
        <div style="display: flex; flex-direction: column; align-items: center; text-align: center; padding-bottom: 1rem; border-bottom: 1px solid var(--border-color); margin-bottom: 1rem;">
          <img src="${this.currentUser.profile_photo}" class="avatar-md" alt="${this.currentUser.fullName}">
          <div style="font-weight: 700; font-size: 1rem; margin-top: 8px;">${this.currentUser.fullName}</div>
          <span class="role-badge ${this.currentUser.role}">${this.currentUser.role}</span>
          <div style="font-size: 0.78rem; color: var(--primary); font-weight: 700; margin-top: 4px;">
            ${this.currentUser.batch_name || 'CSE Department'}
          </div>
        </div>

        <ul class="nav-menu">
          ${(this.currentUser.role === 'Student' || this.currentUser.role === 'Alumni') ? `
            <li class="nav-item ${this.currentPage === 'batchGroup' ? 'active' : ''}">
              <button onclick="app.openMyBatch()">
                <span>🏫</span> My Batch
              </button>
            </li>
          ` : ''}

          <li class="nav-item ${this.currentPage === 'feed' ? 'active' : ''}">
            <button onclick="app.setPage('feed')">
              <span>📰</span> CSE Feed
            </button>
          </li>

          <li class="nav-item ${this.currentPage === 'batches' ? 'active' : ''}">
            <button onclick="app.setPage('batches')">
              <span>🎓</span> All Batches
            </button>
          </li>

          <li class="nav-item ${this.currentPage === 'jobs' ? 'active' : ''}">
            <button onclick="app.setPage('jobs')">
              <span>💼</span> Job Portal
            </button>
          </li>

          <li class="nav-item ${this.currentPage === 'achievements' ? 'active' : ''}">
            <button onclick="app.setPage('achievements')">
              <span>🏆</span> Achievements
            </button>
          </li>

          <li class="nav-item ${this.currentPage === 'events' ? 'active' : ''}">
            <button onclick="app.setPage('events')">
              <span>📅</span> Reunions & Events
            </button>
          </li>

          <li class="nav-item ${this.currentPage === 'messages' ? 'active' : ''}">
            <button onclick="app.setPage('messages')">
              <span>💬</span> Private Messages
            </button>
          </li>

          ${(this.currentUser.role === 'HOD' || this.currentUser.role === 'Admin') ? `
            <li class="nav-item ${this.currentPage === 'admin' ? 'active' : ''}">
              <button onclick="app.setPage('admin')" style="color: var(--rose);">
                <span>📊</span> Executive Dashboard
              </button>
            </li>
          ` : ''}
        </ul>
      </div>
    `;
  }

  renderWidgetsSidebar() {
    return `
      <div class="card" style="border-top: 3px solid var(--primary);">
        <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--primary); font-weight: 800; letter-spacing: 0.5px;">
          🎓 CSE Department Info
        </div>
        <h4 style="font-size: 0.95rem; font-weight: 700; color: var(--text-main); margin-top: 6px;">Exclusively for CSE</h4>
        <p style="font-size: 0.82rem; color: var(--text-muted); margin-top: 4px;">
          Connected with MySQL/SQLite backend database. All users, posts, file attachments, and private messages are securely authenticated.
        </p>
      </div>
    `;
  }

  async renderMainContent() {
    const mainContainer = document.getElementById('mainContainer');
    if (!mainContainer) return;

    if (this.currentPage === 'feed') {
      await this.renderFeed(mainContainer);
    } else if (this.currentPage === 'batches') {
      await this.renderAllBatches(mainContainer);
    } else if (this.currentPage === 'batchGroup') {
      await this.renderBatchGroup(mainContainer, this.selectedBatchId);
    } else if (this.currentPage === 'profile') {
      await this.renderProfileView(mainContainer, this.viewUserId || this.currentUser.id);
    } else if (this.currentPage === 'jobs') {
      await this.renderJobsView(mainContainer);
    } else if (this.currentPage === 'achievements') {
      await this.renderAchievementsView(mainContainer);
    } else if (this.currentPage === 'events') {
      await this.renderEventsView(mainContainer);
    } else if (this.currentPage === 'messages') {
      await this.renderMessagesView(mainContainer);
    } else if (this.currentPage === 'search') {
      await this.renderSearchView(mainContainer, this.searchQuery);
    } else if (this.currentPage === 'admin') {
      await this.renderAdminDashboard(mainContainer);
    }
  }

  openMyBatch() {
    this.selectedBatchId = this.currentUser.batch_id || 'b-2023-2027';
    this.currentPage = 'batchGroup';
    this.render();
  }

  // --- Dynamic Feed View ---
  async renderFeed(container) {
    container.innerHTML = `<div class="card text-center">Loading Feed...</div>`;
    try {
      const res = await fetch('/api/posts');
      const data = await res.json();

      const postsHTML = (data.posts || []).map(p => this.buildPostCardHTML(p)).join('');

      container.innerHTML = `
        <!-- Post Creator Box with Real Upload -->
        <div class="post-create-box">
          <div style="display: flex; gap: 12px; align-items: center;">
            <img src="${this.currentUser.profile_photo}" class="avatar-md">
            <div class="post-input-trigger" onclick="app.openCreatePostModal()">
              Start a post, share job referral, or attach document/image...
            </div>
          </div>
          <div style="display: flex; gap: 10px; margin-top: 4px;">
            <button class="btn btn-secondary btn-sm" onclick="app.openCreatePostModal('Job Opportunity')">💼 Post Job</button>
            <button class="btn btn-secondary btn-sm" onclick="app.openCreatePostModal('Achievement')">🏆 Share Achievement</button>
            <button class="btn btn-secondary btn-sm" onclick="app.openCreatePostModal('Document Upload')">📎 Attach File</button>
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 1.25rem;">
          ${postsHTML || '<div class="card text-center">No posts in feed yet. Be the first to post!</div>'}
        </div>
      `;
    } catch (e) {
      container.innerHTML = `<div class="card text-center" style="color: var(--rose);">Error loading feed</div>`;
    }
  }

  buildPostCardHTML(p) {
    const isOfficial = p.is_official;
    const attachment = (p.attachments && p.attachments.length) ? p.attachments[0] : null;

    let attachmentHTML = '';
    if (attachment) {
      if (attachment.file_type === 'image') {
        attachmentHTML = `
          <div class="post-attachment-box">
            <img src="${attachment.file_path}" alt="Attachment">
          </div>
        `;
      } else {
        attachmentHTML = `
          <div class="document-attachment-pill" style="margin-top: 10px;">
            <div class="document-info">
              <span>📄</span>
              <span>${attachment.file_name}</span>
            </div>
            <div style="display: flex; gap: 8px;">
              <a href="${attachment.file_path}" target="_blank" class="btn btn-secondary btn-sm">View Document</a>
              <a href="${attachment.file_path}" download class="btn btn-primary btn-sm">Download</a>
            </div>
          </div>
        `;
      }
    }

    const commentsHTML = (p.comments || []).map(c => `
      <div style="display: flex; gap: 8px; background: var(--bg-subtle); padding: 8px 12px; border-radius: var(--radius-md); margin-top: 6px;">
        <img src="${c.authorAvatar}" class="avatar-sm">
        <div>
          <strong style="font-size: 0.85rem; color: var(--text-main);">${c.authorName}</strong>
          <p style="font-size: 0.85rem; color: #334155; margin-top: 2px;">${c.text}</p>
        </div>
      </div>
    `).join('');

    return `
      <div class="feed-item ${isOfficial ? 'is-official' : ''}">
        <div style="display: flex; align-items: flex-start; gap: 12px;">
          <img src="${p.authorAvatar}" class="avatar-md">
          <div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <strong style="font-size: 0.95rem; color: var(--text-main); cursor: pointer;" onclick="app.viewProfile('${p.user_id}')">${p.authorName}</strong>
              <span class="role-badge ${p.authorRole}">${p.authorRole}</span>
              ${isOfficial ? `<span class="official-badge">⭐ Official CSE</span>` : ''}
            </div>
            <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 2px;">
              ${p.designation} at <strong>${p.company}</strong> • <span style="color: var(--primary); font-weight: 600;">${p.authorBatch || 'CSE'}</span>
            </div>
          </div>
        </div>

        <div class="post-body">
          ${p.content}
        </div>

        ${attachmentHTML}

        <div style="display: flex; gap: 10px; border-top: 1px solid var(--border-color); padding-top: 0.5rem; margin-top: 0.5rem;">
          <button class="btn btn-secondary btn-sm" onclick="app.reactPost('${p.id}', 'like')">👍 Like</button>
          <button class="btn btn-secondary btn-sm" onclick="app.reactPost('${p.id}', 'celebrate')">👏 Celebrate</button>
        </div>

        <!-- Comments -->
        <div style="margin-top: 0.5rem;">
          ${commentsHTML}
          <div style="display: flex; gap: 8px; margin-top: 8px;">
            <input type="text" id="comment-input-${p.id}" placeholder="Write a comment..." 
                   style="flex: 1; padding: 6px 12px; border: 1px solid var(--border-color); border-radius: var(--radius-full);">
            <button class="btn btn-primary btn-sm" onclick="app.submitComment('${p.id}')">Send</button>
          </div>
        </div>
      </div>
    `;
  }

  // --- All Batches View ---
  async renderAllBatches(container) {
    try {
      const res = await fetch('/api/batches');
      const data = await res.json();

      const batchCards = (data.batches || []).map(b => `
        <div class="card" style="display: flex; flex-direction: column; justify-content: space-between; gap: 1rem;">
          <div>
            <h3 style="font-size: 1.2rem; font-weight: 800; color: var(--text-main);">${b.batch_name}</h3>
            <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 4px;">${b.description || 'CSE Department Batch'}</p>
            <div style="font-size: 0.8rem; color: var(--primary); font-weight: 700; margin-top: 8px;">Mentor: ${b.mentor}</div>
          </div>
          <button class="btn btn-primary btn-sm" onclick="app.openBatch('${b.id}')">Enter Batch Hub →</button>
        </div>
      `).join('');

      container.innerHTML = `
        <div style="margin-bottom: 1rem;">
          <h1 style="font-size: 1.6rem; font-weight: 800;">CSE Batches Directory</h1>
          <p style="color: var(--text-muted);">Explore Computer Science & Engineering batch communities</p>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.25rem;">
          ${batchCards}
        </div>
      `;
    } catch (e) {
      container.innerHTML = `<div class="card text-center" style="color: var(--rose);">Error loading batches</div>`;
    }
  }

  // --- Single Batch Group View with STRICT BACKEND Authorization ---
  async renderBatchGroup(container, batchId) {
    container.innerHTML = `<div class="card text-center">Checking batch security permissions...</div>`;
    try {
      const res = await fetch(`/api/batch/${batchId}`);
      const data = await res.json();

      if (res.status === 403) {
        // STRICT BACKEND SECURITY ERROR DISPLAY
        container.innerHTML = `
          <div class="card text-center" style="padding: 3rem; border-top: 4px solid var(--rose);">
            <div style="font-size: 3.5rem; margin-bottom: 1rem;">⛔</div>
            <h2 style="font-size: 1.6rem; color: var(--rose); font-weight: 800;">Access Restricted</h2>
            <p style="font-size: 1rem; color: var(--text-muted); margin-top: 0.5rem;">
              You are not a member of this batch. Access Denied by Backend Authorization.
            </p>
            <div style="margin-top: 1.5rem;">
              <button class="btn btn-primary" onclick="app.openMyBatch()">
                Return to My Batch (${this.currentUser.batch_name})
              </button>
            </div>
          </div>
        `;
        return;
      }

      const batch = data.batch;
      const members = data.members || [];

      const membersHTML = members.map(m => `
        <div class="card" style="display: flex; gap: 12px; align-items: center;">
          <img src="${m.profile_photo}" class="avatar-md">
          <div style="flex: 1;">
            <strong style="font-size: 0.95rem; color: var(--text-main);">${m.fullName}</strong>
            <span class="role-badge ${m.role}">${m.role}</span>
            <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 2px;">
              ${m.designation} at <strong>${m.company}</strong>
            </div>
          </div>
          <button class="btn btn-secondary btn-sm" onclick="app.openPrivateChat('${m.id}')">💬 Message</button>
        </div>
      `).join('');

      container.innerHTML = `
        <div class="batch-header-banner">
          <div>
            <h1>🎓 ${batch.batch_name}</h1>
            <p>${batch.description}</p>
            <div style="margin-top: 10px; display: flex; gap: 8px;">
              <span class="pill">👥 ${members.length} Registered Members</span>
              <span class="pill">👨‍🏫 Mentor: ${batch.mentor}</span>
            </div>
          </div>
        </div>

        <div class="card">
          <h3 class="card-title">Batch Members (${members.length})</h3>
          <div style="display: flex; flex-direction: column; gap: 0.75rem;">
            ${membersHTML.length ? membersHTML : '<p style="color: var(--text-muted);">No members registered in this batch yet.</p>'}
          </div>
        </div>
      `;
    } catch (e) {
      container.innerHTML = `<div class="card text-center" style="color: var(--rose);">Error loading batch</div>`;
    }
  }

  // --- Post Creator Modal & File Upload Handler ---
  openCreatePostModal(defaultType = 'General Post') {
    this.pendingUpload = null;
    const modalHTML = `
      <div class="modal-overlay" id="createPostModal">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Create a Post</h3>
            <button class="close-btn" onclick="app.closeModal('createPostModal')">&times;</button>
          </div>

          <form onsubmit="app.handleCreatePostSubmit(event)">
            <div class="form-group">
              <label>Post Type</label>
              <select id="postTypeSelect">
                <option value="General Post" ${defaultType === 'General Post' ? 'selected' : ''}>💬 General Post</option>
                <option value="Job Opportunity" ${defaultType === 'Job Opportunity' ? 'selected' : ''}>💼 Job Opportunity</option>
                <option value="Achievement" ${defaultType === 'Achievement' ? 'selected' : ''}>🏆 Achievement</option>
                <option value="Technical Post">💻 Technical Post</option>
                ${(this.currentUser.role === 'Teacher' || this.currentUser.role === 'HOD' || this.currentUser.role === 'Admin') ? `
                  <option value="Event Announcement">📢 Official Announcement</option>
                ` : ''}
              </select>
            </div>

            <div class="form-group">
              <label>Content *</label>
              <textarea id="postContentInput" rows="5" placeholder="Write post details, job referral, or announcement..." required></textarea>
            </div>

            <!-- Real Upload Attachment Section -->
            <div class="form-group">
              <label>Attach File / Image (Optional)</label>
              <input type="file" id="postFileInput" onchange="app.handleFileUpload(this)">
              <div id="uploadStatus" style="font-size: 0.8rem; margin-top: 4px;"></div>
            </div>

            <button type="submit" class="btn btn-primary w-full" style="padding: 0.75rem;">
              Publish Post
            </button>
          </form>
        </div>
      </div>
    `;

    document.getElementById('modalContainer').innerHTML = modalHTML;
  }

  async handleFileUpload(inputEl) {
    const file = inputEl.files[0];
    if (!file) return;

    const statusEl = document.getElementById('uploadStatus');
    statusEl.innerHTML = `<span style="color: var(--primary);">Uploading ${file.name}...</span>`;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (res.ok && data.success) {
        this.pendingUpload = data;
        statusEl.innerHTML = `<span style="color: var(--emerald); font-weight: 700;">✓ Attached: ${data.fileName}</span>`;
      } else {
        statusEl.innerHTML = `<span style="color: var(--rose);">${data.error || 'Upload failed'}</span>`;
      }
    } catch (e) {
      statusEl.innerHTML = `<span style="color: var(--rose);">Upload error</span>`;
    }
  }

  async handleCreatePostSubmit(e) {
    e.preventDefault();
    const content = document.getElementById('postContentInput').value.trim();
    const postType = document.getElementById('postTypeSelect').value;
    const isOfficial = (postType === 'Event Announcement');

    if (!content) return;

    const payload = {
      content: content,
      postType: postType,
      isOfficial: isOfficial,
      attachment: this.pendingUpload
    };

    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        this.closeModal('createPostModal');
        this.showToast('Post published successfully!', 'success');
        this.renderMainContent();
      } else {
        this.showToast(data.error || 'Post creation failed', 'error');
      }
    } catch (e) {
      this.showToast('Network error while publishing post', 'error');
    }
  }

  async reactPost(postId, reactionType) {
    await fetch(`/api/posts/${postId}/react`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reactionType })
    });
    this.renderMainContent();
  }

  async submitComment(postId) {
    const input = document.getElementById(`comment-input-${postId}`);
    const text = input ? input.value.trim() : '';
    if (!text) return;

    await fetch(`/api/posts/${postId}/comment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    this.renderMainContent();
  }

  // --- Profile View ---
  async renderProfileView(container, userId) {
    try {
      const res = await fetch(`/api/users/${userId}`);
      const data = await res.json();
      const u = data.user;

      const isOwn = (userId === this.currentUser.id);

      const careerHTML = (u.careerHistory || []).map(ch => `
        <div class="timeline-item">
          <div class="timeline-dot"></div>
          <div>
            <strong>${ch.designation} @ ${ch.company}</strong>
            <div style="font-size: 0.8rem; color: var(--text-muted);">${ch.start_date} – ${ch.end_date} • ${ch.location}</div>
          </div>
        </div>
      `).join('');

      container.innerHTML = `
        <div class="card" style="padding: 1.5rem; display: flex; gap: 1.5rem; align-items: center;">
          <img src="${u.profile_photo}" class="avatar-lg">
          <div style="flex: 1;">
            <h2 style="font-size: 1.5rem; font-weight: 800;">${u.fullName}</h2>
            <div style="display: flex; gap: 8px; margin-top: 4px;">
              <span class="role-badge ${u.role}">${u.role}</span>
              <span style="color: var(--primary); font-weight: 700;">${u.batch_name || 'CSE'}</span>
            </div>
            <div style="font-size: 0.9rem; margin-top: 6px;">💼 <strong>${u.designation}</strong> at ${u.company}</div>
            <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 2px;">📍 ${u.location}</div>
          </div>
          ${!isOwn ? `
            <button class="btn btn-primary" onclick="app.openPrivateChat('${u.id}')">💬 Message</button>
          ` : ''}
        </div>

        <div class="card">
          <h3 class="card-title">📈 Career History Timeline</h3>
          <div class="career-timeline">
            ${careerHTML || '<p style="color: var(--text-muted);">No historical career entries added.</p>'}
          </div>
        </div>
      `;
    } catch (e) {
      container.innerHTML = `<div class="card text-center" style="color: var(--rose);">Error loading profile</div>`;
    }
  }

  // --- Jobs View ---
  async renderJobsView(container) {
    try {
      const res = await fetch('/api/jobs');
      const data = await res.json();

      const jobsHTML = (data.jobs || []).map(j => `
        <div class="card" style="display: flex; flex-direction: column; gap: 0.75rem;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div>
              <h3 style="font-size: 1.15rem; font-weight: 800;">${j.title}</h3>
              <div style="font-size: 0.9rem; color: var(--primary); font-weight: 700;">🏢 ${j.company} (${j.location})</div>
            </div>
            <a href="${j.application_link}" target="_blank" class="btn btn-emerald btn-sm">Apply Now 🚀</a>
          </div>
          <p style="font-size: 0.88rem; color: #475569;">${j.description}</p>
        </div>
      `).join('');

      container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
          <h1 style="font-size: 1.6rem; font-weight: 800;">CSE Job Portal</h1>
          <button class="btn btn-primary" onclick="app.openPostJobModal()">+ Post Job Opportunity</button>
        </div>
        <div style="display: flex; flex-direction: column; gap: 1.25rem;">
          ${jobsHTML || '<div class="card text-center">No job opportunities posted yet.</div>'}
        </div>
      `;
    } catch (e) {
      container.innerHTML = `<div class="card text-center" style="color: var(--rose);">Error loading jobs</div>`;
    }
  }

  // --- Achievements View ---
  async renderAchievementsView(container) {
    try {
      const res = await fetch('/api/achievements');
      const data = await res.json();

      const achHTML = (data.achievements || []).map(a => `
        <div class="card" style="display: flex; gap: 1rem; align-items: flex-start;">
          <div style="font-size: 2rem;">🏆</div>
          <div>
            <h3 style="font-size: 1.1rem; font-weight: 800;">${a.title}</h3>
            <div style="font-size: 0.8rem; color: var(--primary); font-weight: 700;">By ${a.userName} (${a.userBatch})</div>
            <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 4px;">${a.description}</p>
          </div>
        </div>
      `).join('');

      container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
          <h1 style="font-size: 1.6rem; font-weight: 800;">CSE Achievements Showcase</h1>
          <button class="btn btn-primary" onclick="app.openAddAchievementModal()">🏆 Add Achievement</button>
        </div>
        <div style="display: flex; flex-direction: column; gap: 1.25rem;">
          ${achHTML || '<div class="card text-center">No achievements shared yet.</div>'}
        </div>
      `;
    } catch (e) {
      container.innerHTML = `<div class="card text-center" style="color: var(--rose);">Error loading achievements</div>`;
    }
  }

  // --- Events View ---
  async renderEventsView(container) {
    try {
      const res = await fetch('/api/events');
      const data = await res.json();

      const eventsHTML = (data.events || []).map(ev => `
        <div class="card">
          <h3 style="font-size: 1.2rem; font-weight: 800;">${ev.title}</h3>
          <div style="font-size: 0.85rem; color: var(--primary); margin-top: 2px;">📅 ${ev.date} (${ev.time}) • 📍 ${ev.venue}</div>
          <p style="font-size: 0.88rem; color: var(--text-muted); margin-top: 6px;">${ev.description}</p>
          <div style="margin-top: 1rem;">
            <button class="btn btn-emerald btn-sm" onclick="app.registerEvent('${ev.id}')">Register Pass</button>
          </div>
        </div>
      `).join('');

      container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
          <h1 style="font-size: 1.6rem; font-weight: 800;">Reunions & Department Events</h1>
          ${(this.currentUser.role === 'Teacher' || this.currentUser.role === 'HOD' || this.currentUser.role === 'Admin') ? `
            <button class="btn btn-primary" onclick="app.openCreateEventModal()">+ Create Event</button>
          ` : ''}
        </div>
        <div style="display: flex; flex-direction: column; gap: 1.25rem;">
          ${eventsHTML || '<div class="card text-center">No upcoming events scheduled.</div>'}
        </div>
      `;
    } catch (e) {
      container.innerHTML = `<div class="card text-center" style="color: var(--rose);">Error loading events</div>`;
    }
  }

  // --- Private Chat View ---
  async renderMessagesView(container) {
    if (!this.activeChatUserId) {
      container.innerHTML = `<div class="card text-center" style="padding: 3rem;">Select a member from batch or profile to start a private chat.</div>`;
      return;
    }

    try {
      const res = await fetch(`/api/messages/${this.activeChatUserId}`);
      const data = await res.json();

      const messagesHTML = (data.messages || []).map(m => {
        const isOut = (m.sender_id === this.currentUser.id);
        return `
          <div class="message-bubble ${isOut ? 'outgoing' : 'incoming'}">
            <div>${m.message}</div>
          </div>
        `;
      }).join('');

      container.innerHTML = `
        <div class="chat-container">
          <div class="chat-main">
            <div style="padding: 1rem; border-bottom: 1px solid var(--border-color); font-weight: 700;">
              💬 Private Chat Thread
            </div>
            <div class="chat-messages" id="chatStream">
              ${messagesHTML.length ? messagesHTML : '<p style="text-center">No messages yet. Send a message!</p>'}
            </div>
            <form style="padding: 1rem; border-top: 1px solid var(--border-color); display: flex; gap: 8px;" onsubmit="app.sendChatMessageSubmit(event)">
              <input type="text" id="chatTextInput" placeholder="Write message..." style="flex: 1;" required autocomplete="off">
              <button type="submit" class="btn btn-primary">Send</button>
            </form>
          </div>
        </div>
      `;
    } catch (e) {
      container.innerHTML = `<div class="card text-center" style="color: var(--rose);">Error loading chat</div>`;
    }
  }

  openPrivateChat(otherUserId) {
    this.activeChatUserId = otherUserId;
    this.currentPage = 'messages';
    this.render();
  }

  async sendChatMessageSubmit(e) {
    e.preventDefault();
    const text = document.getElementById('chatTextInput').value.trim();
    if (!text || !this.activeChatUserId) return;

    await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ receiverId: this.activeChatUserId, message: text })
    });

    document.getElementById('chatTextInput').value = '';
    this.renderMainContent();
  }

  // --- Admin Dashboard View ---
  async renderAdminDashboard(container) {
    try {
      const res = await fetch('/api/admin/stats');
      const data = await res.json();

      const s = data.stats;
      const usersHTML = (data.allUsers || []).map(u => `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid var(--border-color);">${u.fullName}</td>
          <td style="padding: 8px; border-bottom: 1px solid var(--border-color);"><span class="role-badge ${u.role}">${u.role}</span></td>
          <td style="padding: 8px; border-bottom: 1px solid var(--border-color);">${u.batch_name || '-'}</td>
          <td style="padding: 8px; border-bottom: 1px solid var(--border-color);">${u.company} (${u.designation})</td>
        </tr>
      `).join('');

      container.innerHTML = `
        <h1 style="font-size: 1.6rem; font-weight: 800; margin-bottom: 1rem;">Executive Admin Dashboard</h1>

        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 1.5rem;">
          <div class="card text-center">
            <h2 style="font-size: 1.8rem; color: var(--primary);">${s.totalUsers}</h2>
            <p style="font-size: 0.85rem; color: var(--text-muted);">Total Members</p>
          </div>
          <div class="card text-center">
            <h2 style="font-size: 1.8rem; color: var(--emerald);">${s.alumni}</h2>
            <p style="font-size: 0.85rem; color: var(--text-muted);">Alumni</p>
          </div>
          <div class="card text-center">
            <h2 style="font-size: 1.8rem; color: var(--amber);">${s.students}</h2>
            <p style="font-size: 0.85rem; color: var(--text-muted);">Students</p>
          </div>
          <div class="card text-center">
            <h2 style="font-size: 1.8rem; color: var(--rose);">${s.batches}</h2>
            <p style="font-size: 0.85rem; color: var(--text-muted);">Active Batches</p>
          </div>
        </div>

        <div class="card">
          <h3 class="card-title">Registered CSE Users Directory</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 0.88rem;">
            <thead>
              <tr style="background: var(--bg-subtle);">
                <th style="padding: 8px; text-align: left;">Name</th>
                <th style="padding: 8px; text-align: left;">Role</th>
                <th style="padding: 8px; text-align: left;">Batch</th>
                <th style="padding: 8px; text-align: left;">Designation / Company</th>
              </tr>
            </thead>
            <tbody>
              ${usersHTML}
            </tbody>
          </table>
        </div>
      `;
    } catch (e) {
      container.innerHTML = `<div class="card text-center" style="color: var(--rose);">Access Restricted / Admin Error</div>`;
    }
  }

  // --- Search View ---
  async renderSearchView(container, query) {
    if (!query) {
      container.innerHTML = `<div class="card text-center">Type in search bar to query CSE members or jobs.</div>`;
      return;
    }

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();

      const usersHTML = (data.users || []).map(u => `
        <div class="card" style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <strong>${u.fullName}</strong> <span class="role-badge ${u.role}">${u.role}</span>
            <div style="font-size: 0.8rem; color: var(--text-muted);">${u.designation} at ${u.company} (${u.batch_name})</div>
          </div>
          <button class="btn btn-secondary btn-sm" onclick="app.viewProfile('${u.id}')">View Profile</button>
        </div>
      `).join('');

      container.innerHTML = `
        <h1 style="font-size: 1.6rem; font-weight: 800; margin-bottom: 1rem;">Search Results for "${query}"</h1>
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          ${usersHTML.length ? usersHTML : '<div class="card text-center">No matching members found.</div>'}
        </div>
      `;
    } catch (e) {
      container.innerHTML = `<div class="card text-center" style="color: var(--rose);">Search error</div>`;
    }
  }

  triggerSearch(q) {
    this.searchQuery = q;
    this.currentPage = 'search';
    this.render();
  }

  viewProfile(userId) {
    this.viewUserId = userId;
    this.currentPage = 'profile';
    this.render();
  }

  closeModal(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
  }

  showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'card';
    toast.style.padding = '0.75rem 1.25rem';
    toast.style.fontSize = '0.88rem';
    toast.style.fontWeight = '600';
    toast.style.color = '#ffffff';
    toast.style.background = (type === 'success' ? 'var(--emerald)' : (type === 'error' ? 'var(--rose)' : 'var(--primary)'));
    toast.style.boxShadow = 'var(--shadow-lg)';
    toast.innerHTML = message;

    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
  }
}

window.app = new App();
