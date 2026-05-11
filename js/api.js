const BASE_URL = '/api';

async function apiRequest(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(url, config);
  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    const message = payload?.message || response.statusText || 'Request failed';
    const error = new Error(message);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return response.json().catch(() => ({}));
}

export async function registerVoter(payload) {
  return apiRequest('/voters/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function verifyVoter(cardNumber) {
  return apiRequest('/voters/verify', {
    method: 'POST',
    body: JSON.stringify({ cardNumber }),
  });
}

export async function submitFaceVerification(cardNumber, imageData) {
  return apiRequest('/face/verify', {
    method: 'POST',
    body: JSON.stringify({ cardNumber, imageData }),
  });
}

export async function fetchCandidates() {
  return apiRequest('/election/candidates');
}

export async function submitVotes(payload) {
  return apiRequest('/election/submit-ballot', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function fetchElectionResults() {
  return apiRequest('/election/results');
}

export async function fetchAdminStats() {
  return apiRequest('/admin/stats');
}

export async function fetchVoters(query = '') {
  return apiRequest(`/admin/voters?search=${encodeURIComponent(query)}`);
}

export async function fetchCandidatesAdmin(query = '') {
  return apiRequest(`/admin/candidates?search=${encodeURIComponent(query)}`);
}

export async function loginAdmin(email, password) {
  return apiRequest('/admin/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}
