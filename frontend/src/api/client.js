const API_BASE = '/api';

function getAuthHeader() {
  const token = localStorage.getItem('lumora_token') || 'lumora-token-demo-alex-student-001';
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
}

async function handleResponse(res) {
  if (!res.ok) {
    let errorDetail = 'API request failed';
    try {
      const errJson = await res.json();
      errorDetail = errJson.detail || errJson.message || errorDetail;
    } catch {
      errorDetail = `Error ${res.status}: ${res.statusText}`;
    }
    throw new Error(errorDetail);
  }
  return res.json();
}

export const api = {
  // Authentication
  login: async (email, password) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return handleResponse(res);
  },

  signup: async (name, email, password) => {
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    return handleResponse(res);
  },

  demoLogin: async () => {
    const res = await fetch(`${API_BASE}/auth/demo-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    return handleResponse(res);
  },

  getMe: async () => {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeader()
    });
    return handleResponse(res);
  },

  // Dashboard
  getDashboard: async () => {
    const res = await fetch(`${API_BASE}/dashboard`, {
      headers: getAuthHeader()
    });
    return handleResponse(res);
  },

  // Tasks
  getTasks: async (category = null, status = null) => {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (status) params.append('status', status);
    const res = await fetch(`${API_BASE}/tasks?${params.toString()}`, {
      headers: getAuthHeader()
    });
    return handleResponse(res);
  },

  createTask: async (taskData) => {
    const res = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(taskData)
    });
    return handleResponse(res);
  },

  updateTask: async (taskId, updates) => {
    const res = await fetch(`${API_BASE}/tasks/${taskId}`, {
      method: 'PUT',
      headers: getAuthHeader(),
      body: JSON.stringify(updates)
    });
    return handleResponse(res);
  },

  deleteTask: async (taskId) => {
    const res = await fetch(`${API_BASE}/tasks/${taskId}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    });
    return handleResponse(res);
  },

  aiParseTask: async (text, preferredDate = null) => {
    const res = await fetch(`${API_BASE}/ai/parse-task`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({ text, preferred_date: preferredDate })
    });
    return handleResponse(res);
  },

  recommendSlots: async ({ estimated_hours, deadline, preferred_date, category }) => {
    const res = await fetch(`${API_BASE}/ai/recommend-slots`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({
        estimated_hours: Number(estimated_hours) || 1.5,
        deadline,
        preferred_date,
        category
      })
    });
    return handleResponse(res);
  },

  // Check-ins
  createCheckin: async (checkinData) => {
    const res = await fetch(`${API_BASE}/checkins`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(checkinData)
    });
    return handleResponse(res);
  },

  getCheckinHistory: async () => {
    const res = await fetch(`${API_BASE}/checkins/history`, {
      headers: getAuthHeader()
    });
    return handleResponse(res);
  },

  // Rebalancing & Demo triggers
  simulateRebalance: async () => {
    const res = await fetch(`${API_BASE}/rebalance/simulate`, {
      method: 'POST',
      headers: getAuthHeader()
    });
    return handleResponse(res);
  },

  applyRebalance: async () => {
    const res = await fetch(`${API_BASE}/rebalance/apply`, {
      method: 'POST',
      headers: getAuthHeader()
    });
    return handleResponse(res);
  },

  declineRebalance: async () => {
    const res = await fetch(`${API_BASE}/rebalance/decline`, {
      method: 'POST',
      headers: getAuthHeader()
    });
    return handleResponse(res);
  },

  triggerDemoOverload: async () => {
    const res = await fetch(`${API_BASE}/rebalance/demo/trigger-overload`, {
      method: 'POST',
      headers: getAuthHeader()
    });
    return handleResponse(res);
  },

  resetDemoBaseline: async () => {
    const res = await fetch(`${API_BASE}/rebalance/demo/reset-baseline`, {
      method: 'POST',
      headers: getAuthHeader()
    });
    return handleResponse(res);
  },

  // Recovery
  getRecoveryRecommendations: async () => {
    const res = await fetch(`${API_BASE}/recovery/recommendations`, {
      headers: getAuthHeader()
    });
    return handleResponse(res);
  },

  startRecovery: async (itemId) => {
    const res = await fetch(`${API_BASE}/recovery/start?item_id=${itemId}`, {
      method: 'POST',
      headers: getAuthHeader()
    });
    return handleResponse(res);
  },

  // What-If
  simulateWhatIf: async (scenario) => {
    const res = await fetch(`${API_BASE}/what-if/simulate`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({ scenario })
    });
    return handleResponse(res);
  }
};
