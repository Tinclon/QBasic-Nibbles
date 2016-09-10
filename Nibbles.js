const U = "▀";
const L = "▄";
const S = " ";
const B = "█";
const BG = [
    "0,0,0",        // black
    "4,20,167",     // blue
    "24,168,28",    // green
    "26,170,169",   // cyan
    "168,5,14",     // red
    "168,23,167",   // purple
    "168,86,20",    // brown
    "170,170,170",  // light grey
    "85,85,85",     // dark grey
    "85,92,251",    // light blue
    "94,253,97",    // light green
    "95,255,254",   // light cyan
    "252,87,89",    // light red
    "253,93,251",   // light purple
    "255,253,100",  // light yellow
    "255,255,255"   // white
];
const FG = [
    "0,0,0",        // black
    "0,0,128",      // blue
    "0,128,0",      // green
    "0,128,128",    // cyan
    "128,0,0",      // red
    "128,0,128",    // purple
    "128,128,0",    // brown
    "192,192,192",  // light grey
    "128,128,128",  // dark grey
    "0,0,255",      // light blue
    "0,255,0",      // light green
    "0,255,255",    // light cyan
    "255,0,0",      // light red
    "255,0,255",    // light purple
    "255,255,0",    // light yellow
    "255,255,255"   // white
];

const TICK = 100;
const WIDTH = 80;
const HEIGHT = 25;

var BLANKLINE = new Array(WIDTH + 1).join(" ");
let keyboardQueue = [];

/*
    Display the given label at the given row and column, in the given foreground and background color,
    and blink a cursor while awaiting user input.

    Send the entire input to the callback function when the user presses Enter

 */
function input(row, col, fg, bg, label, inputCallback) {
    let queuedInput = "";
    let cursorIndex = label.length + 1;
    let cursorOn = true;
    let cursorInterval = window.setInterval(displayCursor, TICK);

    function displayCursor() {
        cursorOn = !cursorOn;
        text(row, col + cursorIndex, fg, bg, (cursorOn ? "_" : " "));
        drawBufferToScreen();
    }

    function displayInput(input) {
        text(row, col, fg, bg, label + BLANKLINE.substring(0, WIDTH - col - label.length + 1));
        text(row, col + label.length + 1, fg, bg, input);
        cursorIndex = label.length + input.length + 1;
        drawBufferToScreen();
    }

    function gatherInput() {
        while (keyboardQueue.length > 0) {
            if (keyboardQueue[0] !== "Enter") {
                if (keyboardQueue[0] === "Backspace") {
                    keyboardQueue.shift();
                    queuedInput = queuedInput.slice(0, -1);
                } else if (keyboardQueue[0].length !== 1) {
                    keyboardQueue.shift();
                } else {
                    queuedInput += keyboardQueue.shift();
                }
                displayInput(queuedInput);
            } else {
                window.clearInterval(cursorInterval);
                keyboardQueue.shift();
                displayInput(queuedInput);
                inputCallback(queuedInput);
                return;
            }
        }
        function keydown() {
            document.removeEventListener("keydown", keydown);
            gatherInput();
        }
        document.addEventListener("keydown", keydown);
    }
    displayInput("");
    gatherInput();
}

/*
    Get the next keyboard input

    If no callback or key is specified, will return immediately with the next key in the keyboard buffer if one is available.

    If a callback is specified, will wait until a key is available in the keyboard buffer and return the key to the callback.

    If a callback and a key is specified, will wait until the specified key is pressed, and then return the key to the callback.
 */

function inkey(callback, key) {
    if(callback) {
        if (keyboardQueue.length > 0) {
            if(key) {
                let queuedKey = keyboardQueue.shift();
                while (queuedKey !== key && keyboardQueue.length > 0) {
                    queuedKey = keyboardQueue.shift();
                }
                if (queuedKey === key) {
                    callback(queuedKey);
                    return;
                }
            } else {
                let queuedKey = keyboardQueue.shift();
                if (queuedKey.length === 1) {
                    callback(queuedKey);
                } else {
                    inkey(callback, key);
                }
                return;
            }
        }
        function keydown() {
            document.removeEventListener("keydown", keydown);
            inkey(callback, key);
        }
        document.addEventListener("keydown", keydown);
        return;
    }

    if(keyboardQueue.length > 0) {
        let queuedKey = keyboardQueue.shift();
        if (queuedKey !== "Meta") {
            return queuedKey;
        }
    }
    return "";
}

function keydown(e) {
    keyboardQueue.push(e.key);
}

const fonts = [
    "font-family:Andale Mono, monospace;line-height:normal;",
    "font-family:Courier New, monospace;line-height:normal;",
    "font-family:Lucida Console, monospace;line-height:0.999em;",
    ];
document.body.style = `${fonts[2]};white-space:pre;letter-spacing:-0.008em;display:inline-flex;`;
document.addEventListener("keydown", keydown);

const buffer = [];
const screenBuffer = [];
const heatMapBuffer = [];
let displayHeatMap = false;

/*
    Fills the buffer with specified character (ie clear screen)
 */
function fillBuffer (fg, bg, c = S) {
    for (let row = 1 ; row <= HEIGHT ; row++) {
        buffer[row] = [];
        for (let col = 1 ; col <= WIDTH ; col++) {
            buffer[row][col] = {
                character: c,
                foreground: fg,
                background: bg
            };
        }
    }
}

/*
    Pushes the buffer to the screen. Takes advantage of double buffering.
 */
function drawBufferToScreen() {
    if(screenBuffer.length === 0) {
        // Populate the document body for the first time
        let screenText = "<div style='z-index: 0;background-color: black;position: fixed;top: 0; left: 0; width: 100%; height: 100%; display: block'></div>" +
            "<div style='z-index: 1;transform: translate(50%, 25%);'>";
        for (let row = 1; row <= HEIGHT; row++) {
            screenText += "<div style='line-height:0'>";
            for (let col = 1; col <= WIDTH; col++) {
                screenText += `<span style="color:rgb(${buffer[row][col].foreground});background:rgb(${buffer[row][col].background})">${buffer[row][col].character}</span>`;
            }
            screenText += "</div>\n";
        }

        document.body.innerHTML = screenText + "</div>\n" +
            "<div style='z-index: 2;transform: scale(1, 0.5) translate(50%,-26%);position: absolute;opacity: 0.75;display: block'></div>" +
            "<div style='z-index: 3;opacity: 0;position: fixed;top: 0; left: 0; width: 100%; height: 100%; display: block'></div>";

    } else {
        for (let row = 1; row <= HEIGHT; row++) {
            for (let col = 1; col <= WIDTH; col++) {
                if (screenBuffer[row][col] !== buffer[row][col]) {
                    let e = document.body.children[1].children[row-1].children[col-1];
                    e.setAttribute("style",`color:rgb(${buffer[row][col].foreground});background:rgb(${buffer[row][col].background})`);
                    e.innerHTML = buffer[row][col].character;
                }
            }
        }
    }

    // Update screenBuffer
    for (let row = 1 ; row <= HEIGHT ; row++) {
        screenBuffer[row] = Array.from(buffer[row]);
    }
}

