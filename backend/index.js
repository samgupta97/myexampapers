// =============================================
// MyExamPapers.co.uk — Express Backend Server
// All routes in one file for simplicity
// =============================================

var express = require('express');
var cors = require('cors');
var path = require('path');
var fs = require('fs');
var crypto = require('crypto');
var multer = require('multer');
var { Resend } = require('resend');
var dotenv = require('dotenv');
var db = require('./db');

// Load environment variables
dotenv.config();

var app = express();
var PORT = process.env.PORT || 5000;

// =============================================
// MIDDLEWARE
// =============================================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files as static assets
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// =============================================
// ENSURE UPLOAD DIRECTORIES EXIST
// =============================================
var papersDir = path.join(__dirname, 'uploads', 'papers');
var thumbnailsDir = path.join(__dirname, 'uploads', 'thumbnails');

if (!fs.existsSync(papersDir)) {
    fs.mkdirSync(papersDir, { recursive: true });
}
if (!fs.existsSync(thumbnailsDir)) {
    fs.mkdirSync(thumbnailsDir, { recursive: true });
}

// =============================================
// MULTER CONFIG
// =============================================

// Storage for paper files
var paperStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (file.fieldname === 'paper_file') {
            cb(null, papersDir);
        } else if (file.fieldname === 'thumbnail') {
            cb(null, thumbnailsDir);
        } else {
            cb(null, papersDir);
        }
    },
    filename: function (req, file, cb) {
        var uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

var upload = multer({ storage: paperStorage });

// Combined upload fields for papers
var paperUpload = upload.fields([
    { name: 'paper_file', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
]);

// =============================================
// IN-MEMORY OTP STORE
// =============================================
// Format: { email: { otp: '123456', expiresAt: Date } }
var otpStore = {};

// Generate a random 6-digit OTP
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Store OTP with expiry (default 5 minutes)
function storeOTP(email, otp) {
    var expiryMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES) || 5;
    var expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);
    otpStore[email] = { otp: otp, expiresAt: expiresAt };
}

// Verify OTP — returns true if valid, false if invalid/expired
function verifyOTP(email, otp) {
    var record = otpStore[email];
    if (!record) {
        return false;
    }
    if (new Date() > record.expiresAt) {
        // OTP has expired — clean it up
        delete otpStore[email];
        return false;
    }
    if (record.otp !== otp) {
        return false;
    }
    // OTP is valid — delete it so it can't be reused
    delete otpStore[email];
    return true;
}

// =============================================
// IN-MEMORY TOKEN STORE (simple auth)
// =============================================
// Format: { token: { userId, email, role } }
var tokenStore = {};

// Generate a random auth token
function generateToken() {
    return crypto.randomBytes(32).toString('hex');
}

// Auth middleware — checks Authorization header for a valid token
function authMiddleware(req, res, next) {
    var authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).json({ success: false, message: 'No authorization token provided' });
    }

    // Support "Bearer <token>" or just "<token>"
    var token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
    var userData = tokenStore[token];

    if (!userData) {
        return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }

    // Attach user info to request
    req.user = userData;
    next();
}

// Admin-only middleware — must be used AFTER authMiddleware
function adminMiddleware(req, res, next) {
    if (!req.user || req.user.role !== 'Admin') {
        return res.status(403).json({ success: false, message: 'Admin access required' });
    }
    next();
}

// =============================================
// EMAIL CONFIG (RESEND)
// =============================================
var resend = new Resend(process.env.RESEND_API_KEY);

// Send OTP via email (also logs to console for dev convenience)
function sendOTPEmail(email, otp) {
    console.log('============================================');
    console.log('  OTP for ' + email + ': ' + otp);
    console.log('============================================');

    return resend.emails.send({
        from: 'onboarding@resend.dev',
        to: email,
        subject: 'Your MyExamPapers Login OTP',
        html: '<div style="font-family:Arial,sans-serif;padding:20px;">'
            + '<h2 style="color:#2c3e50;">MyExamPapers.co.uk</h2>'
            + '<p>Your one-time password (OTP) is:</p>'
            + '<h1 style="color:#3498db;letter-spacing:5px;">' + otp + '</h1>'
            + '<p>This OTP is valid for ' + (process.env.OTP_EXPIRY_MINUTES || 5) + ' minutes.</p>'
            + '</div>'
    })
    .then(function(response) {
        console.log('Resend email sent:', response.data);
        return response.data;
    })
    .catch(function(error) {
        console.error('Resend email error:', error);
        return null;
    });
}

