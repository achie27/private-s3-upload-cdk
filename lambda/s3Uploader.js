const { S3 } = require("aws-sdk");
const s3 = new S3();

exports.getPresignedUrl = async function (event) {
  console.log("request:", JSON.stringify(event, undefined, 2));
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(await createPresignedPost()),
  };
};

const createPresignedPost = () => {
  return new Promise((resolve, reject) => {
    s3.createPresignedPost(
      {
        Bucket: process.env.DESTINATION_BUCKET,
        Fields: {
          key: `license-${parseInt(Math.random() * 10000000)}.jpg`,
        },
        Conditions: [["eq", "$Content-Type", "image/jpeg"]],
        Expires: 60 * 10, // 10min
      },
      (err, data) => {
        if (err) return reject(err);
        resolve(data);
      }
    );
  });
};