function drawHeatMapToScreen() {
    if (displayHeatMap) {
        document.body.children[2].setAttribute("style", document.body.children[2].getAttribute("style").replace(/display: none/,"display: block"));

        if (heatMapBuffer.length === 0) {
            // Populate the document body for the first time
            let screenText = "";
            for (let row = 1; row <= ARENAHEIGHT; row++) {
                screenText += "<div style='line-height:0'>";
                for (let col = 1; col <= ARENAWIDTH; col++) {
                    screenText += `<span style="color:rgb(${heatMap[row][col]},${heatMap[row][col] === 255 ? 0 : 90 - heatMap[row][col]}, 0);background:rgb(0,0,0)">${B}</span>`;
                }
                screenText += "</div>\n";
            }
            document.body.children[2].innerHTML = screenText;
        } else {
            for (let row = 1; row <= ARENAHEIGHT; row++) {
                for (let col = 1; col <= ARENAWIDTH; col++) {
                    if (heatMapBuffer[row][col] !== heatMap[row][col]) {
                        let e = document.body.children[2].children[row - 1].children[col - 1];
                        e.setAttribute("style", `color:rgb(${heatMap[row][col]},${heatMap[row][col] === 0 ? 255 : 90 - heatMap[row][col]}, 0);background:rgb(0,0,0)`);
                    }
                }
            }
        }

        // Update screenBuffer
        for (let row = 1; row <= ARENAHEIGHT; row++) {
            heatMapBuffer[row] = Array.from(heatMap[row]);
        }
    } else {
        document.body.children[2].setAttribute("style", document.body.children[2].getAttribute("style").replace(/display: block/,"display: none"));
    }
}

// ======= DONE WITH SETUP. START PROGRAM ========= //
const arena = [];
const heatMap = [];
const ARENAHEIGHT = HEIGHT * 2;
const ARENAWIDTH = WIDTH;
const MAXPLAYERS = 8;
const MAXSNAKELENGTH = 1000;
const STARTOVER = 1;
const SAMELEVEL = 2;
const NEXTLEVEL = 3;
let colortable = [0, 15, 14, 13, 12, 11, 10, 9, 8, 7]; // Filler, Snakes 1-8, Walls

/*
     Centers the specified text, in the given color, to the specified row in the buffer.
 */
function center (row, fg, bg, text) {
    const x = (WIDTH >> 1) - (text.length >> 1);
    for (let i = 0 ; i < text.length ; i++) {
        buffer[row][x+i] = {
            character: text[i],
            foreground: fg,
            background: bg
        };
    }
}

/*
    Populates the given text to the buffer at the row, col, and color provided.
 */
function text (row, col, fg, bg, text) {
    for (let i = 0 ; i < text.length ; i++) {
        buffer[row][col+i] = {
            character: text[i],
            foreground: fg,
            background: bg
        };
    }
}

/*
    Sets the arena's row and col to the given color index
 */
function set (row, col, acolor) {
    if (row !== 0) {
        arena[row][col].acolor = acolor;
        const realRow = arena[row][col].realRow;
        const topFlag = (arena[row][col].sister + 1 / 2) > 0;

        const sisterRow = row + arena[row][col].sister;
        const sisterColor = arena[sisterRow][col].acolor;

        if (acolor === sisterColor) {
            buffer[realRow][col] = {
                character: B,
                foreground: FG[acolor],
                background: FG[acolor]
            };
        } else {
            if (topFlag) {
                if (acolor > 7) {
                    buffer[realRow][col] = {
                        character: U,
                        foreground: FG[acolor],
                        background: FG[sisterColor]
                    };
                } else {
                    buffer[realRow][col] = {
                        character: L,
                        foreground: FG[sisterColor],
                        background: FG[acolor]
                    };
                }
            } else {
                if (acolor > 7) {
                    buffer[realRow][col] = {
                        character: L,
                        foreground: FG[acolor],
                        background: FG[sisterColor]
                    };
                } else {
                    buffer[realRow][col] = {
                        character: U,
                        foreground: FG[sisterColor],
                        background: FG[acolor]
                    };
                }
            }
        }
    }
}

function spacePause(text, next) {
    center(11, FG[15], BG[4], "█▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀█");
    center(12, FG[15], BG[4], `█ ${(text + "                             ").substring(0,29)} █`);
    center(13, FG[15], BG[4], "█▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄█");
    drawBufferToScreen();

    function restoreArena() {
        for (let i = 21; i <= 26; i++) {
            for (let j = 24; j <= 56; j++) {
                set(i, j, arena[i][j].acolor);
            }
        }
        drawBufferToScreen();
        next();
    }
    inkey(restoreArena, " ");
}

function sparklePause(next) {
    const sparkles = "*    *    *    *    *    *    *    *    *    *    *    *    *    *    *    *    *    ";

    function sparkle(a) {
        text(1, 1, FG[4], BG[0], sparkles.substring(a - 1, WIDTH + a - 1));
        text(22, 1, FG[4], BG[0], sparkles.substring(6 - a - 1, WIDTH + (6 - a) - 1));

        for (let b = 2; b <= 21; b++) {
            const c = (a + b) % 5;
            if (c === 1) {
                text(b, WIDTH, FG[4], BG[0], "*");
                text(23 - b, 1, FG[4], BG[0], "*");
            } else {
                text(b, WIDTH, FG[4], BG[0], " ");
                text(23 - b, 1, FG[4], BG[0], " ");
            }
        }
        drawBufferToScreen();
    }

    let stopSparkle = false;
    function doSparkle(a) {
        if(stopSparkle) {
            next();
            return;
        }
        setTimeout(() => {
            sparkle(a);
            doSparkle(((a+1) % 5) + 1);
        }, TICK);
    }
    doSparkle(1);

    inkey(() => {
        stopSparkle = true;
    });
}


function drawScreen() {
    fillBuffer(FG[14], BG[0]);
    center(1, FG[14], BG[0], "Nibbles");
    center(11, FG[14], BG[0], "Initializing Playing Field...");
    drawBufferToScreen();

    for (let row = 1 ; row <= ARENAHEIGHT ; row++) {
        arena[row] = [];
        heatMap[row] = [];
        for (let col = 1 ; col <= ARENAWIDTH ; col++) {
            arena[row][col] = {
                realRow: (row + 1) >> 1,
                sister: (row % 2) * 2 - 1
            };
        }
    }
}

