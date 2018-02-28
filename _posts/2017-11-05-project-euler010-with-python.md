---
layout: post
title: "Project Euler010 with python"
description: ""
date: 2017-11-05
tags: [algorithm,python,math]
comments: true
---

#### 10. Summation of primes

> The sum of the primes below 10 is 2 + 3 + 5 + 7 = 17.
>
> Find the sum of all the primes below two million.

- 2,000,000 이하의 모든 소수의 합을 구하는 문제이다!
- 앞에서 사용했던 소수구하는 함수를 재활용하자.

```python
def is_prime(x):
    if x <=3:
        if x<=1:
            return False
        return True
    if not x%2 or not x%3:
        return False
    for i in range(5, int(x**0.5)+1, 6):
        if not x%i or not x%(i+2):
            return False
    return True

def euler010a(number=2000000):
    results = []

    for n in range(2, number+2):
        if is_prime(n):
            results.append(n)
    print(sum(results))
```

- 이 방식은 함수를 무지막지하게 불러오기때문에 많이 느리다.

```python
def euler010(number=2000000):
    prime = [False for n in range(2,number + 1)]
    sumOfNum = 0
    for n in range(2, len(prime)):
        if (prime[n] == False):
            sumOfNum += n
            for nn in range(n, len(prime), n):
                prime[nn] = True
    print(sumOfNum)
```

- [에라토스테네스의 체](https://ko.wikipedia.org/wiki/에라토스테네스의_체)의 방식으로 다시 풀어보았다.
