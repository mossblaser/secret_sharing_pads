import {h} from "preact";

import "./SecretSharingPads.less";

import {
	printerIcon,
	instructionsStep1,
	instructionsStep2,
	instructionsStep3,
} from "./images.js";

/**
 * A complete set of secret sharing pads, ready for printing.
 *
 * Props:
 * * padId: The unique ID identifying the set of secret sharing pads.
 * * padColours: A lookup {letter: colour, ...} giving the colour to use for
 *   each pad letter.
 * * description: Any introductory notes from the pad author to display.
 * * allEncryptedSecrets: An array of {letter, [{name, description,
 *   encryptedSecret: [{letter,  code: [n, ...]}, ...]}, ...]} objects.  For
 *   each lettered pad, gives the secret to be displayed gives the name and
 *   description string and encrypted secrets. Each encrypted secret is given
 *   as an array of encoded values and their associated letters.
 */
export default function SecretSharingPads({
	padId,
	padColours,
	description,
	allEncryptedSecrets,
}) {
	return <div className="SecretSharingPads">
		<div className="print-button">
			<PrintHint />
		</div>
		<div className="pads">{
			allEncryptedSecrets.map(
				({letter, encryptedSecrets}) => <SecretSharingPad
					padId={padId}
					padLetter={letter}
					padColours={padColours}
					description={description}
					encryptedSecrets={encryptedSecrets}
				/>
			)
		}</div>
	</div>;
}


/**
 * Given a string with paragraphs separated by newlines, output each in a new
 * <p> tag.
 */
function stringToParagraphs(str) {
	return str.trim().split(/[\n]+/).map(line => <p>{line}</p>);
}


/**
 * A single secret sharing pad, ready for printing.
 *
 * Props:
 * * padId: The unique ID identifying the set of secret sharing pads.
 * * padLetter: The letter for this pad.
 * * padColours: A lookup {letter: colour, ...} giving the colour to use for
 *   each pad letter.
 * * description: Any introductory notes from the pad author to display.
 * * encryptedSecrets: An array of {name, description, encryptedSecret: [{letter,  code: [n,
 *   ...]}, ...]} objects.  For each secret to be displayed gives the name and
 *   description string and encrypted secrets. Each encrypted secret is given
 *   as an array of encoded values and their associated letters.
 */
function SecretSharingPad({
	padId,
	padLetter,
	padColours,
	description,
	encryptedSecrets,
}) {
	const colour = padColours[padLetter];
	return <div className="SecretSharingPad">
		<div className="inner">
			<Header
				padId={padId}
				padLetter={padLetter}
				colour={colour}
			/>
			{stringToParagraphs(description)}
			<Instructions padId={padId} padLetter={padLetter} />
			<hr />
			<EncryptedSecrets
				encryptedSecrets={encryptedSecrets}
				padColours={padColours}
			/>
		</div>
	</div>;
};

/**
 * The header bar shown on the first page of each secret sharing pads.
 *
 * Props:
 * * padId: The unique ID identifying the set of secret sharing pads.
 * * padLetter: The letter for this pad.
 * * colour: The colour to use for this pad.
 */
function Header({padId, padLetter, colour}) {
	return <header className="Header">
		<div className="inner">
			<h1>Secret Sharing Pad</h1>
			<div class="pad-id">
				Pad number:
				<PadIdBadge
					padId={padId}
					padLetter={padLetter}
					colour={colour}
				/>
			</div>
		</div>
	</header>
}

/**
 * A badge showing the pad ID and letter.
 *
 * Props:
 * * padId: The unique ID identifying the set of secret sharing pads.
 * * padLetter: The letter for this pad.
 * * colour: The colour to use for this pad.
 */
function PadIdBadge({padId, padLetter, colour}) {
	return <div className="PadIdBadge">
		<span class="number" style={{backgroundColor: colour}}>
			<span class="id">{padId}</span>
			<span class="letter">{padLetter}</span>
		</span>
	</div>
}

function Instructions({padId, padLetter}) {
	return <div className="Instructions">
		<h2>Decryption instructions</h2>
		<div className="steps">
			<div className="step">
				<img src={instructionsStep1} />
				<p>Obtain another secret sharing pad with the same pad number as this
				one, but different letter, printed at the top right. Find the secret
				you want to decrypt on both pads.</p>
			</div>
			<div className="step">
				<img src={instructionsStep2} />
				<p>Find the list of three-digit codes printed next to the letter of
				the other pad. Working left-to-right, add the codes on the first pad to
				the codes on the second pad and write down the answers.</p>
			</div>
			<div className="step">
				<img src={instructionsStep3} />
				<p>Use the table above to turn the last three digits of each sum
				into a character. Stop when you find a sum whose last three digits are
				'000'. The remaining codes just hide the secret's real length.</p>
			</div>
		</div>
		
		<p><strong>Alternative using spreadsheet:</strong> Copy the three-digit
		codes for your two pads into columns A and B of your spreadsheet. Type
		<code>=MOD(A1+B1, 1000)</code> into cell C1 and <code>=CHAR(C1)</code> into cell
		D1. Use auto-fill to repeat the formulae in columns C and D over the
		remaining rows.</p>
		
		<p><strong>Troubleshooting:</strong> The last three digits of summed codes
		should be either 000 or between 032 and 126. If this is not the case, check
		the pad numbers match and that you're looking at the correct list of
		codes.</p>
	</div>;
}

/**
 * A list of encrypted secrets
 *
 * Props:
 * * encryptedSecrets: An array of {name, description, encryptedSecret:
 *   [{letter,  code: [n, ...]}, ...]} objects.
 * * padColours: A lookup {letter: colour, ...}.
 */
function EncryptedSecrets({padColours, encryptedSecrets}) {
	return <div class="EncryptedSecrets">
		{encryptedSecrets.map(
			({name, description, encryptedSecret}, i) => <EncryptedSecret
				name={name}
				number={i+1}
				description={description}
				encryptedSecret={encryptedSecret}
				padColours={padColours}
			/>
		)}
	</div>;
}

/**
 * A single encrypted secret in an <EncryptedSecrets> container.
 *
 * Props:
 * * number The secret number
 * * name The secret name
 * * description The secret description
 * * encryptedSecrets: An array of {name, description, encryptedSecret:
 *   [{letter,  code: [n, ...]}, ...]} objects.
 * * padColours: A lookup {letter: colour, ...}.
 */
function EncryptedSecret({number, name, description, encryptedSecret, padColours}) {
	return <article className="EncryptedSecret">
		<h2>Secret {number}: {name}</h2>
		{stringToParagraphs(description)}
		<div className="encrypted-secrets">
			{encryptedSecret.map(({letter, code}) => <div className="secret">
				<div class="letter" style={{
					color: padColours[letter],
					borderColor: padColours[letter],
				}}>
					{letter}
				</div>
				<div class="code">{
					code.map(n => n.toString().padStart(3, '0')).join(" ")
				}</div>
			</div>)}
		</div>
	</article>
}


function PrintHint() {
	return <div className="PrintHint">
		<button onClick={() => window.print()} title="Print all pads">
			<img src={printerIcon} alt="Print" />
		</button>
		<span>Warning: These pads will be shown only once.</span>
	</div>;
}
