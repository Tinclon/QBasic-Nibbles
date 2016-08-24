DEFLNG A-Z

TYPE snakeBody
    row AS LONG
    col AS LONG
END TYPE

TYPE snaketype
    head      AS LONG
    length    AS LONG
    row       AS LONG
    col       AS LONG
    direction AS LONG
    lives     AS LONG
    score     AS LONG
    scolor    AS LONG
    alive     AS LONG
    col2      AS LONG
    col3      AS LONG
    row2      AS LONG
    row3      AS LONG
    wall      AS LONG
END TYPE

TYPE arenaType
    realRow     AS LONG
    acolor      AS LONG
    sister      AS LONG
END TYPE

DECLARE SUB SpacePause (ttext$)
DECLARE SUB Intro ()
DECLARE SUB GetInputs (numplayers, speed, diff$, monitor$, comp)
DECLARE SUB DrawScreen ()
DECLARE SUB PlayNibbles (numplayers, speed, diff$, comp)
DECLARE SUB set (row, col, acolor)
DECLARE SUB Center (row, ttext$)
DECLARE SUB DoIntro ()
DECLARE SUB Initialize ()
DECLARE SUB SparklePause ()
DECLARE SUB Level (WhatToDO, comp, numplayers, sammy() AS snaketype)
DECLARE SUB InitColors ()
DECLARE SUB EraseSnake (snake() AS ANY, snakeBod() AS ANY, snakeNum&)
DECLARE FUNCTION StillWantsToPlay ()
DECLARE FUNCTION PointIsThere (row, col, backColor)
DECLARE FUNCTION PointIsThere2 (row, col, c, d)


CONST TRUE = -1
CONST FALSE = NOT TRUE
CONST MAXSNAKELENGTH = 1000
CONST STARTOVER = 1
CONST SAMELEVEL = 2
CONST NEXTLEVEL = 3

DIM SHARED arena(1 TO 50, 1 TO 80) AS arenaType
DIM SHARED curlevel, colortable(13)

    RANDOMIZE TIMER
    GOSUB ClearKeyLocks
    Intro
    GetInputs numplayers, speed, diff$, monitor$, comp
    GOSUB SetColors
    DrawScreen

    DO
      PlayNibbles numplayers, speed, diff$, comp
    LOOP WHILE StillWantsToPlay

    GOSUB RestoreKeyLocks
    COLOR 15, 0
    CLS
END

ClearKeyLocks:
    REM DEF SEG = 0
    REM  KeyFlags = PEEK(1047)
    REM POKE 1047, &H0
    REM DEF SEG
    RETURN

RestoreKeyLocks:
    REM DEF SEG = 0
    REM POKE 1047, KeyFlags
    REM DEF SEG
    RETURN

SetColors:
    RESTORE normal
    FOR a = 1 TO 9
        READ colortable(a)
    NEXT a
    RETURN

           'snake1 snake2 snake3 snake4 snake5 snake6 snake7 snake8  Walls
normal: DATA 15,    14,    13,    12,    11,    10,     9,     8,     7,
END

SUB Center (row, ttext$)
    LOCATE row, 41 - LEN(ttext$) / 2
    PRINT ttext$;
END SUB

SUB DrawScreen

    VIEW PRINT
    COLOR 14, 0
    CLS

    Center 1, "Nibbles!"
    Center 11, "Initializing Playing Field..."
    
    FOR row = 1 TO 50
        FOR col = 1 TO 80
            arena(row, col).realRow = INT((row + 1) / 2)
            arena(row, col).sister = (row MOD 2) * 2 - 1
        NEXT col
    NEXT row
END SUB

SUB EraseSnake (snake() AS snaketype, snakeBod() AS snakeBody, snakeNum)

    FOR c = 0 TO 9
        FOR b = snake(snakeNum).length - c TO 0 STEP -10
            tail = (snake(snakeNum).head + MAXSNAKELENGTH - b) MOD MAXSNAKELENGTH
            set snakeBod(tail, snakeNum).row, snakeBod(tail, snakeNum).col, 0
        NEXT b
    NEXT c
    
END SUB

SUB GetInputs (numplayers, speed, diff$, monitor$, comp)

    COLOR 7, 0
    CLS

    DO
        LOCATE 5, 47: PRINT SPACE$(34);
        LOCATE 5, 20
        INPUT "How many players (1 to 8)"; num$
    LOOP UNTIL VAL(num$) > 0 AND VAL(num$) < 9
    numplayers = VAL(num$)
    DO
      LOCATE 6, 47: PRINT SPACE$(34)
      LOCATE 6, 20
      INPUT "How many players does computer play"; comp$
    LOOP UNTIL VAL(comp$) = 0 OR VAL(comp$) = 1 OR VAL(comp$) = 2 OR VAL(comp$) = 3 OR VAL(comp$) = 4 OR VAL(comp$) = 5 OR VAL(comp$) = 6 OR VAL(comp$) = 7 OR VAL(comp$) = 8
    comp = VAL(comp$)


    LOCATE 8, 21: PRINT "Skill level (1 to 100)"
    LOCATE 9, 22: PRINT "1   = Novice"
    LOCATE 10, 22: PRINT "90  = Expert"
    LOCATE 11, 22: PRINT "100 = Twiddle Fingers"
    LOCATE 12, 15: PRINT "(Computer speed may affect your skill level)"
    DO
        LOCATE 8, 44: PRINT SPACE$(35);
        LOCATE 8, 43
        INPUT gamespeed$
    LOOP UNTIL VAL(gamespeed$) >= 1 AND VAL(gamespeed$) <= 1000
    speed = VAL(gamespeed$)
  
    speed = (200 - speed) * 2 + 1

