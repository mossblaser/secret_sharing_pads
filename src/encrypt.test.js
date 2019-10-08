// Polyfill for nodejs environment
//
// Adds window.crypto with interface similar to browser-based version
import "window-crypto";

import {
	cryptoRandInt,
	encryptAsciiChar,
	randomlyPadString,
	generateSecretSharingPadData,
} from "./encrypt.js";

describe("cryptoRandInt", function() {
	test("values cover full range", function() {
		const lo = 100;
		const hi = 110;
		const generatedValues = new Set();
		
		for (let i = 0; i < 1000; i++) {
			generatedValues.add(cryptoRandInt(lo, hi));
		}
		
		expect(generatedValues.size).toEqual(11);
		for (let i = lo; i <= hi; i++) {
			expect(generatedValues.has(i)).toBe(true);
		}
	});
	
	test("works for empty range", function() {
		const generatedValues = new Set();
		for (let i = 0; i < 1000; i++) {
			generatedValues.add(cryptoRandInt(123, 123));
		}
		
		expect(generatedValues.size).toEqual(1);
		expect(generatedValues.has(123)).toBe(true);
	});
});

describe("encryptAsciiChar", function() {
	test("produces valid pairs for printable chars", function() {
		for (const c of [" ", "a", "~", "\0"]) {
			const allAs = new Set();
			const allBs = new Set();
			
			for (let i = 0; i < 100; i++) {
				const [a, b] = encryptAsciiChar(c);
				
				allAs.add(a);
				allBs.add(b);
				
				// Must be no more than 3 digits
				expect(a).toBeLessThan(1000);
				expect(a).toBeGreaterThanOrEqual(0);
				expect(b).toBeLessThan(1000);
				expect(b).toBeGreaterThanOrEqual(0);
				
				// Must decode correctly
				expect(String.fromCharCode((a + b) % 1000)).toBe(c);
			}
			
			// Must have produced different values when called with the same
			// characters
			expect(allAs.size).toBeGreaterThan(5);
			expect(allBs.size).toBeGreaterThan(5);
		}
	});
	
	test("fails for non-printable ASCII, and non-ascii chars", function() {
		for (const c of ["\x1F", "\x7F", "\u1234"]) {
			expect(() => encryptAsciiChar(c)).toThrow();
		}
	});
});

describe("randomlyPadString", function() {
	test("always returns the original string followed by some nulls", function() {
		for (let i = 0; i < 100; i++) {
			const s = randomlyPadString("foobar");
			
			const front = s.substring(0, 6);
			const back = s.substring(6, s.length);
			
			// Should start with original string
			expect(front).toBe("foobar");
			
			// And be padded with nulls
			for (let i = 0; i < back.length; i++) {
				expect(back[i]).toBe("\0");
			}
		}
	});
	
	test("up-to doubles length", function() {
		for (const input of ["", "a", "foobar"]) {
			const lengths = new Set();
			for (let i = 0; i < 100; i++) {
				const output = randomlyPadString(input);
				lengths.add(output.length);
			}
			
			// Check all possible lengths were encountered (and no others!)
			expect(lengths.size).toBe(input.length + 1);
			for (let i = input.length; i <= input.length*2; i++) {
				expect(lengths.has(i)).toBe(true);
			}
		}
	});
});

describe("generateSecretSharingPadData", function() {
	test("one pad created per letter", function() {
		const padData = generateSecretSharingPadData([], ["A", "B", "C", "D"]);
		expect(padData).toHaveLength(4);
		expect(padData[0].letter).toBe("A");
		expect(padData[1].letter).toBe("B");
		expect(padData[2].letter).toBe("C");
		expect(padData[3].letter).toBe("D");
	});
	
	test("every sheet has all secrets for every other sheet", function() {
		const secrets = [
			{name: "s1", description: "", secret: "foo", pad: false},
			{name: "s2", description: "", secret: "bar", pad: true},
		];
		const letters = ["A", "B", "C", "D"]
		const padData = generateSecretSharingPadData(secrets, letters);
		
		expect(padData[0].encryptedSecrets).toHaveLength(2);
		expect(padData[1].encryptedSecrets).toHaveLength(2);
		expect(padData[2].encryptedSecrets).toHaveLength(2);
		expect(padData[3].encryptedSecrets).toHaveLength(2);
	});
	
	test("padding option is obeyed", function() {
		const secrets = [
			{name: "s1", description: "", secret: "foo", pad: false},
			{name: "s2", description: "", secret: "bar", pad: true},
		];
		const letters = ["A", "B"]
		
		const s1Lengths = new Set();
		const s2Lengths = new Set();
		
		for (let i = 0; i < 100; i++) {
			const padData = generateSecretSharingPadData(secrets, letters);
			s1Lengths.add(padData[0].encryptedSecrets[0].encryptedSecret[0].code.length);
			s2Lengths.add(padData[0].encryptedSecrets[1].encryptedSecret[0].code.length);
		}
		
		expect(s1Lengths.size).toBe(1);
		expect(s1Lengths.has(3)).toBe(true);
		
		expect(s2Lengths.size).toBe(4);
		expect(s2Lengths.has(3)).toBe(true);
		expect(s2Lengths.has(4)).toBe(true);
		expect(s2Lengths.has(5)).toBe(true);
		expect(s2Lengths.has(6)).toBe(true);
	});
	
	test("check sheets feature correct letters", function() {
		const secrets = [
			{name: "s1", description: "", secret: "foo", pad: false},
			{name: "s2", description: "", secret: "bar", pad: true},
		];
		const letters = ["A", "B", "C"]
		
		const padData = generateSecretSharingPadData(secrets, letters);
		expect(padData[0].encryptedSecrets[0].encryptedSecret).toHaveLength(2);
		expect(padData[0].encryptedSecrets[0].encryptedSecret[0].letter).toBe("B");
		expect(padData[0].encryptedSecrets[0].encryptedSecret[1].letter).toBe("C");
		
		expect(padData[1].encryptedSecrets[0].encryptedSecret).toHaveLength(2);
		expect(padData[1].encryptedSecrets[0].encryptedSecret[0].letter).toBe("A");
		expect(padData[1].encryptedSecrets[0].encryptedSecret[1].letter).toBe("C");
		
		expect(padData[2].encryptedSecrets[0].encryptedSecret).toHaveLength(2);
		expect(padData[2].encryptedSecrets[0].encryptedSecret[0].letter).toBe("A");
		expect(padData[2].encryptedSecrets[0].encryptedSecret[1].letter).toBe("B");
	});
	
	test("check decoding works as expected", function() {
		const secrets = [
			{name: "s1", description: "", secret: "foo", pad: false},
			{name: "s2", description: "", secret: "bar", pad: true},
		];
		const letters = ["A", "B", "C"]
		
		const padData = generateSecretSharingPadData(secrets, letters);
		
		expect(padData[0].encryptedSecrets[0].encryptedSecret[1].letter).toBe("C");
		const padACodes = padData[0].encryptedSecrets[0].encryptedSecret[1].code;
		
		expect(padData[2].encryptedSecrets[0].encryptedSecret[0].letter).toBe("A");
		const padCCodes = padData[2].encryptedSecrets[0].encryptedSecret[0].code;
		
		expect(padACodes).toHaveLength(padCCodes.length);
		
		const decoded = [];
		for (let i = 0; i < padACodes.length; i++) {
			decoded.push(String.fromCharCode((padACodes[i] + padCCodes[i]) % 1000));
		}
		
		expect(decoded.join("")).toBe("foo");
	});
});
