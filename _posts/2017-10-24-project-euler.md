---
layout: post
title: "Project Euler 01 with python."
description: "Project Euler 01"
date: 2017-10-24
tags: algorithm,python,math
comments: true
---

한동안 코딩을 할 여유가 나지를 않았다...~~(망할 수학)~~

오일러프로젝트는 아마 60번대 문제까지 풀었었는데... 계정 비밀번호찾기가 되지를 않아서 짬이 날때마다 조금씩 다시 풀어보기로 했다. (예전에 풀었던 코드들을 보니 개선사항이 많이 보이기도 하므로 ㅎㅎ)

또 최근 공부를 하면서 수학공부와 알고리즘문제는 뗄래야 뗄 수없는 관계임을 새삼 느낀 점도 한 몫을 단단히 하는 것같다 ㅎㅎ



> If we list all the natural numbers below 10 that are multiples of 3 or 5, we get 3, 5, 6 and 9. The sum of these multiples is 23.
>
> Find the sum of all the multiples of 3 or 5 below 1000.



```python
def euler001a(number=1000):    
    import time
    sum_   = 0
    n      = 0
    startTime = time.time()
    while (n < number):
        if n % 3==0 or n % 5==0:
            sum_+=n
        n+=1
    print(sum_)
    print(time.time() - startTime)
```

- 일반적으로는 이렇게 많이 푸실 것 같다(나도 맨 처음엔 이런식으로 풀었고). 딱히 큰 문제는 없지만 파이썬에서 제공해주는 **[set](https://docs.python.org/3/tutorial/datastructures.html)**자료형을 활용해서 풀면 약간이나마 연산 속도가 빨라진다.*(믿고 사용하는 STL이다..)*



```python
def euler001(n1=3, n2=5, limit=1000):  
    import time
    startTime = time.time() # 시작시간
    
    number1   = {n for n in range(n1, limit, n1)} # set으로 n1의 배수 생성
    number2   = {n for n in range(n2, limit, n2)} # set으로 n2의 배수 생성
    
    result    = sorted(number1 | number2) # union 처리
    
    print(time.time() - startTime) # 작동 시간 출력
    return sum(result)
```

- **set**을 사용하면 우선 *set comprehension*을 사용하여 우리가 구하고자 하는 두 숫자들의 배수 set을 만든다.
- 그리고 그 두 숫자를 **union**연산을 통해서 결과*set*을 저장한다(굳이 저장할 필요 없이 바로 뽑아 써도 되지만 절차를 위해서..).
- 저장된 결과*set*의 합을 구한다.





















