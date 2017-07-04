const mock = {};
module.exports = mock;

const ledgers = mock.ledgers = {};
const blocks = mock.blocks = {};
const events = mock.events = {};
const keys = mock.keys = {};

mock.authorizedSigners = {
  // fully valid signer
  alpha: 'did:v1:53ebca61-5687-4558-b90a-03167e4c2838/keys/1',
  // fully valid signer
  beta: 'did:v1:5627622e-0ab3-479a-bfe7-0f4983a1f7ce/keys/1',
  // there is no DDO for gamma key
  gamma: 'did:v1:777ea7ad-ab68-4039-b85b-a45a795b2d93/keys/1',
  // public/private key mismatch
  delta: 'did:v1:79482a9c-e352-4b50-9d39-5594968bd81d/keys/1',
  // fully valid signer
  epsilon: 'did:v1:324d09e4-07a9-44aa-a89c-c7a9e344316b/keys/1'
};

ledgers.alpha = {
  config: {
    '@context': 'https://w3id.org/webledger/v1',
    type: 'WebLedgerConfigurationEvent',
    operation: 'Config',
    input: [{
      type: 'WebLedgerConfiguration',
      ledger: 'did:v1:c02915fc-672d-4568-8e6e-b12a0b35cbb3',
      consensusMethod: {
        type: 'UnilateralConsensus2017'
      },
      eventGuard: [{
        type: 'SignatureGuard2017',
        supportedEventType: 'WebLedgerEvent',
        approvedSigner: [
          'did:v1:53ebca61-5687-4558-b90a-03167e4c2838'
        ],
        minimumSignaturesRequired: 1
      }, {
        type: 'SignatureGuard2017',
        supportedEventType: 'WebLedgerConfigurationEvent',
        approvedSigner: [
          'did:v1:53ebca61-5687-4558-b90a-03167e4c2838'
        ],
        minimumSignaturesRequired: 1
      }]
    }]
  }
};
ledgers.beta = {
  config: {
    '@context': 'https://w3id.org/webledger/v1',
    type: 'WebLedgerConfigurationEvent',
    operation: 'Config',
    input: [{
      type: 'WebLedgerConfiguration',
      ledger: 'did:v1:3b7cfe17-b493-45e8-906c-0f150d51b227',
      consensusMethod: {
        type: 'UnilateralConsensus2017'
      },
      eventGuard: [{
        type: 'SignatureGuard2017',
        supportedEventType: 'WebLedgerEvent',
        approvedSigner: [
          'did:v1:53ebca61-5687-4558-b90a-03167e4c2838',
          'did:v1:5627622e-0ab3-479a-bfe7-0f4983a1f7ce'
        ],
        minimumSignaturesRequired: 2
      }, {
        type: 'SignatureGuard2017',
        supportedEventType: 'WebLedgerConfigurationEvent',
        approvedSigner: [
          'did:v1:53ebca61-5687-4558-b90a-03167e4c2838',
          'did:v1:5627622e-0ab3-479a-bfe7-0f4983a1f7ce'
        ],
        minimumSignaturesRequired: 2
      }]
    }]
  }
};

// this ledger has approved signer that is a publicKey
// configuration requires 3 signatures
ledgers.gamma = {
  config: {
    '@context': 'https://w3id.org/webledger/v1',
    type: 'WebLedgerConfigurationEvent',
    operation: 'Config',
    input: [{
      type: 'WebLedgerConfiguration',
      ledger: 'did:v1:5ed5a201-26ba-445b-8101-44a9779768b2',
      consensusMethod: {
        type: 'UnilateralConsensus2017'
      },
      eventGuard: [{
        type: 'SignatureGuard2017',
        supportedEventType: 'WebLedgerEvent',
        approvedSigner: [
          'did:v1:53ebca61-5687-4558-b90a-03167e4c2838',
          'did:v1:5627622e-0ab3-479a-bfe7-0f4983a1f7ce/keys/1'
        ],
        minimumSignaturesRequired: 2
      }, {
        type: 'SignatureGuard2017',
        supportedEventType: 'WebLedgerConfigurationEvent',
        approvedSigner: [
          'did:v1:53ebca61-5687-4558-b90a-03167e4c2838',
          'did:v1:5627622e-0ab3-479a-bfe7-0f4983a1f7ce/keys/1',
          'did:v1:324d09e4-07a9-44aa-a89c-c7a9e344316b'
        ],
        minimumSignaturesRequired: 3
      }]
    }]
  }
};

