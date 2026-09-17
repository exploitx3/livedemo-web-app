import { Buffer } from 'buffer'

const BLOCK_SIZE = 256
const CIPHER_BLOCK_SIZE = 512

/*
Get some key material to use as input to the deriveKey method.
The key material is a password supplied by the user.
*/
export function getKeyMaterial(passphrase) {

  const enc = new TextEncoder()
  return window.crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  )
}

/*
Create RSA_OAEP keypair.
*/
export function getRSAKeys() {
  return window.crypto.subtle.generateKey(
    {
      name: 'RSA-OAEP',
      modulusLength: 4096, //can be 1024, 2048, or 4096
      publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
      hash: { name: 'SHA-512' }, //can be "SHA-1", "SHA-256", "SHA-384", or "SHA-512"
    },
    true, //whether the key is extractable (i.e. can be used in exportKey)
    ['encrypt', 'decrypt'] //must be ["encrypt", "decrypt"] or ["wrapKey", "unwrapKey"]
  )
}

/*
Given some key material and some random salt
derive an AES-GCM key using PBKDF2.
*/
export function getWrappingKey(keyMaterial, salt) {
  return window.crypto.subtle.deriveKey(
    {
      'name': 'PBKDF2',
      salt: salt,
      'iterations': 100000,
      'hash': 'SHA-512'
    },
    keyMaterial,
    { 'name': 'AES-GCM', 'length': 256 },
    true,
    ['wrapKey', 'unwrapKey']
  )
}

/*
Wrap the given key.
*/
export function wrapCryptoKey(keyToWrap, wrappingKey, iv) {

  // const salt = window.crypto.getRandomValues(new Uint8Array(16))
  // iv = window.crypto.getRandomValues(new Uint8Array(12))

  return window.crypto.subtle.wrapKey(
    'pkcs8',
    keyToWrap,
    wrappingKey,
    {
      name: 'AES-GCM',
      iv: iv
    }
  )

}


export function unwrapCryptoKey(wrappedKey, unwrappingKey, iv) {

  return window.crypto.subtle.unwrapKey(
    'pkcs8',
    wrappedKey,
    unwrappingKey,
    {
      name: 'AES-GCM',
      iv: iv
    },
    {
      name: 'RSA-OAEP',
      modulusLength: 4096, //can be 1024, 2048, or 4096
      publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
      hash: { name: 'SHA-512' }, //can be "SHA-1", "SHA-256", "SHA-384", or "SHA-512"
    },
    true,
    ['decrypt']
  )

}

/**
 * @return {string}
 */
export function BufferArrayToBase64(bufferArray) {
  let btoa = (str) => new Buffer(str, 'binary').toString('base64')

  return btoa(String.fromCharCode(...new Uint8Array(bufferArray)))
}

export function Base64ToUint8Array(base64String) {

  // console.log(new Buffer(base64String, 'base64'))
  // console.log(new Buffer(base64String, 'base64').toString('binary'))
  // console.log(Uint8Array.from(new Buffer(base64String, 'base64').toString('binary')))
  return new Buffer(base64String, 'base64');

  // return Uint8Array.from(atob(base64String), c => c.charCodeAt(0))
}

