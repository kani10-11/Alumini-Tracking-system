/**
 * CSE AlumniConnect - LinkedIn-Style Feed & Post Module
 */

import { db } from '../db.js';

export class FeedModule {
  constructor(app) {
    this.app = app;
  }

  renderFeed(filteredBatchId = null) {
    const currentUser = db.getCurrentUser();
    let posts = db.getCollection('posts');

    if (filteredBatchId) {
      posts = posts.filter(p => !p.batchId || p.batchId === filteredBatchId);
    }

    // Sort newest first
    posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const postsHTML = posts.length ? posts.map(p => this.renderPostCard(p, currentUser)).join('') : `
      <div class="card text-center" style="padding: 3rem;">
        <div style="font-size: 3rem; margin-bottom: 1rem;">📝</div>
        <h3>No posts in this feed yet</h3>
        <p style="color: var(--text-muted);">Be the first to share an update, job, or achievement with the CSE community!</p>
      </div>
    `;

    return `
      <!-- Post Creation Trigger Box -->
      <div class="post-create-box">
        <div class="post-create-header">
          <img src="${currentUser.avatar}" class="avatar-md" alt="${currentUser.fullName}">
          <div class="post-input-trigger" onclick="app.feed.openCreatePostModal()">
            Start a post, share a job, or announce an achievement...
          </div>
        </div>
        <div class="post-type-buttons">
          <button class="post-type-btn" onclick="app.feed.openCreatePostModal('Job Opportunity')">💼 Job Opportunity</button>
          <button class="post-type-btn" onclick="app.feed.openCreatePostModal('Achievement')">🏆 Achievement</button>
          <button class="post-type-btn" onclick="app.feed.openCreatePostModal('Career Update')">🚀 Career Update</button>
          <button class="post-type-btn" onclick="app.feed.openCreatePostModal('Technical Post')">💻 Tech Insight</button>
          ${currentUser.role === 'Teacher' || currentUser.role === 'Admin' ? `
            <button class="post-type-btn" style="border-color: var(--rose); color: var(--rose);" onclick="app.feed.openCreatePostModal('Event Announcement')">📢 Official CSE Announcement</button>
          ` : ''}
        </div>
      </div>

      <!-- Feed Stream -->
      <div class="feed-stream" style="display: flex; flex-direction: column; gap: 1.25rem;">
        ${postsHTML}
      </div>
    `;
  }

