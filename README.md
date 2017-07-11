# bedrock-ledger-guard-signature

[![Build Status](https://ci.digitalbazaar.com/buildStatus/icon?job=bedrock-ledger-guard-signature)](https://ci.digitalbazaar.com/job/bedrock-ledger-guard-signature)

A guard for [bedrock-ledger] that determines if M of N
digital signatures on a document satisfy the requirements defined in the the
ledger's configuration.

## The Ledger Guard Signature API
- isValid(signedDocument, guardConfig, callback(err, result))

## Configuration
For documentation on configuration, see [config.js](./lib/config.js).

## Usage Example
```javascript
const brGuardSignature = require('bedrock-ledger-guard-signature');

const guardConfig = {
  type: 'SignatureGuard2017',
  approvedSigner: [
    'did:v1:53ebca61-5687-4558-b90a-03167e4c2838'
  ],
  minimumSignaturesRequired: 1
};

const signedDocument = {
  "@context": "https://w3id.org/webledger/v1",
  "type": "WebLedgerEvent",
  "operation": "Create",
  "input": [
    {
      "@context": "https://w3id.org/test/v1",
      "id": "https://example.com/events/dd5090e9-13f0-48d1-89a3-af9ffb092fcf",
      "type": "Concert",
      "name": "Big Band Concert in New York City",
      "startDate": "2017-07-14T21:30",
      "location": "https://example.org/the-venue",
      "offers": {
        "type": "Offer",
        "price": "13.00",
        "priceCurrency": "USD",
        "url": "https://example.com/purchase/309433"
      }
    }
  ],
  "signature": {
    "type": "LinkedDataSignature2015",
    "created": "2017-07-10T14:10:24Z",
    "creator": "did:v1:0a02328e-ba9d-43f8-830c-f05105495d66/keys/1",
    "signatureValue": "IyEQBDNGEMt0YMpVQgrn...HF9FZpyDlFw=="
  }
}

brGuardSignature.isValid(signedDocument, guardConfig, (err, result) {
  if(err) {
    throw new Error('An error occurred when validating the document: ' + err.message);
  }
  if(!result) {
    console.log('FAIL: The document was not validated.');
    return;
  }
  console.log('SUCCESS: The document was validated.');
});
```

[bedrock-ledger]: https://github.com/digitalbazaar/bedrock-ledger