function getInputs(next) {
    fillBuffer(FG[7], BG[0]);
    drawBufferToScreen();

    let numPlayers = 0;
    function getNumberPlayers(next) {
        input(5, 20, FG[7], BG[0], `How many players (1 to ${MAXPLAYERS})`, (input) => {
            let intInput = parseInt(input) || 0;
            if (intInput < 1 || intInput > MAXPLAYERS) {
                getNumberPlayers(next);
                return;
            }
            numPlayers = intInput;
            next();
        });
    }

    let comp = 0;
    function getCompPlayers(next) {
        input(6, 20, FG[7], BG[0], "How many players does computer play", (input) => {
            let intInput = parseInt(input) || 0;
            if (intInput < 0 || intInput > numPlayers) {
                getCompPlayers(next);
                return;
            }
            comp = intInput;
            next();
        });
    }

    let speed = 0;
    function getSkillLevel(next) {
        text(8, 21, FG[7], BG[0], "Skill level (1 to 100)");
        text(9, 22, FG[7], BG[0], "1 =   Novice");
        text(10, 22, FG[7], BG[0], "90  = Expert");
        text(11, 22, FG[7], BG[0], "100 = Twiddle Fingers");
        text(12, 22, FG[7], BG[0], "(Computer speed may affect your skill level)");
        input(8, 43, FG[7], BG[0], "", (input) => {
            let intInput = parseInt(input) || 0;
            if (intInput < 0 || intInput > 1000) {
                getSkillLevel(next);
                return;
            }
            speed = Math.max(0, TICK - (intInput >> 1)) >> 1;
            next();
        });
    }

    getNumberPlayers(() => {
        getCompPlayers(() => {
            getSkillLevel(() => {
                next({
                    numPlayers: numPlayers,
                    comp: comp,
                    speed: speed,
                });
            });
        })
    });
}

function initColors() {
    fillBuffer(FG[0], BG[0]);

    for (let row = 1 ; row <= ARENAHEIGHT ; row++) {
        for (let col = 1 ; col <= ARENAWIDTH ; col++) {
            arena[row][col].acolor = 0;
        }
    }
    for (let col = 1 ; col <= ARENAWIDTH ; col++) {
        set(3, col, colortable[9]);
        set(ARENAHEIGHT, col, colortable[9]);
    }
    for (let row = 4 ; row <= ARENAHEIGHT-1 ; row++) {
        set(row, 1, colortable[9]);
        set(row, ARENAWIDTH, colortable[9]);
    }
    drawBufferToScreen();
}

