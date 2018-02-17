# bedrock-ledger-validator-signature

[![Build Status](https://ci.digitalbazaar.com/buildStatus/icon?job=bedrock-ledger-validator-signature)](https://ci.digitalbazaar.com/job/bedrock-ledger-validator-signature)

A validator for [bedrock-ledger] that determines if M of N
digital signatures on a document satisfy the requirements defined in the the
ledger's configuration.

## The Validator API
- validateConfiguration(validatorConfig, callback(err))
- validate(signedDocument, validatorConfig, callback(err))
- mustValidate(signedDocument, validatorConfig, callback(err, result))

## Configuration
For documentation on configuration, see [config.js](./lib/config.js).

## Usage Example
```javascript
const brValidator = require('bedrock-ledger-validator-signature');

const validatorConfig = {
  type: 'SignatureValidator2017',
  validatorFilter: [{
    type: 'ValidatorFilterByType',
    validatorFilterByType: ['CreateWebLedgerRecord']
  }],
  approvedSigner: [
    'did:v1:53ebca61-5687-4558-b90a-03167e4c2838'
    'did:v1:be0d2a4a-583f-4a8b-98c8-73bdf046bfd1/keys/1'
  ],
  minimumSignaturesRequired: 1
};

const signedDocument = {
  "@context": "https://w3id.org/webledger/v1",
  "type": "CreateWebLedgerRecord",
  "record": {
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
  },
  "proof": {
    "type": "RsaSignature2018",
    "created": "2017-07-10T14:10:24Z",
    "creator": "did:v1:be0d2a4a-583f-4a8b-98c8-73bdf046bfd1/keys/1",
    "jws": "IyEQBDNGEMt0YMpVQgrn...HF9FZpyDlFw=="
  }
};

// when ledgers are created, or configuration changes are made, state
// machines should validate the validator configuration using the
// `validateConfiguration` API
brValidator.validateConfiguration(validatorConfig, err => {
  if(err) {
    throw new Error('An error occurred when validating the configuration: ' + err.message);
  }
  console.log('SUCCESS: The configuration was validated.');
});

// state machines use the `mustValidate` API to determine if this
// validator is designed to operate on a particular document
brValidator.mustValidate(signedDocument, validatorConfig, (err, result) => {
  if(err) {
    throw new Error('An error occurred: ' + err.message);
  }
  if(!result) {
    console.log('The `validate` API should NOT be used for this document.');
  }
  console.log('The `validate` API should be used for this document.');
});

// if the `mustValidate` API returns true, then state machines should
// call the `validate` API for the event
brValidator.validate(signedDocument, validatorConfig, err => {
  if(err) {
    throw new Error('An error occurred when validating the document: ' + err.message);
  }
  console.log('SUCCESS: The document was validated.');
});
```

[bedrock-ledger]: https://github.com/digitalbazaar/bedrock-ledger
