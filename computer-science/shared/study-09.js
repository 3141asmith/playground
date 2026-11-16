window.CSStudyGuides = {
  compression: {
    goal: 'Understand how compression makes a file smaller, why some methods preserve every detail while others discard information, and how to choose between them for a particular use.',
    terms: [
      ['Compression', 'Representing data using fewer bits when the data and method permit it.'],
      ['Lossless', 'Decompression reconstructs the original data exactly.'],
      ['Lossy', 'The process irreversibly discards information, so the original cannot in general be reconstructed exactly.'],
      ['Compression ratio', 'Here, original size ÷ compressed size. Always state the convention because ratio notation can vary.']
    ],
    sections: [
      ['Why do we compress files?',
        'Suppose a school needs to send the same set of photographs to hundreds of pupils. Reducing the number of bits in those files would save storage space and reduce the amount of data sent over the network. For any fixed transfer rate, fewer bits also mean a shorter transmission time. Compression aims to achieve these savings by changing how the data is represented.',
        'To understand a compression method, ask what the recipient can recover after decoding it. If every original bit can be recovered, the method is lossless. If some information has been discarded and only an approximation can be recovered, it is lossy. This distinction matters because different kinds of data can tolerate different kinds of change.'],
      ['How lossless compression preserves the original',
        'Lossless compression uses a more economical description of the same information. For example, instead of storing ten consecutive As separately, a format could record that A occurs ten times. The decoder can use that description to reconstruct the exact sequence, so the saving comes from changing the representation rather than removing part of the message. Run-length encoding and dictionary coding, explored in the next topic, apply this principle in different ways.',
        'Exact recovery is essential when even a small change could alter meaning. A missing character in a program could change its behaviour, while a changed digit in a record could make the record incorrect. However, lossless does not guarantee a smaller file: the description itself needs space, and a short input or one with little useful repetition may not save enough to cover that overhead. Already compressed data may therefore gain little from another compression attempt.'],
      ['How lossy compression trades information for size',
        'For a photograph or a music preview, a close approximation may be acceptable even when exact recovery is not possible. A lossy method takes advantage of this by discarding information that is less important for the intended use. An image method might reduce fine colour detail, while an audio codec might use a perceptual model to decide which sound information to omit. The choice of settings determines the trade-off between the amount retained and the resulting size.',
        'The colour lab makes this trade-off visible through channel quantisation. When fewer red, green and blue values are available, several slightly different original colours have to use the same stored value. The decoder then has no way to tell which of those colours was originally present. This explains both why detail is lost and why it cannot simply be restored afterwards. The lab illustrates that principle rather than implementing a complete JPEG encoder.'],
      ['Choose the method for the job',
        'Start by deciding whether an approximation is acceptable. A web gallery may prioritise quick downloads and accept a small loss of image detail, whereas a source-code archive must preserve every character. Once that requirement is clear, compare the actual size and quality produced by suitable encodings. Compression and decompression also require processing, so a smaller file is only one part of the practical choice.',
        'Keep an untouched original when you expect to create several lossy versions. Re-encoding a previously compressed approximation can discard more information, and saving that result in a lossless format preserves only what remains. It cannot recreate the missing detail. Starting each new version from the original avoids repeatedly accumulating loss in the same working copy.']
    ],
    examples: [
      {title: 'Quantise the lab image and calculate its payload', given: 'Consider a 96 × 64 image whose three colour channels each use 8 bits. We will compare it with a tightly packed version using 4 bits per channel, excluding headers and metadata from both sizes.', steps: [
        'Pixels = 96 × 64 = 6,144. Original bits per pixel = 3 × 8 = 24.',
        'Original payload = 6,144 × 24 = 147,456 bits = 18,432 bytes.',
        'New bits per pixel = 3 × 4 = 12. New payload = 73,728 bits = 9,216 bytes.',
        'Saving = (18,432 − 9,216) ÷ 18,432 × 100 = 50%. Ratio under our convention = 18,432 ÷ 9,216 = 2:1.',
        'Each channel now has 2⁴ = 16 possible levels instead of 2⁸ = 256. Fewer levels explain the visible colour loss; the size calculation alone does not measure perceived quality.'
      ], answer: 'Reducing every channel from 8 bits to 4 bits halves the ideal packed payload. The result applies to this specified representation; a PNG or JPEG file has its own encoding and overheads, so its download size need not match this calculation.'},
      {title: 'Choose a method and estimate transmission time', given: 'A lossy setting reduces an image collection from 24 MB to 6 MB while keeping acceptable viewing quality. Compare its transmission times over a 12 Mb/s link, using decimal MB and ignoring protocol overhead.', steps: [
        'Convert bytes to bits: 24 MB = 192 Mb, and 6 MB = 48 Mb.',
        'Original transfer time = 192 ÷ 12 = 16 seconds. Compressed transfer time = 48 ÷ 12 = 4 seconds.',
        'Saving is 75% and the ratio is 4:1. This may suit viewing photographs if the quality is acceptable.',
        'For a program file, the same willingness to change data would be inappropriate: exact executable instructions must be recovered, so use a suitable lossless method instead.'
      ], answer: 'The smaller collection takes less time to transmit because fewer bits cross the same link. That saving is useful only if the recovered image quality still meets the purpose; the same willingness to lose data would be unsuitable for a program.'}
    ],
    lab: 'Begin at 8 bits per colour channel, then reduce the setting to 4 and finally 1. As the number of available colour levels falls, compare the visible detail with the calculated payload size. When you return to 8 bits, the demo rebuilds the image from its untouched original; use this to explain why the slider can restore detail even though a lossy copy alone cannot.',
    traps: ['Lossless does not mean “no compression” or “always larger than lossy”.', 'A lossy file converted to a lossless format does not recover discarded information.', 'A compression ratio and a percentage saving are different quantities; show your convention.'],
    checks: [
      ['A 20 MB file compresses to 8 MB. Find the saving and ratio.', 'Saved size = 12 MB. Percentage saving = 12 ÷ 20 × 100 = 60%. Original ÷ compressed = 20 ÷ 8 = 2.5, so the ratio is 2.5:1 under the stated convention.'],
      ['Why should a source-code archive use lossless compression?', 'A program depends on the exact sequence of characters in its source code: changing or removing a character can alter its meaning or make it invalid. The archive must therefore reconstruct every original character, which is the guarantee provided by a lossless method.'],
      ['Why can two files of the same original size compress differently?', 'Compression depends on the patterns a method can exploit, rather than just the number of original bytes. One file may contain long repetitions while another contains little useful repetition, so the same method can produce different savings. The space needed for headers or dictionary entries also affects the final result.']
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
      ['Run-length encoding: describe a repeated symbol once',
        'Consider AAAABB. Rather than storing all six characters separately, run-length encoding can describe it as four As followed by two Bs. The encoder finds these runs by reading from left to right and counting consecutive copies of the same symbol. It then stores a count–symbol pair for each run. To decode the result, the receiver repeats each symbol by its count, recovering AAAABB exactly.',
        'Whether this saves space depends on how the pairs are stored. In the lab, each pair contains an 8-bit count and an 8-bit ASCII symbol, so it costs 16 bits. That is worthwhile for a long run, but a run of one would replace an 8-bit character with a 16-bit pair. This is why alternating symbols can expand under RLE. The count field also limits a pair to 255 copies, so a longer run must be split into several pairs.'],
      ['Dictionary coding: reuse a sequence wherever it occurs',
        'RLE needs consecutive copies of one symbol, but other useful patterns may be longer or appear in separate places. Dictionary coding stores such a sequence as a dictionary entry and uses a shorter reference whenever that entry occurs. During decoding, each reference is replaced by its entry. Because the entry preserves the original sequence, the replacement can still be lossless even though the encoded stream looks very different from the original text.',
        'The decoder must have access to the same dictionary, whether it is supplied beforehand, transmitted with the message or rebuilt using agreed rules. This lab transmits entries for words, groups of spaces and punctuation, preserving their case and exact spacing. Its token rules are an explicit teaching format, so other compression schemes may organise their dictionaries differently. The underlying requirement is the same: every reference must expand to the correct original sequence.'],
      ['Count the whole representation',
        'A short stream of references can look impressive, but it is only part of the encoded message when the dictionary must travel too. To make a fair comparison, first calculate the original size using the supplied character encoding. Then include the stream, the dictionary entries and any defined length fields or headers. Those costs explain why a dictionary may pay off for a long repetitive message but make a short message larger.',
        'Use the field sizes stated in the question or format, since they determine the calculation. For instance, fixed-width references need enough distinct codes for the available entries: four bits can distinguish 16 codes, while five bits can distinguish 32. The general minimum for n entries is ceil(log₂ n), before allowing for reserved codes. This calculation explains a reference width; it does not mean every dictionary format uses that exact layout.']
    ],
    examples: [
      {title: 'Encode, decode and size an RLE message', given: 'Encode AAAABB as (count, symbol) pairs, allowing 8 bits for each count and 8 for each symbol. We will compare the pair payload with the original 8-bit characters, excluding headers.', steps: [
        'The runs are AAAA and BB, so emit (4, A), (2, B). There are two pairs.',
        'Decode by producing four As and two Bs: AAAABB, exactly matching the input.',
        'Original size = 6 × 8 = 48 bits. Encoded size = 2 × (8 + 8) = 32 bits.',
        'Saving = 16 bits, or 16 ÷ 48 × 100 ≈ 33.3%. For ABABAB, six one-symbol runs would instead cost 96 bits, twice the original.'
      ], answer: 'RLE saves space when a pair replaces enough repeated symbols to cover its count and symbol fields. Under this format, a run of two breaks even before headers, while longer runs save payload bits.'},
      {title: 'Include a transmitted dictionary', given: 'Use a separate teaching format to encode ABABABAB, with dictionary entry 0 representing AB. Each occurrence uses a 2-bit reference; the transmitted dictionary stores the two 8-bit characters with an 8-bit length, and the message has a 16-bit header. These assumptions differ from the lab’s token rules.', steps: [
        'The original is eight characters, so its size is 8 × 8 = 64 bits.',
        'The stream is 0, 0, 0, 0: four 2-bit references, costing 8 bits.',
        'Dictionary cost = 2 × 8 + 8 = 24 bits. Add the 16-bit header and 8-bit stream: total = 48 bits.',
        'Saving = 64 − 48 = 16 bits, or 25%. Counting only the 8-bit stream would falsely report an 87.5% saving.',
        'For AB alone the same format would cost 16 + 24 + 2 = 42 bits against an original 16 bits, so the overhead outweighs reuse.'
      ], answer: 'Reusing an entry saves reference space, but the message must save enough to pay for its dictionary and header. This explains why the format compresses the longer repetition while expanding the short input.'},
      {title: 'Split a run when a count field is full', given: 'A message contains 300 consecutive As, but the lab’s count field can represent at most 255 in one pair. Use 16 bits per pair to work out how the encoder handles the remaining symbols.', steps: [
        'The first pair can represent 255 As: (255, A). The remaining run has 300 − 255 = 45 As.',
        'Emit a second pair (45, A). Decoding both pairs produces all 300 As.',
        'Encoded payload = 2 × 16 = 32 bits, compared with 300 × 8 = 2,400 original bits.'
      ], answer: 'The long run still compresses well, but it needs two pairs because 300 cannot fit in the unsigned 8-bit count field. Applying the count limit is part of following this format correctly.'}
    ],
    lab: 'Try AAAABB in the RLE lab, then replace it with ABABAB and compare the number of pairs. Use the changed run lengths to explain the difference in size. Next, enter repeated words in the dictionary lab and follow their references back to the entries. Include different spaces and punctuation to check that decoding preserves the exact text, then compare the stream-only cost with the complete encoded cost.',
    traps: ['RLE compresses consecutive runs, not every occurrence of a letter anywhere in a file.', 'Dictionary references are not meaningful without an available dictionary or reconstruction rule.', 'A readable pair label is not a sufficient basis for its bit cost; use the supplied fields.'],
    checks: [
      ['Encode AAABCC using 16-bit RLE pairs and compare with the 8-bit original.', 'Runs are (3, A), (1, B), (2, C). Encoded size = 3 × 16 = 48 bits. Original size = 6 × 8 = 48 bits. The payload breaks even; an additional header would make this example larger.'],
      ['Why must a dictionary preserve two spaces if the original has two spaces?', 'A lossless method must recover the exact original sequence, including its spaces. If the decoder produced only one space, it would have changed the data even if the sentence still looked readable. The dictionary and token rules must therefore preserve the difference between one space and two.'],
      ['A fixed-width dictionary has 17 entries. What is the minimum reference width if all codes are available?', 'Four bits provide 16 different codes, so they cannot identify all 17 entries. Increasing the width to five bits provides 32 codes and is sufficient under the stated assumptions. A format that reserves some codes for other purposes may need a different calculation.']
    ],
    exam: 'State the representation first, show the encoded sequence and demonstrate decoding. Calculate original and complete encoded sizes separately, then conclude whether it compresses this particular input and explain the pattern responsible.'
  },
  encryption: {
    goal: 'Follow a message from readable plaintext to encrypted ciphertext and back again, then explain how symmetric and asymmetric encryption give the intended recipient the key needed to recover it.',
    terms: [
      ['Plaintext / ciphertext', 'The original readable data / its encrypted representation.'],
      ['Symmetric encryption', 'The same secret key is used for encryption and decryption.'],
      ['Public / private key', 'A related asymmetric key pair: the public key may be distributed, while the private key must remain secret.'],
      ['Authentication', 'Establishing a claimed identity or the origin of information under a trusted scheme.']
    ],
    sections: [
      ['Why encrypt a message?',
        'Imagine Alice wants to send Bob a message across a connection that Eve can observe. If Alice sends the readable message, called plaintext, Eve can copy and read it. Encryption addresses this problem by using an algorithm and a key to transform the plaintext into ciphertext. Bob uses the appropriate key to reverse the operation and recover the original message.',
        'Eve may still intercept the ciphertext, so encryption does not rely on making interception impossible. Instead, a suitable scheme makes recovering the plaintext infeasible without the required secret. The algorithm itself can be publicly known: it is the protection of the keys, together with the strength and correct use of the scheme, that keeps the content confidential.'],
      ['Symmetric encryption: Alice and Bob share one secret',
        'With symmetric encryption, Alice uses a secret key to encrypt her message and Bob uses that same key to decrypt it. This makes the key arrangement easy to describe: both participants need the same secret, while Eve must not have it. Symmetric methods are efficient for large amounts of data, so they are useful when many messages or a large file must be protected.',
        'The difficulty is getting that shared secret to both participants securely. If Alice sends the key openly beside the ciphertext, Eve can copy both and decrypt the message just as Bob would. Alice and Bob therefore need a protected way to establish the key before relying on it. In the lab, this secure establishment is assumed; the activity then shows how the shared key is used.'],
      ['Asymmetric encryption: make one key public and keep its partner private',
        'Asymmetric encryption uses a related pair of keys instead of one shared secret. To receive a confidential message, Bob creates a public/private pair and keeps the private key secret. Alice encrypts using Bob’s public key, which he can make available to others. Bob then decrypts using the corresponding private key. Knowing the public key allows Eve to encrypt messages to Bob too, but it does not give her the secret needed to decrypt Alice’s message.',
        'This solves the need to distribute Bob’s decryption key, but Alice still needs to know whose public key she has received. If Eve substitutes her own public key and claims it belongs to Bob, Alice could unknowingly encrypt a message that Eve can decrypt. Certificates or another trusted verification route address this ownership problem. The public key can be shared openly; the claim that it belongs to Bob still needs verification.'],
      ['Why real systems often combine the two approaches',
        'Symmetric and asymmetric methods have complementary strengths. Symmetric encryption efficiently protects large amounts of data, while an appropriate asymmetric mechanism can help participants establish or protect a shared session secret. A hybrid system combines them: it first establishes that secret, then uses symmetric encryption for the main exchange. This avoids trying to encrypt a large file directly with a scheme designed for much smaller inputs.',
        'The exact mechanism depends on the protocol, so the lab’s RSA example is one way to explore the public/private key roles rather than a model of every secure connection. When explaining a hybrid design, follow the secret through the process: how the intended parties obtain it, who must keep it private, and how they use it to encrypt and decrypt the bulk data.'],
      ['What confidentiality does—and what else may be needed',
        'The purpose discussed so far is confidentiality: preventing an observer from reading the content. A system may also need to detect changes to a message and establish who sent it. These are related security needs, but protecting the content from reading does not automatically satisfy them. For example, an encrypted message could still have been supplied by the wrong person.',
        'Authenticated encryption adds an authentication tag that lets a recipient detect tampering under the relevant key. Digital signatures address a different arrangement: a signer uses a signing private key to create a signature that others can check using the corresponding public key. These mechanisms are extra context for understanding real systems. Keep the core encryption explanation clear first: which key encrypts, which key decrypts, and who holds each one.']
    ],
    examples: [
      {title: 'Send a secret to Bob with a key pair', given: 'Bob has a key pair labelled B-public and B-private. Alice wants to send him a confidential message, while Eve can observe the traffic but does not have B-private.', steps: [
        'Alice first obtains B-public and verifies through a trusted method that it really belongs to Bob. This makes sure she is preparing the message for the intended recipient.',
        'She uses B-public with an appropriate encryption scheme to turn her plaintext into ciphertext, then sends that ciphertext across the observable channel.',
        'Bob uses B-private to recover the plaintext. Eve can copy the ciphertext, but her unrelated private key does not match B-public and cannot correctly decrypt it.',
        'Now consider the ownership check: if Eve had substituted E-public before encryption and Alice had accepted it as Bob’s, Eve could decrypt the result with E-private. This is why verifying the key’s owner matters alongside using the correct encryption scheme.'
      ], answer: 'The required key sequence is Bob’s public key for encryption, followed by Bob’s matching private key for decryption. Verifying the public key’s ownership ensures that this sequence protects a message intended for Bob.'},
      {title: 'Protect a large file efficiently', given: 'Alice wants to send Bob a large video, but they do not yet share a session secret. Follow how a hybrid approach can establish that secret before using it to protect the video.', steps: [
        'Authenticate the relevant public key or key-establishment exchange so Alice is communicating with the intended recipient.',
        'Use an appropriate asymmetric mechanism to establish/protect a fresh symmetric session secret.',
        'Encrypt the video with a suitable authenticated symmetric scheme, following its nonce/IV requirements. Send the necessary non-secret parameters and ciphertext/tag.',
        'Bob obtains the same session secret, verifies the authentication tag and decrypts. A failed verification must be treated as failure, not as a usable approximate message.'
      ], answer: 'The asymmetric stage helps the parties obtain a shared secret, and the symmetric stage uses it to protect the large file efficiently. Any nonce/IV is a separate parameter from that secret key and must follow the chosen scheme’s requirements.'}
    ],
    lab: 'Run the symmetric mode first and follow the same shared secret from encryption to decryption. Then repeat in asymmetric mode, tracking Bob’s public and private keys separately. Try Eve’s unrelated key and use the key arrangement to explain the failure. The browser performs real AES-GCM and RSA-OAEP operations, although the packet animation is illustrative. If you repeat a message, fresh randomness can change its ciphertext while Bob still recovers the same plaintext.',
    traps: ['Public-key encryption uses the recipient’s public key for confidentiality, not a private key shared with everyone.', 'Encryption alone does not establish whose public key was received.', 'A digital signature is not adequately explained as simply “encrypting the whole message with the private key”.'],
    checks: [
      ['Which key does Bob use to decrypt a message encrypted with B-public?', 'Bob uses the corresponding B-private because those two keys form the required pair. Alice’s private key or Eve’s unrelated private key would not match the public key used for encryption.'],
      ['Why can two encryptions of identical plaintext differ?', 'A secure scheme can include fresh randomised parameters, such as an IV/nonce or padding randomness, when it encrypts a message. These can change the ciphertext without changing the underlying plaintext, so the correct decryption key and parameters can still recover the same message each time.'],
      ['Why is sending a shared secret through the same openly readable channel unsafe?', 'Anyone who copies the openly transmitted key can use it with the ciphertext to recover the message. Alice and Bob must therefore establish or transport the shared secret through an appropriately protected mechanism before depending on it for confidentiality.']
    ],
    exam: 'Write a clear Alice/Bob sequence and name the owner and role of every key. Separate the goal of hiding data from verifying identity or detecting tampering, then explain why the selected mechanism addresses the stated goal.'
  },
  hashing: {
    goal: 'Understand what a hash value tells you about its input, then apply that idea to checking a file, verifying a password and locating an entry in a hash table.',
    terms: [
      ['Digest', 'The fixed-length output of a hash function for an input.'],
      ['Deterministic', 'The same input bytes under the same function produce the same output.'],
      ['Collision', 'Two different inputs produce the same hash output or, for a hash table, map to the same bucket.'],
      ['Preimage resistance', 'For a cryptographic hash, finding an input that produces a given digest should be computationally infeasible.']
    ],
    sections: [
      ['Turn an input into a repeatable fingerprint',
        'A hash function applies a defined rule to some input data and produces a value. With a cryptographic hash, that output is a fixed-length digest that can serve as a fingerprint of the input. Running the same function on exactly the same bytes produces the same digest, which makes comparison useful. Changing a letter’s case, adding a space or using a different character encoding can change those bytes and therefore change the result.',
        'The lab uses SHA-256, whose digest always contains 256 bits. Since one hexadecimal digit represents four bits, the display needs 256 ÷ 4 = 64 digits whether the input is a short message or a large file. A small input change will typically alter many digest bits, an effect called avalanche. The digest still cannot be decrypted to recover the original: hashing has no decryption key and does not retain a reversible copy of the input.'],
      ['Understand why collisions are possible',
        'Fixed length gives a hash only a finite number of possible outputs, while there are far more possible inputs. Some different inputs must therefore share a digest; this is a collision. A suitable cryptographic hash is designed to make finding such a pair computationally infeasible at its intended security level. Collision resistance describes that practical difficulty rather than a promise that collisions cannot exist.',
        'This distinction helps you interpret comparisons correctly. Different digests show that the checked input bytes differ, assuming the same function was computed correctly. Matching digests provide useful evidence of a match under a suitable scheme, but cannot mathematically prove that every possible pair of inputs is identical. The worked examples apply this idea to both cryptographic checks and a deliberately simple hash-table rule.'],
      ['Use a digest to check a downloaded file',
        'Suppose a publisher supplies a file together with its expected digest. After downloading the file, you calculate its digest using the same function and compare the results. A mismatch tells you that the downloaded bytes differ from the version represented by the expected digest. It detects a difference without, by itself, telling you whether the cause was accidental corruption or deliberate alteration.',
        'For this check to mean what you intend, obtain the expected digest through a trusted route. If an attacker can replace both the file and the value shown beside it, the attacker can supply a matching pair. The comparison would then succeed without establishing that the file came from the publisher. Trust in the expected value is therefore part of the checking process, rather than something the hash automatically provides.'],
      ['Verify a password without storing its readable form',
        'The same repeat-and-compare idea can be used when someone logs in. Instead of keeping the readable password, a service stores a value derived from it. When the user returns, the service applies the same derivation to the entered password and compares the result with the stored value. It can therefore check a password without needing a decryption step to recover a stored plaintext password.',
        'Real password storage needs additional protection because an attacker with the stored values could try likely passwords and compare the results. A purpose-designed slow password-hashing/key-derivation function makes each guess more costly. A separate per-password salt makes identical passwords produce different stored results when their salts differ, reducing the usefulness of precomputed tables. The salt and parameters are normally stored with the derived value; a single fast SHA-256 digest, like the comparison demo, is not a suitable password-storage design.'],
      ['Use a hash to find a table entry',
        'Hashing can also organise data for lookup. In a hash table, a function maps a key to a bucket where the corresponding entry may be stored. This narrows the search, so a well-distributed table can provide fast average lookup. Its indexing function does not need the cryptographic properties used to protect a digest comparison; it needs to distribute keys usefully and work with the table’s collision-handling method.',
        'Because different keys can map to the same bucket, reaching the bucket is only the first step. In the lab’s chaining example, the bucket holds several entries and the lookup compares their full keys to find the requested one. If many keys collect in a single bucket, more comparisons are needed and lookup becomes slower. The CAT/ACT example below shows why sharing a bucket does not mean sharing the same key.']
    ],
    examples: [
      {title: 'Interpret the size of a SHA-256 digest', given: 'Compare the SHA-256 digest of a 3-byte message with that of a 3 GB file. Both full digests are displayed in hexadecimal, allowing us to distinguish input size from output length.', steps: [
        'Both outputs contain 256 bits, regardless of the input lengths.',
        'Convert to bytes: 256 ÷ 8 = 32 bytes. Convert to hexadecimal digits: 256 ÷ 4 = 64.',
        'The larger file taking more work to read does not make its digest longer.',
        'Because a 32-byte digest cannot losslessly represent every possible 3 GB file, a decoder cannot reconstruct an arbitrary original from the digest alone.'
      ], answer: 'Both digests have the same fixed length because that length is set by SHA-256. A longer input does not create a longer digest, and the digest does not provide a reversible compressed copy of either input.'},
      {title: 'Resolve a collision in the toy hash table', given: 'Apply the lab’s rule by adding the ASCII character codes and taking the remainder modulo 10. For CAT, use C = 67, A = 65 and T = 84, then compare the result with ACT.', steps: [
        'CAT gives 67 + 65 + 84 = 216; 216 mod 10 = 6.',
        'ACT contains the same codes in a different order, so it also gives 216 and bucket 6. This weak sum ignores order.',
        'Store both entries in bucket 6’s chain. Looking up ACT requires comparing the full keys in that chain until ACT is found.',
        'The collision does not mean CAT and ACT are equal. It means the index alone is insufficient to identify one entry.'
      ], answer: 'Comparing the full keys preserves correct lookup even though CAT and ACT share a bucket. Too many collisions would make lookup slower, and the simple order-insensitive rule also lacks the properties needed for a cryptographic hash.'},
      {title: 'Check a download without trusting the attacker', given: 'A publisher provides a file and its expected SHA-256 digest. Suppose an attacker can alter a download mirror; decide how the user should obtain and compare the expected value.', steps: [
        'Obtain the expected digest through an authenticated or otherwise trusted route, independently of the attacker’s control.',
        'Hash the downloaded bytes using the same algorithm and compare the complete digest.',
        'Reject a mismatch. A matching trusted digest supports the integrity check, subject to the scheme’s assumptions.',
        'If both file and “expected” digest are fetched from an untrusted altered page, an attacker can replace both. A valid signature under a trusted public key is one way to address origin/authenticity as well.'
      ], answer: 'The comparison is useful because the expected value comes from a trusted route. If the attacker supplies that value too, a matching digest cannot establish that the publisher supplied the downloaded file.'}
    ],
    lab: 'Make the two messages identical and confirm that their digests match. Then change one character and observe how the digest changes, relating the result to the input bytes rather than just the visible wording. In the bucket lab, compare CAT with ACT and follow both to their shared bucket. Use that collision to explain why a lookup must compare full keys after choosing a bucket.',
    traps: ['Fixed length does not mean every input has a unique digest.', 'A hash is not ciphertext that can be decrypted with a secret key.', 'A fast cryptographic hash demo is not a recommended password-storage implementation.'],
    checks: [
      ['How many hexadecimal digits represent a 160-bit digest?', 'Each hexadecimal digit represents four bits, so a 160-bit digest needs 160 ÷ 4 = 40 digits. The calculation describes how the digest is displayed; it does not recommend choosing any particular hash algorithm.'],
      ['Does a different digest prove the input changed?', 'If the same deterministic function has been computed correctly, different digests imply different input bytes. Be careful when reversing that statement: equal digests do not mathematically guarantee equal inputs, because two different inputs can collide.'],
      ['Why should a hash-table lookup compare full keys?', 'The hash selects a bucket, but several different keys may have been placed there. Comparing the full keys lets the lookup distinguish the requested entry from the other entries in that bucket, so collisions do not lead to the wrong record being returned.']
    ],
    exam: 'Identify the use first: integrity checking, password verification or indexing. Explain the complete procedure and its trust or collision assumptions. Use “computationally infeasible” rather than claiming collisions or guessing are absolutely impossible.'
  }
};