events.alpha = {
  '@context': 'https://w3id.org/webledger/v1',
  type: 'WebLedgerEvent',
  operation: 'Create',
  input: [{
    '@context': 'https://schema.org/',
    value: 'a2035188-372a-4afb-9cf2-7d99baebae88'
  }]
};
events.beta = {
  '@context': 'https://w3id.org/webledger/v1',
  type: 'WebLedgerEvent',
  operation: 'Create',
  input: [{
    '@context': 'https://schema.org/',
    value: '456866ac-dc86-4a62-81ab-6c15554d985c'
  }]
};
events.gamma = {
  '@context': 'https://w3id.org/webledger/v1',
  type: 'WebLedgerEvent',
  operation: 'Create',
  input: [{
    '@context': 'https://schema.org/',
    value: '8bbb6850-4afc-40d0-b8ff-d776844196bd'
  }]
};

keys.alpha = {
  publicKey: '-----BEGIN PUBLIC KEY-----\n' +
    'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAskcRISeoOvgQM8KxMEzP\n' +
    'DMSfcw9NKJRvXNoFnxS0j7DcTPvi0zMXKAY5smANZ1iz9jQ43X/EUDNyjaWkiDUr\n' +
    'lpxGxTFq9D+hUnfzPCW6xAprzZaYhvuHun88CmULWeyWLphISk3/3YhRGnywyUfK\n' +
    'AuYYnKo6F+lDPNyPhknlB2uLblE4upqY5OrvlBdey6PV8teyjVSFo+WSTqzH02ne\n' +
    'X0aaIzZ675BWZyBGK5wCq/6vgCOSBqePflPXY2CfwdMVRe4I3FRnqEsKVQtZ2zwi\n' +
    '5j8YSZKNH4+2SrwuGqG/XcZaKCgKNMNDLRErZkdSPGCLM+OoPUOJEKdCvV3zUZYC\n' +
    'mwIDAQAB\n' +
    '-----END PUBLIC KEY-----',
  privateKey: '-----BEGIN RSA PRIVATE KEY-----\n' +
    'MIIEpQIBAAKCAQEAskcRISeoOvgQM8KxMEzPDMSfcw9NKJRvXNoFnxS0j7DcTPvi\n' +
    '0zMXKAY5smANZ1iz9jQ43X/EUDNyjaWkiDUrlpxGxTFq9D+hUnfzPCW6xAprzZaY\n' +
    'hvuHun88CmULWeyWLphISk3/3YhRGnywyUfKAuYYnKo6F+lDPNyPhknlB2uLblE4\n' +
    'upqY5OrvlBdey6PV8teyjVSFo+WSTqzH02neX0aaIzZ675BWZyBGK5wCq/6vgCOS\n' +
    'BqePflPXY2CfwdMVRe4I3FRnqEsKVQtZ2zwi5j8YSZKNH4+2SrwuGqG/XcZaKCgK\n' +
    'NMNDLRErZkdSPGCLM+OoPUOJEKdCvV3zUZYCmwIDAQABAoIBAQCMdIMhXO4kr2WM\n' +
    'chpJVGpXw91fuDFxBCkMvVRqddSf1JZsLJMTFBBtXyI7z4Mf5fm6wn/+une/PBlH\n' +
    'UbZj/Yf+29bB62I5VpxRreE7hPo1E4TFb51x01+m5jE2e09LJKNZyG5D5FnufkRv\n' +
    'msdpfR7B0+iWHWMxjXyEybxl73f6tEZcsfK/O46rtVsD/e8szyugg6zrrYWX8BA4\n' +
    'sIRHzLvOZIow5eNbkAFfxXbIRLxjxFt2zSFM3a0GjKkU/7Jb8XoNszHc0eFVS79y\n' +
    'PwQDeoqUP7sHLoHqazhFxI1KJftA/9NE6Nw+U/XJvQRyEaJxAGYgXvvRXhVtEN/H\n' +
    '0y4/tbJZAoGBANvph6zmm49ExBXIg5K6JZw/9vM5GdJpmOTglQuLZGYJ9zwcAiqq\n' +
    'U0mVGsJW0uq5VrHyqknc+edBfYD9K76mf0Sn9jG6rLL1fCl8BnLaF21tGVHU2W+Y\n' +
    'ogcYXRkgYgYVl6RhvRqEsMWSEdr0S0z240bOsUB5W1mA601q7PwXfWYPAoGBAM+I\n' +
    'eXxuskg+pCrWjgPke2Rk7PeEXrWPilSMR1ueA5kNCNdAMmxbDqDD7TKmKsyIfEEQ\n' +
    '3VcWLGVY4vj0yW+ptsw+QFlt8PSjCT2z1heJW9AFEA/9ULU0ZpVdgy+ys9/cXSfq\n' +
    'hZC4UQVwL3ODZE+hIU8pEJw1wTEMUvUBlxkOb4a1AoGBAI/6ydWt9lNK1obcjShX\n' +
    'r6ApUOnVjM5yTKQtVegFD2qvQ6ubOt/sPDOE58wtRFJhnh1Ln6pUf1mlSyJUn3tn\n' +
    'TxQIU+wjKEbS6sPOa/puR8BhGZ62GNYzvIGgtfNpfEQ3ht0dEM536bSw+fe80kBF\n' +
    'tG/7i5mG2wQyn9xEEXzLdFKJAoGAQA7rGNp+U0hqmgJyAYeUAtAYSOpl5XryAtjt\n' +
    '6byjdamNUguxxLpykHMJkzmxOkLiv566A3iHqZy/KoM8bigfkXmhmTkTSB/O6WnK\n' +
    'KqeuXE5Dv/u73sLW60HbDW0GkpHNe1Wrdpk+AQS40Nn8q4ub4XhWdTEuebpJHPEp\n' +
    't4U6LYUCgYEAvi38SUMij1zrNMVoslx5VojF961KCY+RNJvv9HmwV/W2XwjF0VGX\n' +
    'luDSMT5bBXHf1kQfB+DJGo2M6it2IOEZQjd9AJdW1baLGwm56AyQNko7HtEczH0n\n' +
    '42EADs/ajTEckTxULdirbEk2rINRwQC5kWMde3fcwAnn6xt3wvOyuwg=\n' +
    '-----END RSA PRIVATE KEY-----'
};
keys.beta = {
  publicKey: '-----BEGIN PUBLIC KEY-----\n' +
    'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA3Keb82mEEcdsocDDGz4V\n' +
    'q4qetnlONh9KMNtyOTIiDmAx+cNUZj2ApJH64Gsz7EfmXGyai/l4NvtlAKXGEEw3\n' +
    'dPJGjiE1DckXisTWIc5uRt+Yih4593LVPcrgWfspmg+UqqvmqsSKGYHrKhZ09Wi1\n' +
    'a+vD+6iaYcqydBnUK6X1m9DFtoCbu5eCaBlIVt4j7OhKHN8XkPFfwwbKms3g+O2U\n' +
    'Pj3atdlmQGuJjd5fjfzrtG32sn6+FPV3+nlJ6kncppR0io4gh05Pv5DeAY3vrJdN\n' +
    'c8az9ph0xLK7p/n5o7RI4g+o0RHiczNqsv/I5YknFmGjqPOnThB9Jfy2ctLvDW5a\n' +
    'bQIDAQAB\n' +
    '-----END PUBLIC KEY-----',
  privateKey: '-----BEGIN RSA PRIVATE KEY-----\n' +
    'MIIEpQIBAAKCAQEA3Keb82mEEcdsocDDGz4Vq4qetnlONh9KMNtyOTIiDmAx+cNU\n' +
    'Zj2ApJH64Gsz7EfmXGyai/l4NvtlAKXGEEw3dPJGjiE1DckXisTWIc5uRt+Yih45\n' +
    '93LVPcrgWfspmg+UqqvmqsSKGYHrKhZ09Wi1a+vD+6iaYcqydBnUK6X1m9DFtoCb\n' +
    'u5eCaBlIVt4j7OhKHN8XkPFfwwbKms3g+O2UPj3atdlmQGuJjd5fjfzrtG32sn6+\n' +
    'FPV3+nlJ6kncppR0io4gh05Pv5DeAY3vrJdNc8az9ph0xLK7p/n5o7RI4g+o0RHi\n' +
    'czNqsv/I5YknFmGjqPOnThB9Jfy2ctLvDW5abQIDAQABAoIBAQCZLCjQAjFR/jPk\n' +
    '3WETKjf0ytd+KBso6vOfktZp6elGPXSzwup1xr/kfgm/e+uhXBAHnMRz4ouW71Cf\n' +
    '8HPboGzm28AqrdacaTnUdOuIsDpRLKpBRtZKdgadTJYNIJMyhRpYl9gaNzD+n/dV\n' +
    'Uh2CtlsqPZHgwpvYwtK6Uau9WQl0TWDYMQdLef//r8btrQZ935UDPn0O77cyrjFH\n' +
    'SpUv8ldDml/0KJEuzXBLwiOTkn+ydBZ4E0xEidSKtBBb3vyhCLbGloWtZzDdv4Ka\n' +
    'OyA2O2JeuSBW9ZMwVd1UHobEobLeMsFufTxuHFhfi2lqp7WeAftnR9oVinZajJto\n' +
    '4BMM6vJBAoGBAO6WKHmKmdMaRqogURVtvrRrq22AnZmZRuekhRVPNQiBoPUw6vw1\n' +
    'txpAVZgCYlwAH0XcsviSizhAk/vMxUCA0jaXFXM21lxr55unCSg/kWeqqO9Afpjl\n' +
    'xL+KuqX5pkvKDqUeoSCCczyF8oTNuaWlxyicIJj9S4mVAzala0z/CWB5AoGBAOzC\n' +
    'Z+o1wWYY0+uIYXqze6JkwS8/5P93p59n4qZDHmPLurYlrw5+ADyydbURR/WbJOYL\n' +
    'Uon8mgc/2fdVlDpe4K+OIYi0aZmOye2iGNwUvGGuzoV5K8waqUHSsz2LDtAiOZSN\n' +
    '81LxkWHvT/QB7Q7Fp2dhwMhZ8yDNeNGOVskufdSVAoGAK5sSJrSoTKb+x1VEvI/k\n' +
    'TQFowYjCRTJ4fRnaoPxrCvT2QBoCuLnwj0G24yN8aqgzDwe5RikyfMOAyIKygomI\n' +
    '4iVW7EnXf+jQ2ef7inmjz7inS6MUAEnuXbuzRWaNeEijyJYCiPiOqz8oBhG7noTg\n' +
    'E5IFezDAP5MWlURCij4KrrECgYEA6s7/ymvXzA8RlkXjD5MUKgGtCtReo/MivliE\n' +
    'k4p7iFQUb/O9wyy5xXjkfliOOorMtI5EJO/uPwRXgxJP+PgB9HqMzYzIMnBH2jLq\n' +
    'XtL95g89aWi8RCeo98wk0gOpBEj9PFTwHrHQEwYKEKEcX4sttL1hOhLjqwO9MG/v\n' +
    'qIVAbGUCgYEAxZ1d/u2QJYSy9Lho9zTpOCgFPY3R9Bju0XK37lqsNxlVxE9OU3uC\n' +
    'X7E1UgvC4FbWSjRzCdsSq7ixkuYXzcHDch0UEX+4mZweKvodtAjFtLAkrGmAH7cC\n' +
    'N/2BNGqcYPn2i/AJqFIrhLHHG+oPl8XCQUr3YOuxlSuAn/Y+nVCd4WE=\n' +
    '-----END RSA PRIVATE KEY-----'
};
keys.gamma = {
  publicKey: '-----BEGIN PUBLIC KEY-----\n' +
    'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAwHsTdLQYH6t7BIi/l2Te\n' +
    'ULf/H9djLr3QuWWURp7IzsTlQ2NuCZE5Hmx8BuCZSFnh/yF4OVF1LHhIVmUGJQ+8\n' +
    'eOtdoQyvSe9LyjMVyfyqyRjgEWP5q2Twp/AZN4pKAt2W5NbzulIo0tncJltIyV2o\n' +
    'TS8In7nbxwLa95zjCKdKvkpbBinrxwtY7F+D1XmMly9OLc+P+vcVVvqNsEpyGkSE\n' +
    'kUs9nvgaMgSKgT5Wo/2ljdJZOTeCus3OYaxPOwcvX9OEo7SrVJnTdKtEo5Bfe3ol\n' +
    'H2VceH3luUdyTMMjRKGILJ8VUF4fx0EXGwG4CyQrkMkaXhmR1tozQRl/kR/mybP/\n' +
    'xwIDAQAB\n' +
    '-----END PUBLIC KEY-----',
  privateKey: '-----BEGIN RSA PRIVATE KEY-----\n' +
    'MIIEowIBAAKCAQEAwHsTdLQYH6t7BIi/l2TeULf/H9djLr3QuWWURp7IzsTlQ2Nu\n' +
    'CZE5Hmx8BuCZSFnh/yF4OVF1LHhIVmUGJQ+8eOtdoQyvSe9LyjMVyfyqyRjgEWP5\n' +
    'q2Twp/AZN4pKAt2W5NbzulIo0tncJltIyV2oTS8In7nbxwLa95zjCKdKvkpbBinr\n' +
    'xwtY7F+D1XmMly9OLc+P+vcVVvqNsEpyGkSEkUs9nvgaMgSKgT5Wo/2ljdJZOTeC\n' +
    'us3OYaxPOwcvX9OEo7SrVJnTdKtEo5Bfe3olH2VceH3luUdyTMMjRKGILJ8VUF4f\n' +
    'x0EXGwG4CyQrkMkaXhmR1tozQRl/kR/mybP/xwIDAQABAoIBAQCt1Xm4yH2Q/JnZ\n' +
    'encuD5cIZ2QuKaQVrrA3ABptvTG2K/Sya7YRRerEI03QGD/XK/YDKQMfIQYl52vN\n' +
    'OufVyOR6gHbK4F3e9BMKxiBDj8HeZGzYx+XQeRUvVpQvqOE2vVFt0wPDnjfoVYGR\n' +
    '0pdl5QP+0R+EwaJPlbCUOEiCpDPIrmL/arzpHZTkYexN4HMF2Vfr5eyBnBZFZT0q\n' +
    'c4ePMsGfvk0rQTQ7e+p8NOLt36gvNSmWSIFxJvy5tZRNkKYH46tdEVZypsWXSd83\n' +
    'PS0M3dLEIrkaqoYYezmgaO+5Y1WLAgqr8QkSJLDgOWkk/z49GXQpsJLxDSGuxNXR\n' +
    'x4+KeF3hAoGBAPjBdMh7flwhqPB+Jxi6S1VexioNRqPSrXEKIdAKMbcb3uh1Qgkw\n' +
    'lq+ZBEV0rrLxgDSyjpReavuXfCgRRF2nnma22ejcEeWSw83PDqXJKDGp2dIrEtgZ\n' +
    't1dPXfRHGypIe3axaddRafCVDiSFEzJlN9iWt8YtvL3lOejy/4FZjtctAoGBAMYW\n' +
    'EwuTi8AcA8k75aTZSlVGssngkpmdGGt9e0UylBrwLDZByJ13xBdSLf6yEvCKGOh+\n' +
    'n44k2T1BhOI0sOW3iu6fIuOIX4xQdWgM59nMSyLWbFMAxvgWjVhxoNYN3GQXjxW+\n' +
    '5I1feuyUMouW6mVVVTe7E/TdNR02MtrFg7bmFctDAoGAC/bB9yJ5YVT9GxP2LWpI\n' +
    'VULJpRweWaK4VMd3+NmEqpncjrGVC3wawzdIzU5fWJvk3qP314ry+ka+4e5yq050\n' +
    'f9wrfteWxMPaRvu+aJrUJA9XOpR3w4z5FGnsyuLgm5gA2CSQQprXzYpds8PyuGnF\n' +
    '1dTp4c4xVbDAqEOHpmD4TcECgYBIl3RZTLPtLhcRGvs4Y00DXUpOAxeWZeS6F50i\n' +
    'Kbvu908sfwUW9/oLldk3OmkIb4NbSHQOcmCOO0GIaEjflli6w+TUP3jMgfvUqs4Y\n' +
    'me57ENtXu7Qu3Izl+ZY4e5HluGB+VpuJV5FDu7eeQisaAaCeMNfKZ3p8fw058SIo\n' +
    '177q4wKBgBT5PM5LOeuEE2RjjWNjZjHN6pztCoXF1EhilZk/vIEoQpQBpsQRrxzl\n' +
    'LRL0ScLS0TEMtIfKoshNsYdVz6+EYVYkU4E/k/MqGD8hLX12tCEKAOjVhOkGkMHS\n' +
    'gSQRmrM9jgxutpwAQBZ0rWQlzwkp60T3OTPqsAvrt1COzdWCMmCN\n' +
    '-----END RSA PRIVATE KEY-----'
};
// delta: the public and private keys do not match
keys.delta = {
  publicKey: '-----BEGIN PUBLIC KEY-----\n' +
    'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA3Keb82mEEcdsocDDGz4V\n' +
    'q4qetnlONh9KMNtyOTIiDmAx+cNUZj2ApJH64Gsz7EfmXGyai/l4NvtlAKXGEEw3\n' +
    'dPJGjiE1DckXisTWIc5uRt+Yih4593LVPcrgWfspmg+UqqvmqsSKGYHrKhZ09Wi1\n' +
    'a+vD+6iaYcqydBnUK6X1m9DFtoCbu5eCaBlIVt4j7OhKHN8XkPFfwwbKms3g+O2U\n' +
    'Pj3atdlmQGuJjd5fjfzrtG32sn6+FPV3+nlJ6kncppR0io4gh05Pv5DeAY3vrJdN\n' +
    'c8az9ph0xLK7p/n5o7RI4g+o0RHiczNqsv/I5YknFmGjqPOnThB9Jfy2ctLvDW5a\n' +
    'bQIDAQAB\n' +
    '-----END PUBLIC KEY-----',
  privateKey: '-----BEGIN RSA PRIVATE KEY-----\n' +
    'MIIEowIBAAKCAQEAwHsTdLQYH6t7BIi/l2TeULf/H9djLr3QuWWURp7IzsTlQ2Nu\n' +
    'CZE5Hmx8BuCZSFnh/yF4OVF1LHhIVmUGJQ+8eOtdoQyvSe9LyjMVyfyqyRjgEWP5\n' +
    'q2Twp/AZN4pKAt2W5NbzulIo0tncJltIyV2oTS8In7nbxwLa95zjCKdKvkpbBinr\n' +
    'xwtY7F+D1XmMly9OLc+P+vcVVvqNsEpyGkSEkUs9nvgaMgSKgT5Wo/2ljdJZOTeC\n' +
    'us3OYaxPOwcvX9OEo7SrVJnTdKtEo5Bfe3olH2VceH3luUdyTMMjRKGILJ8VUF4f\n' +
    'x0EXGwG4CyQrkMkaXhmR1tozQRl/kR/mybP/xwIDAQABAoIBAQCt1Xm4yH2Q/JnZ\n' +
    'encuD5cIZ2QuKaQVrrA3ABptvTG2K/Sya7YRRerEI03QGD/XK/YDKQMfIQYl52vN\n' +
    'OufVyOR6gHbK4F3e9BMKxiBDj8HeZGzYx+XQeRUvVpQvqOE2vVFt0wPDnjfoVYGR\n' +
    '0pdl5QP+0R+EwaJPlbCUOEiCpDPIrmL/arzpHZTkYexN4HMF2Vfr5eyBnBZFZT0q\n' +
    'c4ePMsGfvk0rQTQ7e+p8NOLt36gvNSmWSIFxJvy5tZRNkKYH46tdEVZypsWXSd83\n' +
    'PS0M3dLEIrkaqoYYezmgaO+5Y1WLAgqr8QkSJLDgOWkk/z49GXQpsJLxDSGuxNXR\n' +
    'x4+KeF3hAoGBAPjBdMh7flwhqPB+Jxi6S1VexioNRqPSrXEKIdAKMbcb3uh1Qgkw\n' +
    'lq+ZBEV0rrLxgDSyjpReavuXfCgRRF2nnma22ejcEeWSw83PDqXJKDGp2dIrEtgZ\n' +
    't1dPXfRHGypIe3axaddRafCVDiSFEzJlN9iWt8YtvL3lOejy/4FZjtctAoGBAMYW\n' +
    'EwuTi8AcA8k75aTZSlVGssngkpmdGGt9e0UylBrwLDZByJ13xBdSLf6yEvCKGOh+\n' +
    'n44k2T1BhOI0sOW3iu6fIuOIX4xQdWgM59nMSyLWbFMAxvgWjVhxoNYN3GQXjxW+\n' +
    '5I1feuyUMouW6mVVVTe7E/TdNR02MtrFg7bmFctDAoGAC/bB9yJ5YVT9GxP2LWpI\n' +
    'VULJpRweWaK4VMd3+NmEqpncjrGVC3wawzdIzU5fWJvk3qP314ry+ka+4e5yq050\n' +
    'f9wrfteWxMPaRvu+aJrUJA9XOpR3w4z5FGnsyuLgm5gA2CSQQprXzYpds8PyuGnF\n' +
    '1dTp4c4xVbDAqEOHpmD4TcECgYBIl3RZTLPtLhcRGvs4Y00DXUpOAxeWZeS6F50i\n' +
    'Kbvu908sfwUW9/oLldk3OmkIb4NbSHQOcmCOO0GIaEjflli6w+TUP3jMgfvUqs4Y\n' +
    'me57ENtXu7Qu3Izl+ZY4e5HluGB+VpuJV5FDu7eeQisaAaCeMNfKZ3p8fw058SIo\n' +
    '177q4wKBgBT5PM5LOeuEE2RjjWNjZjHN6pztCoXF1EhilZk/vIEoQpQBpsQRrxzl\n' +
    'LRL0ScLS0TEMtIfKoshNsYdVz6+EYVYkU4E/k/MqGD8hLX12tCEKAOjVhOkGkMHS\n' +
    'gSQRmrM9jgxutpwAQBZ0rWQlzwkp60T3OTPqsAvrt1COzdWCMmCN\n' +
    '-----END RSA PRIVATE KEY-----'
};
// epsilon: valid keypair
keys.epsilon = {
  publicKey: '-----BEGIN PUBLIC KEY-----\n' +
    'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAwIjS6bkpr+xR/+JCL0KF\n' +
    '24ZOHEmX/4ASBhSfKh0vGb5plKFuAOumNj5y/CzdgkqenhtcbrMunHuzPqYdTUJB\n' +
    'NXDqpVzXh7bZDHDjFcHgHcU8xxCvchL9EDKyFP39JJG9/sTr6SEkKz8OH48lZoFh\n' +
    'GsXvsYTCMKJRZ0+vECTvEb2gd6OGhXwQqPk402Kk0hMq/5LjceUaxDfcBDJ8WYim\n' +
    'BWy9YO+xeEu3nFrPk2I1aMFDdD6vHO7l7P6tMAY/U+H1wrsDPuv3A/stalSHjZyh\n' +
    'DaBD1ZoEtAk03kOSvwLQb2LI3kAwYqoNApNsLVI+U9HsP/UuKk2/3kZS8Oa70b97\n' +
    'RwIDAQAB\n' +
    '-----END PUBLIC KEY-----',
  privateKey: '-----BEGIN RSA PRIVATE KEY-----\n' +
    'MIIEogIBAAKCAQEAwIjS6bkpr+xR/+JCL0KF24ZOHEmX/4ASBhSfKh0vGb5plKFu\n' +
    'AOumNj5y/CzdgkqenhtcbrMunHuzPqYdTUJBNXDqpVzXh7bZDHDjFcHgHcU8xxCv\n' +
    'chL9EDKyFP39JJG9/sTr6SEkKz8OH48lZoFhGsXvsYTCMKJRZ0+vECTvEb2gd6OG\n' +
    'hXwQqPk402Kk0hMq/5LjceUaxDfcBDJ8WYimBWy9YO+xeEu3nFrPk2I1aMFDdD6v\n' +
    'HO7l7P6tMAY/U+H1wrsDPuv3A/stalSHjZyhDaBD1ZoEtAk03kOSvwLQb2LI3kAw\n' +
    'YqoNApNsLVI+U9HsP/UuKk2/3kZS8Oa70b97RwIDAQABAoIBADJKCr0drjPTSD/L\n' +
    '+3mYqJoEZJai6l7ENvD7pe88HDdfMvitiawX4Rw+B46ysVD86J1njCcmCkC5VsJA\n' +
    'ZVruuVWaHs/+hhVevyauvcHLGBzujcd5Jjpnl04Jz9YH2X0ZzESlbvE/xNC+8ZNw\n' +
    'slYp6REzLj5x7L8DRrvzZkiTPRamuiDQrxr6d27TWPZIAwfPYuoy/OMx9hMgZyKk\n' +
    'pxsAvMmVRyy2NZK428oU5rwF/mWsURS05oWyBqicgaeWlqJ9swnak1OnF5z0N196\n' +
    'fU4bVHjtyAMS/DCNI+4qjpg7G+PPUfK4RXtJ/0AC0ZRDu35khXeI5u1U3F5Ks6ms\n' +
    'XUTQDhECgYEA/gltTiKTlZhGxx9K1P5DQ+ZFHns+NsonbBS1i9Io6dFK0QfS4xOa\n' +
    'TjP1nOKFIlB1TS2kqOylkxbS/Jf1bzSOk/rwIFfDnE0q4zIfiGEnlmnqefmJ4Qac\n' +
    'LXsfwTQ4WiHuQcqOMlM3PgWm8r1zhPQaY2yFXzgCBpsD82cLcaPa8R0CgYEAwgW5\n' +
    'US/UBB+j8OLyjeDgZvhvIfsgL8hREaS3U+Uk72ei+UT2XhjdV4mVyiQ3N5cTHyXC\n' +
    'vkamozmp90zHSnAyjDq+GNt04A1n3nz45VKNlstG/NfrqP5QCfCjEwiJfuclD2+q\n' +
    'VRrpbHbWBJ9B/8e+andl5rixNoI72n44n/k7NLMCgYB/6HM20kYJHoEUpXbiQ5vO\n' +
    'xlSrAlbS83ph+xNl8U1UXWMUWKIgX7BkC9lxQsTSADzvvTmZLH45z1YwhLq5YXcg\n' +
    'n0rkngwJ2PjtKEGkQ3bRT0cWX0TDHrboV4QnnYl6KHd0fO6X/DpmaiYjNqzBlr7q\n' +
    'rKuCxAqRFOAqYAntEBmfKQKBgDjYNnhL3AEtR/nudAQPa4+fn+fDzKVTOjVCHhgt\n' +
    'XYnqwjvn8YqWHFtmSwWDYM4frBGHHaxjxLSz01FKJGVxw82D9GgR/Accxl7QHJgL\n' +
    'fMI+Ylj35eqIP+j5oL2V1brhe+Eu5Se0D8mgc4m9IzgOTIKi4q8bU4hV1bVpH6v2\n' +
    '+FqzAoGAHM2v90bEbN/TNFv7OODWeK7HBRKBNigMVktXBpfCAFOm+cSfMlsoQTr3\n' +
    '4xiV0oxUFjPHA6qt0hGsk7/0P1Pe15Kg5n6+w2JzFpN5ix7DWus57PBKbMUkE64y\n' +
    'KBFLr5ANLqWLaVrSw5Uep1s5VvXyOrltUN/1SUoCoNZuM/FakRc=\n' +
    '-----END RSA PRIVATE KEY-----'
};

