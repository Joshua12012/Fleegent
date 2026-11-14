//! ==============================================================================
//! EDGE PLATFORM DEMO — HARDWARE-AWARE CRYPTOGRAPHIC SECURITY SUITE
//! ==============================================================================
//! Provides high-performance, timing-attack-resistant cryptographic primitives
//! tailored for edge devices (Raspberry Pi, NVIDIA Jetson, Industrial Gateways):
//!
//! 1. In-Flight AEAD Payload Encryption:
//!    - AES-256-GCM: Hardware-accelerated SIMD (AES-NI / ARMv8 Crypto Extensions)
//!    - ChaCha20-Poly1305: Constant-time software cipher for low-power edge CPUs
//!
//! 2. Message Integrity & Authentication:
//!    - HMAC-SHA256: Symmetric cryptographic signatures on all telemetry streams
//!
//! 3. Standardized Encrypted Payload Envelopes:
//!    - Self-describing JSON payload containing nonce, ciphertext, auth tag,
//!      and cryptographic signature.
//! ==============================================================================

use base64::prelude::*;
use ring::aead::{self, BoundKey, Nonce, NonceSequence, OpeningKey, SealingKey, UnboundKey};
use ring::hmac;
use serde::{Deserialize, Serialize};

/// Self-describing secure envelope for encrypted edge-to-cloud telemetry and commands.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EncryptedEnvelope {
    /// Cryptographic cipher suite used: "AES-256-GCM" or "CHACHA20-POLY1305"
    pub cipher_suite: String,
    /// Base64-encoded 12-byte initialization vector (IV / Nonce)
    pub nonce: String,
    /// Base64-encoded ciphertext with appended 16-byte authentication tag
    pub ciphertext: String,
    /// Hex-encoded HMAC-SHA256 digital signature over (cipher_suite + nonce + ciphertext)
    pub signature: String,
    /// Identifier of the shared or public key
    pub key_id: String,
    /// Unix timestamp in seconds
    pub timestamp: u64,
}

/// One-time nonce sequence for ring AEAD encryption/decryption
struct SingleNonceSequence(Option<[u8; 12]>);

impl SingleNonceSequence {
    fn new(nonce: [u8; 12]) -> Self {
        Self(Some(nonce))
    }
}

impl NonceSequence for SingleNonceSequence {
    fn advance(&mut self) -> Result<Nonce, ring::error::Unspecified> {
        self.0
            .take()
            .map(Nonce::assume_unique_for_key)
            .ok_or(ring::error::Unspecified)
    }
}

/// Computes a hex-encoded HMAC-SHA256 message authentication code.
pub fn sign_hmac_sha256(key: &[u8], data: &[u8]) -> String {
    let s_key = hmac::Key::new(hmac::HMAC_SHA256, key);
    let tag = hmac::sign(&s_key, data);
    let bytes = tag.as_ref();
    let mut hex = String::with_capacity(bytes.len() * 2);
    for b in bytes {
        hex.push_str(&format!("{:02x}", b));
    }
    hex
}

/// Verifies an HMAC-SHA256 signature in constant time against timing attacks.
pub fn verify_hmac_sha256(key: &[u8], data: &[u8], expected_hex: &str) -> bool {
    let s_key = hmac::Key::new(hmac::HMAC_SHA256, key);
    let expected_bytes = match hex_to_bytes(expected_hex) {
        Some(b) => b,
        None => return false,
    };
    hmac::verify(&s_key, data, &expected_bytes).is_ok()
}

/// Converts a hex string into a Vec<u8> byte array.
fn hex_to_bytes(hex: &str) -> Option<Vec<u8>> {
    if hex.len() % 2 != 0 {
        return None;
    }
    (0..hex.len())
        .step_by(2)
        .map(|i| u8::from_str_radix(&hex[i..i + 2], 16).ok())
        .collect()
}

/// Encrypts plaintext using AES-256-GCM with a 12-byte nonce.
pub fn encrypt_aes_256_gcm(
    key: &[u8; 32],
    nonce: &[u8; 12],
    plaintext: &[u8],
) -> Result<Vec<u8>, String> {
    let unbound_key = UnboundKey::new(&aead::AES_256_GCM, key).map_err(|_| "Invalid AES key")?;
    let nonce_seq = SingleNonceSequence::new(*nonce);
    let mut sealing_key = SealingKey::new(unbound_key, nonce_seq);

    let mut in_out = plaintext.to_vec();
    sealing_key
        .seal_in_place_append_tag(aead::Aad::empty(), &mut in_out)
        .map_err(|_| "AES-256-GCM encryption failed")?;

    Ok(in_out)
}