// =============================================
// ROUTES: AUTH (User)
// =============================================

// POST /api/auth/signup — Register a new user
app.post('/api/auth/signup', function (req, res) {
    var name = req.body.name;
    var email = req.body.email;
    var mobile = req.body.mobile;

    if (!name || !email) {
        return res.status(400).json({ success: false, message: 'Name and email are required' });
    }

    // Check if email already exists
    db.query('SELECT id FROM users WHERE email = ?', [email])
        .then(function (result) {
            var rows = result[0];
            if (rows.length > 0) {
                return res.status(409).json({ success: false, message: 'Email already registered' });
            }

            // Insert the new user
            return db.query(
                'INSERT INTO users (name, email, mobile, role, status) VALUES (?, ?, ?, ?, ?)',
                [name, email, mobile || null, 'User', 'Active']
            )
                .then(function (insertResult) {
                    var insertId = insertResult[0].insertId;
                    return res.status(201).json({
                        success: true,
                        message: 'User registered successfully',
                        user: { id: insertId, name: name, email: email, mobile: mobile, role: 'User', status: 'Active' }
                    });
                });
        })
        .catch(function (err) {
            console.error('Signup error:', err.message);
            return res.status(500).json({ success: false, message: 'Server error during signup' });
        });
});

// POST /api/auth/send-otp — Send OTP to a registered user
app.post('/api/auth/send-otp', function (req, res) {
    var email = req.body.email;

    if (!email) {
        return res.status(400).json({ success: false, message: 'Email is required' });
    }

    db.query('SELECT id, name, email, role, status FROM users WHERE email = ?', [email])
        .then(function (result) {
            var rows = result[0];
            if (rows.length === 0) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }

            var user = rows[0];
            if (user.status !== 'Active') {
                return res.status(403).json({ success: false, message: 'Account is inactive' });
            }
            if (user.role !== 'User') {
                return res.status(403).json({ success: false, message: 'Please use the admin login' });
            }

            var otp = generateOTP();
            storeOTP(email, otp);

            return sendOTPEmail(email, otp)
                .then(function () {
                    return res.json({ success: true, message: 'OTP sent to your email' });
                });
        })
        .catch(function (err) {
            console.error('Send OTP error:', err.message);
            return res.status(500).json({ success: false, message: 'Server error sending OTP' });
        });
});

// POST /api/auth/verify-otp — Verify user OTP and return auth token
app.post('/api/auth/verify-otp', function (req, res) {
    var email = req.body.email;
    var otp = req.body.otp;

    if (!email || !otp) {
        return res.status(400).json({ success: false, message: 'Email and OTP are required' });
    }

    if (!verifyOTP(email, otp)) {
        return res.status(401).json({ success: false, message: 'Invalid or expired OTP' });
    }

    // OTP is valid — fetch user details and generate token
    db.query('SELECT id, name, email, mobile, role, status FROM users WHERE email = ?', [email])
        .then(function (result) {
            var rows = result[0];
            if (rows.length === 0) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }

            var user = rows[0];
            var token = generateToken();
            tokenStore[token] = { userId: user.id, email: user.email, role: user.role };

            return res.json({
                success: true,
                message: 'Login successful',
                token: token,
                user: user
            });
        })
        .catch(function (err) {
            console.error('Verify OTP error:', err.message);
            return res.status(500).json({ success: false, message: 'Server error verifying OTP' });
        });
});

// =============================================
// ROUTES: AUTH (Admin)
// =============================================

// POST /api/admin/login — Admin login with email and password (password same as emailid)
app.post('/api/admin/login', function (req, res) {
    var email = req.body.email;
    var password = req.body.password;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    // Requirement: password field which will be same as emailid
    if (password !== email) {
        return res.status(401).json({ success: false, message: 'Invalid password' });
    }

    db.query('SELECT id, name, email, mobile, role, status FROM users WHERE email = ?', [email])
        .then(function (result) {
            var rows = result[0];
            if (rows.length === 0) {
                return res.status(404).json({ success: false, message: 'Admin user not found' });
            }

            var user = rows[0];
            if (user.status !== 'Active') {
                return res.status(403).json({ success: false, message: 'Account is inactive' });
            }
            if (user.role !== 'Admin') {
                return res.status(403).json({ success: false, message: 'Not an admin account' });
            }

            var token = generateToken();
            tokenStore[token] = { userId: user.id, email: user.email, role: user.role };

            return res.json({
                success: true,
                message: 'Admin login successful',
                token: token,
                user: user
            });
        })
        .catch(function (err) {
            console.error('Admin login error:', err.message);
            return res.status(500).json({ success: false, message: 'Server error during login' });
        });
});

