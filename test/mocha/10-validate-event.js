/*
 * Copyright (c) 2017-2018 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const bedrock = require('bedrock');
const async = require('async');
const brValidator = require('bedrock-ledger-validator-signature');
const jsigs = require('jsonld-signatures');
jsigs.use('jsonld', bedrock.jsonld);

const mockData = require('./mock.data');

describe('validate API', () => {
  describe('operationValidator', () => {
    it('validates a properly signed operation', done => {
      async.auto({
        sign: callback => signDocument({
          creator: mockData.authorizedSigners.alpha,
          privateKeyPem: mockData.keys.alpha.privateKey,
          doc: mockData.operations.alpha
        }, callback),
        check: ['sign', (results, callback) =>
          brValidator.validate(
            results.sign,
            mockData.ledgerConfigurations.alpha.operationValidator[0],
            err => {
              assertNoError(err);
              callback();
            })
        ]
      }, done);
    });
    it('validates an operation that requires two signatures', done =>
      async.auto({
        signOne: callback => signDocument({
          creator: mockData.authorizedSigners.alpha,
          privateKeyPem: mockData.keys.alpha.privateKey,
          doc: mockData.operations.beta
        }, callback),
        signTwo: ['signOne', (results, callback) => signDocument({
          creator: mockData.authorizedSigners.beta,
          privateKeyPem: mockData.keys.beta.privateKey,
          doc: results.signOne
        }, callback)],
        check: ['signTwo', (results, callback) => {
          brValidator.validate(
            results.signTwo,
            mockData.ledgerConfigurations.beta.operationValidator[0],
            err => {
              assertNoError(err);
              callback();
            });
        }]
      }, done));
    it('validates an operation when approvedSigners specifies a publicKey', done =>
      async.auto({
        signOne: callback => signDocument({
          creator: mockData.authorizedSigners.alpha,
          privateKeyPem: mockData.keys.alpha.privateKey,
          doc: mockData.operations.gamma
        }, callback),
        signTwo: ['signOne', (results, callback) => signDocument({
          creator: mockData.authorizedSigners.beta,
          privateKeyPem: mockData.keys.beta.privateKey,
          doc: results.signOne
        }, callback)],
        check: ['signTwo', (results, callback) => {
          brValidator.validate(
            results.signTwo,
            mockData.ledgerConfigurations.gamma.operationValidator[0],
            err => {
              assertNoError(err);
              callback();
            });
        }]
      }, done));
    it('does not validate operation signed twice by same owner', done =>
      async.auto({
        signOne: callback => signDocument({
          creator: mockData.authorizedSigners.alpha,
          privateKeyPem: mockData.keys.alpha.privateKey,
          doc: mockData.operations.beta
        }, callback),
        signTwo: ['signOne', (results, callback) => signDocument({
          creator: mockData.authorizedSigners.alpha,
          privateKeyPem: mockData.keys.alpha.privateKey,
          doc: results.signOne
        }, callback)],
        check: ['signTwo', (results, callback) => {
          brValidator.validate(
            results.signTwo,
            mockData.ledgerConfigurations.beta.operationValidator[0],
            err => {
              should.exist(err);
              const details = err.details;
              details.input.should.be.an('object');
              details.trustedSigners.should.be.an('object');
              details.signatureCount.should.equal(2);
              details.verifiedSignatures.should.equal(1);
              details.minimumSignaturesRequired.should.equal(2);
              details.keyResults.should.be.an('array');
              callback();
            });
        }]
      }, done));

    it('validates an operation with two valid signatures and one invalid',
      done => async.auto({
        signOne: callback => signDocument({
          creator: mockData.authorizedSigners.alpha,
          privateKeyPem: mockData.keys.alpha.privateKey,
          doc: mockData.operations.beta
        }, callback),
        signTwo: ['signOne', (results, callback) => signDocument({
          creator: mockData.authorizedSigners.beta,
          privateKeyPem: mockData.keys.beta.privateKey,
          doc: results.signOne
        }, callback)],
        signThree: ['signTwo', (results, callback) => signDocument({
          creator: mockData.authorizedSigners.gamma,
          privateKeyPem: mockData.keys.gamma.privateKey,
          doc: results.signTwo
        }, callback)],
        check: ['signThree', (results, callback) => {
          brValidator.validate(
            results.signThree,
            mockData.ledgerConfigurations.beta.operationValidator[0],
            err => {
              assertNoError(err);
              callback();
            });
        }]
      }, done));

    it('does not validate if the public key cannot be validated', done => {
      async.auto({
        sign: callback => signDocument({
          creator: mockData.authorizedSigners.gamma,
          privateKeyPem: mockData.keys.gamma.privateKey,
          doc: mockData.operations.alpha
        }, callback),
        check: ['sign', (results, callback) =>
          brValidator.validate(
            results.sign,
            mockData.ledgerConfigurations.alpha.operationValidator[0],
            err => {
              should.exist(err);
              const details = err.details;
              details.verifiedSignatures.should.equal(0);
              details.keyResults[0].verified.should.be.false;
              details.keyResults[0].publicKey.should.equal(
                mockData.authorizedSigners.gamma);
              details.keyResults[0].error.name.should.contain(
                'jsonld.LoadDocumentError');
              callback();
            })
        ]
      }, done);
    });

    // the public key id does not match the private key used to sign
    it('returns `ValidationError` if the signature is not valid', done => {
      async.auto({
        sign: callback => signDocument({
          creator: mockData.authorizedSigners.alpha,
          // using wrong private key
          privateKeyPem: mockData.keys.delta.privateKey,
          doc: mockData.operations.alpha
        }, callback),
        check: ['sign', (results, callback) =>
          brValidator.validate(
            results.sign,
            mockData.ledgerConfigurations.alpha.operationValidator[0],
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

    // this operation is signed by an owner that is not in `approvedSigner`
    it('does not validate when owner is not an approved signer', done => {
      async.auto({
        sign: callback => signDocument({
          creator: mockData.authorizedSigners.beta,
          privateKeyPem: mockData.keys.beta.privateKey,
          doc: mockData.operations.alpha
        }, callback),
        check: ['sign', (results, callback) =>
          brValidator.validate(
            results.sign,
            mockData.ledgerConfigurations.alpha.operationValidator[0],
            err => {
              should.exist(err);
              const details = err.details;
              details.verifiedSignatures.should.equal(0);
              details.keyResults[0].publicKey.should.equal(
                mockData.authorizedSigners.beta);
              callback();
            })
        ]
      }, done);
    });
  }); // end operationValidator

  describe('ledgerConfigurationValidator', () => {
    it('validates a properly signed ledgerConfiguration', done => {
      async.auto({
        sign: callback => signDocument({
          creator: mockData.authorizedSigners.alpha,
          privateKeyPem: mockData.keys.alpha.privateKey,
          doc: mockData.ledgerConfigurations.alpha
        }, callback),
        check: ['sign', (results, callback) =>
          brValidator.validate(
            results.sign,
            mockData.ledgerConfigurations.alpha
              .ledgerConfigurationValidator[0],
            err => {
              assertNoError(err);
              callback();
            })
        ]
      }, done);
    });
    // epsilon has two valid key pairs
    it('signer with multiple keys may sign using any owned key', done => {
      async.auto({
        sign: callback => signDocument({
          creator: mockData.authorizedSigners.epsilon_1,
          privateKeyPem: mockData.keys.epsilon_1.privateKey,
          doc: mockData.ledgerConfigurations.delta
        }, callback),
        check: ['sign', (results, callback) =>
          brValidator.validate(
            results.sign,
            mockData.ledgerConfigurations.delta
              .ledgerConfigurationValidator[0],
            err => {
              assertNoError(err);
              callback();
            })
        ],
        sign2: ['check', (results, callback) => signDocument({
          creator: mockData.authorizedSigners.epsilon_2,
          privateKeyPem: mockData.keys.epsilon_2.privateKey,
          doc: mockData.ledgerConfigurations.delta
        }, callback)],
        check2: ['sign2', (results, callback) =>
          brValidator.validate(
            results.sign2,
            mockData.ledgerConfigurations.delta.ledgerConfigurationValidator[0],
            err => {
              assertNoError(err);
              callback();
            })
        ]
      }, done);
    });

    it('validates a ledgerConfiguration that requires two signatures', done =>
      async.auto({
        signOne: callback => signDocument({
          creator: mockData.authorizedSigners.alpha,
          privateKeyPem: mockData.keys.alpha.privateKey,
          doc: mockData.ledgerConfigurations.beta
        }, callback),
        signTwo: ['signOne', (results, callback) => signDocument({
          creator: mockData.authorizedSigners.beta,
          privateKeyPem: mockData.keys.beta.privateKey,
          doc: results.signOne
        }, callback)],
        check: ['signTwo', (results, callback) => {
          brValidator.validate(
            results.signTwo,
            mockData.ledgerConfigurations.beta.ledgerConfigurationValidator[0],
            err => {
              assertNoError(err);
              callback();
            });
        }]
      }, done));

    it('does not validate a ledgerConfiguration with 2/3 signatures', done =>
      async.auto({
        signOne: callback => signDocument({
          creator: mockData.authorizedSigners.alpha,
          privateKeyPem: mockData.keys.alpha.privateKey,
          doc: mockData.ledgerConfigurations.gamma
        }, callback),
        signTwo: ['signOne', (results, callback) => signDocument({
          creator: mockData.authorizedSigners.beta,
          privateKeyPem: mockData.keys.beta.privateKey,
          doc: results.signOne
        }, callback)],
        check: ['signTwo', (results, callback) =>
          brValidator.validate(
            results.signTwo,
            mockData.ledgerConfigurations.gamma.ledgerConfigurationValidator[0],
            err => {
              should.exist(err);
              const details = err.details;
              details.signatureCount.should.equal(2);
              details.minimumSignaturesRequired.should.equal(3);
              callback();
            })
        ]
      }, done));

    it('validates a ledgerConfiguration with 3 of 3 signatures', done =>
      async.auto({
        signOne: callback => signDocument({
          creator: mockData.authorizedSigners.alpha,
          privateKeyPem: mockData.keys.alpha.privateKey,
          doc: mockData.ledgerConfigurations.gamma
        }, callback),
        signTwo: ['signOne', (results, callback) => signDocument({
          creator: mockData.authorizedSigners.beta,
          privateKeyPem: mockData.keys.beta.privateKey,
          doc: results.signOne
        }, callback)],
        signThree: ['signTwo', (results, callback) => signDocument({
          creator: mockData.authorizedSigners.epsilon_2,
          privateKeyPem: mockData.keys.epsilon_2.privateKey,
          doc: results.signTwo
        }, callback)],
        check: ['signThree', (results, callback) =>
          brValidator.validate(
            results.signThree,
            mockData.ledgerConfigurations.gamma.ledgerConfigurationValidator[0],
            err => {
              assertNoError(err);
              callback();
            })
        ]
      }, done));

    it('does not validate ledgerConfiguration signed twice by same owner',
      done => async.auto({
        signOne: callback => signDocument({
          creator: mockData.authorizedSigners.alpha,
          privateKeyPem: mockData.keys.alpha.privateKey,
          doc: mockData.ledgerConfigurations.beta
        }, callback),
        signTwo: ['signOne', (results, callback) => signDocument({
          creator: mockData.authorizedSigners.alpha,
          privateKeyPem: mockData.keys.alpha.privateKey,
          doc: results.signOne
        }, callback)],
        check: ['signTwo', (results, callback) =>
          brValidator.validate(results.signTwo,
            mockData.ledgerConfigurations.beta.ledgerConfigurationValidator[0],
            err => {
              should.exist(err);
              const details = err.details;
              details.input.should.be.an('object');
              details.trustedSigners.should.be.an('object');
              details.signatureCount.should.equal(2);
              details.verifiedSignatures.should.equal(1);
              details.minimumSignaturesRequired.should.equal(2);
              details.keyResults.should.be.an('array');
              callback();
            })
        ]
      }, done));

    it('does not validate ledgerConfiguration signed twice by owner ' +
      'w/multiple keys', done =>
      async.auto({
        signOne: callback => signDocument({
          creator: mockData.authorizedSigners.epsilon_1,
          privateKeyPem: mockData.keys.epsilon_1.privateKey,
          doc: mockData.ledgerConfigurations.epsilon
        }, callback),
        signTwo: ['signOne', (results, callback) => signDocument({
          creator: mockData.authorizedSigners.epsilon_2,
          privateKeyPem: mockData.keys.epsilon_2.privateKey,
          doc: results.signOne
        }, callback)],
        check: ['signTwo', (results, callback) =>
          brValidator.validate(
            results.signTwo,
            mockData.ledgerConfigurations.epsilon
              .ledgerConfigurationValidator[0],
            err => {
              should.exist(err);
              const details = err.details;
              details.input.should.be.an('object');
              details.trustedSigners.should.be.an('object');
              details.signatureCount.should.equal(2);
              details.verifiedSignatures.should.equal(1);
              details.minimumSignaturesRequired.should.equal(2);
              details.keyResults.should.be.an('array');
              const keyResults = details.keyResults;
              // shows that both the signatures provided by epsilon are valid
              keyResults.filter(k => k.verified).map(k => k.publicKey)
                .should.have.same.members([
                  mockData.authorizedSigners.epsilon_1,
                  mockData.authorizedSigners.epsilon_2
                ]);
              callback();
            })
        ]
      }, done));

    it('validates a ledgerConfiguration with two valid signatures and ' +
      'one invalid',
      done => async.auto({
        signOne: callback => signDocument({
          creator: mockData.authorizedSigners.alpha,
          privateKeyPem: mockData.keys.alpha.privateKey,
          doc: mockData.ledgerConfigurations.beta
        }, callback),
        signTwo: ['signOne', (results, callback) => signDocument({
          creator: mockData.authorizedSigners.beta,
          privateKeyPem: mockData.keys.beta.privateKey,
          doc: results.signOne
        }, callback)],
        signThree: ['signTwo', (results, callback) => signDocument({
          creator: mockData.authorizedSigners.gamma,
          privateKeyPem: mockData.keys.gamma.privateKey,
          doc: results.signTwo
        }, callback)],
        check: ['signThree', (results, callback) =>
          brValidator.validate(
            results.signThree,
            mockData.ledgerConfigurations.beta.ledgerConfigurationValidator[0],
            err => {
              assertNoError(err);
              callback();
            })
        ]
      }, done));

    it('does not validate if the public key cannot be validated', done => {
      async.auto({
        sign: callback => signDocument({
          creator: mockData.authorizedSigners.gamma,
          privateKeyPem: mockData.keys.gamma.privateKey,
          doc: mockData.ledgerConfigurations.alpha
        }, callback),
        check: ['sign', (results, callback) =>
          brValidator.validate(
            results.sign,
            mockData.ledgerConfigurations.alpha.ledgerConfigurationValidator[0],
            err => {
              should.exist(err);
              const details = err.details;
              details.verifiedSignatures.should.equal(0);
              details.keyResults[0].verified.should.be.false;
              details.keyResults[0].publicKey.should.equal(
                mockData.authorizedSigners.gamma);
              details.keyResults[0].error.name.should.contain(
                'jsonld.LoadDocumentError');
              callback();
            })
        ]
      }, done);
    });

    // the public key id does not match the private key used to sign
    it('returns `ValidationError` if the signature is not valid', done => {
      async.auto({
        sign: callback => signDocument({
          creator: mockData.authorizedSigners.alpha,
          privateKeyPem: mockData.keys.delta.privateKey,
          doc: mockData.ledgerConfigurations.alpha
        }, callback),
        check: ['sign', (results, callback) =>
          brValidator.validate(
            results.sign,
            mockData.ledgerConfigurations.alpha.ledgerConfigurationValidator[0],
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

    // this config is signed by an owner that is not in `approvedSigner`
    it('does not validate when owner is not an approved signer', done => {
      async.auto({
        sign: callback => signDocument({
          creator: mockData.authorizedSigners.beta,
          privateKeyPem: mockData.keys.beta.privateKey,
          doc: mockData.ledgerConfigurations.alpha
        }, callback),
        check: ['sign', (results, callback) =>
          brValidator.validate(
            results.sign,
            mockData.ledgerConfigurations.alpha.ledgerConfigurationValidator[0],
            err => {
              should.exist(err);
              const details = err.details;
              details.verifiedSignatures.should.equal(0);
              details.keyResults[0].publicKey.should.equal(
                mockData.authorizedSigners.beta);
              callback();
            })
        ]
      }, done);
    });
  }); // end ledgerConfigurationValidator
});

function signDocument(options, callback) {
  jsigs.sign(options.doc, {
    algorithm: 'RsaSignature2018',
    privateKeyPem: options.privateKeyPem,
    creator: options.creator
  }, (err, result) => {
    if(err) {
      return callback(err);
    }
    callback(null, result);
  });
}
