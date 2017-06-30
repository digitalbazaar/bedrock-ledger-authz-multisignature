/*
 * Copyright (c) 2017 Digital Bazaar, Inc. All rights reserved.
 */

'use strict';

const bedrock = require('bedrock');
const async = require('async');
const brMultisignature = require('bedrock-ledger-guard-signature');
const expect = global.chai.expect;
const jsigs = require('jsonld-signatures');
jsigs.use('jsonld', bedrock.jsonld);

const mockData = require('./mock.data');

describe('isAuthorized API', () => {
  describe('event blocks', () => {
    it('authorizes a propery signed block', done => {
      async.auto({
        signBlock: callback => signBlock({
          creator: mockData.authorizedSigners.alpha,
          privateKeyPem: mockData.keys.alpha.privateKey,
          block: mockData.blocks.event.alpha
        }, callback),
        check: ['signBlock', (results, callback) =>
          brMultisignature.isAuthorized({
            ledgerConfig: mockData.ledgers.alpha.config
          }, results.signBlock, (err, result) => {
            expect(err).not.to.be.ok;
            expect(result).to.be.a('boolean');
            result.should.be.true;
            callback();
          })
        ]
      }, done);
    });

    it('authorizes a block that requires two signatures', done => async.auto({
      signBlockOne: callback => signBlock({
        creator: mockData.authorizedSigners.alpha,
        privateKeyPem: mockData.keys.alpha.privateKey,
        block: mockData.blocks.event.beta
      }, callback),
      signBlockTwo: ['signBlockOne', (results, callback) => signBlock({
        creator: mockData.authorizedSigners.beta,
        privateKeyPem: mockData.keys.beta.privateKey,
        block: results.signBlockOne
      }, callback)],
      check: ['signBlockTwo', (results, callback) => {
        brMultisignature.isAuthorized({
          ledgerConfig: mockData.ledgers.beta.config
        }, results.signBlockTwo, (err, result) => {
          expect(err).not.to.be.ok;
          result.should.be.a('boolean');
          result.should.be.true;
          callback();
        });
      }]
    }, done));

    it('authorizes a block when approvedSigners specifies a publicKey', done =>
      async.auto({
        signBlockOne: callback => signBlock({
          creator: mockData.authorizedSigners.alpha,
          privateKeyPem: mockData.keys.alpha.privateKey,
          block: mockData.blocks.event.gamma
        }, callback),
        signBlockTwo: ['signBlockOne', (results, callback) => signBlock({
          creator: mockData.authorizedSigners.beta,
          privateKeyPem: mockData.keys.beta.privateKey,
          block: results.signBlockOne
        }, callback)],
        check: ['signBlockTwo', (results, callback) => {
          brMultisignature.isAuthorized({
            ledgerConfig: mockData.ledgers.gamma.config
          }, results.signBlockTwo, (err, result) => {
            expect(err).not.to.be.ok;
            result.should.be.a('boolean');
            result.should.be.true;
            callback();
          });
        }]
      }, done));

    it('does not authorize block signed twice by same owner', done =>
      async.auto({
        signBlockOne: callback => signBlock({
          creator: mockData.authorizedSigners.alpha,
          privateKeyPem: mockData.keys.alpha.privateKey,
          block: mockData.blocks.event.beta
        }, callback),
        signBlockTwo: ['signBlockOne', (results, callback) => signBlock({
          creator: mockData.authorizedSigners.alpha,
          privateKeyPem: mockData.keys.alpha.privateKey,
          block: results.signBlockOne
        }, callback)],
        check: ['signBlockTwo', (results, callback) => {
          brMultisignature.isAuthorized({
            ledgerConfig: mockData.ledgers.beta.config
          }, results.signBlockTwo, (err, result) => {
            expect(err).not.to.be.ok;
            result.should.be.a('boolean');
            result.should.be.false;
            callback();
          });
        }]
      }, done));

    it('authorizes a block with two valid signatures and one invalid',
      done => async.auto({
        signBlockOne: callback => signBlock({
          creator: mockData.authorizedSigners.alpha,
          privateKeyPem: mockData.keys.alpha.privateKey,
          block: mockData.blocks.event.beta
        }, callback),
        signBlockTwo: ['signBlockOne', (results, callback) => signBlock({
          creator: mockData.authorizedSigners.beta,
          privateKeyPem: mockData.keys.beta.privateKey,
          block: results.signBlockOne
        }, callback)],
        signBlockThree: ['signBlockTwo', (results, callback) => signBlock({
          creator: mockData.authorizedSigners.gamma,
          privateKeyPem: mockData.keys.gamma.privateKey,
          block: results.signBlockTwo
        }, callback)],
        check: ['signBlockThree', (results, callback) => {
          brMultisignature.isAuthorized({
            ledgerConfig: mockData.ledgers.beta.config
          }, results.signBlockThree, (err, result) => {
            expect(err).not.to.be.ok;
            result.should.be.a('boolean');
            result.should.be.true;
            callback();
          });
        }]
      }, done));

    it('does not authorize if the public key cannot be validated', done => {
      async.auto({
        signBlock: callback => signBlock({
          creator: mockData.authorizedSigners.gamma,
          privateKeyPem: mockData.keys.gamma.privateKey,
          block: mockData.blocks.event.alpha
        }, callback),
        check: ['signBlock', (results, callback) =>
          brMultisignature.isAuthorized({
            ledgerConfig: mockData.ledgers.alpha.config
          }, results.signBlock, (err, result) => {
            expect(err).not.to.be.ok;
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
        signBlock: callback => signBlock({
          creator: mockData.authorizedSigners.alpha,
          privateKeyPem: mockData.keys.delta.privateKey,
          block: mockData.blocks.event.alpha
        }, callback),
        check: ['signBlock', (results, callback) =>
          brMultisignature.isAuthorized({
            ledgerConfig: mockData.ledgers.alpha.config
          }, results.signBlock, (err, result) => {
            expect(err).not.to.be.ok;
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
        signBlock: callback => signBlock({
          creator: mockData.authorizedSigners.beta,
          privateKeyPem: mockData.keys.beta.privateKey,
          block: mockData.blocks.event.alpha
        }, callback),
        check: ['signBlock', (results, callback) =>
          brMultisignature.isAuthorized({
            ledgerConfig: mockData.ledgers.alpha.config
          }, results.signBlock, (err, result) => {
            expect(err).not.to.be.ok;
            result.should.be.a('boolean');
            result.should.be.false;
            callback();
          })
        ]
      }, done);
    });
  }); // end event blocks

  describe('configuration blocks', () => {
    it('authorizes a propery signed block', done => {
      async.auto({
        signBlock: callback => signBlock({
          creator: mockData.authorizedSigners.alpha,
          privateKeyPem: mockData.keys.alpha.privateKey,
          block: mockData.blocks.config.alpha
        }, callback),
        check: ['signBlock', (results, callback) =>
          brMultisignature.isAuthorized({
            ledgerConfig: mockData.ledgers.alpha.config
          }, results.signBlock, (err, result) => {
            expect(err).not.to.be.ok;
            expect(result).to.be.a('boolean');
            result.should.be.true;
            callback();
          })
        ]
      }, done);
    });

    it('authorizes a block that requires two signatures', done => async.auto({
      signBlockOne: callback => signBlock({
        creator: mockData.authorizedSigners.alpha,
        privateKeyPem: mockData.keys.alpha.privateKey,
        block: mockData.blocks.config.beta
      }, callback),
      signBlockTwo: ['signBlockOne', (results, callback) => signBlock({
        creator: mockData.authorizedSigners.beta,
        privateKeyPem: mockData.keys.beta.privateKey,
        block: results.signBlockOne
      }, callback)],
      check: ['signBlockTwo', (results, callback) => {
        brMultisignature.isAuthorized({
          ledgerConfig: mockData.ledgers.beta.config
        }, results.signBlockTwo, (err, result) => {
          expect(err).not.to.be.ok;
          result.should.be.a('boolean');
          result.should.be.true;
          callback();
        });
      }]
    }, done));

    it('does not authorize a block with 2 of 3 signatures', done => async.auto({
      signBlockOne: callback => signBlock({
        creator: mockData.authorizedSigners.alpha,
        privateKeyPem: mockData.keys.alpha.privateKey,
        block: mockData.blocks.config.gamma
      }, callback),
      signBlockTwo: ['signBlockOne', (results, callback) => signBlock({
        creator: mockData.authorizedSigners.beta,
        privateKeyPem: mockData.keys.beta.privateKey,
        block: results.signBlockOne
      }, callback)],
      check: ['signBlockTwo', (results, callback) => {
        brMultisignature.isAuthorized({
          ledgerConfig: mockData.ledgers.gamma.config
        }, results.signBlockTwo, (err, result) => {
          expect(err).not.to.be.ok;
          result.should.be.a('boolean');
          result.should.be.false;
          callback();
        });
      }]
    }, done));

    it('authorizes a block with 3 of 3 signatures', done =>
      async.auto({
        signBlockOne: callback => signBlock({
          creator: mockData.authorizedSigners.alpha,
          privateKeyPem: mockData.keys.alpha.privateKey,
          block: mockData.blocks.config.gamma
        }, callback),
        signBlockTwo: ['signBlockOne', (results, callback) => signBlock({
          creator: mockData.authorizedSigners.beta,
          privateKeyPem: mockData.keys.beta.privateKey,
          block: results.signBlockOne
        }, callback)],
        signBlockThree: ['signBlockTwo', (results, callback) => signBlock({
          creator: mockData.authorizedSigners.epsilon,
          privateKeyPem: mockData.keys.epsilon.privateKey,
          block: results.signBlockTwo
        }, callback)],
        check: ['signBlockThree', (results, callback) => {
          brMultisignature.isAuthorized({
            ledgerConfig: mockData.ledgers.gamma.config
          }, results.signBlockThree, (err, result) => {
            expect(err).not.to.be.ok;
            result.should.be.a('boolean');
            result.should.be.true;
            callback();
          });
        }]
      }, done));

    it('does not authorize block signed twice by same owner', done =>
      async.auto({
        signBlockOne: callback => signBlock({
          creator: mockData.authorizedSigners.alpha,
          privateKeyPem: mockData.keys.alpha.privateKey,
          block: mockData.blocks.config.beta
        }, callback),
        signBlockTwo: ['signBlockOne', (results, callback) => signBlock({
          creator: mockData.authorizedSigners.alpha,
          privateKeyPem: mockData.keys.alpha.privateKey,
          block: results.signBlockOne
        }, callback)],
        check: ['signBlockTwo', (results, callback) => {
          brMultisignature.isAuthorized({
            ledgerConfig: mockData.ledgers.beta.config
          }, results.signBlockTwo, (err, result) => {
            expect(err).not.to.be.ok;
            result.should.be.a('boolean');
            result.should.be.false;
            callback();
          });
        }]
      }, done));

    it('authorizes a block with two valid signatures and one invalid',
      done => async.auto({
        signBlockOne: callback => signBlock({
          creator: mockData.authorizedSigners.alpha,
          privateKeyPem: mockData.keys.alpha.privateKey,
          block: mockData.blocks.config.beta
        }, callback),
        signBlockTwo: ['signBlockOne', (results, callback) => signBlock({
          creator: mockData.authorizedSigners.beta,
          privateKeyPem: mockData.keys.beta.privateKey,
          block: results.signBlockOne
        }, callback)],
        signBlockThree: ['signBlockTwo', (results, callback) => signBlock({
          creator: mockData.authorizedSigners.gamma,
          privateKeyPem: mockData.keys.gamma.privateKey,
          block: results.signBlockTwo
        }, callback)],
        check: ['signBlockThree', (results, callback) => {
          brMultisignature.isAuthorized({
            ledgerConfig: mockData.ledgers.beta.config
          }, results.signBlockThree, (err, result) => {
            expect(err).not.to.be.ok;
            result.should.be.a('boolean');
            result.should.be.true;
            callback();
          });
        }]
      }, done));

    it('does not authorize if the public key cannot be validated', done => {
      async.auto({
        signBlock: callback => signBlock({
          creator: mockData.authorizedSigners.gamma,
          privateKeyPem: mockData.keys.gamma.privateKey,
          block: mockData.blocks.config.alpha
        }, callback),
        check: ['signBlock', (results, callback) =>
          brMultisignature.isAuthorized({
            ledgerConfig: mockData.ledgers.alpha.config
          }, results.signBlock, (err, result) => {
            expect(err).not.to.be.ok;
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
        signBlock: callback => signBlock({
          creator: mockData.authorizedSigners.alpha,
          privateKeyPem: mockData.keys.delta.privateKey,
          block: mockData.blocks.config.alpha
        }, callback),
        check: ['signBlock', (results, callback) =>
          brMultisignature.isAuthorized({
            ledgerConfig: mockData.ledgers.alpha.config
          }, results.signBlock, (err, result) => {
            expect(err).not.to.be.ok;
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
        signBlock: callback => signBlock({
          creator: mockData.authorizedSigners.beta,
          privateKeyPem: mockData.keys.beta.privateKey,
          block: mockData.blocks.config.alpha
        }, callback),
        check: ['signBlock', (results, callback) =>
          brMultisignature.isAuthorized({
            ledgerConfig: mockData.ledgers.alpha.config
          }, results.signBlock, (err, result) => {
            expect(err).not.to.be.ok;
            result.should.be.a('boolean');
            result.should.be.false;
            callback();
          })
        ]
      }, done);
    });
  });
});

function signBlock(options, callback) {
  jsigs.sign(options.block, {
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