// =============================================
// ROUTES: PAPERS
// =============================================

// GET /api/papers — Get all papers
// Public/User: only Active papers | Admin with ?status=all: all papers
app.get('/api/papers', function (req, res) {
    var statusFilter = req.query.status;

    // Check if there's an auth token to determine if admin
    var authHeader = req.headers['authorization'];
    var token = null;
    var userData = null;

    if (authHeader) {
        token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
        userData = tokenStore[token];
    }

    var query;
    var params = [];

    if (userData && userData.role === 'Admin' && statusFilter === 'all') {
        // Admin requesting all papers
        query = 'SELECT * FROM papers ORDER BY created_at DESC';
    } else {
        // Public or user — only Active papers
        query = 'SELECT * FROM papers WHERE status = ? ORDER BY created_at DESC';
        params = ['Active'];
    }

    db.query(query, params)
        .then(function (result) {
            var rows = result[0];
            return res.json({ success: true, papers: rows });
        })
        .catch(function (err) {
            console.error('Get papers error:', err.message);
            return res.status(500).json({ success: false, message: 'Server error fetching papers' });
        });
});

// GET /api/papers/:id — Get single paper by ID
app.get('/api/papers/:id', function (req, res) {
    var paperId = req.params.id;

    db.query('SELECT * FROM papers WHERE id = ?', [paperId])
        .then(function (result) {
            var rows = result[0];
            if (rows.length === 0) {
                return res.status(404).json({ success: false, message: 'Paper not found' });
            }
            return res.json({ success: true, paper: rows[0] });
        })
        .catch(function (err) {
            console.error('Get paper error:', err.message);
            return res.status(500).json({ success: false, message: 'Server error fetching paper' });
        });
});

// POST /api/papers — Create new paper (admin only)
app.post('/api/papers', authMiddleware, adminMiddleware, function (req, res) {
    paperUpload(req, res, function (err) {
        if (err) {
            console.error('Upload error:', err.message);
            return res.status(400).json({ success: false, message: 'File upload error: ' + err.message });
        }

        var title = req.body.title;
        var subject = req.body.subject;
        var class_year = req.body.class_year;
        var exam_board = req.body.exam_board;
        var paper_type = req.body.paper_type;
        var description = req.body.description;
        var price = req.body.price || 0;
        var status = req.body.status || 'Active';

        // Get file paths if uploaded
        var paper_file = null;
        var thumbnail = null;

        if (req.files && req.files['paper_file'] && req.files['paper_file'][0]) {
            paper_file = 'uploads/papers/' + req.files['paper_file'][0].filename;
        }
        if (req.files && req.files['thumbnail'] && req.files['thumbnail'][0]) {
            thumbnail = 'uploads/thumbnails/' + req.files['thumbnail'][0].filename;
        }

        if (!title) {
            return res.status(400).json({ success: false, message: 'Title is required' });
        }

        db.query(
            'INSERT INTO papers (title, subject, class_year, exam_board, paper_type, description, paper_file, thumbnail, price, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [title, subject || null, class_year || null, exam_board || null, paper_type || null, description || null, paper_file, thumbnail, price, status]
        )
            .then(function (result) {
                var insertId = result[0].insertId;
                return res.status(201).json({
                    success: true,
                    message: 'Paper created successfully',
                    paper: {
                        id: insertId, title: title, subject: subject, class_year: class_year,
                        exam_board: exam_board, paper_type: paper_type, description: description,
                        paper_file: paper_file, thumbnail: thumbnail, price: price, status: status
                    }
                });
            })
            .catch(function (err) {
                console.error('Create paper error:', err.message);
                return res.status(500).json({ success: false, message: 'Server error creating paper' });
            });
    });
});

