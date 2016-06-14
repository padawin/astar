var canvas = document.getElementById('myCanvas');
var context = canvas.getContext('2d');

var STATE_SELECT_START = 0;
var STATE_SELECT_END = 1;
var STATE_FIND_PATH = 2;
var STATE_PATH_FOUND = 3;
var state = STATE_SELECT_START;
var start = end = null;

var reachables = [];
var visited = [];

var grid = [
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,1,0,0,1,0,0,0,0,0,0,1,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0],
	[0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,1,0,0,0,0,1,0,1,0,0,1,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
];

var nodeWidth = Math.round(canvas.width / grid[0].length);
var nodeHeight = Math.round(canvas.height / grid.length);

for (var row = 0; row < grid.length; row++) {
	for (var col = 0; col < grid[row].length; col++) {
		grid[row][col] = {
			x: col, y: row,
			cost: Infinity,
			visited: false,
			reachable: false,
			isOnPath: false,
			reachedFrom: null,
			walkable: grid[row][col] === 0
		};
	}
}

function draw(to, from) {
	var color;
	context.strokeStyle = 'black';
	for (var row = 0; row < grid.length; row++) {
		for (var col = 0; col < grid[row].length; col++) {
			context.strokeRect(
				col * nodeWidth,
				row * nodeHeight,
				nodeWidth,
				nodeHeight
			);

			if (to == grid[row][col]) {
				color = 'yellow';
			}
			else if (from == grid[row][col]) {
				color = 'blue';
			}
			else if (grid[row][col].isOnPath) {
				color = 'purple';
			}
			else if (grid[row][col].visited) {
				color = 'red';
			}
			else if (grid[row][col].reachable) {
				color = 'green';
			}
			else if (grid[row][col].walkable) {
				color = 'white';
			}
			else {
				color = 'black';
			}

			context.fillStyle = color;
			context.fillRect(
				col * nodeWidth,
				row * nodeHeight,
				nodeWidth,
				nodeHeight
			);
		}
	}
}

canvas.onclick = function (e) {
	var rect = canvas.getBoundingClientRect();
	var coordX = e.clientX - rect.left;
	var coordY = e.clientY - rect.top;

	var gridX = parseInt(coordX / nodeWidth);
	var gridY = parseInt(coordY / nodeHeight);

	if (
		state == STATE_SELECT_START
		&& grid[gridY][gridX] && grid[gridY][gridX].walkable
	) {
		start = grid[gridY][gridX];
		start.cost = 0;
		state = STATE_SELECT_END;
		reachables.push(start)
	}
	else if (
		state == STATE_SELECT_END
		&& grid[gridY][gridX] && start !== grid[gridY][gridX]
		&& grid[gridY][gridX].walkable
	) {
		end = grid[gridY][gridX];
		state = STATE_FIND_PATH;
	}
	else if (state == STATE_FIND_PATH) {
		run(start, end);
	}

	draw(start, end);
};

function run(start, end) {
	var path = null;
	while (reachables.length && path === null) {
		path = step(start, end);
	}
}

function step(start, end) {
	node = getNextReachable();
	if (node === end) {
		state = STATE_PATH_FOUND;
		return generatePath(end);
	}

	getNodeNeighbours(node).forEach(function (neighbour) {
		if (!neighbour.reachable) {
			neighbour.reachedFrom = node;
			addReachable(neighbour);
		}
	});

	return null;
}

function generatePath(lastNode) {
	var path = [],
		node = lastNode;
	while (node) {
		path.unshift(node);
		node.isOnPath = true;
		node = node.reachedFrom;
	}
}

function getNextReachable() {
	// find appropriate from reachables
	// and remove from reachables
	next = reachables.shift();
	// add to visited
	next.visited = true;
	return next;
}

function calculateDistance(nodeFrom, nodeTo) {
	return Math.abs(nodeFrom.x - nodeTo.x) + Math.abs(nodeFrom.y - nodeTo.y);
}

function addReachable(node) {
	node.reachable = true;
	reachables.push(node)
}

function getNodeNeighbours(node) {
	var x = node.x,
		y = node.y,
		n = [];

	if (grid[y - 1] && grid[y - 1][x].walkable && !grid[y - 1][x].visited) {
		n.push(grid[y - 1][x]);
	}

	if (grid[y][x + 1] && grid[y][x + 1].walkable && !grid[y][x + 1].visited) {
		n.push(grid[y][x + 1]);
	}

	if (grid[y + 1] && grid[y + 1][x].walkable && !grid[y + 1][x].visited) {
		n.push(grid[y + 1][x]);
	}

	if (grid[y][x - 1] && grid[y][x - 1].walkable && !grid[y][x - 1].visited) {
		n.push(grid[y][x - 1]);
	}

	return n;
}

draw(start, end);
