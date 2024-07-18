const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

function base58Decode(address: string) {
    let num = BigInt(0);
    for (const char of address) {
        const charIndex = BASE58_ALPHABET.indexOf(char);
        if (charIndex === -1) {
            throw new Error('Invalid base58 character');
        }
        num = num * BigInt(58) + BigInt(charIndex);
    }

    const byteArray = [];
    while (num > 0) {
        byteArray.push(Number(num % BigInt(256)));
        num = num / BigInt(256);
    }

    // Account for leading zeros
    for (const char of address) {
        if (char === BASE58_ALPHABET[0]) {
            byteArray.push(0);
        } else {
            break;
        }
    }

    return Uint8Array.from(byteArray.reverse());
}

export const isValidSolanaAddress = (address: string) => {
    try {
        const decoded = base58Decode(address);
        return decoded.length === 32;
    } catch (e) {
        return false;
    }
};
