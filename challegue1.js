/* CREATED BY: Alexaner E. Reyes Brazoban ------ 1/16/2023  */

// CONSTASNTS //
const MINT_URL = "https://challenge.crossmint.io/api/";
const CONDIDATE_ID = "6e694ded-aad7-4d9c-b2da-80f7f94c2120";
const GRID_LIMITS = { MIN_ROW: 0, MAX_ROW: 10, MIN_COLUMN: 0, MAX_COLUMN: 10 };
const TYPES_OF_CELESTIAL_BODIES = ["polyanets", "soloons", "comeths"];
const STEPS = 14;
let actualStep = 0;

// Utilities //
function printPorcent() {
	actualStep++;
	let percent = (100 / STEPS) * actualStep;
	console.log(`${Math.round(percent)}% porcent of the challenge completed`);
}

/**
 * @param {string} item \
 * @param {array} validValues
 * */
function isValid(item, validValues) {
	return validValues.includes(item);
}

/**
 * @param {string} type 
 * @param {object} body
 * */
function executeValidations(type, body) {
	if (
		body.row < GRID_LIMITS.MIN_ROW ||
		body.row > GRID_LIMITS.MAX_ROW ||
		body.column < GRID_LIMITS.MIN_COLUMN ||
		body.column > GRID_LIMITS.MAX_COLUMN
	) {
		throw new Error(`Invalid row or column, your values are: row = ${body.row}, column = ${body.column}.
        Max values are: row = ${GRID_LIMITS.MAX_ROW}, column = ${GRID_LIMITS.MAX_COLUMN}, min values are: row = ${GRID_LIMITS.MIN_ROW}, 
        column = ${GRID_LIMITS.MIN_COLUMN}`);
	}

	if (!isValid(type, TYPES_OF_CELESTIAL_BODIES)) {
		throw new Error(`Invalid type, the choose is ${type}, 
        but the avilable one are: ${TYPES_OF_CELESTIAL_BODIES.forEach((item) => ` ${item}, `)}`);
	}
}

/** @param {number} ms */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** 
 * @param {object} obj 
 * @param {string} route 
 * @param {string} method 
 * */
async function sendRequest(obj, route, method) {
	var response = await fetch(MINT_URL + route, {
		method: method,
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			...obj,
			candidateId: CONDIDATE_ID,
		}),
	});
	await sleep(1500);
	printPorcent();
	return response;
}

// Classes //
class BaseCelestialBody {
    /** @param {string} type */
    constructor(type) {
        this.type = type;
    }
}


class Polyanets  extends BaseCelestialBody{
	constructor() {
        super("polyanets");
		this.celestialBodiesManager = new CelestialBodiesManager();
	}

	async create({ row, column }) {
		await this.celestialBodiesManager.create(this.type, { row, column });
	}

	async delete({ row, column }) {
		await this.celestialBodiesManager.delete(this.type, { row, column });
	}
}

class Soloons extends BaseCelestialBody{
	constructor() {
        super("soloons");
		this.celestialBodiesManager = new CelestialBodiesManager();
		this.colors = ["red", "blue", "purple", "white"];
	}

	async create({ row, column, color }) {
		if (!isValid(color, this.colors)) throw new Error("Invalid color");
		await this.celestialBodiesManager.create(this.type, { row, column, color });
	}

	async delete({ row, column, color }) {
		await this.celestialBodiesManager.delete(this.type, { row, column, color });
	}
}

class Cometh extends BaseCelestialBody{
	constructor() {
        super("comeths");
		this.celestialBodiesManager = new CelestialBodiesManager();
		this.directions = ["up", "down", "left", "right"];
	}

	async create({ row, column, direction }) {
		if (!isValid(direction, this.directions)) throw new Error("Invalid direction");
		await this.celestialBodiesManager.create(this.type, { row, column, direction });
	}

	async delete({ row, column, direction }) {
		await this.celestialBodiesManager.delete(this.type, { row, column, direction });
	}
}

class CelestialBodiesManager {
	constructor() {
		this.methods = ["post", "delete"];
	}

	/** 
     * @param {string} type 
	 * @param {object} body 
     */
	async create(type, body) {
		executeValidations(type, body);
		return await sendRequest(body, type, this.methods[0]);
	}

	/** 
     * @param {string} type 
	 * @param {object} body 
     * */
	async delete(type, body) {
		executeValidations(type, body);
		return await sendRequest(body, type, this.methods[1]);
	}
}

// Main //
const polyanets = new Polyanets();

async function CreateDiagonal1() {
	let column = 2;
	for (let row = 2; row < 9; row++) {
		await polyanets.create({ row, column });
		column++;
	}
}

async function CreateDiagonal2() {
	let column = 8;
	for (let row = 2; row < 9; row++) {
		await polyanets.delete({ row, column });
		column--;
	}
}


/* 
    USE CASE 1 - Create a x shape with polyanets
*/
async function main() {
    try {
        await CreateDiagonal1();
        await CreateDiagonal2();
        console.log("Success");
    } catch (error) {
        console.log(error.message);
    }
}

// RUN //
main();