diff$ = "Y"

monitor$ = "C"

    startTime# = TIMER
    FOR i# = 1 TO 1000: NEXT i#
    stopTime# = TIMER
    REM speed = speed * .5 / (stopTime# - startTime#)
    speed = speed * 5
END SUB

SUB InitColors
    
    FOR row = 1 TO 50
        FOR col = 1 TO 80
            arena(row, col).acolor = 0
        NEXT col
    NEXT row

    CLS
   
    FOR col = 1 TO 80
        set 3, col, colortable(9)
        set 50, col, colortable(9)
    NEXT col

    FOR row = 4 TO 49
        set row, 1, colortable(9)
        set row, 80, colortable(9)
    NEXT row

END SUB

SUB Intro
    SCREEN 0
    WIDTH 80, 25
    COLOR 15, 0
    CLS

    Center 4, "Q B a s i c   N i b b l e s"
    COLOR 7
    Center 8, "Nibbles is a game for one to eight players.  Navigate your snakes"
    Center 9, "around the game board trying to eat up numbers. The more numbers you eat"
    Center 10, "up, the more points you gain and the longer you snake becomes."
    Center 11, "With more points you have more special functions available to you."
    Center 14, "  Keys             Descriptions (Points)             Player Centres (5) "
    Center 15, "⁄ƒƒƒƒƒø                                                                 "
    Center 16, "≥1 2 3≥   1 = Random Warp  (1)  6 = RIGHT        (0)    1  --  5        "
    Center 17, "≥     ≥   2 = UP           (0)  7 = Erase Snake  (3)    2  --  S        "
    Center 18, "≥4 5 6≥   3 = Pass Through (2)  8 = Warp Others  (1)    3  --  G        "
    Center 19, "≥     ≥   4 = LEFT         (0)  9 = Warp Near    (5)    4  --  K        "
    Center 20, "≥7 8 9≥   5 = DOWN         (0)                                          "
    Center 21, "¿ƒƒƒƒƒŸ                                                                 "
    Center 24, "Press any key to continue"
   
    LOCATE 12, 1
    FOR a = 1 TO 8
    LOCATE 13, a * 7
    COLOR colortable(a), 0
    PRINT g
    NEXT a
   
    'PLAY "MBT160O1L8CDEDCDL4ECC"
    SparklePause

END SUB

SUB Level (WhatToDO, comp, numplayers, sammy() AS snaketype) STATIC
    
    SELECT CASE (WhatToDO)

    CASE STARTOVER
        curlevel = 1
    CASE NEXTLEVEL
        curlevel = curlevel + 1
    END SELECT

    FOR a = 1 TO 8
      sammy(a).head = 1
      sammy(a).length = ((numplayers - comp) < 1) * 0 + 2
      sammy(a).alive = TRUE
      sammy(a).scolor = colortable(a)
    NEXT a
   

    InitColors
    
    SELECT CASE curlevel
    CASE 1


    CASE 2
        FOR i = 20 TO 60
            set 25, i, colortable(9)
        NEXT i

    CASE 3
        FOR i = 10 TO 40
            set i, 20, colortable(9)
            set i, 60, colortable(9)
        NEXT i

    CASE 4
        FOR i = 4 TO 30
            set i, 20, colortable(9)
            set 53 - i, 60, colortable(9)
        NEXT i
        FOR i = 2 TO 40
            set 38, i, colortable(9)
            set 15, 81 - i, colortable(9)
        NEXT i
   
    CASE 5
        FOR i = 13 TO 39
            set i, 21, colortable(9)
            set i, 59, colortable(9)
        NEXT i
        FOR i = 23 TO 57
            set 11, i, colortable(9)
            set 41, i, colortable(9)
        NEXT i

    CASE 6
        FOR i = 4 TO 49
            IF i > 30 OR i < 23 THEN
                set i, 10, colortable(9)
                set i, 20, colortable(9)
                set i, 30, colortable(9)
                set i, 40, colortable(9)
                set i, 50, colortable(9)
                set i, 60, colortable(9)
                set i, 70, colortable(9)
            END IF
        NEXT i

    CASE 7
        FOR i = 4 TO 49 STEP 2
            set i, 40, colortable(9)
        NEXT i

    CASE 8
        FOR i = 4 TO 40
            set i, 10, colortable(9)
            set 53 - i, 20, colortable(9)
            set i, 30, colortable(9)
            set 53 - i, 40, colortable(9)
            set i, 50, colortable(9)
            set 53 - i, 60, colortable(9)
            set i, 70, colortable(9)
        NEXT i

    CASE 9
        FOR i = 6 TO 47
            set i, i, colortable(9)
            set i, i + 28, colortable(9)
        NEXT i
   
    CASE 10
        FOR i = 4 TO 49 STEP 2
            set i, 10, colortable(9)
            set i + 1, 20, colortable(9)
            set i, 30, colortable(9)
            set i + 1, 40, colortable(9)
            set i, 50, colortable(9)
            set i + 1, 60, colortable(9)
            set i, 70, colortable(9)
        NEXT i
   
     CASE 11
       FOR j = 5 TO 45 STEP 10
         FOR i = 5 + (j / 2) TO 48 - (j / 2)
           set i, j, colortable(9)
           set i, 81 - j, colortable(9)
         NEXT i
       NEXT j
       FOR j = 8 TO 36 STEP 4
         FOR i = -12 + (j * 2.5) TO 92 - (j * 2.5)
           set 53 - j, i, colortable(9)
           set j, i, colortable(9)
         NEXT i
       NEXT j
   
    CASE 12
        FOR j = 5 TO 40 STEP 5
          FOR i = 5 + (j / 3) TO 48 - (j / 3)
            set i, j, colortable(9)
            set i, 81 - j, colortable(9)
          NEXT i
        NEXT j
        FOR j = 6 TO 12 STEP 2
          FOR i = -15 + (j * 4) TO 96 - (j * 4)
            set 53 - j, i, colortable(9)
            set j, i, colortable(9)
          NEXT i
        NEXT j
   
    CASE 13
      FOR j = 5 TO 48 STEP 1
        FOR i = 3 TO 78 STEP 2
          set j, i, colortable(9)
        NEXT i
      NEXT j
   
    CASE 14
      FOR j = 5 TO 48 STEP 2
        FOR i = 3 TO 78 STEP 1
          set j, i, colortable(9)
        NEXT i
      NEXT j

    CASE 15
      FOR j = 4 TO 77
        IF (j > 10 AND j < 14) OR (j > 25 AND j < 29) OR (j > 38 AND j < 43) OR (j > 51 AND j < 55) OR (j > 66 AND j < 70) THEN
          set 11, j, colortable(9)
          set 42, j, colortable(9)
        ELSE
          set 6, j, colortable(9)
          set 47, j, colortable(9)
        END IF
      NEXT j
      FOR j = 6 TO 47
        IF (j > 13 AND j < 16) OR (j > 25 AND j < 29) OR (j > 37 AND j < 40) THEN
          set j, 8, colortable(9)
          set j, 73, colortable(9)
        ELSE
          set j, 4, colortable(9)
          set j, 77, colortable(9)
        END IF
      NEXT j
      r = 0
      FOR q = 1 TO 8
        IF r = 66 THEN r = 70
        IF r = 55 THEN r = 66
        IF r = 51 THEN r = 55
        IF r = 29 THEN r = 51
        IF r = 25 THEN r = 29
        IF r = 14 THEN r = 25
        IF r = 10 THEN r = 14
        IF r = 0 THEN r = 10
      FOR j = 7 TO 11
        set j, r, colortable(9)
        set 53 - j, r, colortable(9)
      NEXT j
      NEXT q
      FOR j = 4 TO 8
        set 13, j, colortable(9)
        set 13, 81 - j, colortable(9)
        set 16, j, colortable(9)
        set 16, 81 - j, colortable(9)
        set 37, j, colortable(9)
        set 37, 81 - j, colortable(9)
        set 40, j, colortable(9)
        set 40, 81 - j, colortable(9)
      NEXT j
      FOR j = 13 TO 68
       IF (j > 16 AND j < 24) OR (j > 38 AND j < 43) OR (j > 57 AND j < 64) THEN
          set 11, j, colortable(9)
          set 42, j, colortable(9)
       ELSE
         set 15, j, colortable(9)
         set 38, j, colortable(9)
       END IF
      NEXT j
      FOR j = 15 TO 38
        IF (j > 18 AND j < 23) OR (j > 31 AND j < 35) THEN
          set j, 8, colortable(9)
          set j, 73, colortable(9)
        ELSE
          set j, 13, colortable(9)
          set j, 68, colortable(9)
        END IF
      NEXT j
      r = 0
      FOR q = 1 TO 4
        IF r = 57 THEN r = 64
        IF r = 23 THEN r = 57
        IF r = 16 THEN r = 23
        IF r = 0 THEN r = 16
      FOR j = 11 TO 15
        set j, r, colortable(9)
        set 53 - j, r, colortable(9)
      NEXT j
      NEXT q
      FOR j = 8 TO 12
        set 18, j, colortable(9)
        set 18, 81 - j, colortable(9)
        set 23, j, colortable(9)
        set 23, 81 - j, colortable(9)
        set 31, j, colortable(9)
        set 31, 81 - j, colortable(9)
        set 35, j, colortable(9)
        set 35, 81 - j, colortable(9)
      NEXT j
      FOR j = 16 TO 65
        IF (j > 38 AND j < 43) THEN
        ELSE
          set 18, j, colortable(9)
          set 35, j, colortable(9)
        END IF
      NEXT j
      FOR j = 18 TO 35
        set j, 16, colortable(9)
        set j, 65, colortable(9)
      NEXT j
      FOR j = 38 TO 43
        set 27, j, colortable(9)
      NEXT j
      FOR j = 25 TO 29
        set j, 40, colortable(9)
        set j, 41, colortable(9)
      NEXT j
      FOR r = 18 TO 38 STEP 2
        FOR j = 20 TO 33
          IF (j > 26 AND j < 28) THEN
          ELSE
            set j, r, colortable(9)
            REM set j,45,colortable(9)
          END IF
        NEXT j
      NEXT r
      FOR r = 43 TO 65 STEP 2
        FOR j = 20 TO 33
          IF (j > 26 AND j < 28) THEN
          ELSE
            set j, r, colortable(9)
            REM set j , 45, colortable(9)
          END IF
        NEXT j
      NEXT r

    CASE 16
      FOR j = 4 TO 77
        IF (j > 10 AND j < 14) OR (j > 25 AND j < 29) OR (j > 38 AND j < 43) OR (j > 51 AND j < 55) OR (j > 66 AND j < 70) THEN
          set 11, j, colortable(9)
          set 42, j, colortable(9)
        ELSE
          set 6, j, colortable(9)
          set 47, j, colortable(9)
        END IF
      NEXT j
      FOR j = 6 TO 47
        IF (j > 13 AND j < 16) OR (j > 25 AND j < 29) OR (j > 37 AND j < 40) THEN
          set j, 8, colortable(9)
          set j, 73, colortable(9)
        ELSE
          set j, 4, colortable(9)
          set j, 77, colortable(9)
        END IF
      NEXT j
      r = 0
      FOR q = 1 TO 8
        IF r = 66 THEN r = 70
        IF r = 55 THEN r = 66
        IF r = 51 THEN r = 55
        IF r = 29 THEN r = 51
        IF r = 25 THEN r = 29
        IF r = 14 THEN r = 25
        IF r = 10 THEN r = 14
        IF r = 0 THEN r = 10
      FOR j = 7 TO 11
        set j, r, colortable(9)
        set 53 - j, r, colortable(9)
      NEXT j
      NEXT q
      FOR j = 4 TO 8
        set 13, j, colortable(9)
        set 13, 81 - j, colortable(9)
        set 16, j, colortable(9)
        set 16, 81 - j, colortable(9)
        set 37, j, colortable(9)
        set 37, 81 - j, colortable(9)
        set 40, j, colortable(9)
        set 40, 81 - j, colortable(9)
      NEXT j
      FOR j = 13 TO 68
       IF (j > 16 AND j < 24) OR (j > 38 AND j < 43) OR (j > 57 AND j < 64) THEN
          set 11, j, colortable(9)
          set 42, j, colortable(9)
       ELSE
         set 15, j, colortable(9)
         set 38, j, colortable(9)
       END IF
      NEXT j
      FOR j = 15 TO 38
        IF (j > 18 AND j < 23) OR (j > 31 AND j < 35) THEN
          set j, 8, colortable(9)
          set j, 73, colortable(9)
        ELSE
          set j, 13, colortable(9)
          set j, 68, colortable(9)
        END IF
      NEXT j
      r = 0
      FOR q = 1 TO 4
        IF r = 57 THEN r = 64
        IF r = 23 THEN r = 57
        IF r = 16 THEN r = 23
        IF r = 0 THEN r = 16
      FOR j = 11 TO 15
        set j, r, colortable(9)
        set 53 - j, r, colortable(9)
      NEXT j
      NEXT q
      FOR j = 8 TO 12
        set 18, j, colortable(9)
        set 18, 81 - j, colortable(9)
        set 23, j, colortable(9)
        set 23, 81 - j, colortable(9)
        set 31, j, colortable(9)
        set 31, 81 - j, colortable(9)
        set 35, j, colortable(9)
        set 35, 81 - j, colortable(9)
      NEXT j
      FOR j = 16 TO 65
        IF (j > 38 AND j < 43) THEN
        ELSE
          set 18, j, colortable(9)
          set 35, j, colortable(9)
        END IF
      NEXT j
      FOR j = 18 TO 35
        set j, 16, colortable(9)
        set j, 65, colortable(9)
      NEXT j
      FOR j = 18 TO 63
        set 27, j, colortable(9)
      NEXT j
      FOR j = 23 TO 31
        set j, 40, colortable(9)
        set j, 41, colortable(9)
      NEXT j
      
      FOR j = 20 TO 33
        IF (j > 25 AND j < 29) THEN
        ELSE
          set j, 38, colortable(9)
          set j, 43, colortable(9)
        END IF
      NEXT j
      FOR j = 18 TO 63
        IF (j > 38 AND j < 43) THEN
        ELSE
          set 20, j, colortable(9)
          set 25, j, colortable(9)
          set 29, j, colortable(9)
          set 33, j, colortable(9)
        END IF
      NEXT j
      FOR j = 1 TO 50
8
         q = INT(RND * 13) + 20
         IF (q > 25 AND q < 29) THEN GOTO 8
9
         r = INT(RND * 45) + 18
         IF (r > 38 AND r < 43) THEN GOTO 9
         set q, r, colortable(9)
      NEXT j
   
   
   
    CASE ELSE
      FOR i = 1 TO (curlevel - 15) * 100
            set (INT(RND * 46) + 4), (INT(RND * 79) + 1), colortable(9)
      NEXT i
   
    END SELECT

    FOR a = 1 TO 8
      LOCATE 1, a * 8
      COLOR colortable(a), 0
      PRINT sammy(a).score
    NEXT a

END SUB

SUB PlayNibbles (numplayers, speed, diff$, comp)

    x = -1
    DIM sammyBody(MAXSNAKELENGTH - 1, 1 TO 8) AS snakeBody
   
    DIM sammy(1 TO 8) AS snaketype
    FOR a = 1 TO numplayers
      sammy(a).lives = 9
      sammy(a).score = 0
      sammy(a).scolor = colortable(a)
      sammy(a).wall = 0
      sammy(a).row = INT(RND * 40) + 4
      sammy(a).col = INT(RND * 77) + 2
      sammy(a).direction = INT(RND * 4) + 1
    NEXT a
    
    Level STARTOVER, comp, numplayers, sammy()
    FOR a = 1 TO numplayers
      startRow = sammy(a).row: startCol = sammy(a).col
    NEXT a

    curSpeed = speed


    SpacePause "     Level" + STR$(curlevel) + ",  Push Space"
    gameOver = FALSE
    DO

        number = 1
        nonum = TRUE
        playerDied = FALSE
        'PLAY "T160O1>L20CDEDCDL10ECC"

        DO
           
            IF nonum = TRUE THEN
                DO
                    numberrow = INT(RND(1) * 47 + 3)
                    numbercol = INT(RND(1) * 78 + 2)
                    sisterRow = numberrow + arena(numberrow, numbercol).sister
                    row1 = numberrow
                    col1 = numbercol
                LOOP UNTIL NOT PointIsThere(numberrow, numbercol, 0) AND NOT PointIsThere(sisterRow, numbercol, 0)
                numberrow = arena(numberrow, numbercol).realRow
                nonum = FALSE
                COLOR colortable(4), 0
                COLOR INT(RND * 7) + 9
                LOCATE numberrow, numbercol
                DO
                  xx = INT(RND * 255)
                LOOP UNTIL CHR$(xx) <> " " AND CHR$(xx) <> ""
                PRINT RIGHT$(CHR$(xx), 1);
                count = 0
            END IF

            FOR a# = 1 TO curSpeed:  NEXT a#

            kbd$ = INKEY$
            SELECT CASE kbd$
                CASE "i", "I": IF sammy(4).direction <> 2 THEN sammy(4).direction = 1
                CASE "k", "K": IF sammy(4).direction <> 1 THEN sammy(4).direction = 2
                CASE "j", "J": IF sammy(4).direction <> 4 THEN sammy(4).direction = 3
                CASE "l", "L": IF sammy(4).direction <> 3 THEN sammy(4).direction = 4
                CASE "t", "T": IF sammy(3).direction <> 2 THEN sammy(3).direction = 1
                CASE "g", "G": IF sammy(3).direction <> 1 THEN sammy(3).direction = 2
                CASE "f", "F": IF sammy(3).direction <> 4 THEN sammy(3).direction = 3
                CASE "h", "H": IF sammy(3).direction <> 3 THEN sammy(3).direction = 4
                CASE "w", "W": IF sammy(2).direction <> 2 THEN sammy(2).direction = 1
                CASE "s", "S": IF sammy(2).direction <> 1 THEN sammy(2).direction = 2
                CASE "a", "A": IF sammy(2).direction <> 4 THEN sammy(2).direction = 3
                CASE "d", "D": IF sammy(2).direction <> 3 THEN sammy(2).direction = 4
                CASE "8": IF sammy(1).direction <> 2 THEN sammy(1).direction = 1
                CASE "5": IF sammy(1).direction <> 1 THEN sammy(1).direction = 2
                CASE "4": IF sammy(1).direction <> 4 THEN sammy(1).direction = 3
                CASE "6": IF sammy(1).direction <> 3 THEN sammy(1).direction = 4
                CASE "p", "P": SpacePause " Game Paused ... Push Space  "
                CASE " ": nonum = TRUE
                CASE "7", "q", "Q", "r", "R", "u", "U"
                        SELECT CASE kbd$
                          CASE "7": a = 1
                          CASE "q", "Q": a = 2
                          CASE "r", "R": a = 3
                          CASE "u", "U": a = 4
                        END SELECT
                        IF sammy(a).score > 1 THEN
                          sammy(a).score = sammy(a).score - 1
                          sammy(a).row = INT(RND * 40) + 4
                          sammy(a).col = INT(RND * 77) + 2
                          sammy(a).direction = INT(RND * 4) + 1
                        END IF
                CASE "9", "e", "E", "y", "Y", "o", "O"
                        SELECT CASE kbd$
                          CASE "9": a = 1
                          CASE "e", "E": a = 2
                          CASE "y", "Y": a = 3
                          CASE "o", "O": a = 4
                        END SELECT
                        IF sammy(a).score > 2 THEN
                          SELECT CASE sammy(a).direction
                            CASE 1: arena(sammy(a).row - 1, sammy(a).col).acolor = 0
                            CASE 2: arena(sammy(a).row + 1, sammy(a).col).acolor = 0
                            CASE 3: arena(sammy(a).row, sammy(a).col - 1).acolor = 0
                            CASE 4: arena(sammy(a).row, sammy(a).col + 1).acolor = 0
                          END SELECT
                          sammy(a).score = sammy(a).score - 2
                        END IF
               
                CASE "1", "z", "Z", "v", "V", "m", "M"
                        SELECT CASE kbd$
                          CASE "1": a = 1
                          CASE "z", "Z": a = 2
                          CASE "v", "V": a = 3
                          CASE "m", "M": a = 4
                        END SELECT
                        r = 0
                        IF sammy(a).score > 3 THEN
                          FOR q = 1 TO 8
                            SELECT CASE sammy(a).direction
                              CASE 1: IF arena(sammy(a).row - 1, sammy(a).col).acolor = colortable(q) THEN r = q
                              CASE 2: IF arena(sammy(a).row + 1, sammy(a).col).acolor = colortable(q) THEN r = q
                              CASE 3: IF arena(sammy(a).row, sammy(a).col - 1).acolor = colortable(q) THEN r = q
                              CASE 4: IF arena(sammy(a).row, sammy(a).col + 1).acolor = colortable(q) THEN r = q
                            END SELECT
                          NEXT q
                          IF r > 0 AND r < 9 THEN
                            EraseSnake sammy(), sammyBody(), r
                          END IF
                          r = 0
                          sammy(a).score = sammy(a).score - 3
                        END IF
               
                CASE "2", "x", "X", "b", "B", ","
                       
                        SELECT CASE kbd$
                          CASE "2": a = 1
                          CASE "x", "X": a = 2
                          CASE "b", "B": a = 3
                          CASE ",": a = 4
                        END SELECT
                       
                        IF sammy(a).score > 4 THEN
                          FOR q = 1 TO numplayers
                            IF q <> a THEN sammy(q).row = INT(RND * 40) + 4
                            IF q <> a THEN sammy(q).col = INT(RND * 77) + 2
                            IF q <> a THEN sammy(q).direction = INT(RND * 4) + 1
                          NEXT q
                          sammy(a).score = sammy(a).score - 1
                        END IF

                CASE "3", "c", "C", "n", "N", "."
                        SELECT CASE kbd$
                          CASE "3": a = 1
                          CASE "c", "C": a = 2
                          CASE "n", "N": a = 3
                          CASE ".": a = 4
                        END SELECT
                       
                        IF sammy(a).score > 5 THEN
                          sammy(a).row = row1 + INT(RND * 2) + 1
                          sammy(a).col = col1 + INT(RND * 2) + 1
                          sammy(a).direction = INT(RND * 4) + 1
                          sammy(a).score = sammy(a).score - 5
                        END IF
               
                CASE ELSE
            END SELECT
                   
                 
                  FOR q = 1 TO numplayers
                    IF sammy(q).row < 4 THEN sammy(q).row = 4
                    IF sammy(q).row > 49 THEN sammy(q).row = 49
                    IF sammy(q).col < 2 THEN sammy(q).col = 2
                    IF sammy(q).col > 79 THEN sammy(q).col = 79
                    LOCATE 1, q * 8
                    COLOR colortable(q), 0
                    PRINT sammy(q).score
                  NEXT q
                  COLOR colortable(q), 0
                  LOCATE 1, q * 8
                  PRINT curlevel
           
            x = x + 1
            IF x > 10000 THEN x = 0

           
            FOR a = 1 TO numplayers
            
            IF a > (numplayers - comp) THEN
              IF (x / 2) - INT(x / 2) = 0 THEN
                IF sammy(a).wall = 0 THEN
                  IF col1 > sammy(a).col THEN sammy(a).direction = 4
                  IF col1 < sammy(a).col THEN sammy(a).direction = 3
                END IF
                  sammy(a).col2 = sammy(a).col
                  sammy(a).row2 = sammy(a).row
              END IF
              IF (x / 2) - INT(x / 2) <> 0 THEN
                IF sammy(a).wall = 0 THEN
                  IF row1 > sammy(a).row THEN sammy(a).direction = 2
                  IF row1 < sammy(a).row THEN sammy(a).direction = 1
                END IF
                  sammy(a).col3 = sammy(a).col
                  sammy(a).row3 = sammy(a).row
              END IF
            END IF
               
                SELECT CASE sammy(a).direction
                    CASE 1: IF NOT PointIsThere(sammy(a).row - 1, sammy(a).col, 0) THEN sammy(a).row = sammy(a).row - 1
                    CASE 2: IF NOT PointIsThere(sammy(a).row + 1, sammy(a).col, 0) THEN sammy(a).row = sammy(a).row + 1
                    CASE 3: IF NOT PointIsThere(sammy(a).row, sammy(a).col - 1, 0) THEN sammy(a).col = sammy(a).col - 1
                    CASE 4: IF NOT PointIsThere(sammy(a).row, sammy(a).col + 1, 0) THEN sammy(a).col = sammy(a).col + 1
                END SELECT
             
            IF sammy(a).wall = .25 THEN sammy(a).wall = 0
            IF sammy(a).wall = .5 THEN sammy(a).wall = .25

            IF a > (numplayers - comp) THEN
              IF PointIsThere(sammy(a).row, sammy(a).col, 0) THEN
                   IF sammy(a).direction = 1 OR sammy(a).direction = 2 THEN
                     sammy(a).direction = INT(RND * 2) + 3
                     sammy(a).wall = 1
                     GOTO 4
                   END IF
                   IF sammy(a).direction = 3 OR sammy(a).direction = 4 THEN
                     sammy(a).direction = INT(RND * 2) + 1
                     sammy(a).wall = 1
                     GOTO 4
                   END IF
4                END IF
             
                 IF sammy(a).direction = 1 OR sammy(a).direction = 2 THEN
                   IF PointIsThere(sammy(a).row, sammy(a).col - 1, 0) OR PointIsThere(sammy(a).row, sammy(a).col + 1, 0) THEN
                   ELSE
                     sammy(a).wall = .5
                   END IF
                 END IF
             
                 IF sammy(a).direction = 3 OR sammy(a).direction = 4 THEN
                   IF PointIsThere(sammy(a).row - 1, sammy(a).col, 0) OR PointIsThere(sammy(a).row + 1, sammy(a).col + 1, 0) THEN
                   ELSE
                     sammy(a).wall = .5
                   END IF
                 END IF
             
                 IF sammy(a).row < 5 OR sammy(a).row > 48 OR sammy(a).col < 3 OR sammy(a).col > 78 THEN
                   sammy(a).wall = .5
                 END IF
              END IF

                IF numberrow = INT((sammy(a).row + 1) / 2) AND numbercol = sammy(a).col THEN
                    'PLAY "MBO0L16>CCCE"
                    IF sammy(a).length < (MAXSNAKELENGTH - 500) THEN
                        sammy(a).length = sammy(a).length + number * (numplayers * 5)
                        sammy(a).scolor = colortable(a)
                        FOR b = 1 TO numplayers
                          sammy(b).wall = 0
                        NEXT b
                    END IF
                    sammy(a).score = sammy(a).score + number
                    LOCATE 1, a * 8
                    COLOR colortable(a), 0
                    PRINT sammy(a).score
                    number = number + 1
                    IF number = 15 THEN
                        FOR b = 1 TO numplayers
                          EraseSnake sammy(), sammyBody(), b
                        NEXT b
                        LOCATE numberrow, numbercol: PRINT " "
                        Level NEXTLEVEL, comp, numplayers, sammy()
                        SpacePause "     Level" + STR$(curlevel) + ",  Push Space"
                        IF numplayers = 1 THEN sammy(2).row = 0
                        number = 1
                        IF diff$ = "P" THEN speed = speed - 10: curSpeed = speed
                    END IF
                    nonum = TRUE
                    IF curSpeed < 1 THEN curSpeed = 1
                END IF
            NEXT a

            FOR a = 1 TO numplayers
                 
                  IF PointIsThere2(sammy(a).row, sammy(a).col, 0, sammy(a).direction) THEN
                    IF a > (numplayers - comp) THEN
                      choose = INT(RND * 5) + 1
                      SELECT CASE choose
                        CASE 1, 2, 3:
                              IF sammy(a).score > -1 THEN
                                sammy(a).row = INT(RND * 40) + 4
                                sammy(a).col = INT(RND * 77) + 2
                                sammy(a).direction = INT(RND * 4) + 1
                                sammy(a).score = sammy(a).score + 1
                              END IF
                        CASE 4:
                              IF sammy(a).score > 2 THEN
                                SELECT CASE sammy(a).direction
                                  CASE 1: arena(sammy(a).row - 1, sammy(a).col).acolor = 0
                                  CASE 2: arena(sammy(a).row + 1, sammy(a).col).acolor = 0
                                  CASE 3: arena(sammy(a).row, sammy(a).col - 1).acolor = 0
                                  CASE 4: arena(sammy(a).row, sammy(a).col + 1).acolor = 0
                                END SELECT
                                sammy(a).score = sammy(a).score - 2
                              END IF
                        CASE 5:
                              r = 0
                              IF sammy(a).score > 3 THEN
                              FOR q = 1 TO 8
                                SELECT CASE sammy(a).direction
                                  CASE 1: IF arena(sammy(a).row - 1, sammy(a).col).acolor = colortable(q) THEN r = q
                                  CASE 2: IF arena(sammy(a).row + 1, sammy(a).col).acolor = colortable(q) THEN r = q
                                  CASE 3: IF arena(sammy(a).row, sammy(a).col - 1).acolor = colortable(q) THEN r = q
                                  CASE 4: IF arena(sammy(a).row, sammy(a).col + 1).acolor = colortable(q) THEN r = q
                                END SELECT
                              NEXT q
                              IF r > 0 AND r < 9 THEN
                                EraseSnake sammy(), sammyBody(), r
                              END IF
                              r = 0
                              sammy(a).score = sammy(a).score - 3
                            END IF
                    
                      END SELECT
                    END IF
                  END IF
                   
                  IF sammy(a).row < 4 THEN sammy(a).row = 4
                  IF sammy(a).row > 49 THEN sammy(a).row = 49
                  IF sammy(a).col < 2 THEN sammy(a).col = 2
                  IF sammy(a).col > 79 THEN sammy(a).col = 79
               
                IF PointIsThere(sammy(a).row, sammy(a).col, 0) THEN

                  IF sammy(a).direction = 1 THEN
                    IF NOT PointIsThere(sammy(a).row + 1, sammy(a).col, 0) THEN
                      sammy(a).direction = 2
                      GOTO 1
                    END IF
                  END IF
                 
                  IF sammy(a).direction = 2 THEN
                    IF NOT PointIsThere(sammy(a).row - 1, sammy(a).col, 0) THEN
                      sammy(a).direction = 1
                      GOTO 1
                    END IF
                  END IF
                 
                  IF sammy(a).direction = 3 THEN
                    IF NOT PointIsThere(sammy(a).row, sammy(a).col + 1, 0) THEN
                      sammy(a).direction = 4
                      GOTO 1
                    END IF
                  END IF
                 
                  IF sammy(a).direction = 4 THEN
                    IF NOT PointIsThere(sammy(a).row, sammy(a).col - 1, 0) THEN
                      sammy(a).direction = 3
                      GOTO 1
                    END IF
                  END IF
             
1
                END IF
                sammy(a).head = (sammy(a).head + 1) MOD MAXSNAKELENGTH
                sammyBody(sammy(a).head, a).row = sammy(a).row
                sammyBody(sammy(a).head, a).col = sammy(a).col
                tail = (sammy(a).head + MAXSNAKELENGTH - sammy(a).length) MOD MAXSNAKELENGTH
                set sammyBody(tail, a).row, sammyBody(tail, a).col, 0
                sammyBody(tail, a).row = 0
                set sammy(a).row, sammy(a).col, sammy(a).scolor
            NEXT a

        LOOP UNTIL playerDied

        curSpeed = speed
       
        FOR a = 1 TO numplayers
            EraseSnake sammy(), sammyBody(), a

            IF sammy(a).alive = FALSE THEN
                sammy(a).score = sammy(a).score - 10
                
                SpacePause " -- Someone Died! Push Space --"
                
            END IF
        NEXT a

        Level SAMELEVEL, comp, numplayers, sammy()
       
    LOOP UNTIL sammy(1).lives = 0 OR sammy(2).lives = 0

END SUB

FUNCTION PointIsThere (row, col, acolor)
    IF row <> 0 THEN
       IF arena(row, col).acolor <> acolor THEN
            PointIsThere = TRUE
        ELSE
            PointIsThere = FALSE
        END IF
    END IF
END FUNCTION

FUNCTION PointIsThere2 (row, col, c, d)
       PointIsThere2 = FALSE
       SELECT CASE d
       CASE 1: IF arena(row - 1, col).acolor <> c AND arena(row, col - 1).acolor <> c AND arena(row, col + 1).acolor <> c THEN PointIsThere2 = TRUE
       CASE 2: IF arena(row + 1, col).acolor <> c AND arena(row, col - 1).acolor <> c AND arena(row, col + 1).acolor <> c THEN PointIsThere2 = TRUE
       CASE 3: IF arena(row + 1, col).acolor <> c AND arena(row - 1, col).acolor <> c AND arena(row, col - 1).acolor <> c THEN PointIsThere2 = TRUE
       CASE 4: IF arena(row + 1, col).acolor <> c AND arena(row - 1, col).acolor <> c AND arena(row, col + 1).acolor <> c THEN PointIsThere2 = TRUE
       END SELECT
END FUNCTION

SUB set (row, col, acolor)
   IF row <> 0 THEN
       
        arena(row, col).acolor = acolor
        realRow = arena(row, col).realRow
        topFlag = arena(row, col).sister + 1 / 2
                                                    
        sisterRow = row + arena(row, col).sister
        sisterColor = arena(sisterRow, col).acolor

        LOCATE realRow, col

        IF acolor = sisterColor THEN
            COLOR acolor, acolor
            PRINT CHR$(219);  '219
        ELSE
            IF topFlag THEN
                IF acolor > 7 THEN
                    COLOR acolor, sisterColor
                    PRINT CHR$(223); '223
                ELSE
                    COLOR sisterColor, acolor
                    PRINT CHR$(220); '220
                END IF
            ELSE
                IF acolor > 7 THEN
                    COLOR acolor, sisterColor
                    PRINT CHR$(220); '220
                ELSE
                    COLOR sisterColor, acolor
                    PRINT CHR$(223); '223
                END IF
            END IF
        END IF
    END IF
END SUB

SUB SpacePause (ttext$)

    COLOR 15, 4
    Center 11, "€ﬂﬂﬂﬂﬂﬂﬂﬂﬂﬂﬂﬂﬂﬂﬂﬂﬂﬂﬂﬂﬂﬂﬂﬂﬂﬂﬂﬂﬂﬂﬂ€"
    Center 12, "€ " + LEFT$(ttext$ + SPACE$(29), 29) + " €"
    Center 13, "€‹‹‹‹‹‹‹‹‹‹‹‹‹‹‹‹‹‹‹‹‹‹‹‹‹‹‹‹‹‹‹€"
    WHILE INKEY$ <> "": WEND
    REM WHILE INKEY$ <> " ": WEND
    COLOR 15, 0

    FOR i = 21 TO 26
        FOR j = 24 TO 56
            set i, j, arena(i, j).acolor
        NEXT j
    NEXT i

END SUB

SUB SparklePause

    COLOR 4, 0
    a$ = "*    *    *    *    *    *    *    *    *    *    *    *    *    *    *    *    *    "
    WHILE INKEY$ <> "": WEND

    WHILE INKEY$ = ""
        FOR a = 1 TO 5
            LOCATE 1, 1
            PRINT MID$(a$, a, 80);
            LOCATE 22, 1
            PRINT MID$(a$, 6 - a, 80);

            FOR b = 2 TO 21
            c = (a + b) MOD 5
                IF c = 1 THEN
                    LOCATE b, 80
                    PRINT "*";
                    LOCATE 23 - b, 1
                    PRINT "*";
                ELSE
                    LOCATE b, 80
                    PRINT " ";
                    LOCATE 23 - b, 1
                    PRINT " ";
                END IF
            NEXT b
        NEXT a
    WEND

END SUB

FUNCTION StillWantsToPlay

    COLOR 15, 4
    Center 10, "€ﬂﬂﬂﬂﬂﬂﬂﬂﬂﬂﬂﬂﬂﬂﬂﬂﬂﬂﬂﬂﬂﬂﬂﬂﬂﬂﬂﬂﬂﬂﬂ€"
    Center 11, "€       G A M E   O V E R       €"
    Center 12, "€                               €"
    Center 13, "€      Play Again?   (Y/N)      €"
    Center 14, "€‹‹‹‹‹‹‹‹‹‹‹‹‹‹‹‹‹‹‹‹‹‹‹‹‹‹‹‹‹‹‹€"

    WHILE INKEY$ <> "": WEND
    DO
        kbd$ = UCASE$(INKEY$)
    LOOP UNTIL kbd$ = "Y" OR kbd$ = "N"

    COLOR 15, 0
    Center 10, "                                 "
    Center 11, "                                 "
    Center 12, "                                 "
    Center 13, "                                 "
    Center 14, "                                 "

    IF kbd$ = "Y" THEN
        StillWantsToPlay = TRUE
    ELSE
        StillWantsToPlay = FALSE
        COLOR 7, 0
        CLS
    END IF

END FUNCTION

