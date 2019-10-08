/**
 * Logic for encrypting secrets for use on a secret sharing pad.
 */


/**
 * Generate unbiased random integers between lo and hi (inclusive) using
 * Crypto.getRandomValues().
 *
 * Range is limited to 65535 (16 bits).
 */
export function cryptoRandInt(lo, hi) {
	const range = hi - lo + 1;
	
	const randomMax = Math.floor((1<<16) / range) * range;
	const a = new Uint16Array(1);
	let firstIteration = true;
	while (a[0] >= randomMax || firstIteration) {
		firstIteration = false;
		window.crypto.getRandomValues(a);
	}
	
	let value = a[0] % range;
	
	return lo + value;
}


/**
 * Encrypt a character as a pair of numbers in the range 0-999 inclusive.
 */
export function encryptAsciiChar(c) {
	const charCode = c.charCodeAt(0);
	
	if (charCode != 0 && (charCode < 32 || charCode > 126)) {
		throw "Character is not a printable ASCII character or NULL."
	}
	
	const randomNumber = cryptoRandInt(0, 999);
	
	return [randomNumber, (1000 + charCode - randomNumber) % 1000];
}

/**
 * Encrypt a string, return the two number sequences.
 */
export function encryptString(s) {
	const a1 = [];
	const a2 = [];
	for (let i = 0; i < s.length; i++) {
		const [v1, v2] = encryptAsciiChar(s[i]);
		a1.push(v1);
		a2.push(v2);
	}
	
	return [a1, a2];
}


/**
 * Add a random number of null characters to the end of the supplied string.
 * The length of the string may be increased by up to double its original
 * length.
 */
export function randomlyPadString(s) {
	const padLength = cryptoRandInt(s.length, s.length*2);
	return s.padEnd(padLength, "\0");
}


/**
 * Generate a datastructure defining a set of secret sharing pads.
 *
 * @param secrets An array of {name, description, secret, pad} objects defining
 *        the complete set of secrets to encrypt.
 * @param letters An array of letters to use to identify the pads over which
 *        the secrets will be shared.
 *
 * @return [
 *    {
 *        letter,
 *        encryptedSecrets: [
 *            {
 *                name,
 *                description,
 *                encryptedSecret: [{letter, code: [n, ...]}, ...],
 *            },
 *            ...
 *        ],
 *    },
 *    ...
 * ]
 */
export function generateSecretSharingPadData(secrets, letters) {
	const out = letters.map(letter => ({
		letter,
		encryptedSecrets: secrets.map(({name, description}) => ({
			name,
			description,
			encryptedSecret: [],
		})),
	}));
	
	for (let secretNo = 0; secretNo < secrets.length; secretNo++) {
		let {name, description, secret, pad} = secrets[secretNo];
		
		if (pad) {
			secret = randomlyPadString(secret);
		}
		
		for (let letterNo1 = 0; letterNo1 < letters.length; letterNo1++) {
			for (let letterNo2 = letterNo1+1; letterNo2 < letters.length; letterNo2++) {
				const [code1, code2] = encryptString(secret);
				out[letterNo1].encryptedSecrets[secretNo].encryptedSecret.push({
					letter: letters[letterNo2],
					code: code1,
				});
				
				out[letterNo2].encryptedSecrets[secretNo].encryptedSecret.push({
					letter: letters[letterNo1],
					code: code2,
				});
			}
		}
	}
	
	return out;
}
