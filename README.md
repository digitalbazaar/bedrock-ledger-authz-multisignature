# bedrock-ledger-authz-multisignature

[![Build Status](https://ci.digitalbazaar.com/buildStatus/icon?job=bedrock-ledger-authz-multisignature)](https://ci.digitalbazaar.com/job/bedrock-ledger-authz-multisignature)

An authorization subsystem for bedrock-ledger that determines if M of N
digital signatures on a block satisfy the requirements defined in the the
ledger's configuration.

## The Authz-Multisignature API
- isAuthorized(ledgerMeta, block, callback(err, result))

## Configuration
For documentation on configuration, see [config.js](./lib/config.js).

## Usage Example
```javascript
const brMultisignature = require('bedrock-ledger-authz-multisignature');

const ledgerConfig = {
  '@context': 'https://w3id.org/webledger/v1',
  id: 'did:v1:c02915fc-672d-4568-8e6e-b12a0b35cbb3/blocks/1',
  type: 'WebLedgerConfigurationBlock',
  ledger: 'did:v1:c02915fc-672d-4568-8e6e-b12a0b35cbb3',
  consensusMethod: {
    type: 'Continuity2017'
  },
  configurationBlockAuthorizationMethod: {
    type: 'LinkedDataSignature2015',
    approvedSigner: [
      'did:v1:53ebca61-5687-4558-b90a-03167e4c2838'
    ],
    minimumSignaturesRequired: 1
  },
  eventBlockAuthorizationMethod: {
    type: 'LinkedDataSignature2015',
    approvedSigner: [
      'did:v1:53ebca61-5687-4558-b90a-03167e4c2838'
    ],
    minimumSignaturesRequired: 1
  }
};
const signedBlock = {
  "@context": "https://w3id.org/webledger/v1",
  "id": "did:v1:c02915fc-672d-4568-8e6e-b12a0b35cbb3/blocks/2",
  "type": "WebLedgerEventBlock",
  "event": ['ni:///sha-256;249bac6ec5d5f9298fe9d3b5c9d6095dde04df2a52cf485b49e3061af8b0b929'],
  "previousBlock": "did:v1:e7adbe7-79f2-425a-9dfb-76a234782f30/blocks/1",
  "previousBlockHash": "ni:///sha-256;09965dfb512bfd1179eed6c3d03ccf9361d3a310a86ae76f54eac3cca49fc6e7",
  "signature": {
    "type": "LinkedDataSignature2015",
    "created": "2017-06-29T18:18:18Z",
    "creator": "did:v1:53ebca61-5687-4558-b90a-03167e4c2838/keys/1",
    "signatureValue": "EXsPuARfjJ...1/PuekmCz7EQ=="
  }
}

brMultisignature.isAuthorized({ledgerConfig}, signedBlock, (err, result) {
  if(err) {
    throw new Error('An error occurred when authorizing the block: ' + err.message);
  }
  if(!result) {
    console.log('FAIL: The block was not authorized.');
    return;
  }
  console.log('SUCCESS: The block was authorized.');
});
```