mock.ldDocuments = {};

// alpha
mock.ldDocuments['did:v1:53ebca61-5687-4558-b90a-03167e4c2838'] = {
  "@context": "https://w3id.org/identity/v1",
  "id": "did:v1:53ebca61-5687-4558-b90a-03167e4c2838",
  "publicKey": [{
    "id": 'did:v1:53ebca61-5687-4558-b90a-03167e4c2838/keys/1',
    "type": "CryptographicKey",
    "owner": "did:v1:53ebca61-5687-4558-b90a-03167e4c2838",
    "publicKeyPem": keys.alpha.publicKey
  }]
};
mock.ldDocuments['did:v1:53ebca61-5687-4558-b90a-03167e4c2838/keys/1'] = {
  "@context": "https://w3id.org/identity/v1",
  "type": "CryptographicKey",
  "owner": "did:v1:53ebca61-5687-4558-b90a-03167e4c2838",
  "label": "Signing Key 1",
  "id": 'did:v1:53ebca61-5687-4558-b90a-03167e4c2838/keys/1',
  "publicKeyPem": keys.alpha.publicKey
};

// beta
mock.ldDocuments['did:v1:5627622e-0ab3-479a-bfe7-0f4983a1f7ce'] = {
  "@context": "https://w3id.org/identity/v1",
  "id": "did:v1:5627622e-0ab3-479a-bfe7-0f4983a1f7ce",
  "publicKey": [{
    "id": 'did:v1:5627622e-0ab3-479a-bfe7-0f4983a1f7ce/keys/1',
    "type": "CryptographicKey",
    "owner": "did:v1:5627622e-0ab3-479a-bfe7-0f4983a1f7ce",
    "publicKeyPem": keys.beta.publicKey
  }]
};
mock.ldDocuments['did:v1:5627622e-0ab3-479a-bfe7-0f4983a1f7ce/keys/1'] = {
  "@context": "https://w3id.org/identity/v1",
  "type": "CryptographicKey",
  "owner": "did:v1:5627622e-0ab3-479a-bfe7-0f4983a1f7ce",
  "label": "Signing Key 1",
  "id": 'did:v1:5627622e-0ab3-479a-bfe7-0f4983a1f7ce/keys/1',
  "publicKeyPem": keys.beta.publicKey
};

