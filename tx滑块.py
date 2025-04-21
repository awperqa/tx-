import json
import random
import re
import subprocess
import time
import hashlib
import cv2
from PIL import Image
from io import BytesIO
import requests

def md5_hash(s):
    """
    计算字符串 s 的 MD5 哈希（以十六进制字符串形式返回）
    """
    return hashlib.md5(s.encode('utf-8')).hexdigest()

def md5collide(params, timeout=30000):
    """
    模拟 JS 代码中 md5collide 的功能：
      - params 是一个字典，包含两个键：
           nonce: 字符串
           target: 目标 MD5 哈希值（十六进制字符串）
      - timeout: 超时时间，单位为毫秒，默认为 30000ms
    函数不断尝试不同的数字 u，使得 md5(nonce + str(u)) 等于 target，
    如果在超时时间内找到则返回答案，否则返回最后尝试的 u 以及所花时间。

    返回一个字典，例如：
         { "ans": 1106, "duration": 8 }
    """
    nonce = params['nonce']
    target = params['target']
    start_time = time.time() * 1000  # 当前时间，单位：毫秒
    u = 0
    # 循环尝试不同的 u 值，直到 MD5 值匹配 target 或超时
    while True:
        candidate = f"{nonce}{u}"
        h = md5_hash(candidate)
        if h == target:
            break
        u += 1
        if time.time() * 1000 - start_time > timeout:
            break
    duration = int(time.time() * 1000 - start_time)
    return {'ans': u, 'duration': duration}


def get_img_by_url(url, name):
    response = requests.get(url)
    if response.status_code == 200:
        print("Image downloaded successfully.")
        image = Image.open(BytesIO(response.content))
        image.save(name)
        return image
    else:
        raise Exception(f"Failed to download image. Status code: {response.status_code}")
def get_quekou(img, top_left, side_length):
    # 计算裁剪区域右下角坐标
    bottom_right = (top_left[0] + side_length, top_left[1] + side_length)
    # 裁剪图片
    cropped_image = img[top_left[1]:bottom_right[1], top_left[0]:bottom_right[0]]
    cv2.imwrite('quekou.jpg', cropped_image)
    # 显示结果
    # cv2.imshow('Matched Result', cropped_image)
    # cv2.waitKey(0)
    # cv2.destroyAllWindows()
    return cropped_image
def math_quekou(quekou_image, bg_image, x, y):
    tp_edge = cv2.Canny(quekou_image, 100, 200)
    tp_pic = cv2.cvtColor(tp_edge, cv2.COLOR_GRAY2RGB)

    # 读取目标图片
    bg_edge = cv2.Canny(bg_image, 100, 200)
    bg_pic = cv2.cvtColor(bg_edge, cv2.COLOR_GRAY2RGB)

    # 使用模板匹配
    result = cv2.matchTemplate(bg_pic, tp_pic, cv2.TM_CCOEFF_NORMED)
    min_val, max_val, min_loc, max_loc = cv2.minMaxLoc(result)

    # 获取匹配位置
    top_left = max_loc  # 左上角点的坐标
    h, w, _ = tp_pic.shape
    bottom_right = (top_left[0] + w, top_left[1] + h)

    # 在目标图片上绘制匹配结果
    cv2.rectangle(bg_image, top_left, bottom_right, (0, 255, 0), 2)

    # 将缺口补充到背景图上
    # 获取要覆盖的图像尺寸
    overlay_h, overlay_w = quekou_image.shape[:2]
    # 指定放置位置左上角坐标
    # 将小图像放到大图像上（注意边界处理）
    bg_h, bg_w = bg_image.shape[:2]
    if x + overlay_w > bg_w or y + overlay_h > bg_h:
        raise ValueError("Overlay image exceeds background boundaries.")

    # 替换背景图像的对应区域
    bg_image[y:y + overlay_h, x:x + overlay_w] = quekou_image
    cv2.imwrite('result.png', bg_image)

    # 显示结果
    # cv2.imshow('Matched Result', bg_image)
    # cv2.waitKey(0)
    # cv2.destroyAllWindows()

    return top_left

