/* CREATED BY: Alexaner E. Reyes Brazoban  */
// Imports //
let goal = require("./GOAL.json");

// CONSTASNTS //
const MINT_URL = "https://challenge.crossmint.io/api/";
const CONDIDATE_ID = "6e694ded-aad7-4d9c-b2da-80f7f94c2120";
const GRID_LIMITS = { MIN_ROW: 0, MAX_ROW: 29, MIN_COLUMN: 0, MAX_COLUMN: 29 };
const TYPES_OF_CELESTIAL_BODIES = ["polyanets", "soloons", "comeths"];
let STEPS = 166;
let actualStep = 0;

// Utilities //

function resetProcent(steps) {
    STEPS = steps;
    actualStep = 0;
}
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
	await sleep(500);
	printPorcent();
	return { 
        status: response.status, 
        requestParams:{obj,route,method}
    };
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
		return await this.celestialBodiesManager.create(this.type, { row, column });
	}

	async delete({ row, column }) {
		return await this.celestialBodiesManager.delete(this.type, { row, column });
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
		return await this.celestialBodiesManager.create(this.type, { row, column, color });
	}

	async delete({ row, column, color }) {
		return await this.celestialBodiesManager.delete(this.type, { row, column, color });
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
		return await this.celestialBodiesManager.create(this.type, { row, column, direction });
	}

	async delete({ row, column, direction }) {
		return await this.celestialBodiesManager.delete(this.type, { row, column, direction });
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
const soloons = new Soloons();
const comeths = new Cometh();

function getTypeOfCelestialBody(str) {

    if (str === "SPACE") { return null }
    if (str === "POLYANET" ) { 
        return {
            type: "POLYANET",
            attribute: null
        } 
    }

    let arr = str.split("_");
    let type = arr[1];
    let attribute = arr[0].toLowerCase();;    
    return { type, attribute }
}

async function CreateCelestialBodyBody(type,attribute) {
    let CelestialBodies = {
        "POLYANET": ({row,column}) => polyanets.create({ row, column }),
        "SOLOON": ({row,column,attribute}) => soloons.create({ row, column, color: attribute }),
        "COMETH": ({row,column,attribute}) => comeths.create({ row, column, direction:attribute })
    };
    return await CelestialBodies[type]({...attribute});
}

/** @param {array} requestErrors */
async function retryFailedRequests(requestErrors) {
    resetProcent(requestErrors.length);
    let errors = [];
    console.log("----------------Retrying failed requests----------------");

    for (let i = 0; i < requestErrors.length; i++) {
        let response = await sendRequest(requestErrors[i].obj, requestErrors[i].route, requestErrors[i].method);
        if (response.status !== 200) {
            errors.push(response.requestParams);
        }
    }

    if (errors.length !== 0) {
        retryFailedRequests(errors);
    } else {
        return;
    }
}

async function getMap() {
    let mapResponse = await fetch("https://challenge.crossmint.io/api/map/6e694ded-aad7-4d9c-b2da-80f7f94c2120/goal", {
        "headers": {
            "Accept": "application/json, text/plain, */*",
            "Content-Type": "application/json;charset=utf-8",
            method: "GET",
        },
    });
    let reponse = await mapResponse.json();
    return reponse.goal.flat();
}

async function main() {
    let goalArray = goal.goal.flat();
    let row = 0;
    let column = 0;
    let requestErrors = [];
   
    for (let i = 0; i < goalArray.length; i++) {
        let typeOfBody = getTypeOfCelestialBody(goalArray[i]);
        if (typeOfBody) {
            const {type, attribute} = typeOfBody;
            let response = await CreateCelestialBodyBody(type, {row, column, attribute});      
            if (response.status !== 200) {
                requestErrors.push(response.requestParams);
            }
        }
        column++;
        if (column === 30) {
            column = 0;
            row++;
        }
    }

    await retryFailedRequests(requestErrors);
    console.log("Done!");


}

async function run() {
    const start = new Date();
    await main();
    const end = new Date();
    const time = (end - start) / 1000;
    console.log(time);
}

run();