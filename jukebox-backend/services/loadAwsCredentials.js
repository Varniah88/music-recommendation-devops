require('dotenv').config({ path: __dirname + '/../.env' });
const { decrypt } = require('./encryptor');
const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URL;
const client = new MongoClient(uri);
const dbName = 'JUKEBOXDB';

let awsCredentials = null; // cache credentials after first fetch

async function loadAwsCredentials() {
  try {
    if (!client.topology || !client.topology.isConnected()) {
      await client.connect();
    }

    if (awsCredentials) return awsCredentials;

    const db = client.db(dbName);
    const config = await db.collection('app_config').findOne({ _id: 'aws_keys' });

    if (!config) throw new Error('AWS credentials not found in MongoDB');

    awsCredentials = {
      accessKeyId: decrypt(config.aws_access_key_id),
      secretAccessKey: decrypt(config.aws_secret_access_key),
      region: config.region || 'us-east-1'
    };

    return awsCredentials;
  } catch (err) {
    console.error('Error loading AWS credentials:', err.message);
    throw err;
  }
}

module.exports = loadAwsCredentials;
