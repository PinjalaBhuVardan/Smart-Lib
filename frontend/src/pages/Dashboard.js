import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FaCalendarAlt, FaQrcode, FaExclamationTriangle } from 'react-icons/fa';

const INSTRUCTIONS = [
    { icon: '⏰', text: 'Arrive at least 10 minutes before your booking time.' },
    { icon: '📱', text: 'Show your QR code to the admin at the entrance desk.' },
    { icon: '⛔', text: 'Arriving more than 10 min late will auto-cancel your slot.' },
    { icon: '🤫', text: 'Maintain silence inside the study room at all times.' },
    { icon: '🛡️', text: 'Do not damage furniture, equipment, or any property.' },
    { icon: '📵', text: 'Keep your phone on silent mode.' },
    { icon: '🚫', text: 'Misbehavior leads to Restricted Access List.' },
];

const Dashboard = () => {
    const { user } = useAuth();
    const [upcomingBooking, setUpcomingBooking] = useState(null);
    const [stats, setStats] = useState({ total: 0, upcoming: 0, checkedIn: 0, cancelled: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadData(); }, []);

    const loadData = async() => {
        try {
            const res = await axios.get('/api/bookings/my-bookings');
            const bookings = res.data;
            const today = new Date().toISOString().split('T')[0];
            const upcoming = bookings.find(function(b) { return b.date >= today && b.status === 'confirmed'; });
            setUpcomingBooking(upcoming);
            setStats({
                total: bookings.length,
                upcoming: bookings.filter(function(b) { return b.status === 'confirmed'; }).length,
                checkedIn: bookings.filter(function(b) { return b.status === 'checked-in'; }).length,
                cancelled: bookings.filter(function(b) { return b.status === 'cancelled' || b.status === 'expired'; }).length
            });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const formatSlot = function(slot) {
        var parts = slot.split('-');
        var start = parts[0];
        var end = parts[1];
        var fmt = function(t) {
            var tp = t.split(':');
            var h = tp[0];
            var m = tp[1];
            var ampm = parseInt(h) >= 12 ? 'PM' : 'AM';
            var hour = parseInt(h) % 12 || 12;
            return hour + ':' + m + ' ' + ampm;
        };
        return fmt(start) + ' - ' + fmt(end);
    };

    var userName = '';
    var userRollNo = '';
    var userDept = '';
    var userQrImg = '';
    var userQrCode = '';

    if (user) {
        userName = user.name ? user.name.split(' ')[0] : '';
        userRollNo = user.rollNo || '';
        userDept = user.department || 'Student';
        userQrImg = user.qrCodeDataUrl || '';
        userQrCode = user.qrCode || '';
    }

    if (loading) return React.createElement('div', { className: 'loading' }, React.createElement('div', { className: 'spinner' }));

    return ( <
        div className = "page" >

        <
        div style = {
            { background: 'linear-gradient(135deg, #1a237e, #1565c0)', color: 'white', borderRadius: 16, padding: '28px 32px', marginBottom: 24 } } >
        <
        h2 style = {
            { fontSize: 24, fontWeight: 700 } } > Welcome back, { userName }! < /h2> <
        p style = {
            { opacity: 0.85, marginTop: 4 } } > Roll No: { userRollNo } - { userDept } < /p> <
        div style = {
            { display: 'flex', gap: 12, marginTop: 20, flexWrap: 'wrap' } } >
        <
        Link to = "/book"
        className = "btn"
        style = {
            { background: 'white', color: '#1a237e', fontWeight: 700 } } > Book a Room < /Link> <
        Link to = "/my-bookings"
        className = "btn"
        style = {
            { background: 'rgba(255,255,255,0.15)', color: 'white' } } > My Bookings < /Link> <
        /div> <
        /div>

        <
        div className = "grid grid-4"
        style = {
            { marginBottom: 24 } } > {
            [
                { label: 'Total Bookings', value: stats.total, icon: '📊', color: '#e8eaf6' },
                { label: 'Upcoming', value: stats.upcoming, icon: '📅', color: '#e8f5e9' },
                { label: 'Checked In', value: stats.checkedIn, icon: '✅', color: '#e3f2fd' },
                { label: 'Cancelled', value: stats.cancelled, icon: '❌', color: '#ffebee' },
            ].map(function(s) {
                return ( <
                    div key = { s.label }
                    className = "stat-card" >
                    <
                    div className = "stat-icon"
                    style = {
                        { background: s.color } } >
                    <
                    span style = {
                        { fontSize: 22 } } > { s.icon } < /span> <
                    /div> <
                    div >
                    <
                    div className = "stat-value" > { s.value } < /div> <
                    div className = "stat-label" > { s.label } < /div> <
                    /div> <
                    /div>
                );
            })
        } <
        /div>

        <
        div className = "grid grid-2"
        style = {
            { marginBottom: 24 } } >

        <
        div className = "card" >
        <
        h3 style = {
            { marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 } } >
        <
        FaCalendarAlt color = "#1a237e" / > Upcoming Booking <
        /h3> {
            upcomingBooking ? ( <
                div style = {
                    { background: '#f0f4ff', borderRadius: 12, padding: 16 } } >
                <
                div style = {
                    { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' } } >
                <
                div >
                <
                p style = {
                    { fontWeight: 700, fontSize: 16 } } > { upcomingBooking.room ? upcomingBooking.room.name : 'Room' } < /p> <
                p style = {
                    { color: '#6b7280', fontSize: 13, marginTop: 4 } } > { upcomingBooking.date } < /p> <
                p style = {
                    { color: '#1a237e', fontWeight: 600, marginTop: 4 } } > { formatSlot(upcomingBooking.timeSlot) } < /p> <
                p style = {
                    { color: '#6b7280', fontSize: 12, marginTop: 4 } } > ID: { upcomingBooking.bookingId } < /p> <
                /div> <
                span className = "badge badge-success" > Confirmed < /span> <
                /div> <
                div className = "alert alert-warning"
                style = {
                    { marginTop: 12, marginBottom: 0 } } >
                Reminder: Arrive 10 minutes before your slot time!
                <
                /div> <
                /div>
            ) : ( <
                div style = {
                    { textAlign: 'center', padding: '24px 0', color: '#6b7280' } } >
                <
                FaCalendarAlt style = {
                    { fontSize: 36, opacity: 0.3, marginBottom: 8 } }
                /> <
                p > No upcoming bookings < /p> <
                Link to = "/book"
                className = "btn btn-primary"
                style = {
                    { marginTop: 12 } } > Book Now < /Link> <
                /div>
            )
        } <
        /div>

        <
        div className = "card" >
        <
        h3 style = {
            { marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 } } >
        <
        FaQrcode color = "#1a237e" / > Your QR Code <
        /h3> {
            userQrImg ? ( <
                div className = "qr-container" >
                <
                img src = { userQrImg }
                alt = "QR Code"
                style = {
                    { maxWidth: 200 } }
                /> <
                p style = {
                    { marginTop: 12, color: '#6b7280', fontSize: 13 } } > Show this at admin desk
                for check - in < /p> <
                p style = {
                    { fontSize: 11, color: '#9ca3af', marginTop: 4 } } > This is your permanent QR code < /p> <
                div style = {
                    { marginTop: 12, background: '#f0f2f5', borderRadius: 8, padding: 10 } } >
                <
                p style = {
                    { fontSize: 11, color: '#6b7280', marginBottom: 4 } } > QR Code String(
                    for manual entry): < /p> <
                p style = {
                    { fontSize: 11, fontFamily: 'monospace', wordBreak: 'break-all', color: '#1a237e' } } > { userQrCode } < /p> <
                /div> <
                /div>
            ) : ( <
                div style = {
                    { textAlign: 'center', color: '#6b7280', padding: 24 } } >
                <
                FaQrcode style = {
                    { fontSize: 36, opacity: 0.3, marginBottom: 8 } }
                /> <
                p > QR code will appear after your first booking < /p> <
                /div>
            )
        } <
        /div>

        <
        /div>

        <
        div className = "instructions-banner" >
        <
        h3 > < FaExclamationTriangle / > Library Rules and Instructions < /h3> <
        ul > {
            INSTRUCTIONS.map(function(item, i) {
                return ( <
                    li key = { i } >
                    <
                    span > { item.icon } < /span> <
                    span > { item.text } < /span> <
                    /li>
                );
            })
        } <
        /ul> <
        /div>

        <
        /div>
    );
};

export default Dashboard;

