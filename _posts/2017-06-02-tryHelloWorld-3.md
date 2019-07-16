---
layout: post
title: "TryHelloWorld Level 1 (3)"
description: "TryHelloWorld 알고리즘 level1 (3)"
date: 2017-06-02
tags: [algorithm, python]
author-id: pignu
comments: true
mathjax: true
---



#### 17. 가운데 글자 가져오기

> getMiddle메소드는 하나의 단어를 입력 받습니다. 단어를 입력 받아서 가운데 글자를 반환하도록 getMiddle메소드를 만들어 보세요. 단어의 길이가 짝수일경우 가운데 두글자를 반환하면 됩니다.
> 예를들어 입력받은 단어가 power이라면 w를 반환하면 되고, 입력받은 단어가 test라면 es를 반환하면 됩니다.

```python
def string_middle(str):
    return str[(len(str)-1)//2:len(str)//2+1]
```

- index를 이용한 간단한 문제. *홀짝*의 조건에 주의하자.

<br><br>

#### 18. 최대공약수와 최소 공배수

> 두 수를 입력받아 두 수의 최대공약수와 최소공배수를 반환해주는 gcdlcm 함수를 완성해 보세요. 배열의 맨 앞에 최대공약수, 그 다음 최소공배수를 넣어 반환하면 됩니다. 예를 들어 gcdlcm(3,12) 가 입력되면, [3, 12]를 반환해주면 됩니다.

```python
def gcdlcm(a, b):
    m, s = max(a, b), min(a, b)
    while s > 0:
        m, s = s, m % s
    return [m, int(a*b/m)]
```

- 알고리즘의 단골 문제인 최대공약수/최소공배수 구하기이다.

- 위 방법은 유클리드 호제법을 이용한 것인데, 

  - 두 숫자 a,b가 있을 때 $ (a\ge b, \ \ 0\le r \lt b) $이며 a,b의 **최대공약수**를 (a, b)라 할 때 다음이 성립한다.
    $$
    \left(a,\ b\right) = \left(b,\ r\right)
    $$

    1. (94, 30)
    2. (30,  4)
    3. (4,   2)
    4. (2,   0)  —> *최대공약수 2*

  - 최대 공약수를 구했으면 최소공배수를 구하기는 무난하다.

    - $최소 공배수 \to a \times b \div gcd$

- 추가로 예전에 공부한 스테인 알고리즘으로 푼 방법도 하나 올려 본다.(코드는 좀 C언어스럽다..)

  ```python
  def gcdlcm(aa,bb):
      exp = 0;r=0
      a,b = min(aa,bb), max(aa,bb)
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
      return [r<<exp, (aa*bb)//(r<<exp)]
  ```

  <br><br>

#### 19. 행렬의 덧셈

> 행렬의 덧셈은 행과 열의 크기가 같은 두 행렬의 같은 행, 같은 열의 값을 서로 더한 결과가 됩니다. 2개의 행렬을 입력받는 sumMatrix 함수를 완성하여 행렬 덧셈의 결과를 반환해 주세요.
>
> 예를 들어 2x2 행렬인 A = ((1, 2), (2, 3)), B = ((3, 4), (5, 6)) 가 주어지면, 같은 2x2 행렬인 ((4, 6), (7, 9))를 반환하면 됩니다.(어떠한 행렬에도 대응하는 함수를 완성해주세요.)

```python
def sumMatrix(A,B):
    for y in range(len(A)):
        for x in range(len(A[y])):
            A[y][x] += B[y][x]
    return A

def sumMatrix(A,B):
    return [[A[y][x] + B[y][x] for x in range(len(A[y]))] for y in range(len(A))]
```

- 행렬의 덧셈을 간단한 코드로 구현하였다. 
- 반복문의 이름을 개인적으론 y,x로 표현하는데 가로 세로가 직관적으로 보이는 듯해서 좋다.
- 위의 이중 반복문을 아래의 리스트 컴프리헨션으로 바꾸었다.
  <br><br>

#### 20. 피보나치 수

> 피보나치 수는 F(0) = 0, F(1) = 1일 때, 2 이상의 n에 대하여 F(n) = F(n-1) + F(n-2) 가 적용되는 점화식입니다. 2 이상의 n이 입력되었을 때, fibonacci 함수를 제작하여 n번째 피보나치 수를 반환해 주세요. 예를 들어 n = 3이라면 2를 반환해주면 됩니다.

```python
def fibonacci(n):
    a = [0,1,]
    for n in range(2, n+1):
        a.append(a[n-1]+a[n-2])
    return a[-1]
```

- 간단하게 DP를 이용하여 피보나치 수를 계산하였다.
- 익히 아는 것처럼 $f\left(n\right) = f\left(n-1\right) + f\left(n+1\right)$의 점화식을 재귀로 구현하는 방식은 속도의 낭비가 크다.
- 굳이 a라는 리스트를 사용할 필요없이 바로 계산하는 것이 더 좋긴하다.

<br><br>

#### 21. 약수의 합

> 어떤 수를 입력받아 그 수의 약수를 모두 더한 수 sumDivisor 함수를 완성해 보세요. 예를 들어 12가 입력된다면 12의 약수는 [1, 2, 3, 4, 6, 12]가 되고, 총 합은 28이 되므로 28을 반환해 주면 됩니다

```python
def sumDivisor(number):
    divs = []
    for n in range(1, int(pow(number, 0.5)) + 1):
        if (number % n == 0):
            divs.append(n)
            divs.append(number // n)
    divs = set(divs)
    return (sum(divs))
```

- 아무리해도 이런 약수를 구하는 등의 수학관련 문제에는 약한것같다...
- 입력된 숫자 N의 가장 큰 약수는 자기 자신인 N을 제외하고는 최대 N의 절반이라는 것을 이용한 알고리즘이다.















