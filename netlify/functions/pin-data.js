const axios = require('axios');

exports.handler = async function (event) {
  try {
    const result = await axios.post('https://api.pinata.cloud/pinning/pinJSONToIPFS', event.body, {
      headers: {
        'Content-Type': 'application/json',
        pinata_api_key: process.env.PINATA_API_KEY,
        pinata_secret_api_key: process.env.PINATA_SECRET_API_KEY,
      },
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ ipfsCid: result.data.IpfsHash }),
    };
  } catch (error) {
    return {
      statusCode: 404,
      body: error.toString(),
    };
  }
};
