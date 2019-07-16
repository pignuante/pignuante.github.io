---
layout: post
title: "Project Euler004 with python"
description: ""
date: 2017-10-31
tags: [algorithm,python,math]
author-id: pignu
comments: true
---

## 003. Largest palindrome product

> A palindromic number reads the same both ways. The largest palindrome made from the product of two 2-digit numbers is 9009 = 91 × 99.
>
> Find the largest palindrome made from the product of two 3-digit numbers.
>
>

- [***Palindrome***](https://namu.wiki/w/회문)(회문, 대칭수)이란 뒤집어서 읽어도 자기자신과 같은 문자열을 뜻한다.
- 우리는 3자리의 숫자(100~999)까지의 숫자를 곱했을 때 가장 큰 대칭수를 구하는 것이다!

```python
def is_palindrome(number=121):
    data = str(number)
    return True if data == data[::-1] else False

def euler004(digit=3):
    result_list = []
    for y in range((10**digit)-1,(10**(digit-1)-1), -1):
        for x in range((10**digit)-1,(10**(digit-1)-1), -1):
            if is_palindrome(y*x):
                result_list.append((y*x, y, x))

    return max(result_list)[0]
```

- 코드는 크게 두 부분으로 나뉜다.
  1. `is_palindrome` : 어떠한 숫자가 들어 왔을 때에 회문인지 아닌지를 판단한다. 위의 코드는 간단하게 list의 slicing을 이용하였다.
  2. 탐색의 범위는 사실 범위가 그렇게 크지 않아서 전체를 탐색해도 되지만, 우리는 가장 **큰** 회문을 찾는 것이므로 뒤에서 부터 한자리수 전체만 탐색을 해서 탐색의 횟수를 조금이라도 줄였다! $$999\times999 \sim 99\times99$$의 범위를 탐색한다!
