"use client";

// Web Cryptography API E2EE Module (ECDH P-256 + AES-GCM 256)

const KEY_PREFIX = "echochat_e2ee_priv_";
const PUB_PREFIX = "echochat_e2ee_pub_";

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Retrieves existing or generates a new ECDH KeyPair for the authenticated user.
 */
export async function getOrCreateUserKeyPair(userId: string): Promise<{
  publicKey: string;
  privateKeyJwk: JsonWebKey;
}> {
  if (typeof window === "undefined" || !window.crypto || !window.crypto.subtle) {
    throw new Error("Web Cryptography API is not supported in this environment");
  }

  const storedPriv = localStorage.getItem(`${KEY_PREFIX}${userId}`);
  const storedPub = localStorage.getItem(`${PUB_PREFIX}${userId}`);

  if (storedPriv && storedPub) {
    try {
      return {
        publicKey: storedPub,
        privateKeyJwk: JSON.parse(storedPriv),
      };
    } catch {
      // If corrupted, re-generate
    }
  }

  // Generate new ECDH P-256 Keypair
  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: "ECDH",
      namedCurve: "P-256",
    },
    true,
    ["deriveKey", "deriveBits"]
  );

  const pubJwk = await window.crypto.subtle.exportKey("jwk", keyPair.publicKey);
  const privJwk = await window.crypto.subtle.exportKey("jwk", keyPair.privateKey);

  const publicKeyString = JSON.stringify(pubJwk);

  localStorage.setItem(`${KEY_PREFIX}${userId}`, JSON.stringify(privJwk));
  localStorage.setItem(`${PUB_PREFIX}${userId}`, publicKeyString);

  return {
    publicKey: publicKeyString,
    privateKeyJwk: privJwk,
  };
}

/**
 * Derives a symmetric AES-GCM key from current user's private key and contact's public key.
 */
async function deriveSharedKey(
  myPrivateKeyJwk: JsonWebKey,
  contactPublicKeyStr: string
): Promise<CryptoKey> {
  const contactPubJwk = JSON.parse(contactPublicKeyStr);

  const privateKey = await window.crypto.subtle.importKey(
    "jwk",
    myPrivateKeyJwk,
    {
      name: "ECDH",
      namedCurve: "P-256",
    },
    false,
    ["deriveKey"]
  );

  const contactPublicKey = await window.crypto.subtle.importKey(
    "jwk",
    contactPubJwk,
    {
      name: "ECDH",
      namedCurve: "P-256",
    },
    false,
    []
  );

  return await window.crypto.subtle.deriveKey(
    {
      name: "ECDH",
      public: contactPublicKey,
    },
    privateKey,
    {
      name: "AES-GCM",
      length: 256,
    },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Encrypts a message using AES-GCM-256 with an ECDH-derived shared key.
 */
export async function encryptE2EEMessage(
  plaintext: string,
  myPrivateKeyJwk: JsonWebKey,
  contactPublicKeyStr: string
): Promise<string> {
  if (!contactPublicKeyStr) return plaintext;

  try {
    const sharedKey = await deriveSharedKey(myPrivateKeyJwk, contactPublicKeyStr);
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(plaintext);

    const ciphertext = await window.crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv,
      },
      sharedKey,
      encoded
    );

    const ivBase64 = arrayBufferToBase64(iv.buffer);
    const cipherBase64 = arrayBufferToBase64(ciphertext);

    return `e2ee:v1:${ivBase64}:${cipherBase64}`;
  } catch (error) {
    console.error("E2EE encryption error:", error);
    return plaintext;
  }
}

/**
 * Decrypts an encrypted message formatted as `e2ee:v1:<iv>:<ciphertext>`.
 */
export async function decryptE2EEMessage(
  encryptedString: string,
  myPrivateKeyJwk: JsonWebKey,
  contactPublicKeyStr: string
): Promise<string> {
  if (!encryptedString || !isE2EEMessage(encryptedString)) {
    return encryptedString;
  }

  if (!contactPublicKeyStr) {
    return "[Encrypted message - Waiting for encryption key]";
  }

  try {
    const parts = encryptedString.split(":");
    if (parts.length !== 4) return encryptedString;

    const ivBuffer = base64ToArrayBuffer(parts[2]);
    const cipherBuffer = base64ToArrayBuffer(parts[3]);

    const sharedKey = await deriveSharedKey(myPrivateKeyJwk, contactPublicKeyStr);

    const decrypted = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: new Uint8Array(ivBuffer),
      },
      sharedKey,
      cipherBuffer
    );

    return new TextDecoder().decode(decrypted);
  } catch (error) {
    console.warn("E2EE decryption failed (key mismatch or unverified session):", error);
    return "[🔒 Encrypted Message]";
  }
}

export function isE2EEMessage(text: string): boolean {
  return typeof text === "string" && text.startsWith("e2ee:v1:");
}
