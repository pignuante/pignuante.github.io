---
layout: post
title: "Project Euler007 with python"
description: ""
date: 2017-11-03
tags: algorithm,python,math
comments: true
---

> By listing the first six prime numbers: 2, 3, 5, 7, 11, and 13, we can see that the 6th prime is 13.
>
> What is the 10 001st prime number?
>
> 

- 10001번째 소수를 찾는 문제이다!

- 소수를 찾기위해서 n을 1~n까지 나눠봤다!

  ```python
  @check_time
  def euler007(number = 10001):
      primeList   = [2,] 	
      num         = 3
      flag        = True
      
      while(len(primeList) < number): 
          for n in primeList:			
              if (num % n == 0):
                  flag = False
                  break;
              if (n * 2 > num):
                  break
          if(flag == False):
              flag = True
          else:
              primeList.append(num);
              flag = True
          num += 2

  ```

- 반복문이 비효율적으로 중첩되어 있으므로 알고리즘을 고쳐보았다.

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

  def euler007a(num=10000):
      l = 0
      n = 1
      
      if num < 2:
          return 0
      if num == 2:
          return 1
      while l < num:
          n += 2
          if is_prime(n):
              l += 1
      return n


  ```

- 초반에 구할수 있는 소수를 최대한 구한 다음 탐색의 step을 넓혔다!