  renderPostCard(post, currentUser) {
    const isOfficial = post.isOfficial;
    const userReacted = post.userReactions && post.userReactions[currentUser.id];
    
    // Total reactions count
    const totalReactions = Object.values(post.reactions || {}).reduce((a, b) => a + b, 0);

    const commentsHTML = (post.comments || []).map(c => `
      <div style="display: flex; gap: 10px; margin-top: 10px; background: rgba(255,255,255,0.03); padding: 8px 12px; border-radius: var(--radius-md);">
        <img src="${c.authorAvatar}" class="avatar-sm" alt="${c.authorName}">
        <div style="flex: 1;">
          <div style="display: flex; justify-content: space-between;">
            <strong style="font-size: 0.85rem; color: var(--text-main);">${c.authorName}</strong>
            <span style="font-size: 0.72rem; color: var(--text-muted);">${this.formatDate(c.createdAt)}</span>
          </div>
          <p style="font-size: 0.85rem; color: #cbd5e1; margin-top: 2px;">${c.text}</p>
        </div>
      </div>
    `).join('');

    return `
      <div class="feed-item ${isOfficial ? 'is-official' : ''}" id="post-${post.id}">
        <!-- Post Header -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div class="post-author">
            <img src="${post.authorAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=300'}" class="avatar-md" alt="${post.authorName}">
            <div class="post-author-info">
              <div class="post-author-name">
                <span onclick="app.viewProfile('${post.authorId}')" style="cursor: pointer; text-decoration: underline;">${post.authorName}</span>
                <span class="role-badge ${post.authorRole}">${post.authorRole}</span>
                ${isOfficial ? `<span class="official-badge">⭐ Official CSE</span>` : ''}
              </div>
              <div class="post-author-meta">
                ${post.authorDesignation || 'CSE Member'} • <span style="color: var(--primary);">${post.authorBatch}</span>
              </div>
              <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">
                ${this.formatDate(post.createdAt)} • <span class="pill" style="font-size: 0.68rem; padding: 1px 6px;">${post.postType}</span>
              </div>
            </div>
          </div>

          <div style="display: flex; gap: 6px;">
            <button class="nav-icon-btn" style="width: 30px; height: 30px; font-size: 0.8rem;" title="Report Content" onclick="app.feed.reportPost('${post.id}')">🚩</button>
            ${(currentUser.role === 'Admin' || currentUser.id === post.authorId) ? `
              <button class="nav-icon-btn" style="width: 30px; height: 30px; font-size: 0.8rem;" title="Delete Post" onclick="app.feed.deletePost('${post.id}')">🗑️</button>
            ` : ''}
          </div>
        </div>

        <!-- Post Content -->
        <div class="post-body">
          ${post.content}
        </div>

        <!-- Reactions Stats Bar -->
        <div style="display: flex; justify-content: space-between; font-size: 0.8rem; color: var(--text-muted); padding-top: 4px;">
          <div>
            ${totalReactions > 0 ? `👍❤️👏💡 ${totalReactions} reactions` : 'Be the first to react'}
          </div>
          <div>
            ${(post.comments || []).length} comments
          </div>
        </div>

        <!-- Reactions Action Buttons -->
        <div class="post-reactions-bar">
          <div class="reaction-btn-group">
            <button class="reaction-btn ${userReacted === 'like' ? 'active' : ''}" onclick="app.feed.reactToPost('${post.id}', 'like')">
              👍 Like
            </button>
            <button class="reaction-btn ${userReacted === 'celebrate' ? 'active' : ''}" onclick="app.feed.reactToPost('${post.id}', 'celebrate')">
              👏 Celebrate
            </button>
            <button class="reaction-btn ${userReacted === 'support' ? 'active' : ''}" onclick="app.feed.reactToPost('${post.id}', 'support')">
              ❤️ Support
            </button>
            <button class="reaction-btn ${userReacted === 'insightful' ? 'active' : ''}" onclick="app.feed.reactToPost('${post.id}', 'insightful')">
              💡 Insightful
            </button>
          </div>
          <button class="reaction-btn" onclick="document.getElementById('comment-input-${post.id}').focus()">
            💬 Comment
          </button>
        </div>

        <!-- Comments Section -->
        <div class="comments-section" style="margin-top: 0.5rem;">
          ${commentsHTML}

          <!-- Comment Input -->
          <div style="display: flex; gap: 10px; margin-top: 12px;">
            <img src="${currentUser.avatar}" class="avatar-sm" alt="${currentUser.fullName}">
            <input type="text" id="comment-input-${post.id}" placeholder="Write a comment..." 
                   style="flex: 1; background: var(--bg-input); border: 1px solid var(--border-color); padding: 6px 12px; border-radius: var(--radius-full); color: white;"
                   onkeydown="if(event.key==='Enter') app.feed.addComment('${post.id}', this.value)">
            <button class="btn btn-primary btn-sm" onclick="app.feed.addComment('${post.id}', document.getElementById('comment-input-${post.id}').value)">
              Send
            </button>
          </div>
        </div>
      </div>
    `;
  }

