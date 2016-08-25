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
                } else if (keyboardQueue[0] === "Meta") {
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

function inkey(callback, key) {
    if(callback) {
        if (keyboardQueue.length > 0) {
            if(key) {
                let queuedKey = keyboardQueue.shift();
                while (queuedKey !== key && keyboardQueue.length > 0) {
                    queuedKey = keyboardQueue.shift();
                }
                if (queuedKey === key) {
                    callback();
                    return;
                }
            } else {
                let queuedKey = keyboardQueue.shift();
                if (queuedKey !== "Meta") {
                    callback();
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
document.body.style = `${fonts[2]};white-space:pre;letter-spacing:-0.008em;`;
document.addEventListener("keydown", keydown);

const buffer = [];
function fillBuffer (fg, bg) {
    for (let row = 1 ; row <= HEIGHT ; row++) {
        buffer[row] = [];
        for (let col = 1 ; col <= WIDTH ; col++) {
            buffer[row][col] = {
                character: S,
                foreground: fg,
                background: bg
            };
        }
    }
}
function drawBufferToScreen() {
    let screenText = "";
    for (let row = 1 ; row <= HEIGHT ; row++) {
        for (let col = 1 ; col <= WIDTH ; col++) {
            screenText += `<span style="color:rgb(${buffer[row][col].foreground});background:rgb(${buffer[row][col].background})">${buffer[row][col].character}</span>`;
        }
        screenText += "\n";
    }
    document.body.innerHTML = screenText;
}



// ======= DONE WITH SETUP. START PROGRAM ========= //
const arena = [];
const ARENAHEIGHT = HEIGHT * 2;
const ARENAWIDTH = WIDTH;
const MAXPLAYERS = 8;
const MAXSNAKELENGTH = 1000;
const STARTOVER = 1;
const SAMELEVEL = 2;
const NEXTLEVEL = 3;
let colortable = [0, 15, 14, 13, 12, 11, 10, 9, 8, 7]; // Filler, Snakes 1-8, Walls

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

function text (row, col, fg, bg, text) {
    for (let i = 0 ; i < text.length ; i++) {
        buffer[row][col+i] = {
            character: text[i],
            foreground: fg,
            background: bg
        };
    }
}

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
            speed = (TICK / intInput);
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

    for(let a = 1 ; a <= numPlayers ; a++) {
        text(1, a * 8, FG[colortable[a]], BG[0], "" + sammy[a].score);
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
    if (row !== 0) {
        if (arena[row][col].acolor !== acolor) {
            return true;
        }
    }
    return false;
}

function pointIsThere2(row, col, c, d) {
    switch(d) {
        case 1:
            if (arena[row - 1][col].acolor !== c &&
                arena[row][col - 1].acolor !== c &&
                arena[row][col + 1].acolor !== c) {
                return true;
            }
            break;
        case 2:
            if (arena[row + 1][col].acolor !== c &&
                arena[row][col - 1].acolor !== c &&
                arena[row][col + 1].acolor !== c) {
                return true;
            }
            break;
        case 3:
            if (arena[row + 1][col].acolor !== c &&
                arena[row - 1][col].acolor !== c &&
                arena[row][col - 1].acolor !== c) {
                return true;
            }
            break;
        case 4:
            if (arena[row + 1][col].acolor !== c &&
                arena[row - 1][col].acolor !== c &&
                arena[row][col + 1].acolor !== c) {
                return true;
            }
            break;
    }
    return false
}

function playNibbles({numPlayers, speed, comp}) {
    const CANDIESTOLEVELUP = 15;
    let x = -1;
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
                numberRow = arena[numberPlace.r][numberPlace.c].realRow;
                numberCol = numberPlace.c;
                nonum = false;
                // TODO Tinclon: Randomize "Candy" character
                text(numberRow, numberCol, FG[Math.floor(Math.random() * 7) + 9], BG[0], "@");
                drawBufferToScreen();
            }

            let kbd = inkey();
            switch(kbd) {
                case "w": case "W": if (sammy[3].direction !== 2) { sammy[3].direction = 1; } break;
                case "s": case "S": if (sammy[3].direction !== 1) { sammy[3].direction = 2; } break;
                case "a": case "A": if (sammy[3].direction !== 4) { sammy[3].direction = 3; } break;
                case "d": case "D": if (sammy[3].direction !== 3) { sammy[3].direction = 4; } break;
                case "t": case "T": if (sammy[2].direction !== 2) { sammy[2].direction = 1; } break;
                case "g": case "G": if (sammy[2].direction !== 1) { sammy[2].direction = 2; } break;
                case "f": case "F": if (sammy[2].direction !== 4) { sammy[2].direction = 3; } break;
                case "h": case "H": if (sammy[2].direction !== 3) { sammy[2].direction = 4; } break;
                case "i": case "I": if (sammy[1].direction !== 2) { sammy[1].direction = 1; } break;
                case "k": case "K": if (sammy[1].direction !== 1) { sammy[1].direction = 2; } break;
                case "j": case "J": if (sammy[1].direction !== 4) { sammy[1].direction = 3; } break;
                case "l": case "L": if (sammy[1].direction !== 3) { sammy[1].direction = 4; } break;
                // TODO Tinclon: Insert all the fun stuff here
            }

            for (let q = 1 ; q < numPlayers ; q++) {
                if (sammy[q].row < 4) { sammy[q].row = 4; }
                if (sammy[q].row > ARENAHEIGHT - 1) { sammy[q].row = ARENAHEIGHT - 1; }
                if (sammy[q].col < 2) { sammy[q].col = 2; }
                if (sammy[q].col > ARENAWIDTH - 1) { sammy[q].col = ARENAWIDTH - 1; }
                text(1, q * 8, FG[q], BG[0], "" + sammy[q].score);
                drawBufferToScreen();
            }

            // TODO What is this here for?
            x++;
            if(x > 10000) { x = 0; }

            for(let a = 1 ; a <= numPlayers ; a++) {
                if (a > (numPlayers - comp)) {
                    // TODO Insert computer logic here
                }

                switch (sammy[a].direction) {
                    case 1: if(!pointIsThere(sammy[a].row - 1, sammy[a].col, 0)) { sammy[a].row = sammy[a].row - 1; } break;
                    case 2: if(!pointIsThere(sammy[a].row + 1, sammy[a].col, 0)) { sammy[a].row = sammy[a].row + 1; } break;
                    case 3: if(!pointIsThere(sammy[a].row, sammy[a].col - 1, 0)) { sammy[a].col = sammy[a].col - 1; } break;
                    case 4: if(!pointIsThere(sammy[a].row, sammy[a].col + 1, 0)) { sammy[a].col = sammy[a].col + 1; } break;
                }

                if (sammy[a].wall === 2) { sammy[a].wall = 1; }
                else if (sammy[a].wall === 1) { sammy[a].wall = 0; }

                if (a > (numPlayers - comp)) {
                    // TODO Insert computer logic here
                }

                if (numberRow === ((sammy[a].row + 1) >> 1) && numberCol === sammy[a].col) {
                    if (sammy[a].length < (MAXSNAKELENGTH - 500)) {
                        sammy[a].length = sammy[a].length + number * (numPlayers * 5);
                        sammy[a].scolor = colortable[a];
                        for (let b = 1 ; b <= numPlayers ; b++) {
                            sammy[b].wall = 0;
                        }
                    }
                    sammy[a].score = sammy[a].score + number;
                    text(1, a * 8, FG[colortable[a]], BG[0], "" + sammy[a].score);
                    number++;
                    if (number === CANDIESTOLEVELUP) {
                        for (let b = 1 ; b <= numPlayers ; b++) {
                            eraseSnake(sammy, sammyBody, b);
                        }
                        curlevel = level(NEXTLEVEL, curlevel, comp, numPlayers, sammy);
                        speed = speed - 10;
                        spacePause(`     Level ${curlevel},  Push Space`, play);
                        return;
                    }
                    nonum = true;
                    if(speed < 1) { speed = 1; }
                }
            }

            for(let a = 1 ; a <= numPlayers ; a++) {
                if (pointIsThere2(sammy[a].row, sammy[a].col, 0, sammy[a].direction)) {
                    if (a > (numPlayers - comp)) {
                        // TODO Insert computer logic here
                    }
                }

                if (sammy[a].row < 4) { sammy[a].row = 4; }
                if (sammy[a].row > ARENAHEIGHT - 1) { sammy[a].row = ARENAHEIGHT - 1; }
                if (sammy[a].col < 2) { sammy[a].col = 2; }
                if (sammy[a].col > ARENAWIDTH - 1) { sammy[a].col = ARENAWIDTH - 1; }

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

    center(4, FG[15], BG[0], "Q B a s i c   N i b b l e s");
    center(8, FG[7], BG[0], "Nibbles is a game for one to eight players.  Navigate your snakes");
    center(9, FG[7], BG[0], "around the game board trying to eat up numbers. The more numbers you eat");
    center(10, FG[7], BG[0], "up, the more points you gain and the longer you snake becomes.");
    center(11, FG[7], BG[0], "With more points you have more special functions available to you.");
    center(14, FG[7], BG[0], "  Keys             Descriptions (Points)             Player Centres (5) ");
    center(15, FG[7], BG[0], "╔═════╗                                                                 ");
    center(16, FG[7], BG[0], "║1 2 3║   1 = Random Warp  (1)  6 = RIGHT        (0)    1  --  5        ");
    center(17, FG[7], BG[0], "║     ║   2 = UP           (0)  7 = Erase Snake  (3)    2  --  S        ");
    center(18, FG[7], BG[0], "║4 5 6║   3 = Pass Through (2)  8 = Warp Others  (1)    3  --  G        ");
    center(19, FG[7], BG[0], "║     ║   4 = LEFT         (0)  9 = Warp Near    (5)    4  --  K        ");
    center(20, FG[7], BG[0], "║7 8 9║   5 = DOWN         (0)                                          ");
    center(21, FG[7], BG[0], "╚═════╝                                                                 ");
    center(24, FG[7], BG[0], "Press any key to continue");

    for (let a = 1 ; a <= 8 ; a++) {
        buffer[13][a * 7] = {
            character: "█",
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