function level(whatToDo, curlevel, comp, numPlayers, sammy) {
    switch(whatToDo) {
        case STARTOVER:
            curlevel = 1;
            break;
        case NEXTLEVEL:
            curlevel++;
            break;
    }

    for(let a = 1 ; a <= numPlayers ; a++) {
        sammy[a].head = 1;
        sammy[a].length = ((numPlayers - comp) < 1) * 0 + 2;
        sammy[a].alive = true;
    }

    initColors();

    switch(curlevel) {
        case 1:
            break;
        case 2:
            for (let i = 20 ; i <= 60 ; i++) {
                set(25, i, colortable[9]);
            }
            break;
        case 3:
            for (let i = 10 ; i <= 40 ; i++) {
                set(i, 20, colortable[9]);
                set(i, 60, colortable[9]);
            }
            break;
        case 4:
            for (let i = 4 ; i <= 30 ; i++) {
                set(i, 20, colortable[9]);
                set(53 - i, 60, colortable[9]);
            }
            for (let i = 2 ; i <= 40 ; i++) {
                set(38, i, colortable[9]);
                set(15, 81 - i, colortable[9]);
            }
            break;
        case 5:
            for (let i = 13 ; i <= 39 ; i++) {
                set(i, 21, colortable[9]);
                set(i, 59, colortable[9]);
            }
            for (let i = 23 ; i <= 57 ; i++) {
                set(11, i, colortable[9]);
                set(41, i, colortable[9]);
            }
            break;
        case 6:
            for (let i = 4 ; i <= 49 ; i++) {
                if (i > 30 || i < 23) {
                    set(i, 10, colortable[9]);
                    set(i, 20, colortable[9]);
                    set(i, 30, colortable[9]);
                    set(i, 40, colortable[9]);
                    set(i, 50, colortable[9]);
                    set(i, 60, colortable[9]);
                    set(i, 70, colortable[9]);
                }
            }
            break;
        case 7:
            for (let i = 4 ; i <= 49 ; i+=2) {
                set(i, 40, colortable[9]);
            }
            break;
        case 8:
            for (let i = 4 ; i <= 40 ; i++) {
                set(i, 10, colortable[9]);
                set(53 - i, 20, colortable[9]);
                set(i, 30, colortable[9]);
                set(53 - i, 40, colortable[9]);
                set(i, 50, colortable[9]);
                set(53 - i, 60, colortable[9]);
                set(i, 70, colortable[9]);
            }
            break;
        case 9:
            for (let i = 6 ; i <= 47 ; i++) {
                set(i, i, colortable[9]);
                set(i, i + 28, colortable[9]);
            }
            break;
        case 10:
            for (let i = 4 ; i <= 49 ; i+=2) {
                set(i, 10, colortable[9]);
                set(i + 1, 20, colortable[9]);
                set(i, 30, colortable[9]);
                set(i + 1, 40, colortable[9]);
                set(i, 50, colortable[9]);
                set(i + 1, 60, colortable[9]);
                set(i, 70, colortable[9]);
            }
            break;
        case 11:
            for (let j = 5 ; j <= 45 ; j+=10) {
                for (let i = 5 + (j >> 1) ; i <= 48 - (j >> 1) ; i+=10) {
                    set(i, j, colortable[9]);
                    set(i, 81 - j, colortable[9]);
                }
            }
            for (let j = 8 ; j <= 36 ; j+=4) {
                for (let i = -12 + (j * 2.5) ; i <= 92 - (j * 2.5) ; i++) {
                    set(53 - j, i, colortable[9]);
                    set(j, i, colortable[9]);
                }
            }
            break;
        case 12:
            for (let j = 5 ; j <= 40 ; j+=5) {
                for (let i = 5 + Math.floor(j / 3) ; i <= 48 - Math.floor(j / 3) ; i++) {
                    set(i, j, colortable[9]);
                    set(i, 81 - j, colortable[9]);
                }
            }
            for (let j = 6 ; j <= 12 ; j+=2) {
                for (let i = -15 + (j * 4) ; i <= 96 - (j * 4) ; i++) {
                    set(53 - j, i, colortable[9]);
                    set(j, i, colortable[9]);
                }
            }
            break;
        case 13:
            for (let j = 5 ; j <= 48 ; j++) {
                for (let i = 3; i <= 78 ; i+=2) {
                    set(j, i, colortable[9]);
                }
            }
            break;
        case 14:
            for (let j = 5 ; j <= 48 ; j+=2) {
                for (let i = 3; i <= 78 ; i++) {
                    set(j, i, colortable[9]);
                }
            }
            break;
        case 15: {
            for (let j = 4 ; j <= 77 ; j++) {
                if ((j > 10 && j < 14) || (j > 25 && j < 29) || (j > 38 && j < 43) || (j > 51 && j < 55) || (j > 66 && j < 70)) {
                    set(11, j, colortable[9]);
                    set(42, j, colortable[9]);
                } else {
                    set(6, j, colortable[9]);
                    set(47, j, colortable[9]);
                }
            }
            for (let j = 6 ; j <= 47 ; j++) {
                if ((j > 13 && j < 16) || (j > 25 && j < 29) || (j > 37 && j < 40)) {
                    set(j, 8, colortable[9]);
                    set(j, 73, colortable[9]);
                } else {
                    set(j, 4, colortable[9]);
                    set(j, 77, colortable[9]);
                }
            }
            let r = 0;
            for (let q = 1 ; q <= 8 ; q++) {
                if ( r === 66 ) { r = 70; }
                if ( r === 55 ) { r = 66; }
                if ( r === 51 ) { r = 55; }
                if ( r === 29 ) { r = 51; }
                if ( r === 25 ) { r = 29; }
                if ( r === 14 ) { r = 25; }
                if ( r === 10 ) { r = 14; }
                if ( r === 0 ) { r = 10; }
                for (let j = 7 ; j <= 11 ; j++) {
                    set(j, r, colortable[9]);
                    set(53 - j, r, colortable[9]);
                }
            }
            for (let j = 4 ; j <= 8 ; j++) {
                set(13, j, colortable[9]);
                set(13, 81 - j, colortable[9]);
                set(16, j, colortable[9]);
                set(16, 81 - j, colortable[9]);
                set(37, j, colortable[9]);
                set(37, 81 - j, colortable[9]);
                set(40, j, colortable[9]);
                set(40, 81 - j, colortable[9]);
            }
            for (let j = 13 ; j <= 68; j++) {
                if ((j > 16 && j < 24) || (j > 38 && j < 43) || (j > 57 && j < 64)) {
                    set(11, j, colortable[9]);
                    set(42, j, colortable[9]);
                } else {
                    set(15, j, colortable[9]);
                    set(38, j, colortable[9]);
                }
            }
            for (let j = 15 ; j <= 38 ; j++) {
                if ((j > 18 && j < 23) || (j > 31 && j < 35)) {
                    set(j, 8, colortable[9]);
                    set(j, 73, colortable[9]);
                } else {
                    set(j, 13, colortable[9]);
                    set(j, 68, colortable[9]);
                }
            }
            r = 0;
            for (let q = 1 ; q <= 4 ; q++) {
                if ( r === 57 ) { r = 64; }
                if ( r === 23 ) { r = 57; }
                if ( r === 16 ) { r = 23; }
                if ( r === 0 ) { r = 16; }
                for (let j = 11 ; j <= 15 ; j++) {
                    set(j, r, colortable[9]);
                    set(53 - j, r, colortable[9]);
                }
            }
            for (let j = 8 ; j <= 12; j++) {
                set(18, j, colortable[9]);
                set(18, 81 - j, colortable[9]);
                set(23, j, colortable[9]);
                set(23, 81 - j, colortable[9]);
                set(31, j, colortable[9]);
                set(31, 81 - j, colortable[9]);
                set(35, j, colortable[9]);
                set(35, 81 - j, colortable[9]);
            }
            for (let j = 16 ; j <= 65; j++) {
                if ((j > 38 && j < 43)) {
                } else {
                    set(18, j, colortable[9]);
                    set(35, j, colortable[9]);
                }
            }
            for (let j = 18 ; j <= 35; j++) {
                set(j, 16, colortable[9]);
                set(j, 65, colortable[9]);
            }
            for (let j = 38 ; j <= 43; j++) {
                set(27, j, colortable[9]);
            }
            for (let j = 25 ; j <= 29; j++) {
                set(j, 40, colortable[9]);
                set(j, 41, colortable[9]);
            }
            for (let r = 18 ; r <= 38; r+=2) {
                for (let j = 20; j <= 33; j++) {
                    if ((j > 26 && j < 28)) {
                    } else {
                        set(j, r, colortable[9]);
                    }
                }
            }
            for (let r = 43 ; r <= 65; r+=2) {
                for (let j = 20; j <= 33; j++) {
                    if ((j > 26 && j < 28)) {
                    } else {
                        set(j, r, colortable[9]);
                    }
                }
            }
            break;
        }
        case 16: {
            for (let j = 4 ; j <= 77 ; j++) {
                if ((j > 10 && j < 14) || (j > 25 && j < 29) || (j > 38 && j < 43) || (j > 51 && j < 55) || (j > 66 && j < 70)) {
                    set(11, j, colortable[9]);
                    set(42, j, colortable[9]);
                } else {
                    set(6, j, colortable[9]);
                    set(47, j, colortable[9]);
                }
            }
            for (let j = 6 ; j <= 47 ; j++) {
                if ((j > 13 && j < 16) || (j > 25 && j < 29) || (j > 37 && j < 40)) {
                    set(j, 8, colortable[9]);
                    set(j, 73, colortable[9]);
                } else {
                    set(j, 4, colortable[9]);
                    set(j, 77, colortable[9]);
                }
            }
            let r = 0;
            for (let q = 1 ; q <= 8; q++) {
                if ( r === 66 ) { r = 70; }
                if ( r === 55 ) { r = 66; }
                if ( r === 51 ) { r = 55; }
                if ( r === 29 ) { r = 51; }
                if ( r === 25 ) { r = 29; }
                if ( r === 14 ) { r = 25; }
                if ( r === 10 ) { r = 14; }
                if ( r === 0 ) { r = 10; }
                for (let j = 7 ; j <= 11 ; j++) {
                    set(j, r, colortable[9]);
                    set(53 - j, r, colortable[9]);
                }
            }
            for (let j = 4 ; j <= 8; j++) {
                set(13, j, colortable[9]);
                set(13, 81 - j, colortable[9]);
                set(16, j, colortable[9]);
                set(16, 81 - j, colortable[9]);
                set(37, j, colortable[9]);
                set(37, 81 - j, colortable[9]);
                set(40, j, colortable[9]);
                set(40, 81 - j, colortable[9]);
            }
            for (let j = 13 ; j <= 68 ; j++) {
                if ((j > 16 && j < 24) || (j > 38 && j < 43) || (j > 57 && j < 64)) {
                    set(11, j, colortable[9]);
                    set(42, j, colortable[9]);
                } else {
                    set(15, j, colortable[9]);
                    set(38, j, colortable[9]);
                }
            }
            for (let j = 15 ; j <= 38 ; j++) {
                if ((j > 18 && j < 23) || (j > 31 && j < 35)) {
                    set(j, 8, colortable[9]);
                    set(j, 73, colortable[9]);
                } else {
                    set(j, 13, colortable[9]);
                    set(j, 68, colortable[9]);
                }
            }
            r = 0;
            for (let q = 1 ; q <= 4 ; q++) {
                if ( r === 57 ) { r = 64; }
                if ( r === 23 ) { r = 57; }
                if ( r === 16 ) { r = 23; }
                if ( r === 0 ) { r = 16; }
                for (let j = 11 ; j <= 15 ; j++) {
                    set(j, r, colortable[9]);
                    set(53 - j, r, colortable[9]);
                }
            }
            for (let j = 8 ; j <= 12 ; j++) {
                set(18, j, colortable[9]);
                set(18, 81 - j, colortable[9]);
                set(23, j, colortable[9]);
                set(23, 81 - j, colortable[9]);
                set(31, j, colortable[9]);
                set(31, 81 - j, colortable[9]);
                set(35, j, colortable[9]);
                set(35, 81 - j, colortable[9]);
            }
            for (let j = 16 ; j <= 65 ; j++) {
                if ((j > 38 && j < 43)) {
                } else {
                    set(18, j, colortable[9]);
                    set(35, j, colortable[9]);
                }
            }
            for (let j = 18 ; j <= 35 ; j++) {
                set(j, 16, colortable[9]);
                set(j, 65, colortable[9]);
            }
            for (let j = 18 ; j <= 63 ; j++) {
                set(27, j, colortable[9]);
            }
            for (let j = 23 ; j <= 31 ; j++) {
                set(j, 40, colortable[9]);
                set(j, 41, colortable[9]);
            }

            for (let j = 20 ; j <= 33 ; j++) {
                if ((j > 25 && j < 29)) {
                } else {
                    set(j, 38, colortable[9]);
                    set(j, 43, colortable[9]);
                }
            }
            for (let j = 18 ; j <= 63 ; j++) {
                if ((j > 38 && j < 43)) {
                } else {
                    set(20, j, colortable[9]);
                    set(25, j, colortable[9]);
                    set(29, j, colortable[9]);
                    set(33, j, colortable[9]);
                }
            }
            for (let j = 1 ; j <= 50 ; j++) {
                let q = 26;
                while ( (q > 25 && q < 29) ) {
                    q = Math.floor(Math.random() * 13) + 20;
                }
                let r = 40;
                while ( (r > 38 && r < 43) ) {
                    r = Math.floor(Math.random() * 45) + 18
                }
                set(q, r, colortable[9]);
            }
            break;
        }
        default:
            for (let i = 1 ; i <= (curlevel - 15) * 100 ; i++) {
                set(Math.floor(Math.random() * 46) + 4, Math.floor(Math.random() * 79) + 1, colortable[9]);
            }
            break;
    }

    let bg = 0, maxScore = 0, r = 0;
    for(let q = 1 ; q <= numPlayers ; q++) {
        if (sammy[q].score > maxScore) {
            maxScore = sammy[q].score;
            r = q;
        }
    }

    for(let a = 1 ; a <= numPlayers ; a++) {
        bg = 0;
        if (r === a) {bg = 2;}
        text(1, a * 8 - 1, FG[sammy[a].scolor], BG[bg], "    ");
        text(1, a * 8, FG[sammy[a].scolor], BG[bg], "" + sammy[a].score);
    }
    drawBufferToScreen();

    return curlevel;
}

