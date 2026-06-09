import { getCollegesForStudent, COLLEGE_DATABASE } from './src/constants/collegeDatabase.js';

console.log("Total colleges:", COLLEGE_DATABASE.length);
console.log("Dept match:", COLLEGE_DATABASE.filter(c => c.department === "engineering").length);
const res = getCollegesForStudent("Tamil Nadu", "engineering", 90, null);
console.log("Result length:", res.length);
if (res.length > 0) {
  console.log("First college:", res[0].name);
}
