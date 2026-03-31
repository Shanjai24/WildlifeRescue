// Notification utilities (WebSocket stubs — safe for production)
// These are no-op stubs so the import doesn't break the server.
// Replace with real WebSocket (socket.io) implementation when ready.

const clients = new Map(); // userId -> Set of response objects

export function broadcast(data) {
  // Stub: would send to all connected clients via WebSocket
  console.log(`📢 Broadcast: ${data?.type || 'notification'} (${clients.size} clients)`);
}

export function sendToUsers(userIds, data) {
  // Stub: would send to specific users via WebSocket
  console.log(`📨 Notify ${userIds.length} user(s): ${data?.type || 'notification'}`);
}

export default { broadcast, sendToUsers };