function eraseSnake(snake, snakeBody, snakeNum) {
    for (let c = 0 ; c <= 9 ; c++) {
        for (let b = snake[snakeNum].length - c ; b >= 0 ; b-= 10) {
            let tail = (snake[snakeNum].head + MAXSNAKELENGTH - b) % MAXSNAKELENGTH;
            set(snakeBody[snakeNum][tail].row, snakeBody[snakeNum][tail].col, 0);
        }
    }
    drawBufferToScreen();
}

function pointIsThere(row, col, acolor) {
    if (row > 0 && row <= ARENAHEIGHT &&
        col > 0 && col <= ARENAWIDTH) {
        if (arena[row][col].acolor !== acolor) {
            return true;
        }
    }
    return false;
}

function pointIsThere2(row, col, c, d) {
    switch(d) {
        case 1:
            if ((row > 1 && arena[row - 1][col].acolor !== c) &&
                (col > 1 && arena[row][col - 1].acolor !== c) &&
                (col < ARENAWIDTH && arena[row][col + 1].acolor !== c)) {
                return true;
            }
            break;
        case 2:
            if ((row < ARENAHEIGHT && arena[row + 1][col].acolor !== c) &&
                (col > 1 && arena[row][col - 1].acolor !== c) &&
                (col < ARENAWIDTH && arena[row][col + 1].acolor !== c)) {
                return true;
            }
            break;
        case 3:
            if ((row < ARENAHEIGHT && arena[row + 1][col].acolor !== c) &&
                (row > 1 && arena[row - 1][col].acolor !== c) &&
                (col > 1 && arena[row][col - 1].acolor !== c)) {
                return true;
            }
            break;
        case 4:
            if ((row < ARENAHEIGHT && arena[row + 1][col].acolor !== c) &&
                (row > 1 && arena[row - 1][col].acolor !== c) &&
                (col < ARENAHEIGHT && arena[row][col + 1].acolor !== c)) {
                return true;
            }
            break;
    }
    return false
}


function sortedIndex(array, value) {
    var low = 0,
        high = array.length;

    while (low < high) {
        var mid = (low + high) >>> 1;
        if (array[mid].val < value.val) low = mid + 1;
        else high = mid;
    }
    return low;
}

function clearHeatMap() {
    for (let row = 1; row <= ARENAHEIGHT; row++) {
        heatMap[row] = [];
    }
}

function buildHeatMap(heat, heatQueue) {
    if(!heatQueue) { heatQueue = [heat]; heatMap[heat.row][heat.col] = heat.val}
    const lookDirs = [{},{},{},{}];

    function buildNext(row, col, val) {
        if(row > 0 && col > 0 && row <= ARENAHEIGHT && col <= ARENAWIDTH) {
            if (heatMap[row][col] === undefined) {
                let newVal = val + 1;
                if (arena[row][col].acolor === 7) { newVal = val + 90; }          // Walls are hard to get through
                else if (arena[row][col].acolor !== 0) { newVal = val + 30; }     // Snakes, less so
                heatMap[row][col] = newVal;
                return {row: row, col: col, val: newVal};
            }
        }
        return null;
    }
    function lookAround(heatQueue, row, col, val) {
        lookDirs[0] = {row: row + 1, col: col};
        lookDirs[1] = {row: row - 1, col: col};
        lookDirs[2] = {row: row, col: col + 1};
        lookDirs[3] = {row: row, col: col - 1};

        for (let lookDir = 0 ; lookDir < lookDirs.length ; lookDir++) {
            let heat = buildNext(lookDirs[lookDir].row, lookDirs[lookDir].col, val);
            if (heat !== null) {
                heatQueue.splice(sortedIndex(heatQueue, heat), 0, heat);
            }
        }
    }

    while(heatQueue.length > 0) {
        heat = heatQueue.shift();
        lookAround(heatQueue, heat.row, heat.col, heat.val);
    }
}

