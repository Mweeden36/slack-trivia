const { post } = require('axios');

function sendPublicMessage(url, message, attachments = []) {
  return post(url, {
    response_type: 'in_channel',
    text: message,
    attachments: attachments.map(attachment => ({ text: attachment })),
  });
}

function sendPrivateMessage(url, message, attachments) {
  return post(url, {
    response_type: 'ephemeral',
    text: message,
    attachments: attachments.map(attachment => ({ text: attachment })),
  });
}

module.exports = {
  sendPublicMessage,
  sendPrivateMessage,
};
