---
layout: post
title: "네이버뉴스 댓글 크롤링 with python"
description: "간단히 해보는 네이버 댓글 크롤링"
date: 2018-03-26
tags: python, crawling
comments: true
---



잠깐 사용할 일이 있어서 간단히 만들어보았다.

Beautifulsoup으로 처리하다가 동적(?)으로 생성되는 댓글페이지의 글들을 가져오지 못해서 **selenium**으로 해결했다.

언제나 처럼 **osX**, **python 3.x**으로 하였다.



#### 1. 필요 프로그램 설치

- Beautifulsoup4, selenium 설치

```powershell
pip install --upgrade Beautifulsoup4 selenium 
```

- selenium에 사용할 WebDriver 설치
  - [이 곳](https://sites.google.com/a/chromium.org/chromedriver/)에서 자신에게 맞는 버젼을 설치한다.(Chrome)
  - 설치한 다음 설치된 위치를 잘 <u>기억</u>해둔다.



#### 2. 크롤링해보기.

- 우선 나는 이 [기사](http://sports.news.naver.com/kbaseball/news/read.nhn?oid=108&aid=0002688114)의 댓글을 크롤링 할 것이다.
- 기사의 내용이 있는 주소가 아닌 화면에서 **전체 댓글 더 보기**를 클릭한 주소에서 크롤링을 한다!
- 위에서 말한 댓글창(?)의 주소는 원 주소의 뒤에 `&m_view=1`를 붙여주면 된다.
- 그 뒤에 보통 `&sort=LIKE`도 붙기는 하는데 이건 *좋아요*의 갯수 순으로 정렬되는 옵션이다.(자세한 내용은 네이버 개발자센터를...)

```python
import time

from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.common import exceptions

wd = "./chromedriver"  # 다운 받은 웹드라이버 위치
addr = "http://m.sports.news.naver.com/kbaseball/news/read.nhn?oid=108&aid=0002688114&m_view=1&sort=LIKE" 
# 크롤링하고자하는 사이트 주소
# 개인적으론 모바일 페이지로 하는게 더 가볍고 빠를것같은 기분이 든다.

driver = webdriver.Chrome(wd)
driver.get(addr)

pages = 0 # 한 페이지당 약 20개의 댓글이 표시
try:
    while True: # 댓글 페이지가 몇개인지 모르므로.
        driver.find_element_by_css_selector(".u_cbox_btn_more").click()
        time.sleep(1.5)
        print(pages, end=" ")
        pages+=1
    
except exceptions.ElementNotVisibleException as e: # 페이지 끝
    pass
    
except Exception as e: # 다른 예외 발생시 확인
    print(e)

    
html = driver.page_source
dom = BeautifulSoup(html, "lxml")

# 댓글이 들어있는 페이지 전체 크롤링
comments_raw = dom.find_all("span", {"class" : "u_cbox_contents"})

# 댓글의 text만 뽑는다.
comments = [comment.text for comment in comments_raw]

comments[:3]


# 결과
['경기 지고있는데 쪼개고있던 이대호는 우리 정서에 맞아서 안까이냐?',
 '메이저리그 였으면 빈볼 타석마다 맞고 벤치클리어링 나서 오도어가 죽탱이 한대 칠만한 일인데.. 로저스가 과연 믈브였어도 저렇게 할 수 있었을까 싶다.',
 '다음부터는 자제 좀 하기를']
```





































