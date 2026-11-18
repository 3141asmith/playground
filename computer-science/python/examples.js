/* Original classroom examples. None of these scripts sends network requests. */
window.PythonScripts=[
  {id:'caesar',title:'Caesar cipher',group:'Classical ciphers',description:'Shift each letter by the same amount, then reverse the shift to recover the message. Spaces and punctuation stay in place.',scope:'Extra context: this named cipher and its implementation are enrichment, not an algorithm to memorise for OCR 1.3.1(c). It illustrates a shared key, but is easily broken and is not suitable for protecting data.',challenge:'Change shift to 7 or 29 and predict the output. Why does a shift of 26 leave English letters unchanged? Try decrypting with the wrong shift.',code:`# Caesar cipher: the same shift is the shared secret.
# This historical cipher is NOT secure modern encryption.

def caesar(text, shift):
    result = []
    for character in text:
        if "A" <= character <= "Z":
            start = ord("A")
        elif "a" <= character <= "z":
            start = ord("a")
        else:
            result.append(character)
            continue

        position = ord(character) - start
        result.append(chr(start + (position + shift) % 26))
    return "".join(result)


message = "Meet me at the library!"
shift = 3

encrypted = caesar(message, shift)
recovered = caesar(encrypted, -shift)

print("Original: ", message)
print("Encrypted:", encrypted)
print("Recovered:", recovered)
assert recovered == message
`},
  {id:'vigenere',title:'Vigenère cipher',group:'Classical ciphers',description:'Use a repeating keyword to choose a different shift for each letter. Follow how the key position advances only when a letter is processed.',scope:'Extra context: Vigenère is a historical programming example, not a prescribed OCR encryption algorithm. Repeating-key Vigenère is vulnerable to analysis and is not modern secure encryption.',challenge:'Try the message ATTACKATDAWN and keyword LEMON; expect LXFOPVEFRNHR. Then add spaces: why should the same letters still receive the same shifts?',code:`# Vigenere cipher for English A-Z letters.
# A repeating keyword is educational, not modern security.

def vigenere(text, keyword, decrypt=False):
    if not keyword or any(
        not ("A" <= letter <= "Z" or "a" <= letter <= "z")
        for letter in keyword
    ):
        raise ValueError("The keyword must contain only A-Z letters.")
    key = keyword.upper()

    result = []
    key_position = 0
    direction = -1 if decrypt else 1

    for character in text:
        if "A" <= character <= "Z" or "a" <= character <= "z":
            start = ord("A") if character.isupper() else ord("a")
            shift = ord(key[key_position % len(key)]) - ord("A")
            offset = (ord(character) - start + direction * shift) % 26
            result.append(chr(start + offset))
            key_position += 1
        else:
            result.append(character)
    return "".join(result)


message = "ATTACKATDAWN"
keyword = "LEMON"
encrypted = vigenere(message, keyword)
recovered = vigenere(encrypted, keyword, decrypt=True)

print("Message:  ", message)
print("Keyword:  ", keyword)
print("Encrypted:", encrypted)
print("Recovered:", recovered)
assert recovered == message
`},
  {id:'atbash',title:'Atbash substitution',group:'Classical ciphers',description:'Replace A with Z, B with Y and so on. Applying the same substitution again reverses it, without needing a separate decryption function.',scope:'Extra context: Atbash is a simple substitution exercise. It has no secret key in this fixed alphabet and should not be mistaken for secure encryption.',challenge:'Run the function twice on your own message. Why does it recover the original, and why does the public fixed mapping make it unsuitable for secrecy?',code:`# A fixed reversed alphabet; no secret key is involved.

def atbash(text):
    output = []
    for character in text:
        if "A" <= character <= "Z":
            output.append(chr(ord("Z") - (ord(character) - ord("A"))))
        elif "a" <= character <= "z":
            output.append(chr(ord("z") - (ord(character) - ord("a"))))
        else:
            output.append(character)
    return "".join(output)


message = "Hello, world!"
encrypted = atbash(message)
recovered = atbash(encrypted)

print("Original: ", message)
print("Encrypted:", encrypted)
print("Recovered:", recovered)
assert recovered == message
`},
  {id:'rail-fence',title:'Rail fence transposition',group:'Classical ciphers',description:'Write characters along a zigzag across several rails, then read one rail at a time. This changes positions rather than replacing the characters.',scope:'Extra context: rail fence is an enrichment example of transposition, not an OCR-prescribed encryption method. A small rail count is easy to try and does not provide modern security.',challenge:'Compare 2, 3 and 4 rails. Add spaces to the message and check that decrypting restores them exactly. Which information changes: the characters, their positions, or both?',code:`# A zigzag transposition, not modern secure encryption.

def rail_pattern(length, rails):
    if not isinstance(rails, int) or rails < 2:
        raise ValueError("Use an integer rail count of at least 2.")
    cycle = 2 * (rails - 1)
    return [min(i % cycle, cycle - i % cycle) for i in range(length)]


def encrypt(text, rails):
    pattern = rail_pattern(len(text), rails)
    return "".join(
        character
        for rail in range(rails)
        for character, position in zip(text, pattern)
        if position == rail
    )


def decrypt(ciphertext, rails):
    pattern = rail_pattern(len(ciphertext), rails)
    rows = []
    start = 0
    for rail in range(rails):
        count = pattern.count(rail)
        rows.append(iter(ciphertext[start:start + count]))
        start += count
    return "".join(next(rows[rail]) for rail in pattern)


message = "WEAREDISCOVEREDFLEEATONCE"
rails = 3
encrypted = encrypt(message, rails)
recovered = decrypt(encrypted, rails)

print("Encrypted:", encrypted)
print("Recovered:", recovered)
assert recovered == message
`},
  {id:'one-time-pad',title:'One-time-pad principle',group:'Encryption & keys',description:'Explore how XOR with a same-length secret can recover the original bytes. Generate a fresh key for this one message, and observe that applying XOR twice reverses it.',scope:'Extra context: this illustrates the one-time-pad principle using operating-system random bytes. The theoretical perfect-secrecy result requires a truly random secret as long as the message, shared securely and never reused. This example supplies no tamper authentication.',challenge:'Compare the message and key lengths in bytes, including a non-English character. Explain why secure key distribution remains a problem even though the XOR operation is simple.',code:`import os

# One message, one fresh same-length key.
# Do not reuse a pad. This example does NOT authenticate messages.

message = "A secret for the classroom".encode("utf-8")
key = os.urandom(len(message))


def xor_bytes(data, pad):
    if len(data) != len(pad):
        raise ValueError("The pad must be exactly as long as the data.")
    return bytes(left ^ right for left, right in zip(data, pad))


ciphertext = xor_bytes(message, key)
recovered = xor_bytes(ciphertext, key)

print("Message bytes:", len(message))
print("Key bytes:    ", len(key))
print("Ciphertext:   ", ciphertext.hex())
print("Recovered:    ", recovered.decode("utf-8"))
assert recovered == message
`},
  {id:'fernet',title:'Fernet: shared-key encryption',group:'Encryption & keys',description:'Use a high-level authenticated encryption interface. The same secret encrypts and decrypts, while a different key is rejected.',scope:'OCR connection: symmetric encryption uses a shared secret. Extra context: Fernet and its Python API are practical examples, not named requirements of OCR 1.3.1(c). The displayed key is generated solely for this demonstration.',challenge:'Encrypt the same message twice and compare the tokens. Why can they differ while both decrypt to the same message? Try the wrong key and explain the rejection.',code:`from cryptography.fernet import Fernet, InvalidToken

# This secret is for a disposable classroom example.
key = Fernet.generate_key()
box = Fernet(key)
message = "Meet me in the library.".encode("utf-8")

token = box.encrypt(message)
recovered = box.decrypt(token)

print("Demo shared key:", key.decode("ascii"))
print("Encrypted token:", token.decode("ascii"))
print("Recovered:      ", recovered.decode("utf-8"))
assert recovered == message

wrong_box = Fernet(Fernet.generate_key())
try:
    wrong_box.decrypt(token)
except InvalidToken:
    print("Wrong key rejected: the token could not be authenticated.")
`},
  {id:'aes-gcm',title:'AES-GCM: detect tampering',group:'Encryption & keys',description:'Encrypt with a shared key and a fresh nonce, then deliberately alter the ciphertext. Authenticated decryption rejects the altered result.',scope:'OCR connection: shared-secret encryption. Extra context: AES-GCM, nonce sizes and authentication tags are implementation details beyond the named symmetric/asymmetric requirement. Each key/nonce pair must be used only once for encryption.',challenge:'Change the message and run again. Look at the fresh nonce and ciphertext. Why is rejecting tampered ciphertext more useful than returning a plausible-looking corrupted message?',code:`import os
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.exceptions import InvalidTag

key = AESGCM.generate_key(bit_length=256)
box = AESGCM(key)
nonce = os.urandom(12)  # Fresh for this encryption under this key.
message = "A message with tamper detection.".encode("utf-8")

# The returned value contains ciphertext and its authentication tag.
ciphertext = box.encrypt(nonce, message, None)
recovered = box.decrypt(nonce, ciphertext, None)

print("Nonce:           ", nonce.hex())
print("Ciphertext + tag:", ciphertext.hex())
print("Recovered:       ", recovered.decode("utf-8"))
assert recovered == message

# Flip one bit without updating the authentication tag.
altered = bytearray(ciphertext)
altered[0] ^= 1
try:
    box.decrypt(nonce, bytes(altered), None)
except InvalidTag:
    print("Tampering detected: altered ciphertext was rejected.")
`},
  {id:'rsa-oaep',title:'RSA-OAEP: a public/private pair',group:'Encryption & keys',description:'Generate a real key pair, encrypt a short message with the public key and decrypt with the private key. An unrelated private key cannot recover it.',scope:'OCR connection: the recipient’s public key encrypts and the corresponding private key decrypts. Extra context: RSA-OAEP, padding, key sizes and this library API are implementation examples. Long files normally use a suitable hybrid design.',challenge:'Identify which object Alice could have and which Bob must keep secret. Replace the message with a longer one and explain the size limit. Why does Alice still need to verify whose public key she has?',code:`from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives import hashes

# Bob creates the pair and keeps private_key secret.
private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
public_key = private_key.public_key()

scheme = padding.OAEP(
    mgf=padding.MGF1(algorithm=hashes.SHA256()),
    algorithm=hashes.SHA256(),
    label=None,
)

message = "A short message for Bob".encode("utf-8")
# 2048-bit RSA with SHA-256 OAEP allows at most 190 message bytes.
if len(message) > 190:
    raise ValueError("This example accepts at most 190 UTF-8 bytes.")

ciphertext = public_key.encrypt(message, scheme)
recovered = private_key.decrypt(ciphertext, scheme)

print("Public exponent:", public_key.public_numbers().e)
print("Ciphertext:    ", ciphertext.hex())
print("Recovered:     ", recovered.decode("utf-8"))
assert recovered == message

unrelated_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
try:
    unrelated_key.decrypt(ciphertext, scheme)
except ValueError:
    print("Unrelated private key rejected.")
`},
  {id:'hashing',title:'SHA-256: compare digests',group:'Hashing & Python basics',description:'Calculate a digest for two similar messages. Compare their bytes and hashes to see why hashing is useful for checks rather than reversible encryption.',scope:'OCR connection: uses of hashing in 1.3.1(d). Extra context: SHA-256 and its digest size are specific implementation examples. This fast hash is not a suitable password-storage design on its own.',challenge:'Make both messages identical, then change a space or the case of one letter. How many hexadecimal digits are displayed, and why can you not decrypt the digest?',code:`import hashlib

first = "Hello, world!"
second = "hello, world!"


def digest(text):
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


first_hash = digest(first)
second_hash = digest(second)

print("First: ", first_hash)
print("Second:", second_hash)
print("Same digest?", first_hash == second_hash)
print("Hex digits: ", len(first_hash))
print("A digest is compared, not decrypted.")
`},
  {id:'input',title:'Read input & print output',group:'Hashing & Python basics',description:'Use input(), variables and a loop. Enter one answer per line in the input box before running, then follow how each call consumes the next answer.',scope:'OCR connection: programming practice supports the wider course. This starter is a workspace demonstration rather than an extra encryption algorithm to learn.',challenge:'Supply your name on the first input line and a small integer on the second. Add another input() call and an extra answer, then try leaving an answer out to see EOFError.',stdin:'Ada\n3',code:`name = input("Your name: ")
repeats = int(input("How many greetings? "))

for number in range(repeats):
    print(f"{number + 1}. Hello, {name}!")
`}
];
