const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function getDistance(point1, point2) {
    let totalDistance = 0;
    for (let i = 0; i < 3; i++) {
        totalDistance += Math.pow(point1[i] - point2[i], 2)
    }
    totalDistance = Math.sqrt(totalDistance);
    return totalDistance;
}


function getLongestDistance(points) {
    let distanceInfo = [];
    let longestDistance = 0, x = 0, y = 0;
    for (let i = 0; i < points.length; i++) {
        if (!distanceInfo[i]) {
            distanceInfo[i] = [];
        }
        for (let j = 0; j < points[i].length; j++) {
            if (i === j) continue;
            distanceInfo[i][j] = getDistance(points[i], points[j]);
            if (distanceInfo[i][j] > longestDistance) {
                longestDistance = distanceInfo[i][j];
                y = i;
                x = j;
            }
        }
    }
    return {
        distance: longestDistance,
        x: x,
        y: y,
    }
}

const starSet = [
    [1, 0, 0],
    [1, 1, 0],
    [0, 0, 0],
    [0, 0, 1],
];
const meta = getLongestDistance(starSet);
console.log(meta);

rl.on('line', (line) => {
    if (line === "exit") {
        rl.close();
    }

});