// delta
mock.ldDocuments['did:v1:79482a9c-e352-4b50-9d39-5594968bd81d'] = {
  "@context": "https://w3id.org/identity/v1",
  "id": "did:v1:79482a9c-e352-4b50-9d39-5594968bd81d",
  "publicKey": [{
    "id": 'did:v1:79482a9c-e352-4b50-9d39-5594968bd81d/keys/1',
    "type": "CryptographicKey",
    "owner": "did:v1:79482a9c-e352-4b50-9d39-5594968bd81d",
    "publicKeyPem": keys.delta.publicKey
  }]
};
mock.ldDocuments['did:v1:79482a9c-e352-4b50-9d39-5594968bd81d/keys/1'] = {
  "@context": "https://w3id.org/identity/v1",
  "type": "CryptographicKey",
  "owner": "did:v1:79482a9c-e352-4b50-9d39-5594968bd81d",
  "label": "Signing Key 1",
  "id": 'did:v1:79482a9c-e352-4b50-9d39-5594968bd81d/keys/1',
  "publicKeyPem": keys.delta.publicKey
};

// epsilon
mock.ldDocuments['did:v1:324d09e4-07a9-44aa-a89c-c7a9e344316b'] = {
  "@context": "https://w3id.org/identity/v1",
  "id": "did:v1:324d09e4-07a9-44aa-a89c-c7a9e344316b",
  "publicKey": [{
    "id": 'did:v1:324d09e4-07a9-44aa-a89c-c7a9e344316b/keys/1',
    "type": "CryptographicKey",
    "owner": "did:v1:324d09e4-07a9-44aa-a89c-c7a9e344316b",
    "publicKeyPem": keys.epsilon.publicKey
  }]
};
mock.ldDocuments['did:v1:324d09e4-07a9-44aa-a89c-c7a9e344316b/keys/1'] = {
  "@context": "https://w3id.org/identity/v1",
  "type": "CryptographicKey",
  "owner": "did:v1:324d09e4-07a9-44aa-a89c-c7a9e344316b",
  "label": "Signing Key 1",
  "id": 'did:v1:324d09e4-07a9-44aa-a89c-c7a9e344316b/keys/1',
  "publicKeyPem": keys.epsilon.publicKey
};

const bedrock = require('bedrock');
const config = bedrock.config;
const jsonld = bedrock.jsonld;
const oldLoader = jsonld.documentLoader;
jsonld.documentLoader = function(url, callback) {
  if(Object.keys(mock.ldDocuments).includes(url)) {
    return callback(null, {
      contextUrl: null,
      document: mock.ldDocuments[url],
      documentUrl: url
    });
  }
  const regex = new RegExp(
    config['did-client']['authorization-io'].didBaseUrl + '/(.*?)$');
  const didMatch = url.match(regex);
  if(didMatch && didMatch.length === 2 && didMatch[1] in mock.ldDocuments) {
    return callback(null, {
      contextUrl: null,
      document: mock.ldDocuments[didMatch[1]],
      documentUrl: url
    });
  }
  oldLoader(url, callback);
};
