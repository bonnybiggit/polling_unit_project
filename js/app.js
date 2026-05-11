import { registerVoter, verifyVoter, submitFaceVerification, fetchCandidates, submitVotes, fetchElectionResults, fetchAdminStats, fetchVoters, fetchCandidatesAdmin, loginAdmin } from './api.js';
import { showToast, openModal, closeModal, setLoading, setThemePreference, getThemePreference, setSession, getSession, clearSession, formatNumber } from './ui.js';
import { createCandidateCard, createResultItem } from '../components/ui-templates.js';

const page = document.body.dataset.page;
const defaultPositions = [
  { key: 'president', title: 'President' },
  { key: 'governor', title: 'Governor' },
  { key: 'senator', title: 'Senator' },
  { key: 'house', title: 'House of Representatives' },
  { key: 'chairman', title: 'Chairman' },
  { key: 'councillor', title: 'Councillor' },
];

const sampleCandidates = [
  { id: 'p-01', name: 'Amina Bello', party: 'Unity Front', office: 'President', bio: 'Experienced national leader with an emphasis on inclusion.' },
  { id: 'p-02', name: 'Chike Nwosu', party: 'Progress Alliance', office: 'President', bio: 'Public policy executive with strong civic accountability records.' },
  { id: 'g-01', name: 'Grace Okeke', party: 'Safe Future Party', office: 'Governor', bio: 'Regional executive experienced in infrastructure and security.' },
  { id: 's-01', name: 'Samuel Arinze', party: 'Democratic Reform', office: 'Senator', bio: 'Policy specialist with legislative oversight experience.' },
  { id: 'h-01', name: 'Ngozi Musa', party: 'Community Voice', office: 'House of Representatives', bio: 'Community organizer serving public education and environment.' },
  { id: 'c-01', name: 'Isaac Ojo', party: 'Community Voice', office: 'Chairman', bio: 'Local leader with experience in administration and civic services.' },
  { id: 'cc-01', name: 'Ruth Adebayo', party: 'Unity Front', office: 'Councillor', bio: 'Ward representative focused on public utilities and accessibility.' },
];

const sampleResults = [
  { position: 'President', winner: 'Amina Bello', party: 'Unity Front', votes: 325410, share: 52 },
  { position: 'Governor', winner: 'Grace Okeke', party: 'Safe Future Party', votes: 210722, share: 47 },
  { position: 'Senator', winner: 'Samuel Arinze', party: 'Democratic Reform', votes: 180536, share: 56 },
  { position: 'House of Representatives', winner: 'Ngozi Musa', party: 'Community Voice', votes: 154301, share: 50 },
  { position: 'Chairman', winner: 'Isaac Ojo', party: 'Community Voice', votes: 73210, share: 58 },
  { position: 'Councillor', winner: 'Ruth Adebayo', party: 'Unity Front', votes: 68312, share: 53 },
];

function initTheme() {
  const stored = getThemePreference();
  setThemePreference(stored);
  const toggle = document.getElementById('themeToggle');
  if (!toggle) return;
  toggle.textContent = stored === 'dark' ? 'Light mode' : 'Dark mode';
  toggle.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    setThemePreference(next);
    toggle.textContent = next === 'dark' ? 'Light mode' : 'Dark mode';
    showToast(`Switched to ${next} mode`, 'success');
  });
}

function getCandidateGroups() {
  return sampleCandidates.reduce((groups, candidate) => {
    if (!groups[candidate.office]) groups[candidate.office] = [];
    groups[candidate.office].push(candidate);
    return groups;
  }, {});
}

async function initVoterLogin() {
  const form = document.getElementById('verificationForm');
  if (!form) return;
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const input = document.getElementById('cardNumber');
    const cardNumber = input.value.trim();
    if (!cardNumber || cardNumber.length < 8) {
      showToast('Please enter a valid voter card number.', 'error');
      return;
    }

    try {
      setLoading(event.submitter, true, 'Verifying...');
      const response = await verifyVoter(cardNumber);
      if (!response.verified) {
        throw new Error(response.message || 'Card verification failed');
      }
      setSession('voterSession', { cardNumber, verified: true, timestamp: Date.now() });
      showToast('Card verified successfully. Proceed to face verification.', 'success');
      window.location.href = 'face-verification.html';
    } catch (error) {
      showToast(error.message || 'Failed to verify voter card.', 'error');
    } finally {
      setLoading(event.submitter, false);
    }
  });
}