// PUT /api/papers/:id — Update paper (admin only)
app.put('/api/papers/:id', authMiddleware, adminMiddleware, function (req, res) {
    paperUpload(req, res, function (err) {
        if (err) {
            console.error('Upload error:', err.message);
            return res.status(400).json({ success: false, message: 'File upload error: ' + err.message });
        }

        var paperId = req.params.id;

        // First fetch the existing paper
        db.query('SELECT * FROM papers WHERE id = ?', [paperId])
            .then(function (result) {
                var rows = result[0];
                if (rows.length === 0) {
                    return res.status(404).json({ success: false, message: 'Paper not found' });
                }

                var existing = rows[0];

                var title = req.body.title || existing.title;
                var subject = req.body.subject !== undefined ? req.body.subject : existing.subject;
                var class_year = req.body.class_year !== undefined ? req.body.class_year : existing.class_year;
                var exam_board = req.body.exam_board !== undefined ? req.body.exam_board : existing.exam_board;
                var paper_type = req.body.paper_type !== undefined ? req.body.paper_type : existing.paper_type;
                var description = req.body.description !== undefined ? req.body.description : existing.description;
                var price = req.body.price !== undefined ? req.body.price : existing.price;
                var status = req.body.status || existing.status;

                // Use new file if uploaded, else keep existing
                var paper_file = existing.paper_file;
                var thumbnail = existing.thumbnail;

                if (req.files && req.files['paper_file'] && req.files['paper_file'][0]) {
                    paper_file = 'uploads/papers/' + req.files['paper_file'][0].filename;
                }
                if (req.files && req.files['thumbnail'] && req.files['thumbnail'][0]) {
                    thumbnail = 'uploads/thumbnails/' + req.files['thumbnail'][0].filename;
                }

                return db.query(
                    'UPDATE papers SET title=?, subject=?, class_year=?, exam_board=?, paper_type=?, description=?, paper_file=?, thumbnail=?, price=?, status=? WHERE id=?',
                    [title, subject, class_year, exam_board, paper_type, description, paper_file, thumbnail, price, status, paperId]
                )
                    .then(function () {
                        return res.json({
                            success: true,
                            message: 'Paper updated successfully',
                            paper: {
                                id: parseInt(paperId), title: title, subject: subject, class_year: class_year,
                                exam_board: exam_board, paper_type: paper_type, description: description,
                                paper_file: paper_file, thumbnail: thumbnail, price: price, status: status
                            }
                        });
                    });
            })
            .catch(function (err) {
                console.error('Update paper error:', err.message);
                return res.status(500).json({ success: false, message: 'Server error updating paper' });
            });
    });
});

// DELETE /api/papers/:id — Delete paper (admin only)
app.delete('/api/papers/:id', authMiddleware, adminMiddleware, function (req, res) {
    var paperId = req.params.id;

    db.query('SELECT * FROM papers WHERE id = ?', [paperId])
        .then(function (result) {
            var rows = result[0];
            if (rows.length === 0) {
                return res.status(404).json({ success: false, message: 'Paper not found' });
            }

            return db.query('DELETE FROM papers WHERE id = ?', [paperId])
                .then(function () {
                    return res.json({ success: true, message: 'Paper deleted successfully' });
                });
        })
        .catch(function (err) {
            console.error('Delete paper error:', err.message);
            return res.status(500).json({ success: false, message: 'Server error deleting paper' });
        });
});

// =============================================
// ROUTES: USERS (Admin only)
// =============================================

// GET /api/users — Get all users (admin only)
app.get('/api/users', authMiddleware, adminMiddleware, function (req, res) {
    db.query('SELECT id, name, email, mobile, role, status, created_at, updated_at FROM users ORDER BY created_at DESC')
        .then(function (result) {
            var rows = result[0];
            return res.json({ success: true, users: rows });
        })
        .catch(function (err) {
            console.error('Get users error:', err.message);
            return res.status(500).json({ success: false, message: 'Server error fetching users' });
        });
});

// GET /api/users/:id — Get single user (admin only)
app.get('/api/users/:id', authMiddleware, adminMiddleware, function (req, res) {
    var userId = req.params.id;

    db.query('SELECT id, name, email, mobile, role, status, created_at, updated_at FROM users WHERE id = ?', [userId])
        .then(function (result) {
            var rows = result[0];
            if (rows.length === 0) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }
            return res.json({ success: true, user: rows[0] });
        })
        .catch(function (err) {
            console.error('Get user error:', err.message);
            return res.status(500).json({ success: false, message: 'Server error fetching user' });
        });
});

