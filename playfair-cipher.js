const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function flatten(array) {
    if(array.length === 0)
        return array;
    else if(Array.isArray(array[0]))
        return flatten(array[0]).concat(flatten(array.slice(1)));
    else
        return [array[0]].concat(flatten(array.slice(1)));
}


function createKey(stringBuffer) {
    let line = [...stringBuffer].join('');
    while (line.includes('J')) {
        line = line.replace('J', 'I');
    }

    let cipher = [], usedChars = [], ignoredChars = [];
    let modifiedStringBuffer = [];
    line.split('').forEach(char => {
        const isRepeated = !!usedChars.find(usedChar => char === usedChar);
        if (isRepeated) {
            ignoredChars.push(char);
        } else {
            modifiedStringBuffer.push(char);
            usedChars.push(char);
        }
    });

    let nextCipherChar, summedIterator, generatedCharCode, generatedCharCodeSkipCounter = 0;
    for (let i = 0; i < 5; i++) {
        cipher[i] = [];
        for (let j = 0; j < 5; j++) {
            // Pull from key input where possible
            summedIterator = j + (5 * i);
            if (summedIterator < modifiedStringBuffer.length) {
                nextCipherChar = modifiedStringBuffer[summedIterator];
            } else { // Fill with unused alphabet letters
                generatedCharCode = 0x41 + summedIterator - modifiedStringBuffer.length;
                // Skip letters where already used.
                while (usedChars.includes(String.fromCharCode(generatedCharCode + generatedCharCodeSkipCounter))
                || generatedCharCode + generatedCharCodeSkipCounter === 0x4A // The Char 'J'
                    ) {
                    generatedCharCodeSkipCounter++; // Then skip forward 1
                }
                nextCipherChar = String.fromCharCode(generatedCharCode + generatedCharCodeSkipCounter);
            }
            cipher[i][j] = nextCipherChar;
        }
    }
    return cipher;
}

function createDigraphArray(stringBuffer) {
    let line = [...stringBuffer].join('');
    // Create digraph from input
    let digraph = []
    let nextTermCharArray;
    do {
        let nextTerm = line.substr(0, 2);
        // If both letters in digraph are the same set the second one to an 'X'.
        nextTermCharArray = nextTerm.split('');
        if (nextTermCharArray[0] === nextTermCharArray[1]) {
            nextTerm = nextTermCharArray[0] + 'X';
            line = nextTermCharArray[1] + line; // Filler to ensure only one relevant char is dropped.
        }
        // If a char is alone set second char to 'X'.
        if (nextTermCharArray.length === 1) {
            nextTerm = nextTerm + 'X';
        }
        digraph.push(nextTerm);
        line = line.substr(2); // Drop this term
    } while (line.length); // Do until no terms are left to be pulled.
    return digraph;
}

function encode(key, digraphArray) {
    let cipherBlocks = digraphArray.map(digraph => {
        if (digraph === 'XX') {
            return 'YY';
        }
        // Find the locations of the each of the two letters in the digraph
        let keyDigraphMap = []; // These will be the indexes of the digraphs in the flattened version of the key.
        digraph.split('').forEach(char => {
            keyDigraphMap.push(flatten(key).findIndex(keyChar => char === keyChar));
        })

        let row1 = Math.floor(keyDigraphMap[0] / 5);
        let column1 = keyDigraphMap[0] % 5;
        let row2 = Math.floor(keyDigraphMap[1] / 5);
        let column2 = keyDigraphMap[1] % 5;

        if (row1 !== row2 && column1 !== column2) {
            return key[row1][column2] + key[row2][column1];
        }
        if (column1 === column2) {
            return key[(row1 + 1) % 5][column1] + key[(row2 + 1) % 5][column2];
        }
        if (row1 === row2) {
            return key[row1][(column1 + 1) % 5] + key[row2][(column2 + 1) % 5];
        }
        return 'unmapped';
    });
    const cipher = cipherBlocks.join('');
    return cipher;
}

function encrypt(keyInput, messageInput) {
    keyInput = keyInput.toUpperCase();
    while (keyInput.includes('J')) {
        keyInput = keyInput.replace('J', 'I');
    }
    while (keyInput.includes(' ')) {
        keyInput = keyInput.replace(' ', '');
    }
    const key = createKey(keyInput);

    messageInput = messageInput.toUpperCase();
    while (messageInput.includes('J')) {
        messageInput = messageInput.replace('J', 'I');
    }
    while (messageInput.includes(' ')) {
        messageInput = messageInput.replace(' ', '');
    }
    const digraphArray = createDigraphArray(messageInput);

    return encode(key, digraphArray);
}

let lineCount = null, key = null, messages = [];
rl.on('line', (line) => {
    if (line === "exit") {
        rl.close();
    }
    // A poorly designed state machine
    if (lineCount === null) {
        lineCount = parseInt(line);
    } else if (lineCount && key === null) {
        key = line;
    } else if (lineCount > 0) {
        messages.push(line)
        lineCount--;
        if (lineCount != 0) {
        } else {
            cipherTexts = messages.map(message => encrypt(key, message));
            cipherTexts.forEach(cipherText => {
                console.log(cipherText)
            });
            // Reset state.
            lineCount = null;
            key = null;
            messages = [];
            console.log('');
        }
    }
});