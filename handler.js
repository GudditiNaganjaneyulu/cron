'use strict';

const AWS = require('aws-sdk');
const { Client } = require('pg');  // Import PostgreSQL client

const secretsManager = new AWS.SecretsManager();

module.exports.hello = async (event) => {
  try {
    // Retrieve the secret name and key from environment variables
    const secretName = process.env.SECRET_NAME;
    const pgUrlKey = process.env.PG_URL_KEY;

    console.log('Fetching secret:', secretName);

    // Retrieve the secret from Secrets Manager
    const secret = await secretsManager.getSecretValue({ SecretId: secretName }).promise();

    let secretString;
    if (secret.SecretString) {
      secretString = secret.SecretString;
    } else {
      const buff = Buffer.from(secret.SecretBinary, 'base64');
      secretString = buff.toString('ascii');
    }

    // Parse the secret string to get the PostgreSQL URL
    const secretValues = JSON.parse(secretString);
    const connectionString = secretValues[pgUrlKey];  // Use the key (pg_url) to get the URL

    // Create PostgreSQL client with SSL enabled
    const client = new Client({
      connectionString: connectionString,
      ssl: {
        rejectUnauthorized: false  // Allow self-signed certificates or use the proper SSL cert
      },
    });

    // Connect to the database
    await client.connect();
    console.log('Connection successful!');

    // Query to fetch dummy user list
    const res = await client.query('SELECT * FROM users');
    const userList = res.rows;

    // Close the connection after use
    await client.end();

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Connected to PostgreSQL successfully!',
        users: userList,  // Returning dummy user list
      }),
    };
  } catch (error) {
    console.error('Error connecting to database:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to connect to database.', error: error.message }),
    };
  }
};
