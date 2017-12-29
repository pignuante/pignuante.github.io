---
layout: post
title: "Project Euler030 with python"
description: ""
date: 2017-10-29
tags: algorithm,python,math
mathjax: true
comments: true
---

> Surprisingly there are only three numbers that can be written as the sum of fourth powers of their digits:
>
> $$$
> 1634 = 1^4 + 6^4 + 3^4 + 4^4\\
>
> 8208 = 8^4 + 2^4 + 0^4 + 8^4\\
>
> 9474 = 9^4+4^4+7^4+4^4\\
> $$$
> As 1 = 14 is not a sum it is not included.
>
> The sum of these numbers is 1634 + 8208 + 9474 = 19316.
>
> Find the sum of all the numbers that can be written as the sum of fifth powers of their digits.



- 숫자의 5승을 구해서 합치는 과정 그 자체는 어렵지 않다.

- 하지만 아무생각없이 "풀어야지!"하고 접근을 하다보니 종료조건을 어떻게 해야하나 (....)를 생각하게 되었다.

  1. 일단 우리가 구할 것은 어떠한 숫자의 각 **자리수를 5승을 한 합**을 구하는 것이다.

  2. 그럼 어떠한 자리수에서 가장 큰 수는 $99\cdots9$이다.

  3. 9로 구성된 숫자의 위의 작업을 각각 해보면
     $$
     \begin{align}
     9^5 =&\ 59049 \\
     99^5=&\ 118098 \\
     999^5=&\ 177147  \\
     9999^5 =&\ 236196 \\
     99999^5 =&\ 295245\\
     999999^5=&\ 354294\\
     9999999^5=&\ 413343\\ 
     \end{align}
     $$
     편의상 999로 표현했지만 각 자리수를 5승하여 합한 결과이다.

     보면 알겠지만 9999999의 5승의 합은 6자리가 나와서 7자리에서는 절대로 우리가 원하는 결과를 얻을 수가 없다.

  4. 따라서 우리가 반복문을 돌릴때의 종료점은 **354294**이다.

```python
def euler030(power=5):
    limit = (9**5)*6
    results = []
    
    for num in range(2, limit+1):
        temp = str(num)
        if num == sum(int(n)**5 for n in temp):
            results.append(int(temp))
    print(sum(results))
```

언제나 처럼 갓갓갓 파이썬으로 해결하면 매우 쉽다...

