/// Decrypts ciphertext using AES-256-GCM with a 12-byte nonce and verifies the tag.
pub fn decrypt_aes_256_gcm(
    key: &[u8; 32],
    nonce: &[u8; 12],
    ciphertext_and_tag: &[u8],
) -> Result<Vec<u8>, String> {
    let unbound_key = UnboundKey::new(&aead::AES_256_GCM, key).map_err(|_| "Invalid AES key")?;
    let nonce_seq = SingleNonceSequence::new(*nonce);
    let mut opening_key = OpeningKey::new(unbound_key, nonce_seq);

    let mut in_out = ciphertext_and_tag.to_vec();
    let decrypted = opening_key
        .open_in_place(aead::Aad::empty(), &mut in_out)
        .map_err(|_| "AES-256-GCM authentication/decryption failed")?;

    Ok(decrypted.to_vec())
}

/// Encrypts plaintext using ChaCha20-Poly1305 with a 12-byte nonce.
pub fn encrypt_chacha20_poly1305(
    key: &[u8; 32],
    nonce: &[u8; 12],
    plaintext: &[u8],
) -> Result<Vec<u8>, String> {
    let unbound_key =
        UnboundKey::new(&aead::CHACHA20_POLY1305, key).map_err(|_| "Invalid ChaCha key")?;
    let nonce_seq = SingleNonceSequence::new(*nonce);
    let mut sealing_key = SealingKey::new(unbound_key, nonce_seq);

    let mut in_out = plaintext.to_vec();
    sealing_key
        .seal_in_place_append_tag(aead::Aad::empty(), &mut in_out)
        .map_err(|_| "ChaCha20-Poly1305 encryption failed")?;

    Ok(in_out)
}

/// Decrypts ciphertext using ChaCha20-Poly1305 with a 12-byte nonce and verifies the tag.
pub fn decrypt_chacha20_poly1305(
    key: &[u8; 32],
    nonce: &[u8; 12],
    ciphertext_and_tag: &[u8],
) -> Result<Vec<u8>, String> {
    let unbound_key =
        UnboundKey::new(&aead::CHACHA20_POLY1305, key).map_err(|_| "Invalid ChaCha key")?;
    let nonce_seq = SingleNonceSequence::new(*nonce);
    let mut opening_key = OpeningKey::new(unbound_key, nonce_seq);

    let mut in_out = ciphertext_and_tag.to_vec();
    let decrypted = opening_key
        .open_in_place(aead::Aad::empty(), &mut in_out)
        .map_err(|_| "ChaCha20-Poly1305 authentication/decryption failed")?;

    Ok(decrypted.to_vec())
}

/// Seals a plaintext payload into an authenticated, signed `EncryptedEnvelope`.
pub fn seal_envelope(
    cipher_suite: &str,
    key: &[u8; 32],
    signing_key: &[u8],
    key_id: &str,
    plaintext: &[u8],
) -> Result<EncryptedEnvelope, String> {
    use std::time::{SystemTime, UNIX_EPOCH};

    // 1. Generate pseudo-random 12-byte nonce derived from timestamp and sequence
    let now = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default();
    let mut nonce_bytes = [0u8; 12];
    let time_bytes = now.as_nanos().to_le_bytes();
    nonce_bytes.copy_from_slice(&time_bytes[..12]);

    // 2. Encrypt based on specified cipher suite
    let is_chacha = cipher_suite.eq_ignore_ascii_case("chacha20-poly1305");
    let ciphertext_raw = if is_chacha {
        encrypt_chacha20_poly1305(key, &nonce_bytes, plaintext)?
    } else {
        encrypt_aes_256_gcm(key, &nonce_bytes, plaintext)?
    };

    let nonce_b64 = BASE64_STANDARD.encode(nonce_bytes);
    let cipher_b64 = BASE64_STANDARD.encode(&ciphertext_raw);
    let suite_str = if is_chacha {
        "CHACHA20-POLY1305"
    } else {
        "AES-256-GCM"
    };

    // 3. Compute digital signature over [suite || nonce || ciphertext]
    let mut sign_input = Vec::new();
    sign_input.extend_from_slice(suite_str.as_bytes());
    sign_input.extend_from_slice(nonce_b64.as_bytes());
    sign_input.extend_from_slice(cipher_b64.as_bytes());
    let sig_hex = sign_hmac_sha256(signing_key, &sign_input);

    Ok(EncryptedEnvelope {
        cipher_suite: suite_str.to_string(),
        nonce: nonce_b64,
        ciphertext: cipher_b64,
        signature: sig_hex,
        key_id: key_id.to_string(),
        timestamp: now.as_secs(),
    })
}

