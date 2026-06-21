import { v0_0_1 } from "./scanners/v0_0_1.js"
//import { v1_0_0 } from "./scanners/v1_0_0.js"

const letterRegex = new RegExp("[a-zA-Z]")
const numberRegex = new RegExp("[0-9]")
const symbolRegex = new RegExp("[^a-zA-Z0-9(]")
const emojiRegex = /[\p{Extended_Pictographic}\u{1F3FB}-\u{1F3FF}\u{1F9B0}-\u{1F9B3}]/ug

const specialCases = [
    ["post","^[!]"],
    ["symbol","x'","snumber"],
    ["post","¡!"]
]


const scanners = {
    "v0.0.1": v0_0_1,
    //"v1": v1_0_0
}

export {scanners}

//scanners["v1.0.0"].default = ([...Array(scanners["v1.0.0"].functions.length)]).map((a,b)=>b)