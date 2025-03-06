import WebSocket from 'ws';

const ws = new WebSocket('ws://localhost:3000'); // Connect to your WebSocket server

ws.on('open', () => {
  console.log('✅ Connected to WebSocket server');

  // Send a test message to the server
  ws.send(JSON.stringify({message: 'Hello from test client!'}));
});

ws.on('message', (data) => {
  console.log('📩 Received from server:', data.toString());
});

ws.on('close', () => {
  console.log('❌ WebSocket connection closed');
});

ws.on('error', (error) => {
  console.error('⚠️ WebSocket error:', error);
});
