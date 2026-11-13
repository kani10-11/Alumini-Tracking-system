/**
 * CSE AlumniConnect - Event & Reunion Module
 */

import { db } from '../db.js';

export class EventsModule {
  constructor(app) {
    this.app = app;
  }

  renderEvents(batchFilter = null) {
    const events = db.getCollection('events');
    const currentUser = db.getCurrentUser();

    const cardsHTML = events.map(ev => {
      const isRegistered = (ev.registrations || []).some(r => r.userId === currentUser.id && r.status === 'Registered');
      const isInterested = (ev.registrations || []).some(r => r.userId === currentUser.id && r.status === 'Interested');
      const regCount = (ev.registrations || []).filter(r => r.status === 'Registered').length;

      return `
        <div class="card" style="padding: 0; overflow: hidden; display: flex; flex-direction: column;">
          <!-- Banner -->
          <div style="height: 160px; background: url('${ev.banner}') center/cover; position: relative;">
            <div style="position: absolute; inset: 0; background: linear-gradient(180deg, transparent 40%, rgba(15, 23, 42, 0.95) 100%);"></div>
            <div style="position: absolute; bottom: 12px; left: 16px; right: 16px; display: flex; justify-content: space-between; align-items: flex-end;">
              <span class="pill" style="background: var(--primary); color: white; font-weight: 800; font-size: 0.75rem;">📅 ${ev.date}</span>
              <span class="pill" style="background: rgba(0,0,0,0.6); color: #cbd5e1; font-size: 0.75rem;">👥 ${regCount} / ${ev.maxParticipants} Registered</span>
            </div>
          </div>

          <div style="padding: 1.25rem; display: flex; flex-direction: column; gap: 0.75rem; flex: 1; justify-content: space-between;">
            <div>
              <h3 style="font-size: 1.25rem; font-weight: 800; color: #fff;">${ev.title}</h3>
              <div style="font-size: 0.85rem; color: var(--primary); margin-top: 2px;">
                ⏰ ${ev.time} • 📍 ${ev.venue}
              </div>
              <p style="font-size: 0.88rem; color: var(--text-muted); margin-top: 6px;">${ev.description}</p>
              
              <div style="margin-top: 10px; font-size: 0.8rem; color: #cbd5e1;">
                <strong>Organizer:</strong> ${ev.organizer}
              </div>

              <div style="margin-top: 8px;">
                <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 700; display: block; margin-bottom: 4px;">ELIGIBLE BATCHES:</span>
                <div style="display: flex; gap: 4px; flex-wrap: wrap;">
                  ${(ev.eligibleBatches || []).map(b => `<span class="pill" style="font-size: 0.7rem; padding: 1px 8px;">${b}</span>`).join('')}
                </div>
              </div>
            </div>

            <div style="border-top: 1px solid var(--border-color); padding-top: 0.75rem; display: flex; justify-content: space-between; align-items: center;">
              <div style="display: flex; gap: 8px;">
                <button class="btn ${isRegistered ? 'btn-emerald' : 'btn-primary'} btn-sm" onclick="app.events.toggleRegistration('${ev.id}', 'Registered')">
                  ${isRegistered ? '✓ Registered' : 'Register Now'}
                </button>
                <button class="btn ${isInterested ? 'btn-emerald' : 'btn-secondary'} btn-sm" onclick="app.events.toggleRegistration('${ev.id}', 'Interested')">
                  ${isInterested ? '★ Interested' : 'Interested'}
                </button>
              </div>

              ${(currentUser.role === 'Admin' || currentUser.role === 'Teacher') ? `
                <button class="btn btn-secondary btn-sm" onclick="app.events.viewRoster('${ev.id}')">
                  📋 View Roster (${(ev.registrations || []).length})
                </button>
              ` : ''}
            </div>
          </div>
        </div>
      `;
    }).join('');

    return `
      <div style="display: flex; flex-direction: column; gap: 1.25rem;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h1 style="font-size: 1.6rem; font-weight: 800;">CSE Reunions & Event Announcements</h1>
            <p style="color: var(--text-muted);">Alumni meets, tech workshops, career mentoring panels, and department reunions</p>
          </div>
          ${(currentUser.role === 'Admin' || currentUser.role === 'Teacher') ? `
            <button class="btn btn-primary" onclick="app.events.openCreateEventModal()">
              + Create New Reunion Event
            </button>
          ` : ''}
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 1.25rem;">
          ${cardsHTML}
        </div>
      </div>
    `;
  }

  toggleRegistration(eventId, status) {
    const currentUser = db.getCurrentUser();
    const event = db.getItem('events', eventId);
    if (!event) return;

    let regs = event.registrations || [];
    const existingIndex = regs.findIndex(r => r.userId === currentUser.id);

    if (existingIndex !== -1) {
      if (regs[existingIndex].status === status) {
        // Cancel registration
        regs.splice(existingIndex, 1);
        this.app.showToast('Registration updated (Cancelled)', 'info');
      } else {
        regs[existingIndex].status = status;
        this.app.showToast(`Status updated to ${status}!`, 'success');
      }
    } else {
      regs.push({
        userId: currentUser.id,
        userName: currentUser.fullName,
        batch: currentUser.batchName,
        status: status,
        date: new Date().toISOString().split('T')[0]
      });
      this.app.showToast(`You have ${status === 'Registered' ? 'registered for' : 'marked interest in'} ${event.title}!`, 'success');
    }

    db.updateItem('events', eventId, { registrations: regs });
    this.app.renderMainContent();
  }

