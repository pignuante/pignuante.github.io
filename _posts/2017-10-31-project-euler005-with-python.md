---
layout: post
title: "Project Euler005 with python"
description: ""
date: 2017-10-31
tags: algorithm,python,math
comments: true
---

> 2520 is the smallest number that can be divided by each of the numbers from 1 to 10 without any remainder.
>
> What is the smallest positive number that is evenly divisible by all of the numbers from 1 to 20?

- 나열된 숫자들의 최소 공배수를 구하는 문제이다.

```python
def gcd(a,b):
    exp = 0;r=0
    while ((a|b)&1 == 0):
        exp += 1
        a >>= 1
        b >>= 1
    while(a!=0 and b!=0):
        while((a&1)==0):
            a>>=1
        while((b&1)==0):
            b>>=1
        if (a>b):
            a = a-b
        else:
            b = b-a
    if (a!=0):
        r=a
    else:
        r=b
    return r<<exp

def euler005(number=20):
    num_list = [x for x in range(1,number+1)]
    lcm = num_list[0]*num_list[1]//gcd(num_list[0], num_list[1])       
    for n in range(1, number):
        lcm = lcm*num_list[n] // gcd(lcm, num_list[n])
    print(lcm)
```

- 최소 공배수를 구하기 위해서는 우선 [최대공약수](https://namu.wiki/w/최대공약수)를 구한다.
- 보통은 메모이제이션을 이용하여서들 많이 최대공약수를 구하는데 [이진 최대공약수](https://ko.wikipedia.org/wiki/이진_최대공약수_알고리즘)(스테인 알고리즘)으로 구현해보았다.
- 최대공약수를 구한다음 두 숫자를 곱하고 최대 공약수로 나눠주면 최소 공배수를 구할 수 있다.

















