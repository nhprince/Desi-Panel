const selfsigned = require('selfsigned');

function generateSelfSigned(domainName, days = 90) {
  const attrs = [{ name: 'commonName', value: domainName }];
  const extensions = [
    {
      name: 'basicConstraints',
      cA: false,
    },
    {
      name: 'keyUsage',
      keyCertSign: true,
      digitalSignature: true,
      nonRepudiation: true,
      keyEncipherment: true,
      dataEncipherment: true,
    },
    {
      name: 'extKeyUsage',
      serverAuth: true,
      clientAuth: true,
      codeSigning: false,
      timeStamping: false,
    },
    {
      name: 'subjectAltName',
      altNames: [
        { type: 2, value: domainName },
      ],
    },
  ];
  const pems = selfsigned.generate(attrs, {
    algorithm: 'sha256',
    days,
    keySize: 2048,
    extensions,
  });
  const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  return { certPEM: pems.cert, keyPEM: pems.private, expiresAt };
}

module.exports = { generateSelfSigned };
