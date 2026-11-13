/**
 * CSE AlumniConnect - Authentication & Registration Module
 */

import { db } from '../db.js';

export class AuthModule {
  constructor(app) {
    this.app = app;
  }

  renderLoginModal() {
    return `
      <div class="modal-overlay" id="loginModal">
        <div class="modal-content animate-fade-in" style="max-width: 440px;">
          <div class="modal-header">
            <div style="display: flex; align-items: center; gap: 10px;">
              <div class="brand-icon">🎓</div>
              <div>
                <h3 style="margin: 0;">CSE AlumniConnect</h3>
                <span style="font-size: 0.75rem; color: var(--primary); font-weight: 700;">Computer Science & Engineering</span>
              </div>
            </div>
            <button class="close-btn" onclick="app.closeModal('loginModal')">&times;</button>
          </div>
          
          <form id="loginForm" onsubmit="app.auth.handleLogin(event)">
            <div class="form-group">
              <label>Email or Username</label>
              <input type="text" id="loginEmail" placeholder="e.g. arun.cse23@alumni.cse.edu" required value="arun.cse23@alumni.cse.edu">
            </div>
            
            <div class="form-group">
              <label>Password</label>
              <input type="password" id="loginPassword" placeholder="••••••••" required value="password123">
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; font-size: 0.85rem;">
              <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; color: var(--text-muted);">
                <input type="checkbox" checked> Remember me
              </label>
              <a href="#" onclick="alert('Password reset instructions sent to your CSE email!')" style="color: var(--primary);">Forgot Password?</a>
            </div>

            <button type="submit" class="btn btn-primary w-full" style="padding: 0.75rem; margin-bottom: 1rem;">
              Sign In to CSE Connect
            </button>

            <div class="text-center" style="font-size: 0.88rem; color: var(--text-muted);">
              Don't have an account? <a href="#" onclick="app.closeModal('loginModal'); app.openRegisterModal()" style="color: var(--primary); font-weight: 700;">Register Now</a>
            </div>
          </form>

          <div style="margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid var(--border-color);">
            <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.5rem; text-align: center; text-transform: uppercase; font-weight: 700;">
              ⚡ Quick Demo Account Login
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
              <button class="btn btn-secondary btn-sm" onclick="app.auth.quickLogin('u-1')">Student (Arun 23-27)</button>
              <button class="btn btn-secondary btn-sm" onclick="app.auth.quickLogin('u-2')">Alumni (Sneha Google)</button>
              <button class="btn btn-secondary btn-sm" onclick="app.auth.quickLogin('u-5')">Teacher (Dr. Rajesh)</button>
              <button class="btn btn-secondary btn-sm" onclick="app.auth.quickLogin('u-6')">Admin (HOD Sundaram)</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderRegisterModal() {
    const batches = db.getCollection('batches');
    const batchOptions = batches.map(b => `<option value="${b.id}">${b.name}</option>`).join('');

    return `
      <div class="modal-overlay" id="registerModal">
        <div class="modal-content animate-fade-in" style="max-width: 620px;">
          <div class="modal-header">
            <div>
              <h3 style="margin: 0;">Register for CSE AlumniConnect</h3>
              <span style="font-size: 0.8rem; color: var(--text-muted);">Join the CSE Community (Exclusive for CSE Department)</span>
            </div>
            <button class="close-btn" onclick="app.closeModal('registerModal')">&times;</button>
          </div>

          <form id="registerForm" onsubmit="app.auth.handleRegister(event)">
            <div class="form-row">
              <div class="form-group">
                <label>Full Name *</label>
                <input type="text" id="regName" placeholder="e.g. Ananya Roy" required>
              </div>
              <div class="form-group">
                <label>Username *</label>
                <input type="text" id="regUsername" placeholder="e.g. ananya_cse" required>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Email *</label>
                <input type="email" id="regEmail" placeholder="e.g. ananya@alumni.cse.edu" required>
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
                <select id="regRole" required onchange="app.auth.toggleRoleFields(this.value)">
                  <option value="Student">Student / Alumni</option>
                  <option value="Teacher">Teacher / Faculty</option>
                  <option value="Admin">Management / Admin</option>
                </select>
              </div>
              <div class="form-group" id="batchSelectGroup">
                <label>CSE Batch *</label>
                <select id="regBatch" required>
                  ${batchOptions}
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Department</label>
                <input type="text" value="Computer Science & Engineering" disabled style="background: rgba(255,255,255,0.03); color: var(--primary); font-weight: 700;">
              </div>
              <div class="form-group">
                <label>Graduation / Passing Year</label>
                <input type="text" id="regGradYear" placeholder="e.g. 2027">
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Current Company / College</label>
                <input type="text" id="regCompany" placeholder="e.g. Microsoft / Student">
              </div>
              <div class="form-group">
                <label>Designation / Job Position</label>
                <input type="text" id="regDesignation" placeholder="e.g. Software Engineer">
              </div>
            </div>

            <div class="form-group">
              <label>Key Technical Skills (Comma separated)</label>
              <input type="text" id="regSkills" placeholder="e.g. Java, Python, React, Cloud, Spring Boot">
            </div>

            <div class="form-group">
              <label>Current City / Location</label>
              <input type="text" id="regLocation" placeholder="e.g. Bengaluru, India">
            </div>

            <button type="submit" class="btn btn-primary w-full" style="padding: 0.75rem; margin-top: 0.5rem;">
              Complete Registration
            </button>
          </form>
        </div>
      </div>
    `;
  }

  handleLogin(e) {
    e.preventDefault();
    const identifier = document.getElementById('loginEmail').value.trim();
    const dbUsers = db.getCollection('users');
    const user = dbUsers.find(u => u.email.toLowerCase() === identifier.toLowerCase() || u.username.toLowerCase() === identifier.toLowerCase());
    
    if (user) {
      db.setCurrentUser(user);
      this.app.closeModal('loginModal');
      this.app.showToast(`Welcome back, ${user.fullName}!`, 'success');
      this.app.routeUserAfterLogin(user);
    } else {
      this.app.showToast('Invalid credentials. Try using one of the quick demo buttons.', 'error');
    }
  }

  quickLogin(userId) {
    const user = db.getItem('users', userId);
    if (user) {
      db.setCurrentUser(user);
      this.app.closeModal('loginModal');
      this.app.showToast(`Logged in as ${user.fullName} (${user.role})`, 'success');
      this.app.routeUserAfterLogin(user);
    }
  }

  handleRegister(e) {
    e.preventDefault();
    const pass = document.getElementById('regPass').value;
    const confirmPass = document.getElementById('regConfirmPass').value;

    if (pass !== confirmPass) {
      this.app.showToast('Passwords do not match!', 'error');
      return;
    }

    const role = document.getElementById('regRole').value;
    const batchId = document.getElementById('regBatch').value;
    const batch = db.getItem('batches', batchId);
    const skillsInput = document.getElementById('regSkills').value;
    const skillsArr = skillsInput ? skillsInput.split(',').map(s => s.trim()).filter(Boolean) : ['Java', 'Algorithms'];

    const newUser = {
      id: 'u-' + Date.now(),
      fullName: document.getElementById('regName').value,
      username: document.getElementById('regUsername').value,
      email: document.getElementById('regEmail').value,
      role: role,
      batchId: batchId,
      batchName: batch ? batch.name : 'CSE 2023–2027',
      department: 'Computer Science & Engineering',
      graduationYear: document.getElementById('regGradYear').value || '2027',
      company: document.getElementById('regCompany').value || 'CSE Department',
      designation: document.getElementById('regDesignation').value || 'Member',
      location: document.getElementById('regLocation').value || 'Chennai, India',
      bio: 'CSE Department member.',
      skills: skillsArr,
      higherStudies: 'B.Tech CSE',
      linkedin: 'https://linkedin.com',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=300',
      isApproved: true,
      createdAt: new Date().toISOString()
    };

    db.addItem('users', newUser);
    db.setCurrentUser(newUser);
    this.app.closeModal('registerModal');
    this.app.showToast('Registration successful! Welcome to CSE AlumniConnect.', 'success');
    this.app.routeUserAfterLogin(newUser);
  }

  toggleRoleFields(role) {
    const batchGrp = document.getElementById('batchSelectGroup');
    if (batchGrp) {
      batchGrp.style.display = (role === 'Admin') ? 'none' : 'block';
    }
  }
}
