#!/usr/bin/env python3
import time
import hashlib
import sys
import json



if __name__ == '__main__':
    # 运行时通过命令行参数传入 target 和 nonce
    # 例如： python script.py 0123456789abcdef mynonce
    target = "d292130c919c4e0756c80f52cdbc0722"
    nonce = "294b67b885e0127c#"
    result = md5collide({'nonce': nonce, 'target': target})
    print(json.dumps(result))
