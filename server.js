const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 5000;

const db = new sqlite3.Database('./idc_safety.db', (err) => {
    if (err) {
        console.error('❌ خطأ في الاتصال بـ SQLite:', err.message);
    } else {
        console.log('✅ تم الاتصال بقاعدة بيانات SQLite المحلية بنجاح.');
        initDatabase();
    }
});

function initDatabase() {
    db.serialize(() => {
        db.run(`CREATE TABLE IF NOT EXISTS stop_cards (
            card_id INTEGER PRIMARY KEY AUTOINCREMENT,
            card_number TEXT NOT NULL UNIQUE,
            reporter_name TEXT,
            rig_id INTEGER,
            observation_type TEXT NOT NULL,
            observation_datetime TEXT NOT NULL,
            location_details TEXT NOT NULL,
            description TEXT NOT NULL,
            risk_level TEXT NOT NULL,
            status TEXT DEFAULT 'Open',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);
    });
}

// 📍 حفظ البطاقة مع الحالة المختارة
app.post('/api/stop-cards', (req, res) => {
    const { reporter_name, rig_id, observation_type, observation_datetime, location_details, description, risk_level, status } = req.body;

    const autoCardNumber = `IDC-${new Date().getFullYear()}-${Date.now().toString().slice(-5)}`;

    const query = `INSERT INTO stop_cards (card_number, reporter_name, rig_id, observation_type, observation_datetime, location_details, description, risk_level, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    
    db.run(query, [autoCardNumber, reporter_name || 'غير محدد', rig_id, observation_type, observation_datetime, location_details, description, risk_level, status || 'Open'], function(err) {
        if (err) {
            return res.status(500).json({ success: false, message: 'فشل حفظ البطاقة: ' + err.message });
        }
        res.status(201).json({ 
            success: true, 
            message: `تم حفظ البطاقة بنجاح بالرقم التلقائي: (${autoCardNumber})`, 
            card_id: this.lastID,
            card_number: autoCardNumber
        });
    });
});

// 📍 جلب البطاقات
app.get('/api/stop-cards', (req, res) => {
    db.all(`SELECT * FROM stop_cards ORDER BY card_id DESC`, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'خطأ في جلب البطاقات.' });
        }
        res.status(200).json({ success: true, data: rows });
    });
});

app.listen(PORT, () => {
    console.log(`🚀 خادم نظام الستوب كارد يعمل بكفاءة على المنفذ: ${PORT}`);
});