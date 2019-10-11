/**
 * All images loaded as Javascript data URIs.
 */

import fs from "fs";

/**
 * Convert a buffer into a data URL
 */
function bufferToURL(buffer) {
	return `data:image/svg+xml;base64,${buffer.toString('base64')}`;
}

export const printerIcon = bufferToURL(fs.readFileSync(__dirname + "/images/printer.svg"));
export const instructionsStep1 = bufferToURL(fs.readFileSync(__dirname + "/images/step_1.svg"));
export const instructionsStep2 = bufferToURL(fs.readFileSync(__dirname + "/images/step_2.svg"));
export const instructionsStep3 = bufferToURL(fs.readFileSync(__dirname + "/images/step_3.svg"));

export const examplePads = bufferToURL(fs.readFileSync(__dirname + "/images/examplePads.svg"));
export const upIcon = bufferToURL(fs.readFileSync(__dirname + "/images/up.svg"));
export const downIcon = bufferToURL(fs.readFileSync(__dirname + "/images/down.svg"));
export const deleteIcon = bufferToURL(fs.readFileSync(__dirname + "/images/delete.svg"));
export const addIcon = bufferToURL(fs.readFileSync(__dirname + "/images/add.svg"));
