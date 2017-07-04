/*
 * Copyright (c) 2017 Digital Bazaar, Inc. All rights reserved.
 */
/* globals should */

'use strict';

const bedrock = require('bedrock');
const async = require('async');
const brSignatureGuard = require('bedrock-ledger-guard-signature');
const expect = global.chai.expect;
const jsigs = require('jsonld-signatures');
jsigs.use('jsonld', bedrock.jsonld);

const mockData = require('./mock.data');

describe('isValid API', () => {
  describe('WebLedgerEvent', () => {
    it('validates a propery signed event', done => {
      async.auto({
        signEvent: callback => signDocument({
          creator: mockData.authorizedSigners.alpha,
          privateKeyPem: mockData.keys.alpha.privateKey,
          doc: mockData.events.alpha
        }, callback),
        check: ['signEvent', (results, callback) => brSignatureGuard.isValid(
          results.signEvent,
          mockData.ledgers.alpha.config.input[0].eventGuard[0],
          (err, result) => {
            should.not.exist(err);
            expect(result).to.be.a('boolean');
            result.should.be.true;
            callback();
          })
        ]
      }, done);
    });

    it('authorizes a block that requires two signatures', done => async.auto({
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
        brSignatureGuard.isValid(
          results.signEventTwo,
          mockData.ledgers.beta.config.input[0].eventGuard[0],
          (err, result) => {
            should.not.exist(err);
            result.should.be.a('boolean');
            result.should.be.true;
            callback();
          });
      }]
    }, done));

    it('authorizes a block when approvedSigners specifies a publicKey', done =>
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
          brSignatureGuard.isValid(
            results.signEventTwo,
            mockData.ledgers.gamma.config.input[0].eventGuard[0],
            (err, result) => {
              should.not.exist(err);
              result.should.be.a('boolean');
              result.should.be.true;
              callback();
            });
        }]
      }, done));

    it('does not authorize block signed twice by same owner', done =>
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
          brSignatureGuard.isValid(
            results.signEventTwo,
            mockData.ledgers.beta.config.input[0].eventGuard[0],
            (err, result) => {
              should.not.exist(err);
              result.should.be.a('boolean');
              result.should.be.false;
              callback();
            });
        }]
      }, done));

    it('authorizes a block with two valid signatures and one invalid',
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
          brSignatureGuard.isValid(
            results.signEventThree,
            mockData.ledgers.beta.config.input[0].eventGuard[0],
            (err, result) => {
              should.not.exist(err);
              result.should.be.a('boolean');
              result.should.be.true;
              callback();
            });
        }]
      }, done));

    it('does not authorize if the public key cannot be validated', done => {
      async.auto({
        signEvent: callback => signDocument({
          creator: mockData.authorizedSigners.gamma,
          privateKeyPem: mockData.keys.gamma.privateKey,
          doc: mockData.events.alpha
        }, callback),
        check: ['signEvent', (results, callback) => brSignatureGuard.isValid(
          results.signEvent,
          mockData.ledgers.alpha.config.input[0].eventGuard[0],
          (err, result) => {
            should.not.exist(err);
            result.should.be.a('boolean');
            result.should.be.false;
            callback();
          })
        ]
      }, done);
    });

    // the public key id does not match the private key used to sign the block
    it('returns `false` if the signature is not valid', done => {
      async.auto({
        signEvent: callback => signDocument({
          creator: mockData.authorizedSigners.alpha,
          privateKeyPem: mockData.keys.delta.privateKey,
          doc: mockData.events.alpha
        }, callback),
        check: ['signEvent', (results, callback) => brSignatureGuard.isValid(
          results.signEvent,
          mockData.ledgers.alpha.config.input[0].eventGuard[0],
          (err, result) => {
            should.not.exist(err);
            result.should.be.a('boolean');
            result.should.be.false;
            callback();
          })
        ]
      }, done);
    });

    // this block is signed by an owner that is not in `approvedSigner`
    it('does not authorize when owner is not an approved signer', done => {
      async.auto({
        signEvent: callback => signDocument({
          creator: mockData.authorizedSigners.beta,
          privateKeyPem: mockData.keys.beta.privateKey,
          doc: mockData.events.alpha
        }, callback),
        check: ['signEvent', (results, callback) => brSignatureGuard.isValid(
          results.signEvent,
          mockData.ledgers.alpha.config.input[0].eventGuard[0],
          (err, result) => {
            should.not.exist(err);
            result.should.be.a('boolean');
            result.should.be.false;
            callback();
          })
        ]
      }, done);
    });
  }); // end event blocks

  describe('WebLedgerConfigurationEvent', () => {
    it('authorizes a propery signed event', done => {
      async.auto({
        signEvent: callback => signDocument({
          creator: mockData.authorizedSigners.alpha,
          privateKeyPem: mockData.keys.alpha.privateKey,
          doc: mockData.ledgers.alpha.config
        }, callback),
        check: ['signEvent', (results, callback) => brSignatureGuard.isValid(
          results.signEvent,
          mockData.ledgers.alpha.config.input[0].eventGuard[1],
          (err, result) => {
            should.not.exist(err);
            expect(result).to.be.a('boolean');
            result.should.be.true;
            callback();
          })
        ]
      }, done);
    });

    it('authorizes a block that requires two signatures', done => async.auto({
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
      check: ['signEventTwo', (results, callback) => brSignatureGuard.isValid(
        results.signEventTwo,
        mockData.ledgers.beta.config.input[0].eventGuard[1],
        (err, result) => {
          should.not.exist(err);
          result.should.be.a('boolean');
          result.should.be.true;
          callback();
        })
      ]
    }, done));

    it('does not authorize a block with 2 of 3 signatures', done => async.auto({
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
      check: ['signEventTwo', (results, callback) => brSignatureGuard.isValid(
        results.signEventTwo,
        mockData.ledgers.gamma.config.input[0].eventGuard[1],
        (err, result) => {
          should.not.exist(err);
          result.should.be.a('boolean');
          result.should.be.false;
          callback();
        })
      ]
    }, done));

    it('authorizes a block with 3 of 3 signatures', done =>
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
          brSignatureGuard.isValid(
            results.signEventThree,
            mockData.ledgers.gamma.config.input[0].eventGuard[1],
            (err, result) => {
              should.not.exist(err);
              result.should.be.a('boolean');
              result.should.be.true;
              callback();
            })
        ]
      }, done));

    it('does not authorize block signed twice by same owner', done =>
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
          brSignatureGuard.isValid(results.signEventTwo,
            mockData.ledgers.beta.config.input[0].eventGuard[1],
            (err, result) => {
              should.not.exist(err);
              result.should.be.a('boolean');
              result.should.be.false;
              callback();
            })
        ]
      }, done));

    it('authorizes a block with two valid signatures and one invalid',
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
          brSignatureGuard.isValid(
            results.signEventThree,
            mockData.ledgers.beta.config.input[0].eventGuard[1],
            (err, result) => {
              should.not.exist(err);
              result.should.be.a('boolean');
              result.should.be.true;
              callback();
            })
        ]
      }, done));

    it('does not authorize if the public key cannot be validated', done => {
      async.auto({
        signEvent: callback => signDocument({
          creator: mockData.authorizedSigners.gamma,
          privateKeyPem: mockData.keys.gamma.privateKey,
          doc: mockData.ledgers.alpha.config
        }, callback),
        check: ['signEvent', (results, callback) =>
          brSignatureGuard.isValid(
            results.signEvent,
            mockData.ledgers.alpha.config.input[0].eventGuard[1],
            (err, result) => {
              should.not.exist(err);
              result.should.be.a('boolean');
              result.should.be.false;
              callback();
            })
        ]
      }, done);
    });

    // the public key id does not match the private key used to sign the block
    it('returns `false` if the signature is not valid', done => {
      async.auto({
        signEvent: callback => signDocument({
          creator: mockData.authorizedSigners.alpha,
          privateKeyPem: mockData.keys.delta.privateKey,
          doc: mockData.ledgers.alpha.config
        }, callback),
        check: ['signEvent', (results, callback) =>
          brSignatureGuard.isValid(
            results.signEvent,
            mockData.ledgers.alpha.config.input[0].eventGuard[1],
            (err, result) => {
              should.not.exist(err);
              result.should.be.a('boolean');
              result.should.be.false;
              callback();
            })
        ]
      }, done);
    });

    // this block is signed by an owner that is not in `approvedSigner`
    it('does not authorize when owner is not an approved signer', done => {
      async.auto({
        signEvent: callback => signDocument({
          creator: mockData.authorizedSigners.beta,
          privateKeyPem: mockData.keys.beta.privateKey,
          doc: mockData.ledgers.alpha.config
        }, callback),
        check: ['signEvent', (results, callback) =>
          brSignatureGuard.isValid(
            results.signEvent,
            mockData.ledgers.alpha.config.input[0].eventGuard[1],
            (err, result) => {
              should.not.exist(err);
              result.should.be.a('boolean');
              result.should.be.false;
              callback();
            })
        ]
      }, done);
    });
  });
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
