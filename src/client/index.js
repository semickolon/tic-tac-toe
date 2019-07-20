const WebSocket = require('ws');
const Prompt = require('../prompt');
const MessageProcessor = require('./messageProcessor');

const ws = new WebSocket('ws://localhost:2323');
const prompt = new Prompt();
const processor = new MessageProcessor(prompt);

ws.onopen = () => {
  prompt.print('Connected! Waiting for other players...');

  ws.onmessage = onMessage;
};

ws.onclose = () => {
  prompt.print('Connection closed');
};

ws.onerror = () => {
  prompt.print('Connection failed');
};

async function onMessage({ data: json }) {
  const message = JSON.parse(json);
  const reply = await processor.consume(message);

  if (reply)
    ws.send(reply);
}