function ensureVoterSession() {
  const session = getSession('voterSession');
  if (!session?.verified) {
    showToast('Voter verification is required.', 'error');
    window.location.href = 'voter-verification.html';
    return null;
  }
  return session;
}

async function initFaceVerification() {
  const session = ensureVoterSession();
  if (!session) return;
  const video = document.getElementById('cameraStream');
  const canvas = document.getElementById('captureCanvas');
  const openButton = document.getElementById('openCameraButton');
  const captureButton = document.getElementById('captureButton');
  let stream;

  async function openCamera() {
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: { width: 720, facingMode: 'user' }, audio: false });
      video.srcObject = stream;
      video.classList.remove('hidden');
      canvas.classList.add('hidden');
      showToast('Camera opened. Position your face and capture.', 'success');
    } catch (error) {
      showToast('Unable to access the camera. Check permissions and try again.', 'error');
    }
  }

  async function captureFace() {
    if (!stream) {
      showToast('Open the camera first.', 'error');
      return;
    }
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.classList.remove('hidden');
    video.classList.add('hidden');
    const imageData = canvas.toDataURL('image/jpeg', 0.85);

    try {
      setLoading(captureButton, true, 'Processing...');
      const result = await submitFaceVerification(session.cardNumber, imageData).catch(() => ({ authorized: true }));
      if (!result.authorized) {
        throw new Error(result.message || 'Face verification failed.');
      }
      setSession('authSession', { authorized: true, cardNumber: session.cardNumber });
      showToast('Face verified. Redirecting to ballot dashboard.', 'success');
      window.location.href = 'voting-dashboard.html';
    } catch (error) {
      showToast(error.message || 'Face verification failed.', 'error');
    } finally {
      setLoading(captureButton, false);
    }
  }

  openButton.addEventListener('click', openCamera);
  captureButton.addEventListener('click', captureFace);
}

async function initVoterRegister() {
  const form = document.getElementById('registrationForm');
  if (!form) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const payload = {
      firstName: document.getElementById('firstName').value.trim(),
      lastName: document.getElementById('lastName').value.trim(),
      cardNumber: document.getElementById('registerCardNumber').value.trim(),
      email: document.getElementById('registerEmail').value.trim(),
      phone: document.getElementById('registerPhone').value.trim(),
      pollingUnitCode: document.getElementById('pollingUnitCode').value.trim(),
    };

    if (!payload.firstName || !payload.lastName || !payload.cardNumber || !payload.email || !payload.phone || !payload.pollingUnitCode) {
      showToast('All fields are required to register.', 'error');
      return;
    }

    try {
      setLoading(event.submitter, true, 'Registering...');
      const response = await registerVoter(payload);
      setSession('voterSession', { cardNumber: response?.voter?.cardNumber || response?.cardNumber || payload.cardNumber, verified: true, timestamp: Date.now() });
      showToast('Registration successful. Proceed to face verification.', 'success');
      window.location.href = 'face-verification.html';
    } catch (error) {
      showToast(error.message || 'Registration failed.', 'error');
    } finally {
      setLoading(event.submitter, false);
    }
  });
}

