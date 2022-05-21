import firebase_admin
import requests
from firebase_admin import credentials
from firebase_admin import db
from pprint import pprint
from email.headerregistry import Address
from itertools import count
from modulefinder import STORE_NAME
from tkinter import ANCHOR
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
import time

from soupsieve import select

# 브라우저 생성 및  크롬 드라이버 다운로드 후 경로 지정
options = webdriver.ChromeOptions()
options.add_experimental_option("excludeSwitches", ["enable-logging"])
driver = webdriver.Chrome('chromedriver.exe',options=options)
driver.implicitly_wait(3) # 3초까지 기다리기

# 웹 사이트 열기
driver.get('https://map.kakao.com/')

# 5초 지연주기 (로딩시간동안 아래 코드 진행되는거 방지)
time.sleep(5)

#검색창 찾기
element = driver.find_element_by_xpath('//*[@id="search.keyword.query"]')

#리필스테이션 검색
element.send_keys("리필스테이션")
element.send_keys(Keys.ENTER)
time.sleep(2)

#장소 클릭
driver.find_element_by_xpath('//*[@id="info.main.options"]/li[2]/a').send_keys(Keys.ENTER)

html = driver.page_source
soup = BeautifulSoup(html, 'html.parser')
for store in soup.select('.head_item > .tit_name > .link_name'):
    print (store.get_text())
    
# for address in soup.select('.info_item > .wrapAddress > .address'):
#     print(address.get_text())


# for store in store_lists:
    
#     store_name = store.select('.head_item > .tit_name > .link_name')
#     print(store_name.get_text())

#Firebase database 인증 및 앱 초기화
cred = credentials.Certificate('mykey.json')

firebase_admin.initialize_app(cred,{
    'databaseURL' : 'https://refill-station-71fb7-default-rtdb.firebaseio.com' 
})

ref = db.reference("리필스테이션") #DB 위치 지정
ref.update({}) 

