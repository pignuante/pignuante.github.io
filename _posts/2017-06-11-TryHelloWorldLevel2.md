---
layout: post
title: "TryHelloWorld Level 2 (2)"
description: "TryHelloWorld Level 2"
date: 2017-06-08
tags: [algorithm, python]
comments: true
---

#### 6. 자연수를 뒤집어 리스트로 만들기

> digit_reverse함수는 양의 정수 n을 매개변수로 입력받습니다.
> n을 뒤집어 숫자 하나하나를 list로 표현해주세요
> 예를들어 n이 12345이면 [5,4,3,2,1]을 리턴하면 됩니다.

```python
def digit_reverse(n):
    return [int(x) for x in str(n)[::-1]]
```

- 역시나 파이썬을 이용하면 매우 간단하게 풀 수 있는 문제!
- int로 들어온 숫자를 string형으로 바꾼다음 슬라이싱을 이용하여 역순으로 하나씩 int로 다시 바꿔준다!

<br><br>

#### 7. 이상한 숫자 만들기

> toWeirdCase함수는 문자열 s를 매개변수로 입력받습니다.
> 문자열 s에 각 `단어`의 짝수번째 인덱스 문자는 대문자로, 홀수번째 인덱스 문자는 소문자로 바꾼 문자열을 리턴하도록 함수를 완성하세요.
> 예를 들어 s가 "try hello world"라면 첫 번째 단어는 "TrY", 두 번째 단어는 "HeLlO", 세 번째 단어는 "WoRlD"로 바꿔 "TrY HeLlO WoRlD"를 리턴하면 됩니다.
>
> **주의** 문자열 전체의 짝/홀수 인덱스가 아니라, 단어(공백을 기준)별로 짝/홀수 인덱스를 판단합니다.

```python
def toWeirdCase(s):
    return " ".join(["".join([y if i&1 else y.upper() for i, y in enumerate(x)]) for x in s.lower().split()])
```

- 각 단어별 홀수번째는 대문자, 짝수번째는 소문자로 만든다.

- 너무 한줄로 몰아넣어서 보기 힘들지만

  1. 먼저 문자를 전부 소문자로 만들어준 다음(지금 다시 생각해보니 굳이 필요는 없을듯)
  2. split을 이용하여 단어별로 나눈다.
  3. 이 나눠진 단어의 list의 인자 하나하나를 `enumerate`를 이용하여 char단위와 index를 동시에 뽑아준다.
  4. `enumerate`를 이용해서 뽑은 index를 이용하여 홀,짝수번째를 판단하고 대소문자를 바꿔 준다음
  5. `join`함수를 이용하여 char를 단어로 만들고 다시 `join`을 이용하여 단어들을 문장으로 합쳐준다.

  <br><br>

#### 8. 두 정수 사이의 합 구하기

> adder함수는 정수 a, b를 매개변수로 입력받습니다.
> 두 수와 두 수 사이에 있는 모든 정수를 더해서 리턴하도록 함수를 완성하세요. a와 b가 같은 경우는 둘 중 아무 수나 리턴하세요.
> 예를들어 a가 3, b가 5이면 12를 리턴하면 됩니다.
>
> a, b는 음수나 0, 양수일 수 있으며 둘의 대소 관계도 정해져 있지 않습니다.

```python
def adder(a,b):
    return ((a*(a+1)//2) - ((b-1)*b)//2) if a > b else (b*(b+1)//2) - ((a-1)*a//2)
```

- 두 숫자 사이의 합을 구하는 문제이다.
- `sum`을 이용할수도 있지만 굳이 합의 공식을 이용해서 해보았다.

<br><br>

#### 9. 괄호 확인하기

> is_pair함수는 문자열 s를 매개변수로 입력받습니다.
> s에 괄호가 알맞게 짝지어져 있으면 True를 아니면 False를 리턴하는 함수를 완성하세요.
> 예를들어 s가 "(hello)()"면 True이고, ")("이면 False입니다.
> s가 빈 문자열("")인 경우는 없습니다.

```python
def is_pair(s):
    open_ = 0
    for ss in s:
        if ss=='(':
            open_ += 1
        if ss == ')':
            open_ -= 1
    return False if open_ else True
```