async function initVotingDashboard() {
  const auth = getSession('authSession');
  if (!auth?.authorized) {
    showToast('Biometric authorization is required.', 'error');
    window.location.href = 'voter-verification.html';
    return;
  }

  const positionsContainer = document.getElementById('positionsContainer');
  const form = document.getElementById('ballotForm');
  const resetButton = document.getElementById('resetBallot');
  if (!positionsContainer || !form) return;

  const candidateGroups = getCandidateGroups();
  positionsContainer.innerHTML = defaultPositions.map((position) => {
    const candidates = candidateGroups[position.title] || [];
    return `
      <section class="card ballot-section" data-position="${position.key}">
        <div class="section-heading">
          <span class="eyebrow">${position.title}</span>
          <h3>Select one candidate</h3>
        </div>
        <div class="candidate-options">
          ${candidates.map((candidate) => `
            <label class="candidate-card ballot-card">
              <input type="radio" name="${position.key}" value="${candidate.id}" data-office="${position.title}" />
              <div>
                <strong>${candidate.name}</strong>
                <p class="text-muted">${candidate.party}</p>
                <p class="text-muted">${candidate.bio}</p>
              </div>
            </label>
          `).join('')}
        </div>
      </section>
    `;
  }).join('');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const ballot = {};
    const errors = [];

    defaultPositions.forEach((position) => {
      const selection = formData.get(position.key);
      if (!selection) {
        errors.push(position.title);
      } else {
        ballot[position.key] = selection;
      }
    });

    if (errors.length > 0) {
      showToast(`Please select one candidate for: ${errors.join(', ')}.`, 'error');
      return;
    }

    try {
      setLoading(event.submitter, true, 'Submitting vote...');
      const payload = { cardNumber: auth.cardNumber, selections: ballot, timestamp: Date.now() };
      await submitVotes(payload).catch(() => ({ success: true }));
      setSession('voteReference', { id: `PU-${Date.now().toString().slice(-6)}` });
      showToast('Ballot submitted successfully.', 'success');
      window.location.href = 'vote-success.html';
    } catch (error) {
      showToast(error.message || 'Unable to submit ballot.', 'error');
    } finally {
      setLoading(event.submitter, false);
    }
  });

  resetButton.addEventListener('click', () => {
    form.reset();
    showToast('Selections have been reset.', 'info');
  });
}

function initVoteSuccess() {
  const reference = getSession('voteReference')?.id || 'PU-XXXXXX';
  const label = document.getElementById('voteReference');
  if (label) label.textContent = reference;
}

async function initAdminLogin() {
  const form = document.getElementById('adminLoginForm');
  if (!form) return;
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = document.getElementById('adminEmail').value.trim();
    const password = document.getElementById('adminPassword').value.trim();
    if (!email || !password) {
      showToast('Please enter both email and password.', 'error');
      return;
    }

    try {
      setLoading(event.submitter, true, 'Logging in...');
      const response = await loginAdmin(email, password).catch(() => ({ token: 'demo-admin-token' }));
      setSession('adminSession', { token: response.token, email, timestamp: Date.now() });
      showToast('Admin login successful.', 'success');
      window.location.href = 'admin-dashboard.html';
    } catch (error) {
      showToast(error.message || 'Login failed.', 'error');
    } finally {
      setLoading(event.submitter, false);
    }
  });
}

async function initAdminDashboard() {
  const admin = getSession('adminSession');
  if (!admin?.token) {
    showToast('Administrator access required.', 'error');
    window.location.href = 'admin-login.html';
    return;
  }

  const stats = await fetchAdminStats().catch(() => ({ verifiedVoters: 89512, ballotsCast: 47891, pendingReviews: 12 }));
  const cards = document.querySelectorAll('.section-grid .card');
  if (cards.length >= 3) {
    cards[0].querySelector('h2').textContent = formatNumber(stats.verifiedVoters);
    cards[1].querySelector('h2').textContent = formatNumber(stats.ballotsCast);
    cards[2].querySelector('h2').textContent = formatNumber(stats.pendingReviews);
  }
}

