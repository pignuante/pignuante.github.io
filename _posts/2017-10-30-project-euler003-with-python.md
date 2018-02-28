---
layout: post
title: "Project Euler003 with python"
description: ""
date: 2017-10-30
tags: [algorithm,python,math]
comments: true
---

> The prime factors of 13195 are 5, 7, 13 and 29.
>
> What is the largest prime factor of the number 600851475143?
>
>

- 어떠한 숫자의 소수의 약수를 구하는 문제이다.

- 우선 우리가 알아야 할것은 어떠한 수의 약수는 전부 소수로 표현할수있다!
  예를 들어서 18의 경우 $2\times9$이지만 9의 경우 $3\times 3$의 소수 두개로 표현이 가능하다.

- 따라서 숫자 n의 약수를 구하면서 나누는 숫자를 소수로 만들면 된다!*~~(말은 쉽다!)~~*

  ```python
  def euler003a(number=600851475143):
      def getFactor(num):
          result = {} # 결과 값을 저장할 dict
          n = 2
          while(num >= n):
              while(True):
                  if(num % n == 0): # 약수조건에 맞는다.
                      if (n in result):
                          result[n] += 1
                      else:
                          result[n]  = 1
                      num //= n # 지금의 숫자로 나눌수 있는 만큼 계속 나눈다.
                  else: # 약수가 아닐시 바로 탈주
                      break
              n += 1 # 나누는 숫자 +1
          return (result)
      result = getFactor(number)
  ```

- 결국엔 2에서 부터 숫자를 나눠 나가는데 2를 한번만 나누고 3으로 넘어가는게 아니고 2로 나눌수 있는 만큼 최대로 돌리고 그 다음 숫자로 넘어가는 것이 포인트이다.
