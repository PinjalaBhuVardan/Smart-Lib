import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { FaBuilding, FaCalendarAlt, FaClock, FaCheckCircle, FaEnvelope } from 'react-icons/fa';

var TIME_SLOTS = [
  { slot: '09:00-10:00', label: '9:00 AM - 10:00 AM' },
  { slot: '10:00-11:00', label: '10:00 AM - 11:00 AM' },
  { slot: '11:00-12:00', label: '11:00 AM - 12:00 PM' },
  { slot: '13:00-14:00', label: '1:00 PM - 2:00 PM' },
  { slot: '14:00-15:00', label: '2:00 PM - 3:00 PM' },
  { slot: '15:00-16:00', label: '3:00 PM - 4:00 PM' },
  { slot: '16:00-17:00', label: '4:00 PM - 5:00 PM' },
];

const BookRoom = () => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [slotAvailability, setSlotAvailability] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);
  const [notification, setNotification] = useState(null);

  // Socket.io - real time slot available notification
  useEffect(function() {
    var socket = io('http://localhost:5000');
    socket.on('slot-available', function(data) {
      setNotification(data.message);
      toast.success('Slot Available: ' + data.message, { duration: 8000 });
      setTimeout(function() { setNotification(null); }, 10000);
      // Auto refresh slots if student is viewing same room and date
      if (selectedRoom && selectedDate === data.date) {
        axios.get('/api/bookings/available-slots?roomId=' + selectedRoom + '&date=' + selectedDate)
          .then(function(res) { setSlotAvailability(res.data); });
      }
    });
    return function() { socket.disconnect(); };
  }, [selectedRoom, selectedDate]);

  useEffect(function() {
    axios.get('/api/rooms').then(function(res) {
      setRooms(res.data);
    }).catch(function() {
      toast.error('Failed to load rooms');
    });
  }, []);

  useEffect(function() {
    if (selectedRoom && selectedDate) {
      axios.get('/api/bookings/available-slots?roomId=' + selectedRoom + '&date=' + selectedDate)
        .then(function(res) { setSlotAvailability(res.data); })
        .catch(function(err) { console.error(err); });
    }
  }, [selectedRoom, selectedDate]);

  var isSlotAvailable = function(slot) {
    var found = slotAvailability.find(function(s) { return s.slot === slot; });
    var bookedByOther = found ? !found.available : false;
    if (bookedByOther) return false;
    var istNow = new Date();
    var todayIST = istNow.toISOString().split('T')[0];
    if (selectedDate === todayIST) {
      var endTime = slot.split('-')[1];
      var endHour = parseInt(endTime.split(':')[0]);
      var endMin = parseInt(endTime.split(':')[1]);
      var slotEndMinutes = endHour * 60 + endMin;
      var currentMinutes = istNow.getHours() * 60 + istNow.getMinutes();
      if (currentMinutes >= slotEndMinutes) return false;
    }
    return true;
  };

  var handleBook = async function() {
    if (!selectedRoom || !selectedDate || !selectedSlot) {
      return toast.error('Please select room, date and time slot');
    }
    setLoading(true);
    try {
      var res = await axios.post('/api/bookings', {
        roomId: selectedRoom,
        date: selectedDate,
        timeSlot: selectedSlot
      });
      setBookingResult(res.data);
      toast.success('Room booked successfully!');
    } catch (err) {
      var msg = (err.response && err.response.data && err.response.data.message)
        ? err.response.data.message : 'Booking failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  var today = new Date().toISOString().split('T')[0];
  var maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 7);
  var maxDateStr = maxDate.toISOString().split('T')[0];
  var selectedRoomObj = rooms.find(function(r) { return r._id === selectedRoom; });
  var userName = user ? user.name : '';
  var userRollNo = user ? user.rollNo : '';

  if (bookingResult) {
    var booking = bookingResult.booking;
    var emailSent = bookingResult.emailSent;
    var emailMessage = bookingResult.emailMessage;
    var roomName = (booking && booking.room) ? booking.room.name : 'Room';

    return (
      <div className="page" style={{ maxWidth: 600 }}>
        <div className="card" style={{ padding: 40 }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ width: 80, height: 80, background: '#e8f5e9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <FaCheckCircle style={{ fontSize: 44, color: '#2e7d32' }} />
            </div>
            <h2 style={{ color: '#2e7d32', fontSize: 24, fontWeight: 700 }}>Booking Confirmed!</h2>
            <p style={{ color: '#6b7280', marginTop: 4 }}>Your study room has been reserved</p>
          </div>

          <div style={{ background: '#f0f4ff', borderRadius: 12, padding: 20, marginBottom: 20 }}>
            <h4 style={{ color: '#1a237e', marginBottom: 12, fontWeight: 700 }}>Booking Details</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                ['Booking ID', booking ? booking.bookingId : ''],
                ['Room', roomName],
                ['Date', booking ? booking.date : ''],
                ['Time Slot', booking ? booking.timeSlot : ''],
                ['Student', userName],
                ['Roll No', userRollNo],
              ].map(function(item) {
                return (
                  <div key={item[0]} style={{ background: 'white', borderRadius: 8, padding: '10px 14px' }}>
                    <p style={{ fontSize: 11, color: '#6b7280', fontWeight: 600 }}>{item[0]}</p>
                    <p style={{ fontWeight: 700, marginTop: 2, fontSize: 14 }}>{item[1]}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{
            background: emailSent ? '#e8f5e9' : '#fff8e1',
            border: '1px solid ' + (emailSent ? '#a5d6a7' : '#ffe082'),
            borderRadius: 10, padding: '14px 16px', marginBottom: 20,
            display: 'flex', alignItems: 'flex-start', gap: 10
          }}>
            <FaEnvelope style={{ color: emailSent ? '#2e7d32' : '#f57f17', marginTop: 2 }} />
            <div>
              <p style={{ fontWeight: 600, fontSize: 13, color: emailSent ? '#2e7d32' : '#e65100' }}>
                {emailSent ? 'Email Notification Sent' : 'Email Notification Failed'}
              </p>
              <p style={{ fontSize: 12, color: '#555', marginTop: 2 }}>{emailMessage}</p>
            </div>
          </div>

          <div style={{ background: '#fff3cd', border: '1px solid #ffc107', borderRadius: 10, padding: '14px 16px', marginBottom: 24 }}>
            <p style={{ fontWeight: 700, color: '#856404', marginBottom: 6 }}>Important Reminder</p>
            <p style={{ fontSize: 13, color: '#5d4037' }}>Arrive 10 minutes before your slot and show your QR code at the admin desk. Late arrival will auto-cancel your booking.</p>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}
              onClick={function() { setBookingResult(null); setSelectedSlot(''); }}>
              Book Another Room
            </button>
            <a href="/my-bookings" className="btn btn-outline" style={{ flex: 1, justifyContent: 'center' }}>
              View My Bookings
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page" style={{ maxWidth: 800 }}>

      {notification && (
        <div style={{ background: '#e8f5e9', border: '2px solid #4caf50', borderRadius: 10, padding: '14px 20px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 22, color: '#2e7d32' }}>&#128276;</span>
          <div>
            <strong style={{ color: '#2e7d32' }}>Slot Just Became Available!</strong>
            <p style={{ margin: 0, fontSize: 13, color: '#1b5e20' }}>{notification} - Book now before someone else does!</p>
          </div>
        </div>
      )}

      <div className="page-header">
        <h2 className="page-title">Book a Study Room</h2>
        <p className="page-subtitle">Select your room, date, and preferred time slot</p>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <FaBuilding color="#1a237e" /> Step 1: Select Room
        </h3>
        <div className="grid grid-2">
          {rooms.map(function(room) {
            return (
              <div key={room._id}
                onClick={function() { setSelectedRoom(room._id); }}
                style={{
                  border: '2px solid ' + (selectedRoom === room._id ? '#1a237e' : '#e0e0e0'),
                  borderRadius: 12, padding: 16, cursor: 'pointer',
                  background: selectedRoom === room._id ? '#e8eaf6' : 'white',
                  transition: 'all 0.2s'
                }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h4 style={{ fontWeight: 700 }}>{room.name}</h4>
                  <span className="badge badge-success">AVAILABLE</span>
                </div>
                <p style={{ color: '#6b7280', fontSize: 13, marginTop: 4 }}>{room.description}</p>
                <div style={{ display: 'flex', gap: 12, marginTop: 8, fontSize: 12, color: '#6b7280' }}>
                  <span>Capacity: {room.capacity}</span>
                  <span>{room.location}</span>
                </div>
                {room.amenities && room.amenities.length > 0 && (
                  <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {room.amenities.map(function(a) {
                      return <span key={a} style={{ background: '#f0f2f5', padding: '2px 8px', borderRadius: 12, fontSize: 11 }}>{a}</span>;
                    })}
                  </div>
                )}
              </div>
            );
          })}
          {rooms.length === 0 && <p style={{ color: '#6b7280' }}>No rooms available. Admin must add rooms first.</p>}
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <FaCalendarAlt color="#1a237e" /> Step 2: Select Date
        </h3>
        <input type="date" className="form-control" value={selectedDate} min={today} max={maxDateStr}
          onChange={function(e) { setSelectedDate(e.target.value); setSelectedSlot(''); }}
          style={{ maxWidth: 240 }} />
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <FaClock color="#1a237e" /> Step 3: Select Time Slot
        </h3>
        <div className="slot-grid">
          {TIME_SLOTS.map(function(item) {
            var available = isSlotAvailable(item.slot);
            return (
              <button key={item.slot}
                className={'slot-btn' + (selectedSlot === item.slot ? ' selected' : '')}
                disabled={!available}
                onClick={function() { if (available) setSelectedSlot(item.slot); }}>
                {item.label}
                {!available && <div style={{ fontSize: 10, marginTop: 2, color: '#ef5350' }}>Time Over / Booked</div>}
              </button>
            );
          })}
        </div>
      </div>

      {selectedRoom && selectedSlot && (
        <div style={{ background: '#e8eaf6', borderRadius: 12, padding: 16, marginBottom: 20 }}>
          <p style={{ fontWeight: 700, color: '#1a237e', marginBottom: 8 }}>Booking Summary</p>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', fontSize: 14 }}>
            <span><strong>{selectedRoomObj ? selectedRoomObj.name : ''}</strong></span>
            <span><strong>{selectedDate}</strong></span>
            <span><strong>{selectedSlot}</strong></span>
          </div>
        </div>
      )}

      <button className="btn btn-primary btn-lg" onClick={handleBook}
        disabled={loading || !selectedRoom || !selectedSlot}
        style={{ width: '100%', justifyContent: 'center' }}>
        {loading ? 'Booking...' : 'Confirm Booking'}
      </button>

      <div className="alert alert-info" style={{ marginTop: 16 }}>
        Arrive 10 minutes early for check-in at admin desk.
      </div>
    </div>
  );
};

export default BookRoom;