  openCreatePostModal(defaultType = 'General Post') {
    const currentUser = db.getCurrentUser();
    const canMakeOfficial = (currentUser.role === 'Teacher' || currentUser.role === 'Admin');

    const modalHTML = `
      <div class="modal-overlay" id="createPostModal">
        <div class="modal-content animate-fade-in" style="max-width: 580px;">
          <div class="modal-header">
            <h3>Create a Post</h3>
            <button class="close-btn" onclick="app.closeModal('createPostModal')">&times;</button>
          </div>

          <form onsubmit="app.feed.handleCreatePost(event)">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 1rem;">
              <img src="${currentUser.avatar}" class="avatar-md" alt="${currentUser.fullName}">
              <div>
                <strong style="display: block;">${currentUser.fullName}</strong>
                <span class="role-badge ${currentUser.role}">${currentUser.role}</span>
                <span style="font-size: 0.8rem; color: var(--primary); margin-left: 6px;">${currentUser.batchName}</span>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Post Type</label>
                <select id="postTypeSelect">
                  <option value="General Post" ${defaultType === 'General Post' ? 'selected' : ''}>💬 General Post</option>
                  <option value="Job Opportunity" ${defaultType === 'Job Opportunity' ? 'selected' : ''}>💼 Job Opportunity</option>
                  <option value="Achievement" ${defaultType === 'Achievement' ? 'selected' : ''}>🏆 Achievement</option>
                  <option value="Career Update" ${defaultType === 'Career Update' ? 'selected' : ''}>🚀 Career Update</option>
                  <option value="Workplace Update" ${defaultType === 'Workplace Update' ? 'selected' : ''}>🏢 Workplace Update</option>
                  <option value="Technical Post" ${defaultType === 'Technical Post' ? 'selected' : ''}>💻 Technical Post</option>
                  <option value="College Update" ${defaultType === 'College Update' ? 'selected' : ''}>🏫 College Update</option>
                  <option value="Event Announcement" ${defaultType === 'Event Announcement' ? 'selected' : ''}>📢 Event Announcement</option>
                </select>
              </div>

              ${canMakeOfficial ? `
                <div class="form-group" style="justify-content: flex-end;">
                  <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; color: var(--rose); font-weight: 700; margin-top: 1.5rem;">
                    <input type="checkbox" id="postIsOfficial"> ⭐ Mark as Official CSE Announcement
                  </label>
                </div>
              ` : ''}
            </div>

            <div class="form-group">
              <label>What do you want to talk about?</label>
              <textarea id="postContent" rows="5" placeholder="Share insights, opportunities, or updates with your CSE peers..." required></textarea>
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

  handleCreatePost(e) {
    e.preventDefault();
    const currentUser = db.getCurrentUser();
    const postType = document.getElementById('postTypeSelect').value;
    const isOfficial = document.getElementById('postIsOfficial') ? document.getElementById('postIsOfficial').checked : false;
    const content = document.getElementById('postContent').value.trim();

    if (!content) return;

    const newPost = {
      id: 'p-' + Date.now(),
      authorId: currentUser.id,
      authorName: currentUser.fullName,
      authorAvatar: currentUser.avatar,
      authorBatch: currentUser.batchName,
      authorRole: currentUser.role,
      authorDesignation: `${currentUser.designation} at ${currentUser.company}`,
      postType: postType,
      batchId: currentUser.batchId,
      isOfficial: isOfficial,
      content: content,
      createdAt: new Date().toISOString(),
      reactions: { like: 0, celebrate: 0, support: 0, insightful: 0 },
      userReactions: {},
      comments: []
    };

    db.addItem('posts', newPost);
    this.app.closeModal('createPostModal');
    this.app.showToast('Post published successfully!', 'success');
    this.app.renderMainContent();
  }

  reactToPost(postId, reactionType) {
    const currentUser = db.getCurrentUser();
    const post = db.getItem('posts', postId);
    if (!post) return;

    if (!post.userReactions) post.userReactions = {};
    if (!post.reactions) post.reactions = { like: 0, celebrate: 0, support: 0, insightful: 0 };

    const currentReaction = post.userReactions[currentUser.id];

    if (currentReaction === reactionType) {
      // Toggle off
      delete post.userReactions[currentUser.id];
      post.reactions[reactionType] = Math.max(0, (post.reactions[reactionType] || 1) - 1);
    } else {
      if (currentReaction) {
        post.reactions[currentReaction] = Math.max(0, (post.reactions[currentReaction] || 1) - 1);
      }
      post.userReactions[currentUser.id] = reactionType;
      post.reactions[reactionType] = (post.reactions[reactionType] || 0) + 1;
    }

    db.updateItem('posts', postId, { reactions: post.reactions, userReactions: post.userReactions });
    this.app.renderMainContent();
  }

  addComment(postId, text) {
    if (!text || !text.trim()) return;
    const currentUser = db.getCurrentUser();
    const post = db.getItem('posts', postId);
    if (!post) return;

    const newComment = {
      id: 'c-' + Date.now(),
      authorId: currentUser.id,
      authorName: currentUser.fullName,
      authorAvatar: currentUser.avatar,
      text: text.trim(),
      createdAt: new Date().toISOString()
    };

    const comments = post.comments || [];
    comments.push(newComment);
    db.updateItem('posts', postId, { comments });

    // Send notification to post author if not self
    if (post.authorId !== currentUser.id) {
      db.addItem('notifications', {
        id: 'n-' + Date.now(),
        userId: post.authorId,
        title: 'New Comment',
        message: `${currentUser.fullName} commented on your post.`,
        link: 'feed',
        isRead: false,
        createdAt: new Date().toISOString()
      });
    }

    this.app.renderMainContent();
  }

  reportPost(postId) {
    const currentUser = db.getCurrentUser();
    db.addItem('reports', {
      id: 'rep-' + Date.now(),
      targetId: postId,
      targetType: 'Post',
      reportedBy: currentUser.fullName,
      reason: 'Inappropriate or non-CSE content',
      createdAt: new Date().toISOString()
    });
    this.app.showToast('Post reported to CSE Admin moderation queue.', 'success');
  }

  deletePost(postId) {
    if (confirm('Are you sure you want to delete this post?')) {
      db.deleteItem('posts', postId);
      this.app.showToast('Post deleted.', 'success');
      this.app.renderMainContent();
    }
  }

  formatDate(dateStr) {
    if (!dateStr) return 'Just now';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
}
