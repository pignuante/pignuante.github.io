---
layout: post
title: "Project Euler009 with python"
description: ""
date: 2017-11-03
tags: algorithm,python,math
comments: true
---

#### Special Pythagorean triplet

> A Pythagorean triplet is a set of three natural numbers, a < b < c, for which,
>
> $a^2 + b^2 = c^2$
>
> For example, $3^2 + 4^2 = 9 + 16 = 25 = 5^2.$
>
> There exists exactly one Pythagorean triplet for which a + b + c = 1000.
> Find the product abc.

- 피타고라스의 수를 구하는데 숫자 a,b,c의 합이 **1000**인 것을 찾는것이다!

```python
def euler009(number=1000):
    result = 0
    for a in range(1, number):
        for b in range(1, a):
            c = number - (a + b)
            if (a**2) + (b**2) == (c**2):
                result = (a * b * c)
    print(result)
```

- 우선 a를 1에서부터 1000까지 반복해서 생성한다.
- 그리고 또 1에서부터 a까지 생성을 한다.
- 그리고 1000에서 a와 b의 합을 뺀 수를 c로 설정한 다음에 피타고라스를 계산한다!
- a를 1000까지 반복하는데 그 반복의 횟수를 줄 일 수 있을 것 같다.









