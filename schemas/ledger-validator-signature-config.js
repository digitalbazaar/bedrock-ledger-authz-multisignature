/*!
 * Copyright (c) 2017-2018 Digital Bazaar, Inc. All rights reserved.
 */
const bedrock = require('bedrock');
const schemas = require('bedrock-validation').schemas;

const schema = {
  title: 'Bedrock Ledger Signature Validator Config',
  required: true,
  type: 'object',
  properties: {
    type: {
      type: 'string',
      enum: ['SignatureValidator2017'],
      required: true
    },
    validatorFilter: {
      title: 'Type Filter',
      type: 'array',
      items: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            required: true
          },
          validatorFilterByType: {
            type: 'array',
            items: {
              type: 'string'
            },
            required: true
          }
        },
        additionalProperties: false
      },
      required: true
    },
    minimumSignaturesRequired: {
      type: 'integer',
      required: true
    },
    approvedSigner: {
      type: 'array',
      items: schemas.url(),
      required: true
    }
  },
  additionalProperties: false
};

module.exports = extend => {
  if(extend) {
    return bedrock.util.extend(true, bedrock.util.clone(schema), extend);
  }
  return schema;
};