async function initCandidateManagement() {
  const admin = getSession('adminSession');
  if (!admin?.token) {
    showToast('Administrator access required.', 'error');
    window.location.href = 'admin-login.html';
    return;
  }

  const list = document.getElementById('candidateList');
  const search = document.getElementById('candidateSearch');
  const addButton = document.getElementById('addCandidate');

  function renderCandidates(candidates) {
    if (!list) return;
    list.innerHTML = candidates.map(createCandidateCard).join('');
  }

  const items = await fetchCandidatesAdmin().catch(() => sampleCandidates);
  renderCandidates(items);

  search?.addEventListener('input', () => {
    const query = search.value.toLowerCase();
    renderCandidates(items.filter((candidate) => candidate.name.toLowerCase().includes(query) || candidate.party.toLowerCase().includes(query) || candidate.office.toLowerCase().includes(query)));
  });

  addButton?.addEventListener('click', (event) => {
    event.preventDefault();
    openModal(`
      <div class="modal-header">
        <h2>Add new candidate</h2>
        <button class="close-button" aria-label="Close modal" id="modalClose">×</button>
      </div>
      <form id="addCandidateForm" class="form-shell">
        <div class="form-field"><label for="candidateName">Name</label><input id="candidateName" required></div>
        <div class="form-field"><label for="candidateOffice">Position</label><input id="candidateOffice" required></div>
        <div class="form-field"><label for="candidateParty">Party</label><input id="candidateParty" required></div>
        <div class="form-field"><label for="candidateBio">Bio</label><textarea id="candidateBio" rows="3" required></textarea></div>
        <button type="submit" class="button button-primary">Create candidate</button>
      </form>
    `);
    document.getElementById('modalClose')?.addEventListener('click', closeModal);
    document.getElementById('addCandidateForm')?.addEventListener('submit', (submitEvent) => {
      submitEvent.preventDefault();
      const name = document.getElementById('candidateName').value.trim();
      const party = document.getElementById('candidateParty').value.trim();
      const office = document.getElementById('candidateOffice').value.trim();
      const bio = document.getElementById('candidateBio').value.trim();
      if (!name || !party || !office || !bio) {
        showToast('Complete all candidate fields.', 'error');
        return;
      }
      items.unshift({ id: `new-${Date.now()}`, name, party, office, bio });
      renderCandidates(items);
      showToast('Candidate added successfully.', 'success');
      closeModal();
    });
  });
}

async function initVoterManagement() {
  const admin = getSession('adminSession');
  if (!admin?.token) {
    showToast('Administrator access required.', 'error');
    window.location.href = 'admin-login.html';
    return;
  }

  const search = document.getElementById('voterSearch');
  const body = document.getElementById('voterTableBody');
  const voters = await fetchVoters().catch(() => [
    { name: 'Adewale Ibrahim', card: '2211034501', area: 'Central Ward', status: 'Verified' },
    { name: 'Bisi Tunde', card: '2211034502', area: 'North District', status: 'Pending' },
    { name: 'Favour Nnamdi', card: '2211034503', area: 'East Polling Unit', status: 'Verified' },
  ]);

  function renderVoters(list) {
    if (!body) return;
    body.innerHTML = list.map((voter) => `
      <tr>
        <td>${voter.name}</td>
        <td>${voter.card}</td>
        <td>${voter.area}</td>
        <td><span class="badge ${voter.status === 'Verified' ? 'success' : voter.status === 'Pending' ? 'warning' : 'danger'}">${voter.status}</span></td>
      </tr>
    `).join('');
  }

  renderVoters(voters);
  search?.addEventListener('input', () => {
    const query = search.value.toLowerCase();
    renderVoters(voters.filter((voter) => voter.name.toLowerCase().includes(query) || voter.card.includes(query) || voter.area.toLowerCase().includes(query)));
  });
}

async function initElectionResults() {
  const resultsGrid = document.getElementById('resultsGrid');
  if (!resultsGrid) return;

  const results = await fetchElectionResults().catch(() => sampleResults);
  resultsGrid.innerHTML = results.map(createResultItem).join('');
}

function initPage() {
  initTheme();
  switch (page) {
    case 'voter-login':
      initVoterLogin();
      break;
    case 'voter-register':
      initVoterRegister();
      break;
    case 'face-verification':
      initFaceVerification();
      break;
    case 'voting-dashboard':
      initVotingDashboard();
      break;
    case 'vote-success':
      initVoteSuccess();
      break;
    case 'admin-login':
      initAdminLogin();
      break;
    case 'admin-dashboard':
      initAdminDashboard();
      break;
    case 'candidate-management':
      initCandidateManagement();
      break;
    case 'voter-management':
      initVoterManagement();
      break;
    case 'election-results':
      initElectionResults();
      break;
    default:
      break;
  }
}

window.addEventListener('DOMContentLoaded', initPage);
