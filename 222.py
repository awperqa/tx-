import requests

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

# 替换为实际的值
post_data = {
    "collect": '3kAcyTGKxAsF4qUEKRX/4DyCvpMKnkz28pb/waTEPCBSHhZb9ItHTGtbCgIRk8Rz6WiCP/wWoiT2k7wv/cxohO28s4zgr3MSNDzTHHglVZZHoRCvQU97TJnOabO/l3uIrQckp5jVgYQN7gzIgpgDAwYFUcvILor0YkHVem324XCoszw3EnF+oobhPMyhKbURNYj0AlcCPdDvmIAZuf+veC6huzfkcRaxHZtAph5FY7gPdIx8BhWXOw0HjBL4smYg1f+Mmqisfx8N2j38TxEiwS0OdcR1RRttl8wBuB5ky9gctM3G5cdUa/Hc+2QKgzYlmLcJyG6OY4b02FW9lafFJeAV9zI1VHsDMgdQjB7UdjM/UPQ7DGSH8uUXMtur1ZFFqO/a7GEiwxu/lmwKrFnbSY6JMERbUFLLO2hGRMLdGPRLz0HTND3D1enS0GGrOuBb0w4ru91N6uaaEeoBhZOwQiW1FOWnR2ENdo8Sd86gH1o6s7spQlk0utmcbz3FZnhRfhL0wEP7n81b9Nf3D4u1oDcbGoubfvLv8JDxftTsClaJcFdWGix/5b23VyMlylOD+uet75adjeDYId7iShV3KMRXw6nV/7IcZrSAXBmtCSnLjdhdrg18trSIn1nHURpKhI/m15uWmuNb9Nf3D4u1oCtvAkm/r58GQH/HfXpK9OS9t1cjJcpTg/2KzjCygArc2CHe4koVdyjEV8Op1f+yHGa0gFwZrQkp4HtwWr/4b0Jvb11cp+xe6YSP5teblprjPYye6bHP29hkUlYLI37tL78v+HSvKYwZ/YrOMLKACtwf322cEFm2nGa0gFwZrQkpy43YXa4NfLYJA89cZZdVlOoMIpggxFFYPYye6bHP29grjIOuOoRTcr23VyMlylODxK43I8jbhuZ4r4ejlSBsyGa0gFwZrQkp4HtwWr/4b0JPZz23YyyvxqYyMkMIJcxbPYye6bHP29il+fe4MaklA78v+HSvKYwZ/YrOMLKACtwf322cEFm2nGa0gFwZrQkphXDWMOTPin9EQY0YcXp4MYSP5teblprj9eKpMP1oOnf5IlO/OYVZ/r8v+HSvKYwZpnOolOQA6AVpOdlvgPK+o/EJxAAmC4S2jW6AoTuf+sDgQAA0W370GjbRdLyimdwgdmPvK+L2qUrzr2IuYeh0h+uas8DuzfSiZJDGnBdtW50rzz5a3G6UaB40M1IUseE8lHFgIqVt1WMltRTlp0dhDSW1FOWnR2ENAm9Y59jiCJ3q2oIxx0hbqyiphqcVIsfhBtqGbWmZaZHr6kECYunfI/sWUMCIoHCvzn4mDL8fDB08wGOFzdYOiw3+NcEA2wlSJOnjF+JLmmCe5WKDgxtCN0f7XPNgSH4ngczeD1eh/ZNMnVYpk9QSPHUNWMBrYqBKzcWmZWb7WFqLlRr/hhfYM3fzy6CI2UmlJhF2iIQoo04sLuZt1fUIhkM1iA5q1G+HknF2aXrWzuiYW0L6K0Vrw9qnOEKGPknY3ha/UR/Dl1eCiC5FckKBtYtwVwbX4CzUq2PEJIoQyS6upsUEeUSItNtfxMX6chaqhSLjKDx15D33gZqJ0mmtElc40pFOrI+w1CzXpDOsFep7NATMTNqrZ/LIUCCLobiowSgOlmkawC335GJLfyDDMGL4GoMU9kBCqp+9qIben354g/abr8QP2vR38XVuPs2FktKgEPNjGDUltRTlp0dhDSW1FOWnR2ENIz9coJN0FBtqx9El+oKu2nqeZWzQ+cB6syxiW0nCACs1U85EKHdbfQ==',
    "tlg": 1784,
    "eks": 'NsguQahqEEOCMy5hNNfc8alg91bbe39msOWgY0/IXVFJ0QW4J3PfQJx7Ue/RboGBVswN/W/iEn7tG7UILUwC7ycFgAizN44hdRlYSHZGcGErvkM0jeLzN0ypGgFmD29KDCa79XBA7oi1q+aqGC1z7HNHNCLnqey6y/RhZYbIVqxkumsjGVTLTguEOx3dY13Sq32F7zbjaoirbDPFIRC9CbtMU8xR4qJHFQKew6McQkM=',
    "sess": 's0FlYPxvWYj0DsYEW1KtlBSRWMvxbGVq93OMyGth5T8-9kWju5HhFnpxjT_RXFKbOXm2GabeqpApb2oYawuKNZdeIy2sfSkbnCf4Z3hBQFJPSdaqPtrbRgaT5tz5fCou-vwllA3AgnxjrimoXbE_NM1Fk7n3kj1cJyMOO6W-nb0lsnQV33Vxl1kpp8IQEFK-6QcdkjJIMnYiq6vpSh76Zhhc7bbnp9M9P1tY0r5KoY2ooc5EpwP8Y0m6lS6KnlGgT-rz9oRLHIxpjqmsyuRA9h5Yt82M7HZwXu81DnL5MTIPFUJcn1Oj7qIbOEap7TK_ymkM3vdz_hRkKoRB-tgSSYkuwT1foRUTWyUDmZnryWMoSlud6h-pW9Xmq8cj3wGK4syHzYOKsvArGzPVFuNAjDWRrwJrDLmJrQ',
    "ans": '[{"elem_id":1,"type":"DynAnswerType_POS","data":"519,102"}]',
    "pow_answer": 'e31084061658f6c7#3318',
    "pow_calc_time": '16'
}

# 使用 data 发送表单数据
r = requests.post('https://turing.captcha.qcloud.com/cap_union_new_verify', data=post_data, headers=headers)

# 打印响应内容
print(r.text)