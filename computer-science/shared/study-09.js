window.CSStudyGuides = {
  compression: {
    goal: 'Distinguish reducing a file’s representation from discarding information, calculate savings using stated assumptions, and justify lossless or lossy methods for particular data.',
    terms: [
      ['Compression', 'Representing data using fewer bits when the data and method permit it.'],
      ['Lossless', 'Decompression reconstructs the original data exactly.'],
      ['Lossy', 'The process irreversibly discards information, so the original cannot in general be reconstructed exactly.'],
      ['Compression ratio', 'Here, original size ÷ compressed size. Always state the convention because ratio notation can vary.']
    ],
    sections: [
      ['Why fewer bits help',
        'A smaller representation uses less storage and, for a given connection rate, takes less time to transmit. Compression can also reduce network demand when many people access the same material. Encoding and decoding take computation, and container headers or dictionaries can outweigh savings on very short or poorly suited inputs.',
        'Lossless methods exploit patterns or redundancy without losing the information needed to reverse the representation. Exact recovery is essential for executable code, financial records and many scientific datasets: changing even one bit can change the meaning. A file need not contain obvious repeated words to have compressible statistical structure.'],
      ['What lossy methods choose to discard',
        'Lossy methods deliberately omit information judged less important for a purpose. An image method may reduce fine colour/detail information; an audio codec may discard components according to a perceptual model. The result may look or sound acceptable at a much smaller size, but acceptability depends on the content, settings and use.',
        'The colour lab uses simple channel quantisation: fewer allowed red, green and blue values cause multiple original colours to map to the same result. This makes the loss visible, but it is not a complete implementation of JPEG or any specific audio codec. Once two different originals map to the same representation, the decoder cannot know which original was supplied.'],
      ['Quality, repeated saving and format names',
        'Lower quality settings can trade detail for smaller files. Re-encoding an already lossy result can introduce further loss; converting it to a lossless format afterwards preserves the current degraded data rather than restoring the missing original. Keeping an original master lets a user create new versions without repeatedly degrading the same copy.',
        'Use the actual encoding and requirements, not the filename alone, to choose a method. Photographs for a web gallery may tolerate some loss, while a text document or program requires exact reconstruction. “Lossless” describes recoverability, not a promise that every input becomes smaller. Already compressed or unstructured data may gain little or even expand.']
    ],
    examples: [
      {title: 'Quantise the lab image and calculate its payload', given: 'A 96 × 64 image stores three colour channels. The original uses 8 bits per channel. A teaching version uses 4 bits per channel, tightly packed. Exclude headers and metadata.', steps: [
        'Pixels = 96 × 64 = 6,144. Original bits per pixel = 3 × 8 = 24.',
        'Original payload = 6,144 × 24 = 147,456 bits = 18,432 bytes.',
        'New bits per pixel = 3 × 4 = 12. New payload = 73,728 bits = 9,216 bytes.',
        'Saving = (18,432 − 9,216) ÷ 18,432 × 100 = 50%. Ratio under our convention = 18,432 ÷ 9,216 = 2:1.',
        'Each channel now has 2⁴ = 16 possible levels instead of 2⁸ = 256. Fewer levels explain the visible colour loss; the size calculation alone does not measure perceived quality.'
      ], answer: 'The ideal packed payload halves. This is a calculation for the supplied representation, not the size of a browser PNG download or a full JPEG file.'},
      {title: 'Choose a method and estimate transmission time', given: 'A 24 MB image collection becomes 6 MB with an acceptable lossy setting. The link transfers 12 Mb/s. Use decimal MB and ignore all protocol overhead.', steps: [
        'Convert bytes to bits: 24 MB = 192 Mb, and 6 MB = 48 Mb.',
        'Original transfer time = 192 ÷ 12 = 16 seconds. Compressed transfer time = 48 ÷ 12 = 4 seconds.',
        'Saving is 75% and the ratio is 4:1. This may suit viewing photographs if the quality is acceptable.',
        'For a program file, the same willingness to change data would be inappropriate: exact executable instructions must be recovered, so use a suitable lossless method instead.'
      ], answer: 'Fewer bits reduce ideal transmission time, but suitability depends on what may be lost, not just on the percentage saving.'}
    ],
    lab: 'Predict the number of colour levels at 8, 4 and 1 bit per channel. Compare the image and payload at those settings. Explain why returning the slider to 8 can restore this demo’s image only because it retains an untouched original, not because lost colours can be inferred from a lossy copy.',
    traps: ['Lossless does not mean “no compression” or “always larger than lossy”.', 'A lossy file converted to a lossless format does not recover discarded information.', 'A compression ratio and a percentage saving are different quantities; show your convention.'],
    checks: [
      ['A 20 MB file compresses to 8 MB. Find the saving and ratio.', 'Saved size = 12 MB. Percentage saving = 12 ÷ 20 × 100 = 60%. Original ÷ compressed = 20 ÷ 8 = 2.5, so the ratio is 2.5:1 under the stated convention.'],
      ['Why should a source-code archive use lossless compression?', 'Every character may matter to program meaning or syntax. Decompression must recover the exact original sequence, rather than a visually similar approximation.'],
      ['Why can two files of the same original size compress differently?', 'They may contain different patterns or statistical redundancy, and the selected method exploits some patterns better than others. Headers and dictionary overhead also affect the outcome.']
    ],
    exam: 'Define whether exact recovery is required, explain what the chosen method retains or discards, and connect the size/quality trade-off to the actual use. In calculations, include any supplied overhead and convert bytes and bits before using a bit rate.'
  },
  coding: {
    goal: 'Encode and decode run-length and dictionary representations, account for overhead and explain why the same method can compress one input but expand another.',
    terms: [
      ['Run', 'A consecutive sequence of the same symbol. Separated appearances are different runs.'],
      ['RLE', 'Run-length encoding: represent each run by a count and a symbol under an agreed format.'],
      ['Dictionary coding', 'Replace repeated sequences with references to entries in a shared or reconstructible dictionary.'],
      ['Overhead', 'Bits needed for information such as counts, dictionary entries, lengths and headers, in addition to the references or symbols themselves.']
    ],
    sections: [
      ['RLE groups consecutive repetition',
        'Scan from left to right, count identical consecutive symbols and emit a count–symbol pair when the symbol changes or the count limit is reached. The decoder repeats each symbol the stated number of times. The exact format must be known: a printed string such as “4A” is a human-readable description, not automatically the actual bit representation.',
        'In this lab, a pair uses an 8-bit count and an 8-bit ASCII symbol. A count can be at most 255, so a longer run must be split. Long runs replace many symbols with one pair; runs of one replace one byte with two. RLE therefore suits some simple bitmap rows much better than alternating colours or already compressed data.'],
      ['Dictionaries exploit repeated sequences',
        'A dictionary assigns references to sequences, which can be words, phrases or other patterns rather than just single-symbol runs. An encoded stream uses those references; the decoder replaces each reference with its exact entry. Dictionaries can be supplied in advance, transmitted with the data, or built by the encoder and decoder under agreed rules.',
        'The lab uses a deliberately explicit word/space/punctuation token model. It preserves case, repeated spaces and punctuation so decoding reconstructs the original text. This is a teaching format, not an implementation of every commercial dictionary compressor. Its dictionary travels with the stream, and the readouts include that format’s overhead.'],
      ['Compare like with like',
        'Find the original size using the supplied symbol encoding. Then count all bits in the encoded representation: references, counts, entries and any specified metadata. Do not assume reference width or header size; these must come from the question or format. If n distinct entries are addressed by fixed-width codes, at least ceil(log₂ n) bits are needed, subject to the scheme’s reserved codes and rules.',
        'The method is lossless if the decoder can reconstruct the exact original from the complete representation. Replacing a word with a code is not lossy when the dictionary preserves it. Conversely, a stream of codes without the necessary dictionary is incomplete, even if its apparent size looks impressive.']
    ],
    examples: [
      {title: 'Encode, decode and size an RLE message', given: 'The input is AAAABB. Use (count, symbol), with 8 bits for each count and 8 for each symbol. Exclude headers.', steps: [
        'The runs are AAAA and BB, so emit (4, A), (2, B). There are two pairs.',
        'Decode by producing four As and two Bs: AAAABB, exactly matching the input.',
        'Original size = 6 × 8 = 48 bits. Encoded size = 2 × (8 + 8) = 32 bits.',
        'Saving = 16 bits, or 16 ÷ 48 × 100 ≈ 33.3%. For ABABAB, six one-symbol runs would instead cost 96 bits, twice the original.'
      ], answer: 'RLE’s benefit depends on run lengths. Under this format, a run of two breaks even before headers; longer runs save payload bits.'},
      {title: 'Include a transmitted dictionary', given: 'An independent toy format encodes ABABABAB. Dictionary entry 0 means AB. Use a 2-bit reference per entry occurrence, a 16-bit header, and store the entry as two 8-bit characters plus an 8-bit length. This format is separate from the lab’s token rules.', steps: [
        'The original is eight characters, so its size is 8 × 8 = 64 bits.',
        'The stream is 0, 0, 0, 0: four 2-bit references, costing 8 bits.',
        'Dictionary cost = 2 × 8 + 8 = 24 bits. Add the 16-bit header and 8-bit stream: total = 48 bits.',
        'Saving = 64 − 48 = 16 bits, or 25%. Counting only the 8-bit stream would falsely report an 87.5% saving.',
        'For AB alone the same format would cost 16 + 24 + 2 = 42 bits against an original 16 bits, so the overhead outweighs reuse.'
      ], answer: 'A short message may expand while a longer repetitive one compresses. Calculate the complete representation using the question’s format.'},
      {title: 'Split a run when a count field is full', given: 'A message consists of 300 consecutive As. Use the lab’s maximum count of 255 and 16 bits per pair.', steps: [
        'The first pair can represent 255 As: (255, A). The remaining run has 300 − 255 = 45 As.',
        'Emit a second pair (45, A). Decoding both pairs produces all 300 As.',
        'Encoded payload = 2 × 16 = 32 bits, compared with 300 × 8 = 2,400 original bits.'
      ], answer: 'Count limits affect the trace. Do not put 300 in an unsigned 8-bit count field.'}
    ],
    lab: 'Try AAAABB and then ABABAB in the RLE lab and predict the readouts. In the dictionary lab, use repeated words with different spaces and punctuation. Follow the references to reconstruct the exact input, then compare the stream-only cost with the complete cost.',
    traps: ['RLE compresses consecutive runs, not every occurrence of a letter anywhere in a file.', 'Dictionary references are not meaningful without an available dictionary or reconstruction rule.', 'A readable pair label is not a sufficient basis for its bit cost; use the supplied fields.'],
    checks: [
      ['Encode AAABCC using 16-bit RLE pairs and compare with the 8-bit original.', 'Runs are (3, A), (1, B), (2, C). Encoded size = 3 × 16 = 48 bits. Original size = 6 × 8 = 48 bits. The payload breaks even; an additional header would make this example larger.'],
      ['Why must a dictionary preserve two spaces if the original has two spaces?', 'Lossless recovery requires the exact original sequence. Replacing two spaces with one changes the data even if the text looks similar. The token rules and dictionary must preserve that distinction.'],
      ['A fixed-width dictionary has 17 entries. What is the minimum reference width if all codes are available?', 'Four bits encode only 16 possibilities, which is insufficient. Five bits encode 32, so at least five bits are needed under these assumptions. Reserved codes could change a real format’s requirements.']
    ],
    exam: 'State the representation first, show the encoded sequence and demonstrate decoding. Calculate original and complete encoded sizes separately, then conclude whether it compresses this particular input and explain the pattern responsible.'
  },
  encryption: {
    goal: 'Trace who holds each key in symmetric and asymmetric encryption, explain secure key establishment, and distinguish confidentiality from authentication and signatures.',
    terms: [
      ['Plaintext / ciphertext', 'The original readable data / its encrypted representation.'],
      ['Symmetric encryption', 'The same secret key is used for encryption and decryption.'],
      ['Public / private key', 'A related asymmetric key pair: the public key may be distributed, while the private key must remain secret.'],
      ['Authentication', 'Establishing a claimed identity or the origin of information under a trusted scheme.']
    ],
    sections: [
      ['An algorithm and the right secret',
        'Encryption transforms plaintext using an algorithm and key so that a party without the required secret cannot feasibly recover the plaintext. The algorithm need not be hidden. A passive interceptor can copy transmitted ciphertext; security should depend on the cryptographic design, appropriate parameters and protected keys rather than hoping the method stays unknown.',
        'With symmetric encryption, Alice and Bob need the same secret key. It is efficient for bulk data, but they must establish that key securely and keep it secret. Sending a symmetric key openly next to its ciphertext gives an interceptor what they need to decrypt. Losing control of the key compromises the protected data, regardless of how impressive the ciphertext looks.'],
      ['Asymmetric confidentiality depends on the recipient’s key',
        'Bob creates a public/private pair and keeps the private key secret. Alice encrypts using Bob’s authenticated public key; the corresponding private key is needed to decrypt. Alice does not need Bob’s private key, and her own unrelated key pair would not let Bob decrypt data intended for her.',
        'The public key’s ownership matters. If an attacker persuades Alice that the attacker’s key belongs to Bob, Alice can encrypt perfectly to the wrong recipient. Certificates or another trusted verification route can bind a public key to an identity. “Public” means the key need not be confidential, not that any unverified key should be trusted.'],
      ['Hybrid use and distinct security goals',
        'Asymmetric operations are generally more costly for large data and particular schemes limit message size. A hybrid approach establishes or protects a fresh session secret using an appropriate asymmetric mechanism, then uses symmetric encryption for the bulk data. Modern protocols differ in the exact key-establishment mechanism; do not assume every secure connection encrypts all content directly with RSA.',
        'Confidentiality hides content. Integrity detects unauthorised changes under suitable checks; authentication concerns identity or origin. Authenticated encryption combines encryption with a tag that detects tampering under its key. A digital signature is generated using a signing private key and checked with its public key; it is a separate operation from public-key encryption for confidentiality.']
    ],
    examples: [
      {title: 'Send a secret to Bob with a key pair', given: 'Bob has public key B-public and private key B-private. Eve can read traffic but does not have B-private.', steps: [
        'Alice obtains B-public and verifies that it really belongs to Bob using a trusted method.',
        'Alice encrypts the message using B-public and an appropriate encryption scheme. She sends the resulting ciphertext.',
        'Bob decrypts using B-private. Eve’s unrelated private key cannot correctly decrypt the message.',
        'If Eve had substituted E-public before step 2 and Alice did not verify ownership, Eve could decrypt the result with E-private. The encryption algorithm would not fix that identity mistake.'
      ], answer: 'For confidentiality, name the recipient’s public key for encryption and its corresponding private key for decryption. Key ownership must be verified.'},
      {title: 'Protect a large file efficiently', given: 'Alice must send Bob a large video, and they have no previously shared session secret.', steps: [
        'Authenticate the relevant public key or key-establishment exchange so Alice is communicating with the intended recipient.',
        'Use an appropriate asymmetric mechanism to establish/protect a fresh symmetric session secret.',
        'Encrypt the video with a suitable authenticated symmetric scheme, following its nonce/IV requirements. Send the necessary non-secret parameters and ciphertext/tag.',
        'Bob obtains the same session secret, verifies the authentication tag and decrypts. A failed verification must be treated as failure, not as a usable approximate message.'
      ], answer: 'Hybrid design combines manageable secret establishment with efficient bulk encryption. The nonce/IV is not the secret key and must obey the chosen scheme’s rules.'}
    ],
    lab: 'Run both modes and track who holds which key. Try Eve’s wrong key and explain why it fails. Encrypt the same plaintext more than once: the lab uses fresh randomness, so different ciphertext does not imply a different recovered message. AES-GCM and RSA-OAEP here are real browser cryptography, while the packet animation is illustrative.',
    traps: ['Public-key encryption uses the recipient’s public key for confidentiality, not a private key shared with everyone.', 'Encryption alone does not establish whose public key was received.', 'A digital signature is not adequately explained as simply “encrypting the whole message with the private key”.'],
    checks: [
      ['Which key does Bob use to decrypt a message encrypted with B-public?', 'The corresponding B-private. Alice’s private key and an unrelated private key do not form the required pair.'],
      ['Why can two encryptions of identical plaintext differ?', 'Secure schemes can incorporate fresh randomised parameters such as an IV/nonce or padding randomness. Given the correct key and required parameters, both can still decrypt to the same plaintext.'],
      ['Why is sending a shared secret through the same openly readable channel unsafe?', 'An interceptor who obtains both the key and ciphertext can perform the legitimate decryption. The key must be established or transported using an appropriate protected mechanism.']
    ],
    exam: 'Write a clear Alice/Bob sequence and name the owner and role of every key. Separate the goal of hiding data from verifying identity or detecting tampering, then explain why the selected mechanism addresses the stated goal.'
  },
  hashing: {
    goal: 'Explain fixed-length digests and collisions, evaluate integrity checks and password verification, and distinguish cryptographic hashing from hash-table indexing.',
    terms: [
      ['Digest', 'The fixed-length output of a hash function for an input.'],
      ['Deterministic', 'The same input bytes under the same function produce the same output.'],
      ['Collision', 'Two different inputs produce the same hash output or, for a hash table, map to the same bucket.'],
      ['Preimage resistance', 'For a cryptographic hash, finding an input that produces a given digest should be computationally infeasible.']
    ],
    sections: [
      ['A fingerprint is not an encoded copy',
        'A hash maps an input to an output under a defined rule. A cryptographic hash is designed to make certain attacks difficult, including recovering an input from a given digest and finding collisions. It is not encryption: there is no decryption key that recovers the original file, and a short digest cannot contain enough information to reconstruct every possible long input.',
        'SHA-256 produces 256 bits. Displaying it as hexadecimal gives 256 ÷ 4 = 64 digits because each hexadecimal digit represents four bits. The input is bytes: changing case, a space or a character encoding can change those bytes. A good cryptographic hash usually changes many output bits after a tiny input change, called an avalanche effect; it does not promise that every output bit changes.'],
      ['Collisions must exist, even when hard to find',
        'A fixed-length output has finitely many values, while possible inputs can be much more numerous. At least two inputs must therefore share an output. Cryptographic collision resistance means finding such a pair is infeasible with the intended security level, not that a collision is mathematically impossible. Matching digests are useful evidence under a suitable scheme, not a proof that every conceivable pair of inputs is identical.',
        'For a download integrity check, recompute the digest and compare it with an expected value obtained through a trusted route. A mismatch shows the checked bytes differ from those represented by the expected digest. If an attacker can replace both a file and an unauthenticated expected hash, the attacker can publish a matching pair; a bare hash does not authenticate the source.'],
      ['Password verification and fast lookup are different uses',
        'A password verifier can derive a stored value from a password and a per-password salt, then repeat the derivation for a later login attempt. Real password storage should use a purpose-designed slow password-hashing/key-derivation function rather than a single fast SHA-256 calculation. Salts make identical passwords produce different stored results under different salts and hinder precomputed attacks; they are normally stored with the verifier rather than treated as secret passwords.',
        'A hash table uses a hash to locate a bucket for a key. The indexing function need not be cryptographic. Collisions are expected and must be resolved, for example by chaining entries and comparing full keys. With a good distribution and suitable load, lookup can be fast on average; a poor distribution can force many comparisons. Hashing for indexing does not conceal the stored data.']
    ],
    examples: [
      {title: 'Interpret the size of a SHA-256 digest', given: 'A 3-byte message and a 3 GB file are both processed with SHA-256. The full digest is displayed in hexadecimal.', steps: [
        'Both outputs contain 256 bits, regardless of the input lengths.',
        'Convert to bytes: 256 ÷ 8 = 32 bytes. Convert to hexadecimal digits: 256 ÷ 4 = 64.',
        'The larger file taking more work to read does not make its digest longer.',
        'Because a 32-byte digest cannot losslessly represent every possible 3 GB file, a decoder cannot reconstruct an arbitrary original from the digest alone.'
      ], answer: 'Fixed output length is a property of the hash function, not an indication of the input size or a reversible compression ratio.'},
      {title: 'Resolve a collision in the toy hash table', given: 'The lab adds ASCII character codes and takes the remainder modulo 10. CAT uses C = 67, A = 65 and T = 84.', steps: [
        'CAT gives 67 + 65 + 84 = 216; 216 mod 10 = 6.',
        'ACT contains the same codes in a different order, so it also gives 216 and bucket 6. This weak sum ignores order.',
        'Store both entries in bucket 6’s chain. Looking up ACT requires comparing the full keys in that chain until ACT is found.',
        'The collision does not mean CAT and ACT are equal. It means the index alone is insufficient to identify one entry.'
      ], answer: 'The table remains correct if it resolves collisions properly, though excessive collisions reduce performance. This toy rule is unsuitable as a cryptographic hash.'},
      {title: 'Check a download without trusting the attacker', given: 'A publisher supplies a file and a SHA-256 value. An attacker can alter the download mirror.', steps: [
        'Obtain the expected digest through an authenticated or otherwise trusted route, independently of the attacker’s control.',
        'Hash the downloaded bytes using the same algorithm and compare the complete digest.',
        'Reject a mismatch. A matching trusted digest supports the integrity check, subject to the scheme’s assumptions.',
        'If both file and “expected” digest are fetched from an untrusted altered page, an attacker can replace both. A valid signature under a trusted public key is one way to address origin/authenticity as well.'
      ], answer: 'Explain where trust enters the process. A comparison with an attacker-supplied value cannot establish the publisher’s identity.'}
    ],
    lab: 'First make both messages identical, then change just one character and compare the highlighted digest digits. In the bucket example, predict CAT and ACT before looking. Explain why exact input comparison is still needed even after the bucket has been selected.',
    traps: ['Fixed length does not mean every input has a unique digest.', 'A hash is not ciphertext that can be decrypted with a secret key.', 'A fast cryptographic hash demo is not a recommended password-storage implementation.'],
    checks: [
      ['How many hexadecimal digits represent a 160-bit digest?', '160 ÷ 4 = 40 hexadecimal digits. This is a representation calculation, not a recommendation to select a particular hash algorithm.'],
      ['Does a different digest prove the input changed?', 'With the same deterministic function and correctly computed results, different digests imply different input bytes. The reverse claim needs care: equal digests do not mathematically guarantee equal inputs because collisions exist.'],
      ['Why should a hash-table lookup compare full keys?', 'Several keys can map to one bucket. Comparing the full key distinguishes the requested entry from other colliding entries, preserving correctness.']
    ],
    exam: 'Identify the use first: integrity checking, password verification or indexing. Explain the complete procedure and its trust or collision assumptions. Use “computationally infeasible” rather than claiming collisions or guessing are absolutely impossible.'
  }
};
