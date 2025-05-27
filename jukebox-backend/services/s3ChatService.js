const AWS = require('aws-sdk');
const loadAwsCredentials = require('./loadAwsCredentials'); // Ensure this exists
let s3 = null;

const bucketName = 'deakinsarul'; // Your fixed bucket name

async function getS3Client() {
  if (!s3) {
    const creds = await loadAwsCredentials();
    s3 = new AWS.S3({
      accessKeyId: creds.accessKeyId,
      secretAccessKey: creds.secretAccessKey,
      region: creds.region
    });
  }
  return s3;
}

// Upload chat messages to S3
async function saveChatToS3(roomName, messages) {
  const s3 = await getS3Client();
  const key = `chats/${roomName}.json`;

  const params = {
    Bucket: bucketName,
    Key: key,
    Body: JSON.stringify(messages, null, 2),
    ContentType: 'application/json'
  };

  return s3.putObject(params).promise()
    .then(() => console.log(`Saved chat for ${roomName} to S3`))
    .catch((err) => console.error(`S3 upload error:`, err));
}

// Retrieve chat messages from S3
async function loadChatFromS3(roomName) {
  const s3 = await getS3Client();
  const key = `chats/${roomName}.json`;

  const params = {
    Bucket: bucketName,
    Key: key
  };

  return s3.getObject(params).promise()
    .then((data) => JSON.parse(data.Body.toString()))
    .catch((err) => {
      if (err.code === 'NoSuchKey') {
        console.warn(`No chat history found for ${roomName}`);
        return [];
      }
      throw err;
    });
}

// Save private chat
async function savePrivateChatToS3(user1, user2, messages) {
  const s3 = await getS3Client();
  const sorted = [user1, user2].sort();
  const key = `private_chats/${sorted[0]}_${sorted[1]}.json`;

  const params = {
    Bucket: bucketName,
    Key: key,
    Body: JSON.stringify(messages, null, 2),
    ContentType: 'application/json'
  };

  return s3.putObject(params).promise()
    .then(() => console.log(`Saved private chat between ${user1} and ${user2} to S3`))
    .catch((err) => console.error(`Private S3 upload error:`, err));
}

// Load private chat
async function loadPrivateChatFromS3(user1, user2) {
  const s3 = await getS3Client();
  const sorted = [user1, user2].sort();
  const key = `private_chats/${sorted[0]}_${sorted[1]}.json`;

  const params = {
    Bucket: bucketName,
    Key: key
  };

  return s3.getObject(params).promise()
    .then((data) => JSON.parse(data.Body.toString()))
    .catch((err) => {
      if (err.code === 'NoSuchKey') {
        console.warn(`No private chat found for ${user1} and ${user2}`);
        return [];
      }
      console.error(`Failed to load private chat:`, err);
      return [];
    });
}

module.exports = {
  saveChatToS3,
  loadChatFromS3,
  savePrivateChatToS3,
  loadPrivateChatFromS3
};