function playNibbles({numPlayers, speed, comp}) {
    const CANDIESTOLEVELUP = 15;
    const sammyBody =[];
    const sammy = [];
    for (let a = 1 ; a <= numPlayers ; a++) {
        sammyBody[a] = [];
        for (let b = 0 ; b < MAXSNAKELENGTH ; b++) {
            sammyBody[a][b] = {
                row: 0,
                col: 0,
            };
        }
        sammy[a] = {
            lives: 9,
            score: 0,
            scolor:colortable[a],
            wall: 0,
            row: Math.floor(Math.random()*(ARENAHEIGHT-10))+4,
            col: Math.floor(Math.random()*(ARENAWIDTH-3))+1,
            direction: Math.floor(Math.random()*4)+1
        };
    }

    let curlevel = level(STARTOVER, 1, comp, numPlayers, sammy);

    function play() {
        if(sammy[1].lives === 0 || (sammy[2] && sammy[2].lives === 0)) { return; }
        let number = 1;
        let numberRow = -1;
        let numberCol = -1;
        let nonum = true;
        let playerDied = false;
        let candyCol = 0;
        let candyRow = 0;

        text(1, (numPlayers + 1) * 8, FG[numPlayers + 1], BG[0], "" + curlevel);
        drawBufferToScreen();

        function tick(next) {
            if (playerDied) { next(); return; }

            if (nonum) {
                function placeNumber() {
                    const row = Math.floor(Math.random() * (ARENAHEIGHT - 6)) + 5;
                    const col = Math.floor(Math.random() * (ARENAWIDTH - 3)) + 3;
                    return {
                        r: row,
                        c: col,
                        s: row + arena[row][col].sister
                    };
                }
                let numberPlace = placeNumber();
                while(pointIsThere(numberPlace.r, numberPlace.c, 0) || pointIsThere(numberPlace.s, numberPlace.c, 0)) {
                    numberPlace = placeNumber();
                }
                candyCol = numberPlace.c;
                candyRow = numberPlace.r;
                numberRow = arena[numberPlace.r][numberPlace.c].realRow;
                numberCol = numberPlace.c;
                nonum = false;
                if(comp > 0) {
                    clearHeatMap();
                    buildHeatMap({row: candyRow, col: candyCol, val: 0});
                    drawHeatMapToScreen();
                }
                text(numberRow, numberCol, FG[Math.floor(Math.random() * 7) + 9], BG[0], "☼");
                drawBufferToScreen();
            }

            let kbd = inkey();
            let a = 0;
            switch(kbd) {
                case "t": case "T": if (sammy[3] && sammy[3].direction !== 2) { sammy[3].direction = 1; } break;
                case "g": case "G": if (sammy[3] && sammy[3].direction !== 1) { sammy[3].direction = 2; } break;
                case "f": case "F": if (sammy[3] && sammy[3].direction !== 4) { sammy[3].direction = 3; } break;
                case "h": case "H": if (sammy[3] && sammy[3].direction !== 3) { sammy[3].direction = 4; } break;
                case "w": case "W": if (sammy[2] && sammy[2].direction !== 2) { sammy[2].direction = 1; } break;
                case "s": case "S": if (sammy[2] && sammy[2].direction !== 1) { sammy[2].direction = 2; } break;
                case "a": case "A": if (sammy[2] && sammy[2].direction !== 4) { sammy[2].direction = 3; } break;
                case "d": case "D": if (sammy[2] && sammy[2].direction !== 3) { sammy[2].direction = 4; } break;
                case "i": case "I": if (sammy[1] && sammy[1].direction !== 2) { sammy[1].direction = 1; } break;
                case "k": case "K": if (sammy[1] && sammy[1].direction !== 1) { sammy[1].direction = 2; } break;
                case "j": case "J": if (sammy[1] && sammy[1].direction !== 4) { sammy[1].direction = 3; } break;
                case "l": case "L": if (sammy[1] && sammy[1].direction !== 3) { sammy[1].direction = 4; } break;

                case "p": case "P": spacePause(" Game Paused ... Push Space  ", tick); return;

                case "\\": nonum = true; break;

                case "`": displayHeatMap = !displayHeatMap;

                case "q": case "Q": case "r": case "R": case "u": case "U":
                    switch(kbd) {
                        case "q": case "Q": a = 2; break;
                        case "r": case "R": a = 3; break;
                        case "u": case "U": a = 1; break;
                    }
                    if (sammy[a] && sammy[a].score > 1) {
                        sammy[a].score = sammy[a].score - 1;
                        sammy[a].row = Math.floor(Math.random() * 40) + 4;
                        sammy[a].col = Math.floor(Math.random() * 77) + 2;
                        sammy[a].direction = Math.floor(Math.random() * 4) + 1;
                    }
                    break;
                case "e": case "E": case "y": case "Y": case "o": case "O":
                    switch(kbd) {
                        case "e": case "E": a = 2; break;
                        case "y": case "Y": a = 3; break;
                        case "o": case "O": a = 1; break;
                    }
                    if (sammy[a] && sammy[a].score > 2) {
                        switch(sammy[a].direction) {
                            case 1: arena[sammy[a].row - 1][sammy[a].col].acolor = 0; break;
                            case 2: arena[sammy[a].row + 1][sammy[a].col].acolor = 0; break;
                            case 3: arena[sammy[a].row][sammy[a].col - 1].acolor = 0; break;
                            case 4: arena[sammy[a].row][sammy[a].col + 1].acolor = 0; break;
                       }
                       sammy[a].score = sammy[a].score - 2;
                    }
                    break;
                case "z": case "Z": case "v": case "V": case "m": case "M":
                    switch(kbd) {
                        case "z": case "Z": a = 2; break;
                        case "v": case "V": a = 3; break;
                        case "m": case "M": a = 1; break;
                    }
                    let r = 0;
                    if (sammy[a] && sammy[a].score > 3 ) {
                        for (let q = 1 ; q <= numPlayers ; q++) {
                            switch(sammy[a].direction) {
                                case 1: if ( arena[sammy[a].row - 1][sammy[a].col].acolor === colortable[q] ) { r = q; } break;
                                case 2: if ( arena[sammy[a].row + 1][sammy[a].col].acolor === colortable[q] ) { r = q; } break;
                                case 3: if ( arena[sammy[a].row][sammy[a].col - 1].acolor === colortable[q] ) { r = q; } break;
                                case 4: if ( arena[sammy[a].row][sammy[a].col + 1].acolor === colortable[q] ) { r = q; } break;
                            }
                        }
                        if (r > 0 && r <= numPlayers) {
                           eraseSnake(sammy, sammyBody, r);
                        }
                        sammy[a].score = sammy[a].score - 3;
                    }
                   break;
                case "x": case "X": case "b": case "B": case ",":
                    switch(kbd) {
                        case "x": case "X": a = 2; break;
                        case "b": case "B": a = 3; break;
                        case ",": a = 1; break;
                    }

                    if (sammy[a] && sammy[a].score > 4) {
                        for (let q = 1 ; q <= numPlayers ; q++) {
                            if ( q !== a ) { sammy[q].row = Math.floor(Math.random() * 40) + 4; }
                            if ( q !== a ) { sammy[q].col = Math.floor(Math.random() * 77) + 2; }
                            if ( q !== a ) { sammy[q].direction = Math.floor(Math.random() * 4) + 1; }
                        }
                        sammy[a].score = sammy[a].score - 1;
                    }
                    break;
                case "c": case "C": case "n": case "N": case ".":
                    switch(kbd) {
                        case "c": case "C": a = 2; break;
                        case "n": case "N": a = 3; break;
                        case ".": a = 1; break;
                    }

                    if (sammy[a] && sammy[a].score > 5) {
                        sammy[a].row = candyRow + Math.floor(Math.random() * 2) + 1;
                        sammy[a].col = candyCol + Math.floor(Math.random() * 2) + 1;
                        sammy[a].direction = Math.floor(Math.random() * 4) + 1;
                        sammy[a].score = sammy[a].score - 5;
                    }
                    break;
            }

            let bg = 0, maxScore = 0, r = 0;
            for(let q = 1 ; q <= numPlayers ; q++) {
                if (sammy[q].score > maxScore) {
                    maxScore = sammy[q].score;
                    r = q;
                }
            }

            for (let q = 1 ; q <= numPlayers ; q++) {
                bg = 0;
                if (r === q) {bg = 2;}
                if (sammy[q].row < 4) { sammy[q].row = 4; }
                if (sammy[q].row > ARENAHEIGHT - 1) { sammy[q].row = ARENAHEIGHT - 1; }
                if (sammy[q].col < 2) { sammy[q].col = 2; }
                if (sammy[q].col > ARENAWIDTH - 1) { sammy[q].col = ARENAWIDTH - 1; }
                text(1, q * 8 - 1, FG[sammy[q].scolor], BG[bg], "    ");
                text(1, q * 8, FG[sammy[q].scolor], BG[bg], "" + sammy[q].score);
            }

            if(comp > 0) {
                clearHeatMap();
                buildHeatMap({row: candyRow, col: candyCol, val: 0});
                drawHeatMapToScreen();
            }

            for(let a = 1 ; a <= numPlayers ; a++) {
                if (a > (numPlayers - comp)) { // AI
                    let possibleMoves = [];
                    possibleMoves.push({direction: 1, gain: heatMap[sammy[a].row][sammy[a].col] - heatMap[sammy[a].row - 1][sammy[a].col]});
                    possibleMoves.push({direction: 2, gain: heatMap[sammy[a].row][sammy[a].col] - heatMap[sammy[a].row + 1][sammy[a].col]});
                    possibleMoves.push({direction: 3, gain: heatMap[sammy[a].row][sammy[a].col] - heatMap[sammy[a].row][sammy[a].col - 1]});
                    possibleMoves.push({direction: 4, gain: heatMap[sammy[a].row][sammy[a].col] - heatMap[sammy[a].row][sammy[a].col + 1]});
                    let bestMove = {direction: 0, gain: 0};
                    let preferDir = sammy[a].direction;
                    for(let b = 0 ; b < possibleMoves.length ; b++) {
                        let dirIndex = ((b + preferDir) % possibleMoves.length);
                        if (possibleMoves[dirIndex].gain >= bestMove.gain) {
                            bestMove.direction = possibleMoves[dirIndex].direction;
                            bestMove.gain = possibleMoves[dirIndex].gain;
                        }
                    }
                    if (bestMove.direction !== 0) {
                        sammy[a].direction = bestMove.direction;
                    }
                }

                switch (sammy[a].direction) {
                    case 1: if(!pointIsThere(sammy[a].row - 1, sammy[a].col, 0)) { sammy[a].row = sammy[a].row - 1; } break;
                    case 2: if(!pointIsThere(sammy[a].row + 1, sammy[a].col, 0)) { sammy[a].row = sammy[a].row + 1; } break;
                    case 3: if(!pointIsThere(sammy[a].row, sammy[a].col - 1, 0)) { sammy[a].col = sammy[a].col - 1; } break;
                    case 4: if(!pointIsThere(sammy[a].row, sammy[a].col + 1, 0)) { sammy[a].col = sammy[a].col + 1; } break;
                }

                if (numberRow === ((sammy[a].row + 1) >> 1) && numberCol === sammy[a].col) {
                    // Candy hit. Yum.

                    if (sammy[a].length < (MAXSNAKELENGTH - 500)) {
                        sammy[a].length = sammy[a].length + number * (numPlayers * 5);
                        sammy[a].scolor = colortable[a];
                        for (let b = 1 ; b <= numPlayers ; b++) {
                            sammy[b].wall = 0;
                        }
                    }
                    sammy[a].score = sammy[a].score + number;

                    let bg = 0, maxScore = 0, r = 0;
                    for(let q = 1 ; q <= numPlayers ; q++) {
                        if (sammy[q].score > maxScore) {
                            maxScore = sammy[q].score;
                            r = q;
                        }
                    }

                    for(let s = 1 ; s <= numPlayers ; s++) {
                        bg = 0;
                        if (r === s) { bg = 2; }
                        text(1, a * 8 - 1, FG[sammy[s].scolor], BG[bg], "    ");
                        text(1, a * 8, FG[colortable[s]], BG[bg], "" + sammy[s].score);
                    }

                    number++;
                    if (number === CANDIESTOLEVELUP) {
                        for (let b = 1 ; b <= numPlayers ; b++) {
                            eraseSnake(sammy, sammyBody, b);
                        }
                        curlevel = level(NEXTLEVEL, curlevel, comp, numPlayers, sammy);
                        speed = speed - 2;
                        if (numPlayers === comp) {
                            play();
                        } else {
                            spacePause(`     Level ${curlevel},  Push Space`, play);
                        }
                        return;
                    }
                    nonum = true;
                    if(speed < 1) { speed = 1; }
                }
            }

            const useSpecialPointMultiplier = Math.floor(Math.random() * 1000) + 1;
            for(let a = 1 ; a <= numPlayers ; a++) {
                if (a > (numPlayers - comp)) {  // AI Special Moves.

                    if (sammy[a].score > (5 * useSpecialPointMultiplier) && heatMap[sammy[a].row][sammy[a].col] > 150) {
                        // We're beyond the edge of the map. Try a warp-near
                        sammy[a].row = candyRow + Math.floor(Math.random() * 2) + 1;
                        sammy[a].col = candyCol + Math.floor(Math.random() * 2) + 1;
                        sammy[a].direction = Math.floor(Math.random() * 4) + 1;
                        sammy[a].score = sammy[a].score - 5;
                    } else if (sammy[a].score > (3 * useSpecialPointMultiplier) && pointIsThere2(sammy[a].row, sammy[a].col, 0, sammy[a].direction)) {
                        // Sammy is surrounded. Erase a snake
                        let r = 0;
                        for (let q = 1 ; q <= 8 ; q++) {
                            switch(sammy[a].direction) {
                                case 1: if ( arena[sammy[a].row - 1][sammy[a].col].acolor === colortable[q] ) { r = q; } break;
                                case 2: if ( arena[sammy[a].row + 1][sammy[a].col].acolor === colortable[q] ) { r = q; } break;
                                case 3: if ( arena[sammy[a].row][sammy[a].col - 1].acolor === colortable[q] ) { r = q; } break;
                                case 4: if ( arena[sammy[a].row][sammy[a].col + 1].acolor === colortable[q] ) { r = q; } break;
                            }
                        }
                        if ( r > 0 && r <= numPlayers ) {
                            eraseSnake(sammy, sammyBody, r);
                        }
                        r = 0;
                        sammy[a].score = sammy[a].score - 3;
                    } else {
                        let somethingIsInTheWay = false;
                        switch (sammy[a].direction) {
                            case 1: if(pointIsThere(sammy[a].row - 1, sammy[a].col, 0)) { somethingIsInTheWay = true; } break;
                            case 2: if(pointIsThere(sammy[a].row + 1, sammy[a].col, 0)) { somethingIsInTheWay = true; } break;
                            case 3: if(pointIsThere(sammy[a].row, sammy[a].col - 1, 0)) { somethingIsInTheWay = true; } break;
                            case 4: if(pointIsThere(sammy[a].row, sammy[a].col + 1, 0)) { somethingIsInTheWay = true; } break;
                        }
                        if(somethingIsInTheWay && (Math.random() < 0.2)) {
                            if (sammy[a].score > (1 * useSpecialPointMultiplier) && heatMap[sammy[a].row][sammy[a].col] > 60) {
                                // Random Warp
                                sammy[a].row = Math.floor(Math.random() * 40) + 4;
                                sammy[a].col = Math.floor(Math.random() * 77) + 2;
                                sammy[a].direction = Math.floor(Math.random() * 4) + 1;
                                sammy[a].score = sammy[a].score - 1;
                            } else if (sammy[a].score > (2 * useSpecialPointMultiplier) && heatMap[sammy[a].row][sammy[a].col] > 20) {
                                // Pass through
                                switch(sammy[a].direction) {
                                    case 1: arena[sammy[a].row - 1][sammy[a].col].acolor = 0; break;
                                    case 2: arena[sammy[a].row + 1][sammy[a].col].acolor = 0; break;
                                    case 3: arena[sammy[a].row][sammy[a].col - 1].acolor = 0; break;
                                    case 4: arena[sammy[a].row][sammy[a].col + 1].acolor = 0; break;
                                }
                                sammy[a].score = sammy[a].score - 2;
                            }
                        }
                    }
                }

                if (sammy[a].row < 4) { sammy[a].row = 4; }
                if (sammy[a].row > ARENAHEIGHT - 1) { sammy[a].row = ARENAHEIGHT - 1; }
                if (sammy[a].col < 2) { sammy[a].col = 2; }
                if (sammy[a].col > ARENAWIDTH - 1) { sammy[a].col = ARENAWIDTH - 1; }

                // Bounce
                if (pointIsThere(sammy[a].row, sammy[a].col, 0)) {
                    if (sammy[a].direction === 1) {
                        if (!pointIsThere(sammy[a].row + 1, sammy[a].col, 0)) {
                            sammy[a].direction = 2;
                        }
                    } else if (sammy[a].direction === 2) {
                        if (!pointIsThere(sammy[a].row - 1, sammy[a].col, 0)) {
                            sammy[a].direction = 1;
                        }
                    } else if (sammy[a].direction === 3) {
                        if (!pointIsThere(sammy[a].row , sammy[a].col + 1, 0)) {
                            sammy[a].direction = 4;
                        }
                    } else if (sammy[a].direction === 4) {
                        if (!pointIsThere(sammy[a].row , sammy[a].col - 1, 0)) {
                            sammy[a].direction = 3;
                        }
                    }
                }

                sammy[a].head = (sammy[a].head+1) % MAXSNAKELENGTH;
                sammyBody[a][sammy[a].head].row = sammy[a].row;
                sammyBody[a][sammy[a].head].col = sammy[a].col;
                let tail = (sammy[a].head + MAXSNAKELENGTH - sammy[a].length) % MAXSNAKELENGTH;
                set(sammyBody[a][tail].row, sammyBody[a][tail].col, 0);
                sammyBody[a][tail].row = 0;
                set(sammy[a].row, sammy[a].col, sammy[a].scolor);
            }
            drawBufferToScreen();


            setTimeout(() => {
                tick(next);
            }, speed);
        }

        function finishPlay() {
            let pause = false;
            for (let a = 1; a <= numPlayers; a++) {
                eraseSnake(sammy, sammyBody, a);
                if (!sammy[a].alive) {
                    sammy[a].score -= 10;
                    pause = true;
                }
            }
            if (pause) {
                spacePause(" -- Someone Died! Push Space -- ", () => {
                    curlevel = level(SAMELEVEL, curlevel, comp, numPlayers, sammy);
                    play();
                });
            } else {
                play();
            }
        }

        tick(finishPlay);
    }

    spacePause(`     Level ${curlevel},  Push Space`, play);
}


