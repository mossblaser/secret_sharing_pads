import {h, render} from "preact";

import SecretEntryForm from "./SecretEntryForm.jsx";
import SecretSharingPads from "./SecretSharingPads.jsx";
import {cryptoRandInt, generateSecretSharingPadData} from "./encrypt.js";

function createPad(numberOfPads, description, secrets) {
	const padId = cryptoRandInt(0, 999999).toString().padStart(6, "0");
	
	// Assign letters and colours for each pad
	const letters = [];
	const padColours = {};
	for (let i = 0; i < numberOfPads; i++) {
		const letter = String.fromCharCode("A".charCodeAt(0) + i)
		letters.push(letter);
		padColours[letter] = `hsl(${Math.round(360 * (i/numberOfPads))}, 100%, 40%)`;
	}
	
	const allEncryptedSecrets = generateSecretSharingPadData(secrets, letters);
	
	// Create window for generated pads
	const padWindow = window.open("", padId);
	padWindow.document.write("<html><head></head><body></body></html>")
	padWindow.document.title = `Secret Sharing Pads ${padId}{${letters.join(",")}}`;
	const padWindowHead = padWindow.document.getElementsByTagName("head")[0];
	const padWindowBody = padWindow.document.getElementsByTagName("body")[0];
	
	// Copy all CSS from this page
	for (const link of document.getElementsByTagName("link")) {
		const linkCopy = padWindow.document.importNode(link, true);
		padWindowHead.appendChild(linkCopy);
	}
	
	// Show the pads in the window and trigger a print
	render(<SecretSharingPads
		padId={padId}
		padColours={padColours}
		description={description}
		allEncryptedSecrets={allEncryptedSecrets}
	/>, padWindowBody);
}

render(<SecretEntryForm onCreatePad={createPad} />, document.getElementById("root"));
