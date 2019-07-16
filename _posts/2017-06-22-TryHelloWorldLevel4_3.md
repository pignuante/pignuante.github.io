---
layout: post
title: "TryHelloWorld Level4 (3)"
description: "TryHelloWorld Level4 (3)"
date: 2017-06-22
tags: [algorithm, python]
author-id: pignu
comments: true
---

#### 03. 숫자의 표현

> 수학을 공부하던 민지는 재미있는 사실을 발견하였습니다. 그 사실은 바로 연속된 자연수의 합으로 어떤 숫자를 표현하는 방법이 여러 가지라는 것입니다. 예를 들어, 15를 표현하는 방법은
> (1+2+3+4+5)
> (4+5+6)
> (7+8)
> (15)
> 로 총 4가지가 존재합니다. 숫자를 입력받아 연속된 수로 표현하는 방법을 반환하는 expressions 함수를 만들어 민지를 도와주세요. 예를 들어 15가 입력된다면 4를 반환해 주면 됩니다.

```python
def expressions(num):
    answer = 1
    for n in range(1, num//2 + 1):
        s = 0
        while s < num:
            s += n
            n += 1
        if s == num:
            answer += 1
    return answer
```

- 어떠한 알고리즘을 적용해서 풀었다기보단 단순히 숫자 노가다로 문제를 풀었다.
- 시작 `1`에서부터 하나씩 합을 다 구하여 입력된 숫자와 같으면 `answer`에 +1을 해준다.
- 반복문의 끝 범위는 입력된 숫자의 절반까지만 돌면된다.
  - 그 이유는 절반의 이후부터는 숫자들의 합으로 입력된 숫자를 만들수가 없다. (대신 answer는 처음부터 1(자기자신)로 설정해준다)



