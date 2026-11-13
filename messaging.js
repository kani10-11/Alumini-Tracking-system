/**
 * CSE AlumniConnect - Private 1-on-1 Messaging Module
 */

import { db } from '../db.js';

export class MessagingModule {
  constructor(app) {
    this.app = app;
    this.activeRecipientId = null;
  }

  renderMessaging(targetUserId = null) {
    const currentUser = db.getCurrentUser();
    const allUsers = db.getCollection('users').filter(u => u.id !== currentUser.id);

    if (targetUserId) {
      this.activeRecipientId = targetUserId;
    } else if (!this.activeRecipientId && allUsers.length > 0) {
      this.activeRecipientId = allUsers[0].id;
    }

    const activeUser = db.getItem('users', this.activeRecipientId) || allUsers[0];

    // Get messages between currentUser and activeUser
    const allMessages = db.getCollection('messages');
    const conversation = allMessages.filter(m => 
      (m.senderId === currentUser.id && m.receiverId === activeUser.id) ||
      (m.senderId === activeUser.id && m.receiverId === currentUser.id)
    ).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    // Mark unread incoming messages as read
    conversation.forEach(m => {
      if (m.receiverId === currentUser.id && !m.isRead) {
        db.updateItem('messages', m.id, { isRead: true });
      }
    });

    const contactItemsHTML = allUsers.map(u => {
      // Find last message
      const lastMsg = allMessages.filter(m => 
        (m.senderId === currentUser.id && m.receiverId === u.id) ||
        (m.senderId === u.id && m.receiverId === currentUser.id)
      ).pop();

      const hasUnread = allMessages.some(m => m.senderId === u.id && m.receiverId === currentUser.id && !m.isRead);

      return `
        <div class="conversation-item ${u.id === activeUser.id ? 'active' : ''}" onclick="app.messaging.openChatWith('${u.id}')">
          <img src="${u.avatar}" class="avatar-md" alt="${u.fullName}">
          <div style="flex: 1; min-width: 0;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <strong style="font-size: 0.9rem; color: #fff; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${u.fullName}</strong>
              ${hasUnread ? `<span class="badge-dot" style="position: static;"></span>` : ''}
            </div>
            <div style="font-size: 0.75rem; color: var(--primary); font-weight: 600;">${u.role} (${u.batchName})</div>
            <div style="font-size: 0.78rem; color: var(--text-muted); text-overflow: ellipsis; overflow: hidden; white-space: nowrap; margin-top: 2px;">
              ${lastMsg ? lastMsg.text : 'Tap to start conversation'}
            </div>
          </div>
        </div>
      `;
    }).join('');

    const messageBubblesHTML = conversation.map(m => {
      const isOutgoing = (m.senderId === currentUser.id);
      return `
        <div class="message-bubble ${isOutgoing ? 'outgoing' : 'incoming'}">
          <div>${m.text}</div>
          <div class="message-time">${this.formatTime(m.createdAt)}</div>
        </div>
      `;
    }).join('');

    return `
      <div class="chat-container">
        <!-- Conversations Sidebar -->
        <div class="conversations-sidebar">
          <div class="conversations-header">
            <h3 style="font-size: 1.1rem; font-weight: 800;">💬 CSE Messages</h3>
            <input type="text" placeholder="Search classmate or teacher..." 
                   oninput="app.messaging.filterContacts(this.value)"
                   style="width: 100%; background: var(--bg-input); border: 1px solid var(--border-color); padding: 0.5rem 0.8rem; border-radius: var(--radius-full); color: white; font-size: 0.8rem; margin-top: 8px;">
          </div>
          <div class="conversation-list" id="contactListContainer">
            ${contactItemsHTML}
          </div>
        </div>

        <!-- Main Chat Area -->
        <div class="chat-main">
          <!-- Chat Header -->
          <div class="chat-header">
            <img src="${activeUser.avatar}" class="avatar-md" alt="${activeUser.fullName}">
            <div>
              <h4 style="font-size: 1rem; font-weight: 800; color: #fff;">${activeUser.fullName}</h4>
              <span class="role-badge ${activeUser.role}">${activeUser.role}</span>
              <span style="font-size: 0.8rem; color: var(--text-muted); margin-left: 6px;">${activeUser.designation} @ ${activeUser.company} (${activeUser.batchName})</span>
            </div>
            <div style="margin-left: auto;">
              <button class="btn btn-secondary btn-sm" onclick="app.viewProfile('${activeUser.id}')">View Profile</button>
            </div>
          </div>

          <!-- Chat Stream -->
          <div class="chat-messages" id="chatMessagesStream">
            ${messageBubblesHTML.length ? messageBubblesHTML : `
              <div class="text-center" style="margin: auto; color: var(--text-muted);">
                <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">👋</div>
                <p>No messages yet. Send a message to start networking with ${activeUser.fullName}!</p>
              </div>
            `}
          </div>

          <!-- Chat Input Bar -->
          <form class="chat-input-bar" onsubmit="app.messaging.sendMessage(event)">
            <input type="text" id="chatInput" placeholder="Write a private message to ${activeUser.fullName}..." required autocomplete="off">
            <button type="submit" class="btn btn-primary">
              Send 🚀
            </button>
          </form>
        </div>
      </div>
    `;
  }

  openChatWith(userId) {
    this.activeRecipientId = userId;
    this.app.openPage('messages');
  }

  sendMessage(e) {
    e.preventDefault();
    const currentUser = db.getCurrentUser();
    const input = document.getElementById('chatInput');
    const text = input.value.trim();
    if (!text || !this.activeRecipientId) return;

    const newMsg = {
      id: 'm-' + Date.now(),
      senderId: currentUser.id,
      receiverId: this.activeRecipientId,
      text: text,
      createdAt: new Date().toISOString(),
      isRead: false
    };

    db.addItem('messages', newMsg);

    // Add notification
    db.addItem('notifications', {
      id: 'n-' + Date.now(),
      userId: this.activeRecipientId,
      title: 'New Message',
      message: `${currentUser.fullName} sent you a private message.`,
      link: 'messages',
      isRead: false,
      createdAt: new Date().toISOString()
    });

    input.value = '';
    this.app.renderMainContent();

    // Scroll to bottom
    setTimeout(() => {
      const stream = document.getElementById('chatMessagesStream');
      if (stream) stream.scrollTop = stream.scrollHeight;
    }, 50);
  }

  filterContacts(query) {
    const q = query.toLowerCase();
    const currentUser = db.getCurrentUser();
    const allUsers = db.getCollection('users').filter(u => u.id !== currentUser.id);

    const filtered = allUsers.filter(u => 
      u.fullName.toLowerCase().includes(q) ||
      u.batchName.toLowerCase().includes(q) ||
      u.company.toLowerCase().includes(q)
    );

    const container = document.getElementById('contactListContainer');
    if (container) {
      container.innerHTML = filtered.map(u => `
        <div class="conversation-item ${u.id === this.activeRecipientId ? 'active' : ''}" onclick="app.messaging.openChatWith('${u.id}')">
          <img src="${u.avatar}" class="avatar-md" alt="${u.fullName}">
          <div style="flex: 1;">
            <strong style="font-size: 0.9rem; color: #fff;">${u.fullName}</strong>
            <div style="font-size: 0.75rem; color: var(--primary);">${u.role} (${u.batchName})</div>
          </div>
        </div>
      `).join('');
    }
  }

  formatTime(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}