function intro() {
    fillBuffer(FG[15], BG[0]);

    center(3, FG[15], BG[0], "Q B a s i c   N i b b l e s");
    center(7, FG[7], BG[0], "Nibbles is a game for one to eight players.  Navigate your snakes");
    center(8, FG[7], BG[0], "around the game board trying to eat up candies. The more candies you eat");
    center(9, FG[7], BG[0], "up, the more points you gain and the longer your snake becomes.");
    center(10, FG[7], BG[0], "With more points you have more special functions available to you.");

    center(13, FG[7], BG[0], "  Keys    Descriptions (Points)    Player 1   Player 2   Player 3       ");
    center(14, FG[7], BG[0], "╔═════╗                                                                 ");
    center(15, FG[7], BG[0], "║1 ▲ 2║   1 = Random Warp  (1)      ╔═════╗    ╔═════╗    ╔═════╗       ");
    center(16, FG[7], BG[0], "║     ║   2 = Pass Through (2)      ║U I O║    ║Q W E║    ║R T Y║       ");
    center(17, FG[7], BG[0], "║◄ ▼ ►║   3 = Erase Snake  (3)      ║J K L║    ║A S D║    ║F G H║       ");
    center(18, FG[7], BG[0], "║     ║   4 = Warp Others  (1)      ║M , .║    ║Z X C║    ║V B N║       ");
    center(19, FG[7], BG[0], "║3 4 5║   5 = Warp Near    (5)      ╚═════╝    ╚═════╝    ╚═════╝       ");
    center(20, FG[7], BG[0], "╚═════╝                                                                 ");
    center(24, FG[7], BG[0], "Press any key to continue");

    for (let a = 1 ; a <= 8 ; a++) {
        buffer[5][a * 7 + 7] = {
            character: B,
            foreground: FG[colortable[a]],
            background: BG[0]
        };
    }

    drawBufferToScreen();
    sparklePause(() => {
        getInputs((gameData) => {
            drawScreen();
            setTimeout(() => {
                playNibbles(gameData);
            }, TICK * 10);
        })
    });
}

intro();


