// API configuration - kết nối với backend trên Render
const API_BASE = 'https://iris-back-end-2guw.onrender.com/api/v1'

async function request(method, path, body) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' }
  }
  if (body) opts.body = JSON.stringify(body)
  const res = await fetch(API_BASE + path, opts)
  if (!res.ok) {
    const err = await res.text()
    throw new Error(err || 'HTTP ' + res.status)
  }
  if (res.status === 204) return null
  return res.json()
}

export const api = {
  // Members
  getMembers: () => request('GET', '/members'),
  getMember: (id) => request('GET', '/members/' + id),
  createMember: (data) => request('POST', '/members', data),
  updateMember: (id, data) => request('PUT', '/members/' + id, data),
  deleteMember: (id) => request('DELETE', '/members/' + id),
  updateStats: (id, stats) => request('PUT', '/members/' + id + '/stats', stats),

  // Events
  getEvents: (from, to) => {
    if (from && to) {
      return request('GET', '/events?from=' + from + '&to=' + to)
    }
    return request('GET', '/events')
  },
  getEvent: (id) => request('GET', '/events/' + id),
  createEvent: (data) => request('POST', '/events', data),
  updateEvent: (id, data) => request('PUT', '/events/' + id, data),
  deleteEvent: (id) => request('DELETE', '/events/' + id),

  // Availability
  getAvailability: (week) => request('GET', '/availability?week=' + week),
  setAvailability: (memberId, data) => request('PUT', '/members/' + memberId + '/availability', data),

  // Notes & Feedback
  getLeaderNotes: (memberId) => request('GET', '/members/' + memberId + '/leader-notes'),
  addLeaderNote: (memberId, data) => request('POST', '/members/' + memberId + '/leader-notes', data),
  deleteLeaderNote: (noteId) => request('DELETE', '/leader-notes/' + noteId),

  getCoachNotes: (memberId) => request('GET', '/members/' + memberId + '/coach-notes'),
  addCoachNote: (memberId, data) => request('POST', '/members/' + memberId + '/coach-notes', data),
  deleteCoachNote: (noteId) => request('DELETE', '/coach-notes/' + noteId),

  getPeerFeedback: (memberId) => request('GET', '/members/' + memberId + '/peer-feedback'),
  addPeerFeedback: (memberId, data) => request('POST', '/members/' + memberId + '/peer-feedback', data),
  deletePeerFeedback: (id) => request('DELETE', '/peer-feedback/' + id),

  // VODs
  getVods: (memberId) => request('GET', '/members/' + memberId + '/vods'),
  addVod: (memberId, data) => request('POST', '/members/' + memberId + '/vods', data),
  deleteVod: (vodId) => request('DELETE', '/vods/' + vodId)
}

export default api
