require('dotenv').config();

const env_data = {
    BUCKET: process.env.AWS_BUCKET,
    REGION: process.env.AWS_REGION
};

console.log(env_data);

module.exports = {env_data};