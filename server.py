import os
import sqlite3
import uuid
from datetime import datetime
from flask import Flask, request, jsonify, render_template, session, send_from_directory, redirect, url_for
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename

app = Flask(__name__, static_folder='static', template_folder='templates')
app.secret_key = 'CSE_ALUMNICONNECT_SECRET_KEY_SUPER_SECURE_2026'

DATABASE = 'alumniconnect.db'
UPLOAD_FOLDER = os.path.join('static', 'uploads')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp', 'pdf', 'doc', 'docx'}

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024 # 16 MB limit

def get_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()

    # Batches
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS batches (
            id TEXT PRIMARY KEY,
            batch_name TEXT NOT NULL,
            department TEXT NOT NULL DEFAULT 'Computer Science and Engineering (CSE)',
            start_year INTEGER NOT NULL,
            end_year INTEGER NOT NULL,
            mentor TEXT,
            description TEXT
        )
    ''')

    # Users
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            fullName TEXT NOT NULL,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL,
            batch_id TEXT,
            batch_name TEXT,
            department TEXT NOT NULL DEFAULT 'Computer Science & Engineering',
            graduation_year TEXT,
            company TEXT,
            designation TEXT,
            location TEXT,
            bio TEXT,
            skills TEXT,
            higher_studies TEXT,
            linkedin_url TEXT,
            profile_photo TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(batch_id) REFERENCES batches(id)
        )
    ''')

    # Career History Timeline
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS career_history (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            company TEXT NOT NULL,
            designation TEXT NOT NULL,
            start_date TEXT NOT NULL,
            end_date TEXT NOT NULL,
            location TEXT,
            description TEXT,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )
    ''')

    # Posts
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS posts (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            batch_id TEXT,
            post_type TEXT NOT NULL,
            is_official BOOLEAN DEFAULT 0,
            content TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )
    ''')

    # Post Attachments
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS post_attachments (
            id TEXT PRIMARY KEY,
            post_id TEXT NOT NULL,
            file_name TEXT NOT NULL,
            file_path TEXT NOT NULL,
            file_type TEXT NOT NULL,
            file_size INTEGER,
            uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(post_id) REFERENCES posts(id) ON DELETE CASCADE
        )
    ''')

    # Comments
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS comments (
            id TEXT PRIMARY KEY,
            post_id TEXT NOT NULL,
            user_id TEXT NOT NULL,
            text TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(post_id) REFERENCES posts(id) ON DELETE CASCADE,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )
    ''')

    # Reactions
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS reactions (
            id TEXT PRIMARY KEY,
            post_id TEXT NOT NULL,
            user_id TEXT NOT NULL,
            reaction_type TEXT NOT NULL,
            UNIQUE(post_id, user_id),
            FOREIGN KEY(post_id) REFERENCES posts(id) ON DELETE CASCADE,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )
    ''')

    # Jobs
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS jobs (
            id TEXT PRIMARY KEY,
            posted_by_user_id TEXT NOT NULL,
            title TEXT NOT NULL,
            company TEXT NOT NULL,
            location TEXT NOT NULL,
            job_type TEXT NOT NULL,
            experience TEXT NOT NULL,
            skills TEXT NOT NULL,
            salary TEXT,
            description TEXT NOT NULL,
            application_link TEXT NOT NULL,
            last_date TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(posted_by_user_id) REFERENCES users(id)
        )
    ''')

    # Achievements
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS achievements (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            title TEXT NOT NULL,
            category TEXT NOT NULL,
            date TEXT NOT NULL,
            organization TEXT NOT NULL,
            description TEXT NOT NULL,
            attachment_path TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )
    ''')

    # Events
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS events (
            id TEXT PRIMARY KEY,
            created_by_user_id TEXT NOT NULL,
            title TEXT NOT NULL,
            date TEXT NOT NULL,
            time TEXT NOT NULL,
            venue TEXT NOT NULL,
            description TEXT NOT NULL,
            organizer TEXT NOT NULL,
            eligible_batches TEXT NOT NULL,
            max_participants INTEGER DEFAULT 300,
            banner TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(created_by_user_id) REFERENCES users(id)
        )
    ''')

    # Event Registrations
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS event_registrations (
            id TEXT PRIMARY KEY,
            event_id TEXT NOT NULL,
            user_id TEXT NOT NULL,
            status TEXT NOT NULL,
            registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(event_id, user_id),
            FOREIGN KEY(event_id) REFERENCES events(id) ON DELETE CASCADE,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )
    ''')

    # Private Messages
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS messages (
            id TEXT PRIMARY KEY,
            sender_id TEXT NOT NULL,
            receiver_id TEXT NOT NULL,
            message TEXT NOT NULL,
            attachment_path TEXT,
            is_read BOOLEAN DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(sender_id) REFERENCES users(id),
            FOREIGN KEY(receiver_id) REFERENCES users(id)
        )
    ''')

    # Notifications
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS notifications (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            title TEXT NOT NULL,
            message TEXT NOT NULL,
            link TEXT,
            is_read BOOLEAN DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )
    ''')

    # Moderation Queue
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS reports (
            id TEXT PRIMARY KEY,
            target_id TEXT NOT NULL,
            target_type TEXT NOT NULL,
            reported_by_user_id TEXT NOT NULL,
            reason TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # Seed Default Batches if empty
    cursor.execute('SELECT COUNT(*) FROM batches')
    if cursor.fetchone()[0] == 0:
        default_batches = [
            ('b-2020-2024', 'CSE 2020–2024', 'Computer Science and Engineering (CSE)', 2020, 2024, 'Dr. Rajesh Verma', 'Distributed Systems & Cloud Infrastructure focus.'),
            ('b-2021-2025', 'CSE 2021–2025', 'Computer Science and Engineering (CSE)', 2021, 2025, 'Dr. Anita Desai', 'Data Science & Machine Learning specialization.'),
            ('b-2022-2026', 'CSE 2022–2026', 'Computer Science and Engineering (CSE)', 2022, 2026, 'Prof. K. Murali', 'Cybersecurity & Modern Web Systems.'),
            ('b-2023-2027', 'CSE 2023–2027', 'Computer Science and Engineering (CSE)', 2023, 2027, 'Dr. Rajesh Verma', 'Artificial Intelligence & Algorithmic Engineering.'),
            ('b-2024-2028', 'CSE 2024–2028', 'Computer Science and Engineering (CSE)', 2024, 2028, 'Dr. S. Ramesh', 'Next-Gen Computing & Mobile Architecture.'),
            ('b-2025-2029', 'CSE 2025–2029', 'Computer Science and Engineering (CSE)', 2025, 2029, 'Prof. Lakshmi Priya', 'Robotics & Intelligent Automation.'),
            ('b-2026-2030', 'CSE 2026–2030', 'Computer Science and Engineering (CSE)', 2026, 2030, 'Dr. Rajesh Verma', 'Quantum Computing & Modern Software Architecture.')
        ]
        cursor.executemany('INSERT INTO batches VALUES (?,?,?,?,?,?,?)', default_batches)

    # Seed 1 initial HOD System Management Account (for administration testing)
    cursor.execute("SELECT COUNT(*) FROM users WHERE username = 'hod_cse'")
    if cursor.fetchone()[0] == 0:
        hod_pass = generate_password_hash('HOD@12345')
        cursor.execute('''
            INSERT INTO users (id, fullName, username, email, password_hash, role, batch_id, batch_name, department, graduation_year, company, designation, location, bio, skills, higher_studies, linkedin_url, profile_photo)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', ('u-hod', 'Dr. Meenakshi Sundaram', 'hod_cse', 'hod@cse.edu', hod_pass, 'HOD', None, 'CSE Management', 'Computer Science & Engineering', '2002', 'CSE Department Management', 'Head of Department (HOD)', 'Chennai, India', 'Head of Department - CSE. Overseeing academic excellence, alumni affairs, and placement drives.', 'Academic Administration, Strategic Planning', 'Ph.D. in Computer Science', 'https://linkedin.com', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=300'))

    conn.commit()
    conn.close()