- 괄호가 들어오는 갯수를 확인하여 체크해준다.
- `open_`변수는 괄호가 완전히 짝을 이루었거나, 하나도 들어오지 않았을때 0을 의미한다.
- 전체를 체크해보고 끝에 0이 아니면 짝이 맞지 않는 것이므로 False를 리턴한다.

<br><br>

#### 10. 가장 긴 팰린드롬

> 앞뒤를 뒤집어도 똑같은 문자열을 palindrome이라고 합니다.
> longest_palindrom함수는 문자열 s를 매개변수로 입력받습니다.
> s의 부분문자열중 가장 긴 palindrom의 길이를 리턴하는 함수를 완성하세요.
> 예를들어 s가 "토마토맛토마토"이면 7을 리턴하고 "토마토맛있어"이면 3을 리턴합니다.

```python
def longest_palindrom(s):
    if s == s[::-1]:
        return len(s)
    else:
        return max(longest_palindrom(s[:-1]), longest_palindrom(s[1:]))
```

- 개인적으론 좀 어려웠던 문제.
- for문중첩으로 전체를 탐색했었다가 재귀를 이용해서 다시 풀었다.
  - index때문에 눈 빠질뻔했다...
  - 어찌되었던 반복문 중첩은 엄청난 시간효율이다..
- 종료 조건으로 원 문자열과 뒤집은 문자열이 같은지를 비교하고 앞뒤로 한 줄씩 줄이면서 내려간다.


<br><br>

#### 11. 소수 찾기

> numberOfPrime 메소드는 정수 n을 매개변수로 입력받습니다.
>
> 1부터 입력받은 숫자 n 사이에 있는 소수의 개수를 반환하도록 numberOfPrime 메소드를 만들어 보세요.
>
> 소수는 1과 자기 자신으로만 나누어지는 수를 의미합니다.
> (1은 소수가 아닙니다.)
>
> 10을 입력받았다면, 1부터 10 사이의 소수는 [2,3,5,7] 4개가 존재하므로 4를 반환
> 5를 입력받았다면, 1부터 5 사이의 소수는 [2,3,5] 3개가 존재하므로 3를 반환

```python
def numberOfPrime(number):
    # 1부터 n사이의 소수는 몇 개인가요?
    prime = {n: False for n in range(2,number + 1)}
    result = []
    for n in range(2, number + 1,):
        if (prime[n] == False):
            result.append(n)
            for nn in range(2*n, number + 1, n):
                prime[nn] = True
    return len(result)
```

- prime이라는 dict안에 2부터*(0, 1은 소수가 아님을 명확히 알고있으므로)* 범위의 끝까지 모든 숫자를 만든 다음 `False`를 표시한다.
- 그리고 숫자를 순회하는데, 만약 숫자 n이 False이면 그 숫자를  result에 넣어주고 n의 배수들은 prime안에 전부 `True`로 변환해준다.
- 이 과정을 숫자의 끝까지 반복하면 result에는 소수들만 남는다.

<br><br>

#### 12. 콜라츠 추측

> 1937년 Collatz란 사람에 의해 제기된 이 추측은, 입력된 수가 짝수라면 2로 나누고, 홀수라면 3을 곱하고 1을 더한 다음, 결과로 나온 수에 같은 작업을 1이 될 때까지 반복할 경우 모든 수가 1이 된다는 추측입니다. 예를 들어, 입력된 수가 6이라면 6→3→10→5→16→8→4→2→1 이 되어 총 8번 만에 1이 됩니다. collatz 함수를 만들어 입력된 수가 몇 번 만에 1이 되는지 반환해 주세요. 단, 500번을 반복해도 1이 되지 않는다면 –1을 반환해 주세요.

```python
def collatz(number):
    num = 1
    l   = [number, ]
    while(number != 1):
        if (num > 500):
            return -1
        if(number == 0):
            num = 0
            break
        if(number % 2 == 0):
            number = int(number / 2)
            l.append(number)
            num += 1
        if(number != 1 and number % 2 == 1):
            number = (3 * number) + 1
            l.append(number)
            num += 1
    return len(tuple(l))-1

```

- 맨 처음에 의식의 흐름대로 짠 코드.
- 조건이 나온 것을 순차적으로 실행한다.

```python
def collatz(num):
    for i in range(500):
        num = (num*3)+1 if num & 1 else num//2
        if num == 1:
            return i+1
    return -1
```

- 위의 기나긴 코드를 이렇게 짧게 변화시킬수 있다.
