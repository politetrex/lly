import random

# Constants
CH_LEN = 5

# Basic encodings
def ctc(ch):
    rcode = ord(ch)
    res=""
    code = "ABCDEFGHIJKLMNOP"
    k = 65536
    for i in range(5):
        res+=code[rcode//k]
        rcode%=k
        k//=16
    return res
def cfc(ch):
    ires=0
    code = "ABCDEFGHIJKLMNOP"
    for i in ch:
        ires*=16
        ires+=code.find(i)
    return chr(ires)
def stc(string):
    #print("Running stc(\""+string+"\")")
    res=""
    for i in string:
        res+=ctc(i)
    return res
def sfc(string):
    res=""
    for i in range(0, len(string), CH_LEN):
        chunk=string[i:i+CH_LEN]
        res+=cfc(chunk)
    return res
def itc(num):
    code = "ABCDEFGHIJ"
    res=""
    while num:
        res=code[num%10]+res
        num//=10
    return res
def ifc(string):
    res=0
    for i in string:
        res*=10
        res+=ord(i)-65
    return res

# Functionality
def reverse(string):
    return string[::-1]
def swape(string, slen):
    while len(string)%slen:
        string+='Q'
    res=""
    for i in range(0, len(string), slen):
        res+=reverse(string[i:i+slen])
    return res
def swapd(string, slen):
    res = ""
    for i in range(0, len(string), slen):
        chunk = string[i:i+slen]
        tmp = reverse(chunk)
        while tmp and tmp[-1] == 'Q':
            tmp = tmp[:-1]
        res += tmp
    return res
def shifte(string, sh):
    res=""
    for i in string:
        if i=='Q': continue
        res+=chr((ord(i)-65+sh)%16+65)
    return res
def shiftd(string, sh):
    return shifte(string, 16-sh)

# Control
def decode(key, ecd):
    commands=[]
    if key[0:5]=="EDCAB":
        cmd_str = key[5:]
        dcd = ecd
        i = 0
        while i < len(cmd_str):
            cmd = cmd_str[i]
            if cmd == 'R':
                dcd = reverse(dcd)
                i += 1
            elif cmd == 'S':
                i += 1
                num_start = i
                while i < len(cmd_str) and cmd_str[i] != 'S':
                    i += 1
                num_enc = cmd_str[num_start:i]
                slen = ifc(num_enc)
                dcd = swapd(dcd, slen)  # Use DECODING swap
                i += 1  # Skip ending 'S'
            elif cmd == 'T':
                # Shift command: T{shift}T
                i += 1
                # Extract shift amount
                num_start = i
                while i < len(cmd_str) and cmd_str[i] != 'T':
                    i += 1
                num_enc = cmd_str[num_start:i]
                sh = ifc(num_enc)
                dcd = shiftd(dcd, sh)  # Use DECODING shift
                i += 1  # Skip ending 'T'
            else:
                # Unknown command, skip
                i += 1
        # Convert custom hex back to string
        return sfc(dcd)
    elif key[0:5]=="EDCAA":
        print(f"In decode({key}, {ecd})\ninfo: this is encoded with the 001st version.\nPlease download or use the 001st version.")
    else:
        print(f"In decode({key}, {ecd})\nfatal: unknown or newer version")
    
def encode(dcd, deep=10, check=True):
    _key=""
    _dcd=""
    while True:
        _deep=deep
        dcd2=stc(dcd)
        # Randomly encode with the rules above and return (key, ecd)
        key_=""
        prev=0
        while _deep:
            command=random.randint(1, 3)
            if command==prev: continue
            if command==1:
                key_="R"+key_
                dcd2=reverse(dcd2)
                _deep-=1
            elif command==2:
                slen=random.randint(2, 5)
                key_=f"S{itc(slen)}S"+key_
                dcd2=swape(dcd2, slen)
                _deep-=1
            elif command==3:
                sh=random.randint(1, 25)
                key_=f"T{itc(sh)}T"+key_
                dcd2=shifte(dcd2, sh)
                _deep-=1
            prev=command
        key_="EDCAB"+key_
        if (decode(key_, dcd2)==dcd) or(not check):
            _key=key_
            _dcd=dcd2
            break
    return (_key, _dcd)