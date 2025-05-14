const db = require('../config/db');
const { format } = require('date-fns');
const fs = require('fs');
const path = require('path');

exports.apiAllSessions = async (req, res) => {
    try {
        const [sessions] = await db.promise().query('SELECT * FROM attendance_sessions');
        const now = new Date();
        const filteredSessions = sessions.filter(session =>
            session.as_end_time && new Date(session.as_end_time) > now
        );
        const allSessions = filteredSessions.map(session => {
            const end = new Date(session.as_end_time);
            const diffMs = end - now;
            if (diffMs <= 0) return `${session.as_name} (Berakhir)`;
            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            const diffHours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
            const diffMinutes = Math.floor((diffMs / (1000 * 60)) % 60);
            let sisa = '';
            if (diffDays > 0) {
                sisa = `Sisa ${diffDays} hari ${diffHours} jam`;
            } else if (diffHours > 0) {
                sisa = `Sisa ${diffHours} jam ${diffMinutes} menit`;
            } else {
                sisa = `Sisa ${diffMinutes} menit`;
            }
            return `${session.as_name} (${sisa})`;
        });
        res.json(allSessions);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};