init_db()

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Authorization Helper
def get_current_user():
    user_id = session.get('user_id')
    if not user_id:
        return None
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM users WHERE id = ?', (user_id,))
    user = cursor.fetchone()
    conn.close()
    return dict(user) if user else None

# Landing & Main App Routes
@app.route('/')
def index():
    return send_from_directory('static', 'index.html')

# Authentication APIs
@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.json or {}
    fullName = data.get('fullName', '').strip()
    username = data.get('username', '').strip()
    email = data.get('email', '').strip()
    password = data.get('password', '')
    role = data.get('role', 'Student') # 'Student', 'Alumni', 'Teacher'
    batch_id = data.get('batchId')
    phone = data.get('phone', '')
    company = data.get('company', '')
    designation = data.get('designation', '')
    location = data.get('location', '')
    skills = data.get('skills', '')
    higher_studies = data.get('higherStudies', '')
    linkedin_url = data.get('linkedinUrl', '')

    if not fullName or not username or not email or not password:
        return jsonify({'error': 'Please fill all required fields.'}), 400

    conn = get_db()
    cursor = conn.cursor()

    # Check unique username / email
    cursor.execute('SELECT id FROM users WHERE username = ? OR email = ?', (username, email))
    if cursor.fetchone():
        conn.close()
        return jsonify({'error': 'Username or Email already exists!'}), 400

    batch_name = ''
    if batch_id:
        cursor.execute('SELECT batch_name FROM batches WHERE id = ?', (batch_id,))
        b_row = cursor.fetchone()
        if b_row:
            batch_name = b_row['batch_name']

    user_id = 'u-' + str(uuid.uuid4())[:8]
    pass_hash = generate_password_hash(password)
    default_avatar = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=300'

    cursor.execute('''
        INSERT INTO users (id, fullName, username, email, password_hash, role, batch_id, batch_name, department, graduation_year, company, designation, location, bio, skills, higher_studies, linkedin_url, profile_photo)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (user_id, fullName, username, email, pass_hash, role, batch_id, batch_name, 'Computer Science & Engineering', '2027', company or 'CSE Member', designation or role, location or 'Chennai, India', 'CSE Department Member.', skills, higher_studies, linkedin_url, default_avatar))

    conn.commit()
    conn.close()

    return jsonify({'success': True, 'message': 'Registration successful! You can now log in.'})

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json or {}
    identifier = data.get('identifier', '').strip()
    password = data.get('password', '')

    if not identifier or not password:
        return jsonify({'error': 'Username/Email and Password are required.'}), 400

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM users WHERE username = ? OR email = ?', (identifier, identifier))
    user = cursor.fetchone()
    conn.close()

    if not user or not check_password_hash(user['password_hash'], password):
        return jsonify({'error': 'Invalid username/email or password.'}), 401

    session['user_id'] = user['id']
    user_dict = dict(user)
    del user_dict['password_hash']
    return jsonify({'success': True, 'user': user_dict})

@app.route('/api/auth/me', methods=['GET'])
def me():
    user = get_current_user()
    if not user:
        return jsonify({'authenticated': False}), 401
    del user['password_hash']
    return jsonify({'authenticated': True, 'user': user})

@app.route('/api/auth/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'success': True})

# Real File & Document Upload API
@app.route('/api/upload', methods=['POST'])
def upload_file():
    user = get_current_user()
    if not user:
        return jsonify({'error': 'Unauthorized'}), 401

    if 'file' not in request.files:
        return jsonify({'error': 'No file attached.'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected.'}), 400

    if file and allowed_file(file.filename):
        ext = file.filename.rsplit('.', 1)[1].lower()
        filename = f"{uuid.uuid4().hex}.{ext}"
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)

        file_url = f"/static/uploads/{filename}"
        file_type = 'image' if ext in ['png', 'jpg', 'jpeg', 'webp'] else 'document'

        return jsonify({
            'success': True,
            'fileName': file.filename,
            'filePath': file_url,
            'fileType': file_type,
            'fileSize': os.path.getsize(filepath)
        })

    return jsonify({'error': 'File type not allowed. Supported: Images (PNG, JPG, WEBP), Documents (PDF, DOC, DOCX)'}), 400

# Batch Access APIs with STRICT Backend Security
@app.route('/api/batches', methods=['GET'])
def get_batches():
    user = get_current_user()
    if not user:
        return jsonify({'error': 'Unauthorized'}), 401

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM batches ORDER BY start_year ASC')
    batches = [dict(b) for b in cursor.fetchall()]
    conn.close()

    # If student or alumni, only reveal their designated batch or filter appropriately
    if user['role'] in ['Student', 'Alumni']:
        batches = [b for b in batches if b['id'] == user['batch_id']]

    return jsonify({'batches': batches})

@app.route('/api/batch/<batch_id>', methods=['GET'])
def get_batch(batch_id):
    user = get_current_user()
    if not user:
        return jsonify({'error': 'Unauthorized'}), 401

    # STRICT BACKEND SECURITY CHECK
    if user['role'] in ['Student', 'Alumni'] and user['batch_id'] != batch_id:
        return jsonify({
            'error': 'Access Restricted',
            'message': 'You are not a member of this batch. Access Denied.',
            'userBatchId': user['batch_id']
        }), 403

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM batches WHERE id = ?', (batch_id,))
    batch = cursor.fetchone()

    if not batch:
        conn.close()
        return jsonify({'error': 'Batch not found'}), 404

    # Get members belonging to this batch
    cursor.execute('SELECT id, fullName, username, email, role, batch_id, batch_name, company, designation, location, skills, profile_photo FROM users WHERE batch_id = ?', (batch_id,))
    members = [dict(m) for m in cursor.fetchall()]
    conn.close()

    return jsonify({
        'batch': dict(batch),
        'members': members
    })

# Feed Posts API
@app.route('/api/posts', methods=['GET', 'POST'])
def posts_api():
    user = get_current_user()
    if not user:
        return jsonify({'error': 'Unauthorized'}), 401

    conn = get_db()
    cursor = conn.cursor()

    if request.method == 'GET':
        batch_id = request.args.get('batchId')
        
        # If student/alumni requests without batchId, default to their batch or global official posts
        if user['role'] in ['Student', 'Alumni'] and batch_id and batch_id != user['batch_id']:
            conn.close()
            return jsonify({'error': 'Access Restricted to designated batch'}), 403

        query = '''
            SELECT p.*, u.fullName as authorName, u.profile_photo as authorAvatar, u.batch_name as authorBatch, u.role as authorRole, u.company, u.designation
            FROM posts p
            JOIN users u ON p.user_id = u.id
        '''
        params = []
        if batch_id:
            query += ' WHERE p.batch_id = ? OR p.is_official = 1'
            params.append(batch_id)
        
        query += ' ORDER BY p.created_at DESC'
        cursor.execute(query, params)
        posts_rows = cursor.fetchall()

        posts = []
        for pr in posts_rows:
            p = dict(pr)
            # Fetch attachments
            cursor.execute('SELECT * FROM post_attachments WHERE post_id = ?', (p['id'],))
            p['attachments'] = [dict(a) for a in cursor.fetchall()]
            
            # Fetch comments
            cursor.execute('''
                SELECT c.*, u.fullName as authorName, u.profile_photo as authorAvatar
                FROM comments c JOIN users u ON c.user_id = u.id
                WHERE c.post_id = ? ORDER BY c.created_at ASC
            ''', (p['id'],))
            p['comments'] = [dict(c) for c in cursor.fetchall()]

            # Fetch reactions
            cursor.execute('SELECT reaction_type, COUNT(*) as count FROM reactions WHERE post_id = ? GROUP BY reaction_type', (p['id'],))
            p['reactions'] = {r['reaction_type']: r['count'] for r in cursor.fetchall()}

            # User reaction status
            cursor.execute('SELECT reaction_type FROM reactions WHERE post_id = ? AND user_id = ?', (p['id'], user['id']))
            user_r = cursor.fetchone()
            p['userReaction'] = user_r['reaction_type'] if user_r else None

            posts.append(p)

        conn.close()
        return jsonify({'posts': posts})

    elif request.method == 'POST':
        data = request.json or {}
        content = data.get('content', '').strip()
        post_type = data.get('postType', 'General Post')
        is_official = 1 if (data.get('isOfficial') and user['role'] in ['Teacher', 'HOD', 'Admin']) else 0
        attachment = data.get('attachment') # {fileName, filePath, fileType, fileSize}

        if not content:
            conn.close()
            return jsonify({'error': 'Post content cannot be empty'}), 400

        post_id = 'p-' + str(uuid.uuid4())[:8]
        cursor.execute('''
            INSERT INTO posts (id, user_id, batch_id, post_type, is_official, content)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (post_id, user['id'], user['batch_id'], post_type, is_official, content))

        if attachment:
            att_id = 'att-' + str(uuid.uuid4())[:8]
            cursor.execute('''
                INSERT INTO post_attachments (id, post_id, file_name, file_path, file_type, file_size)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (att_id, post_id, attachment['fileName'], attachment['filePath'], attachment['fileType'], attachment.get('fileSize', 0)))

        conn.commit()
        conn.close()
        return jsonify({'success': True, 'postId': post_id})

# Reactions API
@app.route('/api/posts/<post_id>/react', methods=['POST'])
def react_post(post_id):
    user = get_current_user()
    if not user:
        return jsonify({'error': 'Unauthorized'}), 401

    data = request.json or {}
    reaction_type = data.get('reactionType', 'like')

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT id, reaction_type FROM reactions WHERE post_id = ? AND user_id = ?', (post_id, user['id']))
    existing = cursor.fetchone()

    if existing:
        if existing['reaction_type'] == reaction_type:
            cursor.execute('DELETE FROM reactions WHERE id = ?', (existing['id'],))
        else:
            cursor.execute('UPDATE reactions SET reaction_type = ? WHERE id = ?', (reaction_type, existing['id']))
    else:
        cursor.execute('INSERT INTO reactions (id, post_id, user_id, reaction_type) VALUES (?, ?, ?, ?)',
                       ('r-' + str(uuid.uuid4())[:8], post_id, user['id'], reaction_type))

    conn.commit()
    conn.close()
    return jsonify({'success': True})

# Comments API
@app.route('/api/posts/<post_id>/comment', methods=['POST'])
def comment_post(post_id):
    user = get_current_user()
    if not user:
        return jsonify({'error': 'Unauthorized'}), 401

    data = request.json or {}
    text = data.get('text', '').strip()

    if not text:
        return jsonify({'error': 'Comment text required'}), 400

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('INSERT INTO comments (id, post_id, user_id, text) VALUES (?, ?, ?, ?)',
                   ('c-' + str(uuid.uuid4())[:8], post_id, user['id'], text))

    conn.commit()
    conn.close()
    return jsonify({'success': True})

# Jobs API
@app.route('/api/jobs', methods=['GET', 'POST'])
def jobs_api():
    user = get_current_user()
    if not user:
        return jsonify({'error': 'Unauthorized'}), 401

    conn = get_db()
    cursor = conn.cursor()

    if request.method == 'GET':
        cursor.execute('''
            SELECT j.*, u.fullName as postedByName, u.profile_photo as postedByAvatar
            FROM jobs j JOIN users u ON j.posted_by_user_id = u.id
            ORDER BY j.created_at DESC
        ''')
        jobs = [dict(j) for j in cursor.fetchall()]
        conn.close()
        return jsonify({'jobs': jobs})

    elif request.method == 'POST':
        data = request.json or {}
        title = data.get('title', '').strip()
        company = data.get('company', '').strip()
        location = data.get('location', '').strip()
        job_type = data.get('jobType', 'Full-time')
        experience = data.get('experience', '0-2 years')
        skills = data.get('skills', '')
        salary = data.get('salary', '')
        description = data.get('description', '').strip()
        application_link = data.get('applicationLink', '').strip()

        if not title or not company or not application_link:
            conn.close()
            return jsonify({'error': 'Title, Company, and Application Link are required.'}), 400

        job_id = 'job-' + str(uuid.uuid4())[:8]
        cursor.execute('''
            INSERT INTO jobs (id, posted_by_user_id, title, company, location, job_type, experience, skills, salary, description, application_link, last_date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (job_id, user['id'], title, company, location, job_type, experience, skills, salary, description, application_link, '2026-12-31'))

        # Broadcast to feed
        post_id = 'p-' + str(uuid.uuid4())[:8]
        cursor.execute('''
            INSERT INTO posts (id, user_id, batch_id, post_type, is_official, content)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (post_id, user['id'], user['batch_id'], 'Job Opportunity', 0, f"💼 NEW JOB OPPORTUNITY: {title} at {company} ({location})\n\nSkills: {skills}\nExperience: {experience}\n\n{description}\nApply Link: {application_link}"))

        conn.commit()
        conn.close()
        return jsonify({'success': True, 'jobId': job_id})

# Achievements API
@app.route('/api/achievements', methods=['GET', 'POST'])
def achievements_api():
    user = get_current_user()
    if not user:
        return jsonify({'error': 'Unauthorized'}), 401

    conn = get_db()
    cursor = conn.cursor()

    if request.method == 'GET':
        cursor.execute('''
            SELECT a.*, u.fullName as userName, u.batch_name as userBatch
            FROM achievements a JOIN users u ON a.user_id = u.id
            ORDER BY a.created_at DESC
        ''')
        achievements = [dict(a) for a in cursor.fetchall()]
        conn.close()
        return jsonify({'achievements': achievements})

    elif request.method == 'POST':
        data = request.json or {}
        title = data.get('title', '').strip()
        category = data.get('category', 'Award')
        date = data.get('date', '')
        organization = data.get('organization', '').strip()
        description = data.get('description', '').strip()

        ach_id = 'ach-' + str(uuid.uuid4())[:8]
        cursor.execute('''
            INSERT INTO achievements (id, user_id, title, category, date, organization, description)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (ach_id, user['id'], title, category, date, organization, description))

        # Broadcast to feed
        post_id = 'p-' + str(uuid.uuid4())[:8]
        cursor.execute('''
            INSERT INTO posts (id, user_id, batch_id, post_type, is_official, content)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (post_id, user['id'], user['batch_id'], 'Achievement', 0, f"🏆 NEW ACHIEVEMENT: {title}\n\nIssuing Organization: {organization}\nCategory: {category}\n\n{description}"))

        conn.commit()
        conn.close()
        return jsonify({'success': True, 'achievementId': ach_id})

# Events API
@app.route('/api/events', methods=['GET', 'POST'])
def events_api():
    user = get_current_user()
    if not user:
        return jsonify({'error': 'Unauthorized'}), 401

    conn = get_db()
    cursor = conn.cursor()

    if request.method == 'GET':
        cursor.execute('SELECT * FROM events ORDER BY created_at DESC')
        events = []
        for er in cursor.fetchall():
            ev = dict(er)
            cursor.execute('''
                SELECT r.*, u.fullName as userName, u.batch_name as batch
                FROM event_registrations r JOIN users u ON r.user_id = u.id
                WHERE r.event_id = ?
            ''', (ev['id'],))
            ev['registrations'] = [dict(r) for r in cursor.fetchall()]
            events.append(ev)
        conn.close()
        return jsonify({'events': events})

    elif request.method == 'POST':
        if user['role'] not in ['Teacher', 'HOD', 'Admin']:
            conn.close()
            return jsonify({'error': 'Only Faculty and Admin can create events.'}), 403

        data = request.json or {}
        title = data.get('title', '').strip()
        date = data.get('date', '')
        time = data.get('time', '')
        venue = data.get('venue', '').strip()
        description = data.get('description', '').strip()
        organizer = data.get('organizer', 'CSE Department')

        ev_id = 'ev-' + str(uuid.uuid4())[:8]
        cursor.execute('''
            INSERT INTO events (id, created_by_user_id, title, date, time, venue, description, organizer, eligible_batches, banner)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (ev_id, user['id'], title, date, time, venue, description, organizer, '2020-2024, 2021-2025, 2022-2026, 2023-2027, 2024-2028', 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=800'))

        # Broadcast official event to feed
        post_id = 'p-' + str(uuid.uuid4())[:8]
        cursor.execute('''
            INSERT INTO posts (id, user_id, batch_id, post_type, is_official, content)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (post_id, user['id'], None, 'Event Announcement', 1, f"📢 OFFICIAL REUNION & EVENT ANNOUNCEMENT: {title}\n\nDate: {date} ({time})\nVenue: {venue}\nOrganizer: {organizer}\n\n{description}"))

        conn.commit()
        conn.close()
        return jsonify({'success': True, 'eventId': ev_id})

@app.route('/api/events/<event_id>/register', methods=['POST'])
def register_event(event_id):
    user = get_current_user()
    if not user:
        return jsonify({'error': 'Unauthorized'}), 401

    data = request.json or {}
    status = data.get('status', 'Registered')

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT id, status FROM event_registrations WHERE event_id = ? AND user_id = ?', (event_id, user['id']))
    existing = cursor.fetchone()

    if existing:
        if existing['status'] == status:
            cursor.execute('DELETE FROM event_registrations WHERE id = ?', (existing['id'],))
        else:
            cursor.execute('UPDATE event_registrations SET status = ? WHERE id = ?', (status, existing['id']))
    else:
        cursor.execute('INSERT INTO event_registrations (id, event_id, user_id, status) VALUES (?, ?, ?, ?)',
                       ('reg-' + str(uuid.uuid4())[:8], event_id, user['id'], status))

    conn.commit()
    conn.close()
    return jsonify({'success': True})

# Messaging API
@app.route('/api/messages/<other_user_id>', methods=['GET'])
def get_messages(other_user_id):
    user = get_current_user()
    if not user:
        return jsonify({'error': 'Unauthorized'}), 401

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT * FROM messages
        WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
        ORDER BY created_at ASC
    ''', (user['id'], other_user_id, other_user_id, user['id']))
    messages = [dict(m) for m in cursor.fetchall()]

    # Mark as read
    cursor.execute('UPDATE messages SET is_read = 1 WHERE receiver_id = ? AND sender_id = ?', (user['id'], other_user_id))
    conn.commit()
    conn.close()

    return jsonify({'messages': messages})

@app.route('/api/messages', methods=['POST'])
def send_message():
    user = get_current_user()
    if not user:
        return jsonify({'error': 'Unauthorized'}), 401

    data = request.json or {}
    receiver_id = data.get('receiverId')
    message = data.get('message', '').strip()
    attachment_path = data.get('attachmentPath')

    if not receiver_id or not message:
        return jsonify({'error': 'Receiver and message text are required'}), 400

    conn = get_db()
    cursor = conn.cursor()
    msg_id = 'm-' + str(uuid.uuid4())[:8]
    cursor.execute('''
        INSERT INTO messages (id, sender_id, receiver_id, message, attachment_path)
        VALUES (?, ?, ?, ?, ?)
    ''', (msg_id, user['id'], receiver_id, message, attachment_path))

    conn.commit()
    conn.close()
    return jsonify({'success': True, 'messageId': msg_id})

# User Profiles API
@app.route('/api/users/<user_id>', methods=['GET', 'PUT'])
def user_profile(user_id):
    current_user = get_current_user()
    if not current_user:
        return jsonify({'error': 'Unauthorized'}), 401

    conn = get_db()
    cursor = conn.cursor()

    if request.method == 'GET':
        cursor.execute('SELECT id, fullName, username, email, role, batch_id, batch_name, department, graduation_year, company, designation, location, bio, skills, higher_studies, linkedin_url, profile_photo FROM users WHERE id = ?', (user_id,))
        u = cursor.fetchone()
        if not u:
            conn.close()
            return jsonify({'error': 'User not found'}), 404

        user = dict(u)
        cursor.execute('SELECT * FROM career_history WHERE user_id = ? ORDER BY start_date DESC', (user_id,))
        user['careerHistory'] = [dict(c) for c in cursor.fetchall()]

        cursor.execute('SELECT * FROM achievements WHERE user_id = ? ORDER BY created_at DESC', (user_id,))
        user['achievements'] = [dict(a) for a in cursor.fetchall()]

        conn.close()
        return jsonify({'user': user})

    elif request.method == 'PUT':
        if current_user['id'] != user_id:
            conn.close()
            return jsonify({'error': 'You can only edit your own profile'}), 403

        data = request.json or {}
        company = data.get('company', current_user['company'])
        designation = data.get('designation', current_user['designation'])
        location = data.get('location', current_user['location'])
        bio = data.get('bio', current_user['bio'])
        skills = data.get('skills', current_user['skills'])

        cursor.execute('''
            UPDATE users SET company = ?, designation = ?, location = ?, bio = ?, skills = ? WHERE id = ?
        ''', (company, designation, location, bio, skills, user_id))

        conn.commit()
        conn.close()
        return jsonify({'success': True})

@app.route('/api/users/<user_id>/career', methods=['POST'])
def add_career(user_id):
    current_user = get_current_user()
    if not current_user or current_user['id'] != user_id:
        return jsonify({'error': 'Unauthorized'}), 403

    data = request.json or {}
    company = data.get('company', '').strip()
    designation = data.get('designation', '').strip()
    start_date = data.get('startDate', '')
    end_date = data.get('endDate', 'Present')
    location = data.get('location', '')
    description = data.get('description', '')

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO career_history (id, user_id, company, designation, start_date, end_date, location, description)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''', ('ch-' + str(uuid.uuid4())[:8], user_id, company, designation, start_date, end_date, location, description))

    conn.commit()
    conn.close()
    return jsonify({'success': True})

# Global Search API
@app.route('/api/search', methods=['GET'])
def search_api():
    user = get_current_user()
    if not user:
        return jsonify({'error': 'Unauthorized'}), 401

    q = request.args.get('q', '').strip().lower()
    if not q:
        return jsonify({'users': [], 'jobs': [], 'posts': []})

    conn = get_db()
    cursor = conn.cursor()

    term = f"%{q}%"
    cursor.execute('''
        SELECT id, fullName, username, role, batch_name, company, designation, location, skills, profile_photo
        FROM users
        WHERE LOWER(fullName) LIKE ? OR LOWER(company) LIKE ? OR LOWER(designation) LIKE ? OR LOWER(skills) LIKE ? OR LOWER(batch_name) LIKE ?
    ''', (term, term, term, term, term))
    users = [dict(u) for u in cursor.fetchall()]

    cursor.execute('''
        SELECT j.*, u.fullName as postedByName
        FROM jobs j JOIN users u ON j.posted_by_user_id = u.id
        WHERE LOWER(j.title) LIKE ? OR LOWER(j.company) LIKE ? OR LOWER(j.skills) LIKE ?
    ''', (term, term, term))
    jobs = [dict(j) for j in cursor.fetchall()]

    cursor.execute('''
        SELECT p.*, u.fullName as authorName, u.profile_photo as authorAvatar
        FROM posts p JOIN users u ON p.user_id = u.id
        WHERE LOWER(p.content) LIKE ? OR LOWER(p.post_type) LIKE ?
    ''', (term, term))
    posts = [dict(p) for p in cursor.fetchall()]

    conn.close()
    return jsonify({'users': users, 'jobs': jobs, 'posts': posts})

# Admin Dashboard & Analytics API
@app.route('/api/admin/stats', methods=['GET'])
def admin_stats():
    user = get_current_user()
    if not user or user['role'] not in ['HOD', 'Admin']:
        return jsonify({'error': 'Access Denied'}), 403

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute('SELECT COUNT(*) FROM users WHERE role = "Student"')
    students = cursor.fetchone()[0]

    cursor.execute('SELECT COUNT(*) FROM users WHERE role = "Alumni"')
    alumni = cursor.fetchone()[0]

    cursor.execute('SELECT COUNT(*) FROM users WHERE role = "Teacher"')
    teachers = cursor.fetchone()[0]

    cursor.execute('SELECT COUNT(*) FROM batches')
    batches_count = cursor.fetchone()[0]

    cursor.execute('SELECT COUNT(*) FROM posts')
    posts_count = cursor.fetchone()[0]

    cursor.execute('SELECT COUNT(*) FROM jobs')
    jobs_count = cursor.fetchone()[0]

    cursor.execute('SELECT COUNT(*) FROM events')
    events_count = cursor.fetchone()[0]

    # Batch Member Distribution
    cursor.execute('''
        SELECT b.batch_name, COUNT(u.id) as count
        FROM batches b LEFT JOIN users u ON b.id = u.batch_id
        GROUP BY b.id ORDER BY b.start_year ASC
    ''')
    batch_dist = [dict(r) for r in cursor.fetchall()]

    # Top Employers
    cursor.execute('''
        SELECT company, COUNT(*) as count FROM users
        WHERE company IS NOT NULL AND company != '' AND company != 'CSE Department Management'
        GROUP BY company ORDER BY count DESC LIMIT 5
    ''')
    top_companies = [dict(r) for r in cursor.fetchall()]

    # Users Table
    cursor.execute('SELECT id, fullName, username, email, role, batch_name, company, designation FROM users ORDER BY created_at DESC')
    all_users = [dict(u) for u in cursor.fetchall()]

    conn.close()
    return jsonify({
        'stats': {
            'students': students,
            'alumni': alumni,
            'teachers': teachers,
            'batches': batches_count,
            'posts': posts_count,
            'jobs': jobs_count,
            'events': events_count,
            'totalUsers': students + alumni + teachers + 1
        },
        'batchDistribution': batch_dist,
        'topCompanies': top_companies,
        'allUsers': all_users
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=True)
