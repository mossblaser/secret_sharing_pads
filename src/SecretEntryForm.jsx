import {h} from "preact";
import {useState, useReducer} from "preact/hooks";

import {
	logoWithText,
	examplePads,
	upIcon,
	downIcon,
	deleteIcon,
	addIcon,
} from "./images.js";

import "./SecretEntryForm.less";


/**
 * Initial reducer state for the secret entry form.
 *
 * Structure:
 *
 * {
 *   description: "...",
 *   secrets: [
 *     {name: "...", description: "...", secret: "...", obscureLength: bool, key: number},
 *     ...
 *   ],
 * }
 *
 * Where All fields are as you might expect and 'key' is a unique ID to help
 * preact track secrets when they're re-ordered.
 */
const initialState = {
	description: "",
	secrets: [
		{name: "", description: "", secret: "", obscureLength: true, key: -1},
	],
};

/**
 * Given a secrets array from the reducer state, return a new array with
 * elements indexed i and j swapped.
 */
function swapSecrets(oldSecrets, i, j) {
	const secrets = oldSecrets.slice();
	
	secrets.splice(j, 0, ...secrets.splice(i, 1));
	
	return secrets;
}

/**
 * Modify a secret in the reducer state secrets array. Takes an object which
 * will be merged into the secret with index 'i'. Returns a new, modified
 * array.
 */
function updateSecret(oldSecrets, i, update) {
	const secrets = oldSecrets.slice();
	secrets[i] = {
		...secrets[i],
		...update,
	};
	return secrets;
}

/**
 * Reducer for the secret entry form.
 */
function reduce(state, action) {
	switch (action.type) {
		case "set-pad-description":
			return {
				...state,
				description: action.value,
			};
		
		case "add-secret":
			return {
				...state,
				secrets: state.secrets.concat([
					{
						name: "",
						description: "",
						secret: "",
						obscureLength: true,
						key: Math.random(),
					},
				]),
			};
		
		case "delete-secret":
			if (window.confirm(`Are you sure you want to delete '${state.secrets[action.number].name}'?`)) {
				const newSecrets = state.secrets.slice();
				newSecrets.splice(action.number, 1);
				return {
					...state,
					secrets: newSecrets,
				};
			} else {
				return state;
			}
		
		case "move-secret-up":
			if (action.number > 0) {
				return {
					...state,
					secrets: swapSecrets(state.secrets, action.number, action.number-1),
				};
			} else {
				return state;
			}
		
		case "move-secret-down":
			if (action.number < state.secrets.length - 1) {
				return {
					...state,
					secrets: swapSecrets(state.secrets, action.number, action.number+1),
				};
			} else {
				return state;
			}
		
		case "set-name":
			return {
				...state,
				secrets: updateSecret(state.secrets, action.number, {name: action.value}),
			};
		
		case "set-description":
			return {
				...state,
				secrets: updateSecret(state.secrets, action.number, {description: action.value}),
			};
		
		case "set-secret":
			return {
				...state,
				secrets: updateSecret(state.secrets, action.number, {secret: action.value}),
			};
		
		case "set-obscure-length":
			return {
				...state,
				secrets: updateSecret(state.secrets, action.number, {obscureLength: action.value}),
			};
		
		default:
			return state;
	}
}


/**
 * An input for a single secret.
 *
 * * number: The secret index in the secrets array.
 * * name: The name field value.
 * * description: The description field value.
 * * secret: The secret field value.
 * * obscureLength: The obscure length field value.
 * * dispatch: The dispatch function to use to store changes.
 */
function SecretInput({number, name, description, secret, obscureLength, dispatch}) {
	const [showSecret, setShowSecret] = useState(false);
	
	return <div className="SecretInput">
		<label title="A short message stating what this secret is.">
			<span>Title:</span>
			<input
				type="text"
				autocomplete="off"
				value={name}
				onInput={evt => dispatch({type: "set-name", number, value: evt.target.value})}
			/>
		</label>
		<label className="description-entry">
			<span>Description:</span>
			<textarea
				onInput={evt => dispatch({type: "set-description", number, value: evt.target.value})}
				placeholder="(optional) e.g. login instructions"
			>{description}</textarea>
		</label>
		<label title="The secret to be encrypted.">
			<span>Secret:</span>
			<div className="secret-box">
				<input
					type={showSecret ? "text" : "password"}
					autocomplete="off"
					value={secret}
					onInput={evt => dispatch({type: "set-secret", number, value: evt.target.value})}
				/>
				<label
					title="Toggle secret visibility. (The secret will always be shown encrypted on the secret sharing pads produced.)"
				>
					<input
						type="checkbox"
						autocomplete="off"
						checked={showSecret ? "true" : ""}
						onInput={evt => setShowSecret(!showSecret)}
					/>
					<span>Show</span>
				</label>
			</div>
		</label>
		<label title="Add a random amount of padding to the encrypted secret to conceal its length.">
			<span></span>
			<div className="obscure-length-option">
				<input
					type="checkbox"
					autocomplete="off"
					checked={obscureLength ? "true" : ""}
					onInput={evt => dispatch({
						type: "set-obscure-length",
						number,
						value: evt.target.checked,
					})}
				/>
				<span>Obscure length of encrypted secret on pad</span>
			</div>
		</label>
	</div>;
}