/// Verifies and opens an `EncryptedEnvelope` back into plaintext bytes.
pub fn open_envelope(
    envelope: &EncryptedEnvelope,
    key: &[u8; 32],
    signing_key: &[u8],
) -> Result<Vec<u8>, String> {
    // 1. Verify HMAC-SHA256 signature
    let mut sign_input = Vec::new();
    sign_input.extend_from_slice(envelope.cipher_suite.as_bytes());
    sign_input.extend_from_slice(envelope.nonce.as_bytes());
    sign_input.extend_from_slice(envelope.ciphertext.as_bytes());

    if !verify_hmac_sha256(signing_key, &sign_input, &envelope.signature) {
        return Err("Cryptographic signature verification failed: packet tampered".to_string());
    }

    // 2. Decode nonce and ciphertext
    let nonce_bytes = BASE64_STANDARD
        .decode(&envelope.nonce)
        .map_err(|e| format!("Corrupted nonce base64: {}", e))?;
    if nonce_bytes.len() != 12 {
        return Err("Invalid nonce length: expected 12 bytes".to_string());
    }
    let mut nonce_arr = [0u8; 12];
    nonce_arr.copy_from_slice(&nonce_bytes);

    let cipher_bytes = BASE64_STANDARD
        .decode(&envelope.ciphertext)
        .map_err(|e| format!("Corrupted ciphertext base64: {}", e))?;

    // 3. Decrypt payload
    if envelope.cipher_suite.eq_ignore_ascii_case("chacha20-poly1305") {
        decrypt_chacha20_poly1305(key, &nonce_arr, &cipher_bytes)
    } else {
        decrypt_aes_256_gcm(key, &nonce_arr, &cipher_bytes)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_hmac_sign_and_verify() {
        let key = b"industrial-edge-secret-key-12345";
        let data = b"temperature: 42.5C, cpu: 12.3%";
        let sig = sign_hmac_sha256(key, data);
        assert!(!sig.is_empty());
        assert!(verify_hmac_sha256(key, data, &sig));
        assert!(!verify_hmac_sha256(key, b"tampered payload", &sig));
    }

    #[test]
    fn test_aes_gcm_roundtrip() {
        let key = [0x42u8; 32];
        let nonce = [0x19u8; 12];
        let plaintext = b"Telemetry: YOLOv8 defect detection [bbox: (45, 112, 130, 95)]";

        let encrypted = encrypt_aes_256_gcm(&key, &nonce, plaintext).expect("encryption failed");
        assert_ne!(plaintext.as_slice(), encrypted.as_slice());

        let decrypted = decrypt_aes_256_gcm(&key, &nonce, &encrypted).expect("decryption failed");
        assert_eq!(plaintext.as_slice(), decrypted.as_slice());
    }

    #[test]
    fn test_chacha20_poly1305_roundtrip() {
        let key = [0x77u8; 32];
        let nonce = [0x88u8; 12];
        let plaintext = b"3-Axis Vibration RMS: 4.82 mm/s - ISO Warning Triggered";

        let encrypted = encrypt_chacha20_poly1305(&key, &nonce, plaintext).expect("encryption failed");
        assert_ne!(plaintext.as_slice(), encrypted.as_slice());

        let decrypted = decrypt_chacha20_poly1305(&key, &nonce, &encrypted).expect("decryption failed");
        assert_eq!(plaintext.as_slice(), decrypted.as_slice());
    }

    #[test]
    fn test_envelope_sealing_and_tamper_detection() {
        let key = [0x55u8; 32];
        let signing_key = b"cloud-jwt-shared-secret-key";
        let payload = br#"{"device_id":"edge-node-alpha-01","cpu":14.2,"temp":48.0}"#;

        // Seal envelope with AES-256-GCM
        let env = seal_envelope("AES-256-GCM", &key, signing_key, "key-01", payload)
            .expect("seal failed");
        assert_eq!(env.cipher_suite, "AES-256-GCM");

        // Verify and open envelope
        let decrypted = open_envelope(&env, &key, signing_key).expect("open failed");
        assert_eq!(payload.as_slice(), decrypted.as_slice());

        // Tamper test: modify ciphertext
        let mut tampered_env = env.clone();
        tampered_env.ciphertext.push('A');
        assert!(open_envelope(&tampered_env, &key, signing_key).is_err());
    }
}

