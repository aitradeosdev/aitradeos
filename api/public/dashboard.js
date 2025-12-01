let startTime = Date.now();

async function checkEndpoint(path, elementId) {
  try {
    const response = await fetch(path);
    const element = document.getElementById(elementId);
    if (response.ok) {
      element.className = 'endpoint-status online';
      return true;
    } else {
      element.className = 'endpoint-status offline';
      return false;
    }
  } catch (error) {
    document.getElementById(elementId).className = 'endpoint-status offline';
    return false;
  }
}

async function updateStatus() {
  const healthCheck = await checkEndpoint('/api/health', 'status-health');
  
  // Update main status cards
  const apiCard = document.getElementById('api-status');
  const apiText = document.getElementById('api-status-text');
  const dbText = document.getElementById('db-status-text');
  const dbCard = document.getElementById('db-status');
  
  if (healthCheck) {
    apiCard.className = 'status-card online';
    apiText.textContent = 'Online & Running';
    
    // Get health data for DB status
    try {
      const healthResponse = await fetch('/api/health');
      const healthData = await healthResponse.json();
      if (healthData.dbConnected) {
        dbCard.className = 'status-card online';
        dbText.textContent = 'Connected';
      } else {
        dbCard.className = 'status-card offline';
        dbText.textContent = 'Disconnected';
      }
    } catch (e) {
      dbCard.className = 'status-card offline';
      dbText.textContent = 'Unknown';
    }
  } else {
    apiCard.className = 'status-card offline';
    apiText.textContent = 'Offline';
    dbCard.className = 'status-card offline';
    dbText.textContent = 'Unknown';
  }
  
  // Check other endpoints (these will likely fail without auth, but we check connectivity)
  await checkEndpoint('/api/auth/verify-token', 'status-auth');
  await checkEndpoint('/api/user/statistics', 'status-history');
  
  // Analysis endpoint check (will return 400 but that means it's working)
  try {
    await fetch('/api/analysis/chart', { method: 'POST' });
    document.getElementById('status-analysis').className = 'endpoint-status online';
  } catch {
    document.getElementById('status-analysis').className = 'endpoint-status offline';
  }
  
  // Update uptime
  const uptime = Math.floor((Date.now() - startTime) / 1000);
  const hours = Math.floor(uptime / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = uptime % 60;
  document.getElementById('uptime-text').textContent = `${hours}h ${minutes}m ${seconds}s`;
  
  // Update last updated time
  document.getElementById('last-updated').textContent = new Date().toLocaleTimeString();
}

// Initial check
updateStatus();

// Update every 10 seconds
setInterval(updateStatus, 10000);

// Update uptime every second
setInterval(() => {
  const uptime = Math.floor((Date.now() - startTime) / 1000);
  const hours = Math.floor(uptime / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = uptime % 60;
  document.getElementById('uptime-text').textContent = `${hours}h ${minutes}m ${seconds}s`;
}, 1000);