time1 = time.time()
ap = "_aq_" + str(int(1e6 * random.random()))
headers11 = {
    'sec-fetch-dest': 'script',
    'sec-fetch-mode': 'no-cors',
    'sec-fetch-site': 'cross-site',
    'Host': 'turing.captcha.qcloud.com',
    'Referer': 'https://pintia.cn/',
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
    'Accept-encoding': 'gzip, deflate, br, zstd',
    'Sec-CH-UA': """'Not A(Brand";v="8", "Chromium";v="132", "Microsoft Edge";v="132'""",
    'Sec-CH-UA-Mobile': '?0',
    'Sec-CH-UA-Platform': "Windows",
    'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36 Edg/132.0.0.0",
}
headers = {
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'cross-site',
    'Host': 'turing.captcha.qcloud.com',
    'Origin': 'https://turing.captcha.gtimg.com',
    'Referer': 'https://turing.captcha.gtimg.com/',
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    'Sec-CH-UA': """'Not A(Brand";v="8", "Chromium";v="132", "Microsoft Edge";v="132'""",
    'Sec-CH-UA-Mobile': '?0',
    'Sec-CH-UA-Platform': "Windows",
    'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36 Edg/132.0.0.0",
}
# js 请求验证码信息
base_url = 'https://turing.captcha.qcloud.com'
target_url = 'https://turing.captcha.qcloud.com/cap_union_new_verify'
                                                            # 199128792
url = 'https://turing.captcha.qcloud.com/cap_union_prehandle?aid=194593025&protocol=https&accver=1&showtype=popup&ua=TW96aWxsYS81LjAgKFdpbmRvd3MgTlQgMTAuMDsgV2luNjQ7IHg2NCkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzEzMi4wLjAuMCBTYWZhcmkvNTM3LjM2IEVkZy8xMzIuMC4wLjA%3D&noheader=1&fb=1&aged=0&enableAged=0&enableDarkMode=0&grayscale=1&clientype=2&cap_cd=&uid=&lang=zh-cn&entry_url=https%3A%2F%2Fpintia.cn%2Fauth%2Flogin&elder_captcha=0&js=%2Ftcaptcha-frame.c055d939.js&login_appid=&wb=2&subsid=1&callback='+ap+'&sess='
cap_union_prehandle = requests.get(url,headers=headers11)

match = re.search(r'(_aq_\w+)\((\{.*?\})\)', cap_union_prehandle.text)
data = json.loads(match.group(2))


tdc_url = base_url + data['data']['comm_captcha_cfg']['tdc_path']
data_y = data['data']['dyn_show_info']['fg_elem_list']
bg_url = base_url + data['data']['dyn_show_info']['bg_elem_cfg']['img_url']
tp_url = base_url + data['data']['dyn_show_info']['sprite_url']

prefix = data['data']['comm_captcha_cfg']['pow_cfg']['prefix']
md5 = data['data']['comm_captcha_cfg']['pow_cfg']['md5']

# md5collide = subprocess.run(['node', "1.js", md5, prefix], capture_output=True, text=True)
# md5_json = json.loads(md5collide.stdout)
md5collide_data = md5collide({'nonce': prefix, 'target': md5})
y = ''
top_left = (140, 490)
side_length = 120
for i in data_y:
    if 'move_cfg' in i and i['move_cfg'] is not None and i['move_cfg'].get('data_type') == ['DynAnswerType_POS']:
        y = i['init_pos'][1]
        top_left = i['sprite_pos']
        side_length = i['size_2d'][0]

#data  sess
sess = data['sess']

pow_answer = prefix + str(md5collide_data['ans'])
pow_calc_time = md5collide_data['duration']

get_img_by_url(bg_url, "bg.png")
get_img_by_url(tp_url, "tp.png")
print(f"图片下载+MD5碰撞花费时间:{time.time()-time1}")

bg_image = cv2.imread('bg.png')
tp_image = cv2.imread("tp.png")
x = 50
qk = get_quekou(tp_image, top_left, side_length)
result = math_quekou(qk, bg_image, x, y)
print(result[0],y)
ans = [{"elem_id":1,"type":"DynAnswerType_POS","data":"267,243"}]
ans[0]['data'] = str(result[0]) + "," + str(y)

encryption_result = subprocess.run(['node', ".\\js补环境\\index.js", tdc_url], capture_output=True, text=True)
result_json = json.loads(encryption_result.stdout)

collect = result_json[0]
tlg = result_json[1]
eks = result_json[2]['info']

print("collect:" + str(collect)+"\n"+"tlg:" + str(tlg) +"\n"+ "eks:" + str(eks)+"\n"+"sess:" + str(sess)+"\n"+"pow_answer:" + str(pow_answer)+"\n"+"pow_calc_time:" + str(pow_calc_time)+ "\n" + "ans:" + str(ans))

post_data = {
    "collect":collect,
    "tlg":tlg,
    "eks":eks,
    "sess":sess,
    "ans": str(ans),
    "pow_answer": pow_answer,
    "pow_calc_time":pow_calc_time
}

r = requests.post(target_url, data=post_data,headers=headers)
print(r.text)
print(time.time()-time1)










