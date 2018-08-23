/*
 * Copyright (c) 2017-2018 Digital Bazaar, Inc. All rights reserved.
 */

const config = require('bedrock').config;
const path = require('path');

config.mocha.tests.push(path.join(__dirname, 'mocha'));

// MongoDB
// config.mongodb.name = 'bedrock_ledger_guard_signature_test';
// config.mongodb.dropCollections.onInit = true;
// config.mongodb.dropCollections.collections = [];
