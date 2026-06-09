import { getCollegesForStudent } from './src/constants/collegeDatabase.js';

let state = "Tamil Nadu";
let department = "engineering";
let percentage = 90;
let entranceScore = null;

let results = getCollegesForStudent(state, department, percentage, entranceScore);
console.log("Initial results:", results.length);

let preferGovt = true;
if (preferGovt) results = results.filter(c => c.type === "Government").concat(results.filter(c => c.type !== "Government"));
console.log("After preferGovt:", results.length);

let needHostel = true;
if (needHostel) results = results.filter(c => c.hostelAvailable);
console.log("After needHostel:", results.length);

if (results.length === 0) results = getCollegesForStudent(state, department, percentage, entranceScore);

console.log("Final results:", results.length);
