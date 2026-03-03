import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaCalendarAlt, FaTimesCircle, FaEnvelope, FaCheckCircle } from 'react-icons/fa';

var statusColors = {
    confirmed: 'badge-success',
    'checked-in': 'badge-info',
    cancelled: 'badge-danger',
    expired: 'badge-secondary',
};

const MyBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [cancelResult, setCancelResult] = useState(null);

    useEffect(function() { loadBookings(); }, []);

    var loadBookings = async function() {
        try {
            var res = await axios.get('/api/bookings/my-bookings');
            setBookings(res.data);
        } catch (err) {
            toast.error('Failed to load bookings');
        } finally {
            setLoading(false);
        }
    };

    var handleCancel = async function(id) {
        if (!window.confirm('Are you sure you want to cancel this booking?')) return;
        try {
            var res = await axios.put('/api/bookings/cancel/' + id);
            setCancelResult(res.data);
            toast.success('Booking cancelled!');
            loadBookings();
        } catch (err) {
            var msg = (err.response && err.response.data && err.response.data.message) ? err.response.data.message : 'Failed to cancel';
            toast.error(msg);
        }
    };

    var filtered = filter === 'all' ? bookings : bookings.filter(function(b) { return b.status === filter; });

    var formatSlot = function(slot) {
        var parts = slot.split('-');
        var start = parts[0];
        var end = parts[1];
        var fmt = function(t) {
            var tp = t.split(':');
            var h = parseInt(tp[0]);
            var m = tp[1];
            var ampm = h >= 12 ? 'PM' : 'AM';
            var hour = h % 12 || 12;
            return hour + ':' + m + ' ' + ampm;
        };
        return fmt(start) + ' - ' + fmt(end);
    };

    if (loading) return <div className = "loading" > < div className = "spinner" > < /div></div > ;

    return ( <
        div className = "page" >
        <
        div className = "page-header" >
        <
        h2 className = "page-title" > My Bookings < /h2> <
        p className = "page-subtitle" > Track all your room bookings and check - in status < /p> <
        /div>

        {
            cancelResult && ( <
                div style = {
                    { background: '#f3f4f6', border: '1px solid #e0e0e0', borderRadius: 12, padding: 20, marginBottom: 20 } } >
                <
                div style = {
                    { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' } } >
                <
                div >
                <
                p style = {
                    { fontWeight: 700, color: '#c62828', marginBottom: 8, fontSize: 16 } } > { cancelResult.message } <
                /p> <
                div style = {
                    {
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        background: cancelResult.emailSent ? '#e8f5e9' : '#fff8e1',
                        borderRadius: 8,
                        padding: '10px 14px'
                    }
                } >
                <
                FaEnvelope style = {
                    { color: cancelResult.emailSent ? '#2e7d32' : '#f57f17', flexShrink: 0 } }
                /> <
                p style = {
                    { fontSize: 13, color: '#555' } } > { cancelResult.emailMessage } < /p> <
                /div> <
                /div> <
                button onClick = {
                    function() { setCancelResult(null); } }
                style = {
                    { background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#6b7280' } } >
                X <
                /button> <
                /div> <
                /div>
            )
        }

        <
        div style = {
            { display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' } } > {
            ['all', 'confirmed', 'checked-in', 'cancelled', 'expired'].map(function(f) {
                var count = f === 'all' ? bookings.length : bookings.filter(function(b) { return b.status === f; }).length;
                return ( <
                    button key = { f }
                    onClick = {
                        function() { setFilter(f); } }
                    className = { 'btn btn-sm' + (filter === f ? ' btn-primary' : ' btn-outline') } > { f.charAt(0).toUpperCase() + f.slice(1) }({ count }) <
                    /button>
                );
            })
        } <
        /div>

        {
            filtered.length === 0 ? ( <
                div className = "card"
                style = {
                    { textAlign: 'center', padding: 40 } } >
                <
                FaCalendarAlt style = {
                    { fontSize: 48, color: '#e0e0e0', marginBottom: 12 } }
                /> <
                p style = {
                    { color: '#6b7280' } } > No bookings found < /p> <
                /div>
            ) : ( <
                div style = {
                    { display: 'flex', flexDirection: 'column', gap: 12 } } > {
                    filtered.map(function(b) {
                        var roomName = (b.room && b.room.name) ? b.room.name : 'Study Room';
                        var checkinTime = b.checkinTime ? new Date(b.checkinTime).toLocaleTimeString() : '';
                        return ( <
                            div key = { b._id }
                            className = "card"
                            style = {
                                { padding: 20 } } >
                            <
                            div style = {
                                { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 } } >
                            <
                            div style = {
                                { display: 'flex', gap: 16 } } >
                            <
                            div style = {
                                { width: 48, height: 48, background: '#e8eaf6', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 } } > 📚
                            <
                            /div> <
                            div >
                            <
                            h4 style = {
                                { fontWeight: 700 } } > { roomName } < /h4> <
                            p style = {
                                { color: '#6b7280', fontSize: 13, marginTop: 2 } } > { b.date } | { formatSlot(b.timeSlot) } <
                            /p> <
                            p style = {
                                { fontSize: 12, color: '#9ca3af', marginTop: 2 } } > ID: { b.bookingId } < /p>

                            {
                                b.status === 'confirmed' && ( <
                                    div style = {
                                        { marginTop: 6, background: '#fff8e1', borderRadius: 6, padding: '6px 10px', fontSize: 12, color: '#e65100', fontWeight: 500 } } >
                                    Arrive 10 minutes early
                                    for QR scan check - in
                                    <
                                    /div>
                                )
                            } {
                                b.status === 'checked-in' && ( <
                                    div style = {
                                        { marginTop: 6, background: '#e8f5e9', borderRadius: 6, padding: '6px 10px', fontSize: 12, color: '#2e7d32', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 } } >
                                    <
                                    FaCheckCircle / > Checked in at { checkinTime } <
                                    /div>
                                )
                            } {
                                (b.status === 'cancelled' || b.status === 'expired') && b.cancelReason && ( <
                                    div style = {
                                        { marginTop: 6, background: '#ffebee', borderRadius: 6, padding: '6px 10px', fontSize: 12, color: '#c62828' } } >
                                    Reason: { b.cancelReason } <
                                    /div>
                                )
                            } <
                            /div> <
                            /div>

                            <
                            div style = {
                                { display: 'flex', alignItems: 'center', gap: 10 } } >
                            <
                            span className = { 'badge ' + (statusColors[b.status] || 'badge-secondary') } > { b.status === 'checked-in' ? 'Checked In' : b.status.charAt(0).toUpperCase() + b.status.slice(1) } <
                            /span> {
                                b.status === 'confirmed' && ( <
                                    button onClick = {
                                        function() { handleCancel(b._id); } }
                                    className = "btn btn-sm btn-danger" >
                                    <
                                    FaTimesCircle / > Cancel <
                                    /button>
                                )
                            } <
                            /div> <
                            /div> <
                            /div>
                        );
                    })
                } <
                /div>
            )
        } <
        /div>
    );
};

export default MyBookings;