export function Base64DecodeUnicode(str) {
  // Going backwards: from bytestream, to percent-encoding, to original string.
  return decodeURIComponent(atob(str).split('').map(function(c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));
}

function createArray(length) {
  return new Uint8Array(length)
}

function copyArray(sourceArray, targetArray, targetStart, sourceStart, sourceEnd) {
  if (sourceStart != null || sourceEnd != null) {
    if (sourceArray.slice) {
      sourceArray = sourceArray.slice(sourceStart, sourceEnd)
    } else {
      sourceArray = Array.prototype.slice.call(sourceArray, sourceStart, sourceEnd)
    }
  }
  targetArray.set(sourceArray, targetStart)
}

function getXORNoncefromCipherBlock(cipherBlock, isEven) {
  let xorBytesArr = []
  let isEvenCheckEqual = isEven ? 0 : 1
  for (let i = 0; i < cipherBlock.length; i++) {
    if (i % 2 === isEvenCheckEqual) {
      xorBytesArr.push(cipherBlock[i])
    }
  }

  return xorBytesArr
}

export function decrypt(privateKeyBuffer, dataBase64, decoder = new TextDecoder()) {
  if (!privateKeyBuffer) {
    throw new Error('Private Key is required')
  }

  let IV = 'XdiixjSXoAl4Ug4nAmSk2bGW8c8PNE7fhinPt6fCDrbKNycUGsBHEgPJBiEPR5+rcWKNBql2coTfx7EJHziKXBlQtyaJ1x9WNcePxhQtrdb56dz073A0Viwh89aXFL7+AoKgF2bOzVvDi0h4xxeYkQoFINrQNQjPynoKrRBSsj0w+WKC0qrlYtpaLsd7lCD/DJHcPgUNcxpqI2MJEbV4cYQ2Ocb02iHmwVgJfFTlJ+tUgsMMxQ0W1zuignl1OolguYfQIF54CFGXTGEjupiQWl986BRng37ph9fNzVVopfzFSeMWwKYMJca701G9kTspCVynS7C9h7FPuBmfpldudA=='

  return decryptCBC(privateKeyBuffer, dataBase64, IV, decoder)

}

export function decryptCBC(privateKeyBuffer, dataBase64, ivBase64, decoder = new TextDecoder()) {

  let plainTextArr = []
  let dataBuffer = Base64ToUint8Array(dataBase64)
  let xorNonceFromCipherBlock = Base64ToUint8Array(ivBase64)
  let promiseChain = Promise.resolve(xorNonceFromCipherBlock)


  for (let i = 0; i < dataBuffer.length; i += CIPHER_BLOCK_SIZE) {
    let block = createArray(CIPHER_BLOCK_SIZE)
    copyArray(dataBuffer, block, 0, i, i + CIPHER_BLOCK_SIZE)

    promiseChain = promiseChain.then(() => {

      return window.crypto.subtle.decrypt(
        {
          name: 'RSA-OAEP',
          modulusLength: 4096, //can be 1024, 2048, or 4096
          publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
          hash: { name: 'SHA-512' }, //can be "SHA-1", "SHA-256", "SHA-384", or "SHA-512"
        },
        privateKeyBuffer,
        block
        )
        .then(decryptedBlock => {

          decryptedBlock = new Uint8Array(decryptedBlock)
          for (let j = 0; j < block.length; j++) {
            decryptedBlock[j] ^= xorNonceFromCipherBlock[j]
          }

          plainTextArr.push(decryptedBlock)

          let isEven = decryptedBlock[0] % 2 === 0
          xorNonceFromCipherBlock = getXORNoncefromCipherBlock(block, isEven)

        })
    })

  }

  return promiseChain
    .then(() => {

      let plaintext = createArray((plainTextArr.length - 1) * BLOCK_SIZE + plainTextArr[plainTextArr.length -1].length)

      for (let i = 0; i < plainTextArr.length; i++) {
        if(i === plainTextArr.length -1 ) {

          copyArray(plainTextArr[i], plaintext, i * BLOCK_SIZE, 0, plainTextArr[i].length)
        } else {
          copyArray(plainTextArr[i], plaintext, i * BLOCK_SIZE, 0, BLOCK_SIZE)
        }

      }

      return decoder.decode(plaintext)
    })
}

export function keyToBase64(key) {

  return window.crypto.subtle.exportKey(
    "pkcs8",
    key
  )
    .then(keyRaw => {

      return BufferArrayToBase64(keyRaw)
    })
    .catch(err => {

      console.log(err)
    })
}

export function base64ToKey(keyBase64) {

  return window.crypto.subtle.importKey(
    "pkcs8",
    Base64ToUint8Array(keyBase64),
    {
      name: 'RSA-OAEP',
      modulusLength: 4096, //can be 1024, 2048, or 4096
      publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
      hash: { name: 'SHA-512' }, //can be "SHA-1", "SHA-256", "SHA-384", or "SHA-512"
    },

    true,
    ['decrypt']
  )
}

export function decryptPrivateKey(passphraseString, privateKeyBase64, passphraseSaltBase64, passphraseIVBase64) {
  let saltBuffer = Base64ToUint8Array(passphraseSaltBase64)
  let ivBuffer = Base64ToUint8Array(passphraseIVBase64)
  let privateKeyBuffer = Base64ToUint8Array(privateKeyBase64)

  return getKeyMaterial(passphraseString)
    .then(keyMaterial => {

      return getWrappingKey(keyMaterial, saltBuffer)
        .then(wrappingKey => {

          return unwrapCryptoKey(privateKeyBuffer, wrappingKey, ivBuffer)
        })
    })
}

export function sha512(str) {
  return crypto.subtle.digest("SHA-512", new TextEncoder("utf-8").encode(str)).then(buf => {
    return Array.prototype.map.call(new Uint8Array(buf), x=>(('00'+x.toString(16)).slice(-2))).join('');
  });
}


// export default {
//   getKeyMaterial,
//   getRSAKeys,
//   getWrappingKey,
//   wrapCryptoKey,
//   BufferArrayToBase64,
//   Base64ToUint8Array,
//   unwrapCryptoKey,
//   decryptPrivateKey,
//   decrypt,
//   decryptCBC
// }