  openCreateEventModal() {
    const modalHTML = `
      <div class="modal-overlay" id="createEventModal">
        <div class="modal-content animate-fade-in" style="max-width: 580px;">
          <div class="modal-header">
            <h3>Create Reunion / Department Event</h3>
            <button class="close-btn" onclick="app.closeModal('createEventModal')">&times;</button>
          </div>

          <form onsubmit="app.events.handleSaveEvent(event)">
            <div class="form-group">
              <label>Event Name / Title *</label>
              <input type="text" id="evTitle" placeholder="e.g. CSE ALUMNI MEET 2026" required>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Date *</label>
                <input type="date" id="evDate" required>
              </div>
              <div class="form-group">
                <label>Time *</label>
                <input type="text" id="evTime" placeholder="e.g. 10:00 AM - 04:00 PM" required>
              </div>
            </div>

            <div class="form-group">
              <label>Venue / Location *</label>
              <input type="text" id="evVenue" placeholder="e.g. Main Auditorium & CSE Quadrangle" required>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Organizer *</label>
                <input type="text" id="evOrganizer" placeholder="e.g. CSE Department & Management" required>
              </div>
              <div class="form-group">
                <label>Max Capacity</label>
                <input type="number" id="evMax" value="300">
              </div>
            </div>

            <div class="form-group">
              <label>Description *</label>
              <textarea id="evDesc" rows="3" placeholder="Outline agenda, keynote speakers, batch photos..." required></textarea>
            </div>

            <button type="submit" class="btn btn-primary w-full" style="padding: 0.75rem;">
              Publish Event Announcement
            </button>
          </form>
        </div>
      </div>
    `;

    document.getElementById('modalContainer').innerHTML = modalHTML;
  }

  handleSaveEvent(e) {
    e.preventDefault();
    const currentUser = db.getCurrentUser();

    const newEv = {
      id: 'ev-' + Date.now(),
      title: document.getElementById('evTitle').value,
      date: document.getElementById('evDate').value,
      time: document.getElementById('evTime').value,
      venue: document.getElementById('evVenue').value,
      description: document.getElementById('evDesc').value,
      organizer: document.getElementById('evOrganizer').value,
      eligibleBatches: ['2020–2024', '2021–2025', '2022–2026', '2023–2027', '2024–2028'],
      registrationDeadline: document.getElementById('evDate').value,
      maxParticipants: parseInt(document.getElementById('evMax').value) || 300,
      banner: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=800',
      registrations: []
    };

    db.addItem('events', newEv);

    // Broadcast to feed
    db.addItem('posts', {
      id: 'p-' + Date.now(),
      authorId: currentUser.id,
      authorName: currentUser.fullName,
      authorAvatar: currentUser.avatar,
      authorBatch: currentUser.batchName,
      authorRole: currentUser.role,
      authorDesignation: currentUser.designation,
      postType: 'Event Announcement',
      batchId: null,
      isOfficial: true,
      content: `📢 OFFICIAL EVENT ANNOUNCEMENT: ${newEv.title}\n\nDate: ${newEv.date} (${newEv.time})\nVenue: ${newEv.venue}\nOrganizer: ${newEv.organizer}\n\n${newEv.description}`,
      createdAt: new Date().toISOString(),
      reactions: { like: 12, celebrate: 8 },
      comments: []
    });

    this.app.closeModal('createEventModal');
    this.app.showToast('Reunion event published!', 'success');
    this.app.renderMainContent();
  }

  viewRoster(eventId) {
    const event = db.getItem('events', eventId);
    if (!event) return;

    const regs = event.registrations || [];
    const rosterRows = regs.map(r => `
      <tr>
        <td style="padding: 8px 12px; border-bottom: 1px solid var(--border-color);">${r.userName}</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid var(--border-color);">${r.batch}</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid var(--border-color);">
          <span class="pill" style="font-size: 0.72rem; ${r.status === 'Registered' ? 'background: rgba(16,185,129,0.2); color:#34d399;' : 'background: rgba(59,130,246,0.2); color:#60a5fa;'}">${r.status}</span>
        </td>
        <td style="padding: 8px 12px; border-bottom: 1px solid var(--border-color);">${r.date}</td>
      </tr>
    `).join('');

    const modalHTML = `
      <div class="modal-overlay" id="rosterModal">
        <div class="modal-content animate-fade-in" style="max-width: 600px;">
          <div class="modal-header">
            <h3>Registered Roster: ${event.title}</h3>
            <button class="close-btn" onclick="app.closeModal('rosterModal')">&times;</button>
          </div>

          <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.88rem;">
            <thead>
              <tr style="background: rgba(255,255,255,0.05); color: var(--primary);">
                <th style="padding: 8px 12px;">Participant Name</th>
                <th style="padding: 8px 12px;">Batch</th>
                <th style="padding: 8px 12px;">Status</th>
                <th style="padding: 8px 12px;">Date</th>
              </tr>
            </thead>
            <tbody>
              ${rosterRows.length ? rosterRows : `<tr><td colspan="4" style="padding: 12px; text-align: center;">No registrations yet.</td></tr>`}
            </tbody>
          </table>
        </div>
      </div>
    `;

    document.getElementById('modalContainer').innerHTML = modalHTML;
  }
}
