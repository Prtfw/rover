// --------------------
// Logic  ************
// --------------------
Number.prototype.mod = function(n) { //custom mod fuction to determine direction
    return ((this % n) + n) % n;
}

var last = []; //refatcor 2: keep location history for path drawing
const facing = ["S", "W", "N", "E"] //used to convert dir(int) on the state object into a user/debug friendly direction
var state = {
    x: 0,
    y: 0,
    dir: 0 //direction is the index of the facing array, in this case we start at "S"
}
var command = "";

var roverController = () => { //main function with logic of moving rover (aka rover controller)
    last = last.concat(JSON.parse(JSON.stringify(state))) //new command = need to update last, user JSON trick to copy current value not update pointer
    var commands = command.split(/(M+)||(L)||(r)/gi).filter((el) => {
        return el;
    }).filter(function(el) {
        return el.length != 0
    }); //split on L,R or Multiple M's together, remove undefined and empty string for safty
    var L = (s) => { //update the direction of the rover
        state.dir -= 1;
    }
    var R = (s) => {
        state.dir += 1;
    }
    var M = (command) => { //move rover
        var axis = (facing[state.dir.mod(4)] == "N" || facing[state.dir.mod(4)] == "S") ? "y" : "x"; //determine axis affected
        var sign = (facing[state.dir.mod(4)] == "N" || facing[state.dir.mod(4)] == "E") ? 1 : -1; //deterime if we are moving in +ve or -ve direction
        state[axis] = state[axis] + sign * command.length; //update coordiate value according to sign, axis and how many "M"s
    }
    commands.forEach(function(command) { //process each individual (already validated) command 
        switch (command) {
            case "L":
                L()
                break;
            case "R":
                R()
                break;
            default: //no catch all default because validation is done in the UI
                M(command)
        }
    })
    draw(); //update canvas
    position(); //update position feed
}

var undo = () => { //added to roll-back 
    if (last.length > 1) {
        state = JSON.parse(JSON.stringify(last.pop())); //copy value not update pointer
    }
    clear(); //clear canvas
    draw();
    position();
}

var reset = () => { //reset state and last then re-draw canvas
    state = {
        x: 0,
        y: 0,
        dir: 0
    };
    last = []; 
    clear();
    position();
}

var position = () => { //update the position feed
    //line for debugging
    // if (last.length > 0) $("<p> last: " + JSON.stringify(last) + " " + last.slice(-1) + " " + last.slice(-1)[0].dir.mod(4) + " " + facing[last.slice(-1)[0].dir.mod(4)] + "</p>").prependTo("#output"); //+ last.slice(-1) + " " + last.slice(-1)[0].dir + " " 
    $("<p>" + " Position " + (last.length) + "=> [x,y] coordinates: [" + state.x + "," + state.y + "]; facing: " + facing[state.dir.mod(4)] + ".</p>").prependTo("#output"); //add to the top, older coordinates are less relevant
}

// --------------------
// End Logic  *********
// --------------------

//=====================================================================>

// --------------------
// UI code ************
// --------------------

var c, ctx, intercept; //delcare global vars 

//draw the canvas to let the user know to expect GUI output
$(document).ready(function() {
    $('#submit').prop('disabled', true);
    var parentWidth = $("#canvasContainer").width();
    var newCanvas = $('<canvas/>', {
        id: 'canvas'
    }).prop({
        width: parentWidth * .75,
        height: parentWidth * .75,
    });
    $('#canvasContainer').append(newCanvas);
    c = document.getElementById("canvas");
    ctx = c.getContext("2d");
    intercept = parentWidth * .35; //initiate intercpet value
});

var validateCommand = () => {
    command = $('#cmd').val().toUpperCase();
    var disabled = ((!/[^l||m||r]/i.test(command) && command !== "") ? false : true); //check if command only contains allowed strings, disable/enable button
    $('#submit').prop('disabled', disabled);
    if (disabled) {
        $('#msg').css('display', 'inline-block').fadeOut(3000);     //display error message
    }
}

//draw the latest path
var draw = () => {
    var roverImg = "https://cdn4.iconfinder.com/data/icons/astronomy-icons/48/17-512.png";
    var scale = setScale();
    $("#scale").html("scale = ~" + Math.round(scale * 1000) / 1000 + ":1");
    clear();
    ctx.beginPath();
    last.forEach((pos) => {     
        ctx.lineTo(pos.x * scale + intercept, -1 * pos.y * scale + intercept)
    })
    ctx.lineTo(state.x * scale + intercept, -1 * state.y * scale + intercept)
    ctx.stroke();

    var img = new Image();
    img.onload = function() {
        ctx.drawImage(img, state.x * scale + intercept, -1 * state.y * scale + intercept - 30, 30, 30); //mark latest coorditaes of the rover with image
        ctx.stroke();
    };
    img.src = roverImg;
}

var clear = () => { //cleaer canas and setup for re-drawing
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.beginPath()
}

var setScale = () => {
        var x = last.map((pos) => {
            return pos.x
        }).concat(state.x).sort(function(a, b) {
            return a - b;
        })
        var y = last.map((pos) => {
            return pos.y
        }).concat(state.y).sort(function(a, b) {
            return a - b;
        })
        var maxDimension = (x.slice(-1)[0] - x[0] > y.slice(-1)[0] - y[0] ? x.slice(-1)[0] - x[0] : y.slice(-1)[0] - y[0]) || 10 //if the first expression => infinity then use 10 as starting value
        return (c.width * .25) / maxDimension;
}