'''
**Fully RLEd** of edc004.  
'''

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
def greeke(string, thick):
    while(len(string)%thick):
        string+='Q'
    res=""
    for i in range(thick):
        for j in range(len(string)//thick):
            res+=string[i+j*thick]
    return res
def greekd(string, thick):
    if not string: return ""
    
    res = ['' for _ in range(len(string))]
    num_rows = len(string) // thick
    cnt = 0
    
    # Grid reconstruction
    for i in range(thick):
        for j in range(num_rows):
            res[i + j * thick] = string[cnt]
            cnt += 1
            
    # rstrip('Q') is safe, fast, and won't crash on an empty string
    return ''.join(res).rstrip('Q')

def rle5e(dc):
    sec=[]
    for i in range(0, len(dc), 5):
        sec.append(dc[i:i+5])
    res=""
    
def rle5d(ec):
    pass

# Control
def decodeInner(_ecd):
    # Seperate key and encoded content.
    ____index=0
    while _ecd[____index]!='V':
        ____index+=1
    key=_ecd[0:____index]
    ecd=_ecd[____index+1:]
    cmd_str = key
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
        elif cmd == 'U':
            i+=1
            num_start = i
            while i < len(cmd_str) and cmd_str[i] != 'U':
                i += 1
            num_enc = cmd_str[num_start:i]
            thick = ifc(num_enc)
            dcd = greekd(dcd, thick)
            i+=1
        else:
            i += 1
    return sfc(dcd)
    
def encodeInner(dcd, deep=10, check=True):
    _key=""
    _dcd=""
    while True:
        _deep=deep
        dcd2=stc(dcd)

        # Randomly encode with the rules above and return (key, ecd)
        key_=""
        prev=0
        while _deep:
            command=random.randint(1, 4)
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
            elif command==4:
                thick=random.randint(2, 10)
                key_=f"U{itc(thick)}U"+key_
                dcd2=greeke(dcd2, thick)
                _deep-=1
            prev=command
        try:
            if (decodeInner(key_+'V'+dcd2)==dcd) or(not check):
                _key=key_
                _dcd=dcd2
                break
        except Exception as e:
            print("detected exception", e)
    # Final process to make it keyless
    return _key+'V'+_dcd

def decode(_ecd):
    if len(_ecd)<5:
        print("\a\a\a\a\a\aWhat sort of encoding even is this???\a\a\a\a\a\a")
        return "What sort of encoding even is this???"
    if _ecd[:5]=="EDCAE":
        _ecd=_ecd[5:]
        org=""
        index=0
        while(index<len(_ecd)):
            if _ecd[index]=='Z':
                sindex=index+1
                index+=1
                while _ecd[index]!='Z':
                    index+=1
                num=ifc(_ecd[sindex:index])
                index+=1
                org+=num*_ecd[index]
            else:
                org+=_ecd[index]
            index+=1
        return decodeInner(org)
    else:
        print("\aThis is an older version of encoding.")
        return "This is an older version of encoding."

def encode(dcd, deep=10, check=True):
    cp=1
    while True and cp:
        def format_rle(char, count):
            if count < 4:
                return char*count
            else:
                return 'Z' + itc(count) + 'Z' + char
        org = encodeInner(dcd, deep, check)
        res = "EDCAE"
        prev = ''
        cnt = 0
        for i in org:
            if i == prev:
                cnt += 1
            else:
                if prev != '':
                    res += format_rle(prev, cnt)
                prev = i
                cnt = 1

        if prev != '':
            res += format_rle(prev, cnt)

        if decode(res)==dcd: return res
        else: cp=0