/**
 * An editor for a list of secrets
 *
 * * secrets: An array of secret objects from the reducer store.
 * * dispatch: The dispatch function to use to store changes.
 */
function SecretList({secrets, dispatch}) {
	return <div className="SecretList">
		{secrets.map((secret, number) =>
			<div className="secret" key={secret.key}>
				<SecretInput
					number={number}
					dispatch={dispatch}
					{...secret}
				/>
				<div className="buttons">
					<button
						className="move-up"
						title="Move secret up"
						style={{visibility: number === 0 ? "hidden" : "visible"}}
						onClick={() => dispatch({type: "move-secret-up", number})}
					>
						<img src={upIcon} alt="Move Up" />
					</button>
					<button
						className="delete"
						title="Delete secret"
						onClick={() => dispatch({type: "delete-secret", number})}
					>
						<img src={deleteIcon} alt="Delete" />
					</button>
					<button
						className="move-down"
						title="Move secret down"
						style={{visibility: number === secrets.length-1 ? "hidden" : "visible"}}
						onClick={() => dispatch({type: "move-secret-down", number})}
					>
						<img src={downIcon} alt="Move Down" />
					</button>
				</div>
			</div>
		)}
		<div className="add-button-area">
			<button
				className="add-button"
				onClick={() => dispatch({type: "add-secret"})}
			>
				<img src={addIcon} alt="Plus Symbol" />
				<span>Add Secret</span>
			</button>
		</div>
	</div>;
}

/**
 * Show the children in a page-style box on the screen.
 */
function Page({children}) {
	return <div className="Page">
		<div className="inner">
			{children}
		</div>
	</div>;
}

/**
 * A form which provides instructions and allows a user to fill secrets to be
 * encrypted.
 *
 * * onCreatePad: A function to call when the 'create pads' button is pressed.
 *   Will be passed three arguments: the number of pads to create, the pad
 *   description string and the secrets to be encrypted.
 */
export default function SecretEntryForm({onCreatePad}) {
	const [{description, secrets}, dispatch] = useReducer(reduce, initialState);
	
	const [numberOfPads, setNumberOfPads] = useState(2);
	
	return <Page><div className="SecretEntryForm">
		<div className="section introduction">
			<h1><img src={logoWithText} alt="Secret Sharing Pad"/></h1>
			
			<img src={examplePads} alt="Four sample secret sharing pads"/>
			
			<p>Use this page to create your own set of secret sharing pads to print
			and share.</p>
			
			<p>Secret sharing pads are a secure way to share important secret
			information, such as passwords, with close friends and family for safe
			keeping or use in the event of an emergency.</p>
			
			<p>Each secret sharing pad contains encrypted copies of your secrets
			which, alone, cannot be read. However, when any two pads from the same
			set are brought together, the secrets can be decrypted using pen and
			paper using the provided instructions.</p>
			
			<p>Enter the secrets to encrypt below and choose how many pads you would
			like to create and click 'Create Secret Sharing Pads'.</p>
			
			<p><i>Secrets entered here are not stored or sent over the internet.</i></p>
		</div>
		<div className="section description">
			<label>
				<h2>Special instructions to show on every pad</h2>
				<textarea
					onInput={(evt) => dispatch({type: "set-pad-description", value: evt.target.value})}
					placeholder="e.g. who created the pad, when should it be used, who has the other pads"
				>{description}</textarea>
			</label>
		</div>
		<div className="section secret-list">
			<h2>Secrets</h2>
			<SecretList
				dispatch={dispatch}
				secrets={secrets}
			/>
		</div>
		<div className="section create-pads-section">
			<h2>Create secret sharing pads</h2>
			<div className="hints">
				<strong>Remember:</strong>
				<ul>
					<li>Sets of secret sharing pads are unique and incompatible with
					previously created pads.</li>
					
					<li>Take care when storing or carrying two or more pads at once.</li>
					
					<li>Secret sharing pads do not provide protection from targeted,
					simultaneous theft of multiple pads.</li>
				</ul>
			</div>
			
			<div className="submission-bar">
				<label className="number-of-pads">
					<span>Number of pads:</span>
					<input
						title="Number of secret sharing pads to create"
						type="number"
						value={numberOfPads}
						onInput={evt => setNumberOfPads(evt.target.value)}
						min="2"
						max="26"
					/>
				</label>
				<button
					className="create-button"
					onClick={() => onCreatePad(numberOfPads, description, secrets)}
				>Create Secret Sharing Pads</button>
			</div>
		</div>
	</div></Page>;
}

