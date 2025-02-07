import requests
import os
from pyquery import PyQuery

def parse_main_page(html):
    d = PyQuery(html)
    items =d("tr.item")
    print(type(items))
    print(list(items.items()))
    print(list(enumerate(items.items())))
    for idx,item in enumerate(items.items()):
        detail = item.find("p.pl").text()
        detail = detail.split('/')
        for i in range(len(detail)):
            detail[i] = detail[i].strip()
        item_data ={
            'index': idx ,
            'name': item.find("a").text().strip(),
            "mark": item.find("span.rating_nums").text().strip() ,
            'author': detail[0],
            'publisher': detail[1],
            'date': detail[2],
            'price': detail[3],
            'url': item.find("div.pl2 a").attr("href"),
            'ing_url': item.find("a.nbg img").attr('src'),
        }

        yield item_data

def sav_to_file(data):
    if not os.path.exists("./data"):
        ##-个点这一级父目录
        os.mkdir("./data")
    with open("./data/douban_top250.txt",mode='a' ,encoding='utf-8') as f:
        f.write(str(data)+'n')

def get_main_page(url):
    headers = {"User-Agent": "Mozila/5.0 (Windows NT 10.3; Win4; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.81 Safari/537.36"}
    r = requests.get(url, headers=headers)
    if r.status_code == 200:
        return r.text

    return None

if __name__ =='__main__':
    url = "https://book.douban.com/top250?start=50"
    html = get_main_page(url)
    for i in parse_main_page(html):
        sav_to_file(i)