// POST /api/users — Create user (admin only)
app.post('/api/users', authMiddleware, adminMiddleware, function (req, res) {
    var name = req.body.name;
    var email = req.body.email;
    var mobile = req.body.mobile;
    var role = req.body.role || 'User';
    var status = req.body.status || 'Active';

    if (!name || !email) {
        return res.status(400).json({ success: false, message: 'Name and email are required' });
    }

    // Check if email already exists
    db.query('SELECT id FROM users WHERE email = ?', [email])
        .then(function (result) {
            var rows = result[0];
            if (rows.length > 0) {
                return res.status(409).json({ success: false, message: 'Email already registered' });
            }

            return db.query(
                'INSERT INTO users (name, email, mobile, role, status) VALUES (?, ?, ?, ?, ?)',
                [name, email, mobile || null, role, status]
            )
                .then(function (insertResult) {
                    var insertId = insertResult[0].insertId;
                    return res.status(201).json({
                        success: true,
                        message: 'User created successfully',
                        user: { id: insertId, name: name, email: email, mobile: mobile, role: role, status: status }
                    });
                });
        })
        .catch(function (err) {
            console.error('Create user error:', err.message);
            return res.status(500).json({ success: false, message: 'Server error creating user' });
        });
});

// PUT /api/users/:id — Update user (admin only)
app.put('/api/users/:id', authMiddleware, adminMiddleware, function (req, res) {
    var userId = req.params.id;

    db.query('SELECT * FROM users WHERE id = ?', [userId])
        .then(function (result) {
            var rows = result[0];
            if (rows.length === 0) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }

            var existing = rows[0];
            var name = req.body.name || existing.name;
            var email = req.body.email || existing.email;
            var mobile = req.body.mobile !== undefined ? req.body.mobile : existing.mobile;
            var role = req.body.role || existing.role;
            var status = req.body.status || existing.status;

            // If email is being changed, check uniqueness
            var emailCheckPromise;
            if (email !== existing.email) {
                emailCheckPromise = db.query('SELECT id FROM users WHERE email = ? AND id != ?', [email, userId])
                    .then(function (checkResult) {
                        if (checkResult[0].length > 0) {
                            return Promise.reject({ statusCode: 409, message: 'Email already in use by another user' });
                        }
                    });
            } else {
                emailCheckPromise = Promise.resolve();
            }

            return emailCheckPromise
                .then(function () {
                    return db.query(
                        'UPDATE users SET name=?, email=?, mobile=?, role=?, status=? WHERE id=?',
                        [name, email, mobile, role, status, userId]
                    );
                })
                .then(function () {
                    return res.json({
                        success: true,
                        message: 'User updated successfully',
                        user: { id: parseInt(userId), name: name, email: email, mobile: mobile, role: role, status: status }
                    });
                });
        })
        .catch(function (err) {
            if (err.statusCode) {
                return res.status(err.statusCode).json({ success: false, message: err.message });
            }
            console.error('Update user error:', err.message);
            return res.status(500).json({ success: false, message: 'Server error updating user' });
        });
});

// DELETE /api/users/:id — Delete user (admin only)
app.delete('/api/users/:id', authMiddleware, adminMiddleware, function (req, res) {
    var userId = req.params.id;

    db.query('SELECT * FROM users WHERE id = ?', [userId])
        .then(function (result) {
            var rows = result[0];
            if (rows.length === 0) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }

            return db.query('DELETE FROM users WHERE id = ?', [userId])
                .then(function () {
                    return res.json({ success: true, message: 'User deleted successfully' });
                });
        })
        .catch(function (err) {
            console.error('Delete user error:', err.message);
            return res.status(500).json({ success: false, message: 'Server error deleting user' });
        });
});

// =============================================
// HEALTH CHECK
// =============================================
app.get('/api/health', function (req, res) {
    db.query('SELECT 1')
        .then(function () {
            return res.json({ success: true, message: 'Server is running', database: 'connected' });
        })
        .catch(function () {
            return res.json({ success: true, message: 'Server is running', database: 'disconnected' });
        });
});

// =============================================
// START SERVER
// =============================================
app.listen(PORT, function () {
    console.log('');
    console.log('=============================================');
    console.log('  MyExamPapers.co.uk Backend Server');
    console.log('  Running on http://localhost:' + PORT);
    console.log('=============================================');
    console.log('');
});
