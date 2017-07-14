/*
 * Copyright (c) 2017 Digital Bazaar, Inc. All rights reserved.
 */
/* globals should */

'use strict';

const bedrock = require('bedrock');
const async = require('async');
const brSignatureGuard = require('bedrock-ledger-guard-signature');
const jsigs = require('jsonld-signatures');
jsigs.use('jsonld', bedrock.jsonld);

const mockData = require('./mock.data');

describe('validateEvent API', () => {
  describe('WebLedgerEvent', () => {
    it('validates a propery signed event', done => {
      async.auto({
        signEvent: callback => signDocument({
          creator: mockData.authorizedSigners.alpha,
          privateKeyPem: mockData.keys.alpha.privateKey,
          doc: mockData.events.alpha
        }, callback),
        check: ['signEvent', (results, callback) =>
          brSignatureGuard.validateEvent(
            results.signEvent,
            mockData.ledgers.alpha.config.input[0].eventValidator[0],
            err => {
              should.not.exist(err);
              callback();
            })
        ]
      }, done);
    });
    it('validates an event that requires two signatures', done => async.auto({
      signEventOne: callback => signDocument({
        creator: mockData.authorizedSigners.alpha,
        privateKeyPem: mockData.keys.alpha.privateKey,
        doc: mockData.events.beta
      }, callback),
      signEventTwo: ['signEventOne', (results, callback) => signDocument({
        creator: mockData.authorizedSigners.beta,
        privateKeyPem: mockData.keys.beta.privateKey,
        doc: results.signEventOne
      }, callback)],
      check: ['signEventTwo', (results, callback) => {
        brSignatureGuard.validateEvent(
          results.signEventTwo,
          mockData.ledgers.beta.config.input[0].eventValidator[0],
          err => {
            should.not.exist(err);
            callback();
          });
      }]
    }, done));
    it('validates an event when approvedSigners specifies a publicKey', done =>
      async.auto({
        signEventOne: callback => signDocument({
          creator: mockData.authorizedSigners.alpha,
          privateKeyPem: mockData.keys.alpha.privateKey,
          doc: mockData.events.gamma
        }, callback),
        signEventTwo: ['signEventOne', (results, callback) => signDocument({
          creator: mockData.authorizedSigners.beta,
          privateKeyPem: mockData.keys.beta.privateKey,
          doc: results.signEventOne
        }, callback)],
        check: ['signEventTwo', (results, callback) => {
          brSignatureGuard.validateEvent(
            results.signEventTwo,
            mockData.ledgers.gamma.config.input[0].eventValidator[0],
            err => {
              should.not.exist(err);
              callback();
            });
        }]
      }, done));
    it('does not validate event signed twice by same owner', done =>
      async.auto({
        signEventOne: callback => signDocument({
          creator: mockData.authorizedSigners.alpha,
          privateKeyPem: mockData.keys.alpha.privateKey,
          doc: mockData.events.beta
        }, callback),
        signEventTwo: ['signEventOne', (results, callback) => signDocument({
          creator: mockData.authorizedSigners.alpha,
          privateKeyPem: mockData.keys.alpha.privateKey,
          doc: results.signEventOne
        }, callback)],
        check: ['signEventTwo', (results, callback) => {
          brSignatureGuard.validateEvent(
            results.signEventTwo,
            mockData.ledgers.beta.config.input[0].eventValidator[0],
            err => {
              should.exist(err);
              const details = err.details;
              details.event.should.be.an('object');
              details.trustedSigners.should.be.an('object');
              details.signatureCount.should.equal(2);
              details.verifiedSignatures.should.equal(1);
              details.minimumSignaturesRequired.should.equal(2);
              details.keyResults.should.be.an('array');
              callback();
            });
        }]
      }, done));

    it('validates an event with two valid signatures and one invalid',
      done => async.auto({
        signEventOne: callback => signDocument({
          creator: mockData.authorizedSigners.alpha,
          privateKeyPem: mockData.keys.alpha.privateKey,
          doc: mockData.events.beta
        }, callback),
        signEventTwo: ['signEventOne', (results, callback) => signDocument({
          creator: mockData.authorizedSigners.beta,
          privateKeyPem: mockData.keys.beta.privateKey,
          doc: results.signEventOne
        }, callback)],
        signEventThree: ['signEventTwo', (results, callback) => signDocument({
          creator: mockData.authorizedSigners.gamma,
          privateKeyPem: mockData.keys.gamma.privateKey,
          doc: results.signEventTwo
        }, callback)],
        check: ['signEventThree', (results, callback) => {
          brSignatureGuard.validateEvent(
            results.signEventThree,
            mockData.ledgers.beta.config.input[0].eventValidator[0],
            err => {
              should.not.exist(err);
              callback();
            });
        }]
      }, done));

    it('does not validate if the public key cannot be validated', done => {
      async.auto({
        signEvent: callback => signDocument({
          creator: mockData.authorizedSigners.gamma,
          privateKeyPem: mockData.keys.gamma.privateKey,
          doc: mockData.events.alpha
        }, callback),
        check: ['signEvent', (results, callback) =>
          brSignatureGuard.validateEvent(
            results.signEvent,
            mockData.ledgers.alpha.config.input[0].eventValidator[0],
            err => {
              should.exist(err);
              const details = err.details;
              details.verifiedSignatures.should.equal(0);
              details.keyResults[0].verified.should.be.false;
              details.keyResults[0].publicKey.should.equal(
                mockData.authorizedSigners.gamma);
              details.keyResults[0].error.should.contain(
                'URL could not be dereferenced');
              callback();
            })
        ]
      }, done);
    });

    // the public key id does not match the private key used to sign the event
    it('returns `ValidationError` if the signature is not valid', done => {
      async.auto({
        signEvent: callback => signDocument({
          creator: mockData.authorizedSigners.alpha,
          // using wrong private key
          privateKeyPem: mockData.keys.delta.privateKey,
          doc: mockData.events.alpha
        }, callback),
        check: ['signEvent', (results, callback) =>
          brSignatureGuard.validateEvent(
            results.signEvent,
            mockData.ledgers.alpha.config.input[0].eventValidator[0],
            err => {
              should.exist(err);
              const details = err.details;
              details.keyResults[0].verified.should.be.false;
              details.keyResults[0].publicKey.should.equal(
                mockData.authorizedSigners.alpha);
              callback();
            })
        ]
      }, done);
    });

    // this event is signed by an owner that is not in `approvedSigner`
    it('does not validate when owner is not an approved signer', done => {
      async.auto({
        signEvent: callback => signDocument({
          creator: mockData.authorizedSigners.beta,
          privateKeyPem: mockData.keys.beta.privateKey,
          doc: mockData.events.alpha
        }, callback),
        check: ['signEvent', (results, callback) =>
          brSignatureGuard.validateEvent(
            results.signEvent,
            mockData.ledgers.alpha.config.input[0].eventValidator[0],
            err => {
              should.exist(err);
              const details = err.details;
              details.keyResults[0].verified.should.be.false;
              details.keyResults[0].error.should.contain('not trusted');
              details.keyResults[0].publicKey.should.equal(
                mockData.authorizedSigners.beta);
              callback();
            })
        ]
      }, done);
    });
  }); // end WebLedgerEvent

  describe('WebLedgerConfigurationEvent', () => {
    it('validates a propery signed event', done => {
      async.auto({
        signEvent: callback => signDocument({
          creator: mockData.authorizedSigners.alpha,
          privateKeyPem: mockData.keys.alpha.privateKey,
          doc: mockData.ledgers.alpha.config
        }, callback),
        check: ['signEvent', (results, callback) =>
          brSignatureGuard.validateEvent(
            results.signEvent,
            mockData.ledgers.alpha.config.input[0].eventValidator[1],
            err => {
              should.not.exist(err);
              callback();
            })
        ]
      }, done);
    });

    it('validates an event that requires two signatures', done => async.auto({
      signEventOne: callback => signDocument({
        creator: mockData.authorizedSigners.alpha,
        privateKeyPem: mockData.keys.alpha.privateKey,
        doc: mockData.ledgers.beta.config
      }, callback),
      signEventTwo: ['signEventOne', (results, callback) => signDocument({
        creator: mockData.authorizedSigners.beta,
        privateKeyPem: mockData.keys.beta.privateKey,
        doc: results.signEventOne
      }, callback)],
      check: ['signEventTwo', (results, callback) =>
        brSignatureGuard.validateEvent(
          results.signEventTwo,
          mockData.ledgers.beta.config.input[0].eventValidator[1],
          err => {
            should.not.exist(err);
            callback();
          })
      ]
    }, done));

    it('does not validate an event with 2/3 signatures', done => async.auto({
      signEventOne: callback => signDocument({
        creator: mockData.authorizedSigners.alpha,
        privateKeyPem: mockData.keys.alpha.privateKey,
        doc: mockData.ledgers.gamma.config
      }, callback),
      signEventTwo: ['signEventOne', (results, callback) => signDocument({
        creator: mockData.authorizedSigners.beta,
        privateKeyPem: mockData.keys.beta.privateKey,
        doc: results.signEventOne
      }, callback)],
      check: ['signEventTwo', (results, callback) =>
        brSignatureGuard.validateEvent(
          results.signEventTwo,
          mockData.ledgers.gamma.config.input[0].eventValidator[1],
          err => {
            should.exist(err);
            const details = err.details;
            details.signatureCount.should.equal(2);
            details.minimumSignaturesRequired.should.equal(3);
            callback();
          })
      ]
    }, done));

    it('validates an event with 3 of 3 signatures', done =>
      async.auto({
        signEventOne: callback => signDocument({
          creator: mockData.authorizedSigners.alpha,
          privateKeyPem: mockData.keys.alpha.privateKey,
          doc: mockData.ledgers.gamma.config
        }, callback),
        signEventTwo: ['signEventOne', (results, callback) => signDocument({
          creator: mockData.authorizedSigners.beta,
          privateKeyPem: mockData.keys.beta.privateKey,
          doc: results.signEventOne
        }, callback)],
        signEventThree: ['signEventTwo', (results, callback) => signDocument({
          creator: mockData.authorizedSigners.epsilon,
          privateKeyPem: mockData.keys.epsilon.privateKey,
          doc: results.signEventTwo
        }, callback)],
        check: ['signEventThree', (results, callback) =>
          brSignatureGuard.validateEvent(
            results.signEventThree,
            mockData.ledgers.gamma.config.input[0].eventValidator[1],
            err => {
              should.not.exist(err);
              callback();
            })
        ]
      }, done));

    it('does not validate event signed twice by same owner', done =>
      async.auto({
        signEventOne: callback => signDocument({
          creator: mockData.authorizedSigners.alpha,
          privateKeyPem: mockData.keys.alpha.privateKey,
          doc: mockData.ledgers.beta.config
        }, callback),
        signEventTwo: ['signEventOne', (results, callback) => signDocument({
          creator: mockData.authorizedSigners.alpha,
          privateKeyPem: mockData.keys.alpha.privateKey,
          doc: results.signEventOne
        }, callback)],
        check: ['signEventTwo', (results, callback) =>
          brSignatureGuard.validateEvent(results.signEventTwo,
            mockData.ledgers.beta.config.input[0].eventValidator[1],
            err => {
              should.exist(err);
              const details = err.details;
              details.event.should.be.an('object');
              details.trustedSigners.should.be.an('object');
              details.signatureCount.should.equal(2);
              details.verifiedSignatures.should.equal(1);
              details.minimumSignaturesRequired.should.equal(2);
              details.keyResults.should.be.an('array');
              callback();
            })
        ]
      }, done));

    it('validates an event with two valid signatures and one invalid',
      done => async.auto({
        signEventOne: callback => signDocument({
          creator: mockData.authorizedSigners.alpha,
          privateKeyPem: mockData.keys.alpha.privateKey,
          doc: mockData.ledgers.beta.config
        }, callback),
        signEventTwo: ['signEventOne', (results, callback) => signDocument({
          creator: mockData.authorizedSigners.beta,
          privateKeyPem: mockData.keys.beta.privateKey,
          doc: results.signEventOne
        }, callback)],
        signEventThree: ['signEventTwo', (results, callback) => signDocument({
          creator: mockData.authorizedSigners.gamma,
          privateKeyPem: mockData.keys.gamma.privateKey,
          doc: results.signEventTwo
        }, callback)],
        check: ['signEventThree', (results, callback) =>
          brSignatureGuard.validateEvent(
            results.signEventThree,
            mockData.ledgers.beta.config.input[0].eventValidator[1],
            err => {
              should.not.exist(err);
              callback();
            })
        ]
      }, done));

    it('does not validate if the public key cannot be validated', done => {
      async.auto({
        signEvent: callback => signDocument({
          creator: mockData.authorizedSigners.gamma,
          privateKeyPem: mockData.keys.gamma.privateKey,
          doc: mockData.ledgers.alpha.config
        }, callback),
        check: ['signEvent', (results, callback) =>
          brSignatureGuard.validateEvent(
            results.signEvent,
            mockData.ledgers.alpha.config.input[0].eventValidator[1],
            err => {
              should.exist(err);
              const details = err.details;
              details.verifiedSignatures.should.equal(0);
              details.keyResults[0].verified.should.be.false;
              details.keyResults[0].publicKey.should.equal(
                mockData.authorizedSigners.gamma);
              details.keyResults[0].error.should.contain(
                'URL could not be dereferenced');
              callback();
            })
        ]
      }, done);
    });

    // the public key id does not match the private key used to sign the event
    it('returns `ValidationError` if the signature is not valid', done => {
      async.auto({
        signEvent: callback => signDocument({
          creator: mockData.authorizedSigners.alpha,
          privateKeyPem: mockData.keys.delta.privateKey,
          doc: mockData.ledgers.alpha.config
        }, callback),
        check: ['signEvent', (results, callback) =>
          brSignatureGuard.validateEvent(
            results.signEvent,
            mockData.ledgers.alpha.config.input[0].eventValidator[1],
            err => {
              should.exist(err);
              const details = err.details;
              details.keyResults[0].verified.should.be.false;
              details.keyResults[0].publicKey.should.equal(
                mockData.authorizedSigners.alpha);
              callback();
            })
        ]
      }, done);
    });

    // this event is signed by an owner that is not in `approvedSigner`
    it('does not validate when owner is not an approved signer', done => {
      async.auto({
        signEvent: callback => signDocument({
          creator: mockData.authorizedSigners.beta,
          privateKeyPem: mockData.keys.beta.privateKey,
          doc: mockData.ledgers.alpha.config
        }, callback),
        check: ['signEvent', (results, callback) =>
          brSignatureGuard.validateEvent(
            results.signEvent,
            mockData.ledgers.alpha.config.input[0].eventValidator[1],
            err => {
              should.exist(err);
              const details = err.details;
              details.keyResults[0].verified.should.be.false;
              details.keyResults[0].error.should.contain('not trusted');
              details.keyResults[0].publicKey.should.equal(
                mockData.authorizedSigners.beta);
              callback();
            })
        ]
      }, done);
    });
  }); // end WebLedgerConfigurationEvent
});

function signDocument(options, callback) {
  jsigs.sign(options.doc, {
    algorithm: 'LinkedDataSignature2015',
    privateKeyPem: options.privateKeyPem,
    creator: options.creator
  }, (err, result) => {
    if(err) {
      return callback(err);
    }
    callback(null, result);
  });
}
