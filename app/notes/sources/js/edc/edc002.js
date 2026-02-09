// Constants
const CH_LEN = 5;

// Utility functions
const reverse = (str) => str.split('').reverse().join('');

// Basic encodings
const ctc = (ch) => {
    let rcode = ch.charCodeAt(0);
    let res = "";
    const code = "ABCDEFGHIJKLMNOP";
    let k = 65536;
    for (let i = 0; i < 5; i++) {
        res += code[Math.floor(rcode / k)];
        rcode %= k;
        k = Math.floor(k / 16);
    }
    return res;
};

const cfc = (ch) => {
    let ires = 0;
    const code = "ABCDEFGHIJKLMNOP";
    for (let i = 0; i < ch.length; i++) {
        ires *= 16;
        ires += code.indexOf(ch[i]);
    }
    return String.fromCharCode(ires);
};

const stc = (string) => {
    let res = "";
    for (let i = 0; i < string.length; i++) {
        res += ctc(string[i]);
    }
    return res;
};

const sfc = (string) => {
    let res = "";
    for (let i = 0; i < string.length; i += CH_LEN) {
        const chunk = string.substring(i, i + CH_LEN);
        res += cfc(chunk);
    }
    return res;
};

const itc = (num) => {
    const code = "ABCDEFGHIJ";
    let res = "";
    while (num > 0) {
        res = code[num % 10] + res;
        num = Math.floor(num / 10);
    }
    return res;
};

const ifc = (string) => {
    let res = 0;
    for (let i = 0; i < string.length; i++) {
        res *= 10;
        res += string.charCodeAt(i) - 65;
    }
    return res;
};

// Functionality
const swape = (string, slen) => {
    let padded = string;
    while (padded.length % slen !== 0) {
        padded += 'Q';
    }
    let res = "";
    for (let i = 0; i < padded.length; i += slen) {
        res += reverse(padded.substring(i, i + slen));
    }
    return res;
};

const swapd = (string, slen) => {
    let res = "";
    for (let i = 0; i < string.length; i += slen) {
        const chunk = string.substring(i, i + slen);
        let tmp = reverse(chunk);
        while (tmp && tmp[tmp.length - 1] === 'Q') {
            tmp = tmp.substring(0, tmp.length - 1);
        }
        res += tmp;
    }
    return res;
};

const shifte = (string, sh) => {
    let res = "";
    for (let i = 0; i < string.length; i++) {
        if (string[i] === 'Q') continue;
        const shiftedCode = ((string.charCodeAt(i) - 65 + sh) % 16) + 65;
        res += String.fromCharCode(shiftedCode);
    }
    return res;
};

const shiftd = (string, sh) => shifte(string, 16 - sh);

// Control functions
const decode = (key, ecd) => {
    if (key.substring(0, 5) === "EDCAB") {
        const cmdStr = key.substring(5);
        let dcd = ecd;
        let i = 0;
        
        while (i < cmdStr.length) {
            const cmd = cmdStr[i];
            
            if (cmd === 'R') {
                dcd = reverse(dcd);
                i += 1;
            } else if (cmd === 'S') {
                i += 1;
                const numStart = i;
                while (i < cmdStr.length && cmdStr[i] !== 'S') {
                    i += 1;
                }
                const numEnc = cmdStr.substring(numStart, i);
                const slen = ifc(numEnc);
                dcd = swapd(dcd, slen);
                i += 1; // Skip ending 'S'
            } else if (cmd === 'T') {
                // Shift command: T{shift}T
                i += 1;
                const numStart = i;
                while (i < cmdStr.length && cmdStr[i] !== 'T') {
                    i += 1;
                }
                const numEnc = cmdStr.substring(numStart, i);
                const sh = ifc(numEnc);
                dcd = shiftd(dcd, sh);
                i += 1; // Skip ending 'T'
            } else {
                // Unknown command, skip
                i += 1;
            }
        }
        // Convert custom hex back to string
        return sfc(dcd);
    } else if (key.substring(0, 5) === "EDCAA") {
        console.log(`In decode(${key}, ${ecd})\ninfo: this is encoded with the 001st version.\nPlease download or use the 001st version.`);
        return null;
    } else {
        console.log(`In decode(${key}, ${ecd})\nfatal: unknown or newer version`);
        return null;
    }
};

const encode = (dcd, deep = 10, check = true) => {
    let _key = "";
    let _dcd = "";
    
    while (true) {
        let currentDeep = deep;
        let dcd2 = stc(dcd);
        let key_ = "";
        let prev = 0;
        
        while (currentDeep > 0) {
            let command;
            do {
                command = Math.floor(Math.random() * 3) + 1;
            } while (command === prev);
            
            if (command === 1) {
                key_ = "R" + key_;
                dcd2 = reverse(dcd2);
                currentDeep -= 1;
            } else if (command === 2) {
                const slen = Math.floor(Math.random() * 4) + 2; // 2-5
                key_ = `S${itc(slen)}S` + key_;
                dcd2 = swape(dcd2, slen);
                currentDeep -= 1;
            } else if (command === 3) {
                const sh = Math.floor(Math.random() * 25) + 1; // 1-25
                key_ = `T${itc(sh)}T` + key_;
                dcd2 = shifte(dcd2, sh);
                currentDeep -= 1;
            }
            prev = command;
        }
        
        key_ = "EDCAB" + key_;
        
        if (!check || decode(key_, dcd2) === dcd) {
            _key = key_;
            _dcd = dcd2;
            break;
        }
    }
    
    return [_key, _dcd];
};

// Export functions for ES6 modules
export { encode, decode };