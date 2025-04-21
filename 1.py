import cv2
import requests
from PIL import Image
from io import BytesIO


# p = "".concat(Math.floor(d / this.rate), ",").concat(Math.floor(l / this.rate))
# rate = 0.5059523809523809     45*rate 402*rate  50 103              data_type: ["DynAnswerType_POS"]}     this.initCSSPosition = init_pos*rate

bg_url = "https://turing.captcha.qcloud.com/cap_union_new_getcapbysig?img_index=1&image=027905000035340900000015593681582bfe&sess=s0_rZNceXRxkqto5hffTWnTNyNOaIkNTo7NyvrWGcuoZHyQiYYs7EhFsSGzTLx_lhsV8lG91idaFmqVjHQX_hwQ74I5zzUvLQvLPgW4cHpf8vF3tu2Vn5OqG0ImbAlOeZhjBNQW72Re5TLM8-2n2tK3o_zuGr7kF2V1SyZT7E-upE2s2R1I39pI38YN8QIbg0xcDGQI85BGVtAQrwuSE_2B_l9Y9cyooXHyJPbFZwOIeScIsS2NYt6x0pmtfY4SDMo8I9wWIUBl_fMjMeL2NM9hnMuJ1iCnKRPtrYs3ZckXC8WypKZIhdSsthjlIFPQ_zf908fEG-6zvi16lDf6rVA-PEsir0wV-LgEFJLfoMsEv7B9fORprbxPxj3gxqjufGqNCOVGmWyOaiPoVV-skNjpK_hs2RsuMMQ"

tp_url = "https://turing.captcha.qcloud.com/cap_union_new_getcapbysig?img_index=0&image=027905000035340900000015593681582bfe&sess=s0_rZNceXRxkqto5hffTWnTNyNOaIkNTo7NyvrWGcuoZHyQiYYs7EhFsSGzTLx_lhsV8lG91idaFmqVjHQX_hwQ74I5zzUvLQvLPgW4cHpf8vF3tu2Vn5OqG0ImbAlOeZhjBNQW72Re5TLM8-2n2tK3o_zuGr7kF2V1SyZT7E-upE2s2R1I39pI38YN8QIbg0xcDGQI85BGVtAQrwuSE_2B_l9Y9cyooXHyJPbFZwOIeScIsS2NYt6x0pmtfY4SDMo8I9wWIUBl_fMjMeL2NM9hnMuJ1iCnKRPtrYs3ZckXC8WypKZIhdSsthjlIFPQ_zf908fEG-6zvi16lDf6rVA-PEsir0wV-LgEFJLfoMsEv7B9fORprbxPxj3gxqjufGqNCOVGmWyOaiPoVV-skNjpK_hs2RsuMMQ"
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
    cv2.imshow('Matched Result', cropped_image)
    cv2.waitKey(0)
    cv2.destroyAllWindows()
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
    print(min_val, max_val, min_loc, max_loc)

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
    cv2.imshow('Matched Result', bg_image)
    cv2.waitKey(0)
    cv2.destroyAllWindows()

    return top_left


get_img_by_url(bg_url, "bg.png")
get_img_by_url(tp_url, "tp.png")

bg_image = cv2.imread('bg.png')
tp_image = cv2.imread("tp.png")
# 定义左上角坐标和裁剪区域大小
top_left = (140, 490)
side_length = 120
x = 50
y = 72
qk = get_quekou(tp_image, top_left, side_length)
result = math_quekou(qk, bg_image, x, y)
print(result[0],72)






