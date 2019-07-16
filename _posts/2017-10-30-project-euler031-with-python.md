---
layout: post
title: "Project Euler031 with python"
description: ""
date: 2017-10-30
tags: [algorithm,python,math]
author-id: pignu
comments: true
---

> In England the currency is made up of pound, £, and pence, p, and there are eight coins in general circulation:
>
> > 1p, 2p, 5p, 10p, 20p, 50p, £1 (100p) and £2 (200p).
>
> It is possible to make £2 in the following way:
>
> > 1×£1 + 1×50p + 2×20p + 1×5p + 1×2p + 3×1p
>
> How many different ways can £2 be made using any number of coins?

- 재귀를 활용하는 전형적인 문제이다..

- 편의상 1페니와 2페니로 5페니를 만드는 경우의 수를 생각해보자.

  1. 1 페니 : 1가지
  2. 2 페니 : (1+1), (2)
  3. 3 페니 : (1+1+1), (1+2)
  4. 4 페니 : (1+1+1+1), (1+1+2), (2+2)
  5. 5 페니 : (1+1+1+1+1), (1+1+1+2) $$\cdots \\$$

- 위의 식은 아래의 공식을 따른다.

  - $$\begin{align}
    	f\left(1\right) =&\  1\\
      	f\left(2\right) =&\  2 \\
      	f\left(3\right) =&\  1+ f\left(1\right) \\
      	f\left(4\right) =&\  1+ f\left(2\right) \\
      	f\left(5\right) =&\  1+f\left(3\right)  \\
    \end{align}$$

- ```python
  def euler031a(value=200):
      coins = [1, 2, 5, 10, 20, 50, 100, 200,]

      def solution(val=200,index=7):
          if val < 0:
              return 0
          if val == 0:
              return 1
          if index < 0:
              return 0
          return solution(
              val-coins[index], index) + solution(val, index-1)

      print(solution(val=value))
  ```

- 정말 단순하게 재귀로 구성하였다. 작동은 하지만 생각보다~~*(라기보다는 당연히)*~~ 빠르진 않다.

  ```python
  def euler031():
      coins = (1, 2, 5, 10, 20, 50, 100, 200)
      ways = [1]+[0] * 200
      for coin in coins:
          for i in range(coin, 200+1):
              ways[i] = ways[i] + ways[i-coin]
      print(ways[-1])
  ```

- 그래서 **dp**(맞나..)의 방식으로 다시 구성해봤다.

  1. 우선 모든 방법의 갯수를 저장할 배열을 생성한다(계산하려고 하는 돈의 크기만큼).

  2. 그리고 ways의 index에 해당하는 돈의 경우의 수를 저장해야한다.  

     1. 1페니를 사용할 경우
        2페니는 (1페니 + 1페니)
        3페니는 (1페니 + 1페니 + 1페니)페니이다.
        4페니는 (1페니 + 1페니 + 1페니 + 1페니)페니이다.

        이 시점에서 배열에는 (1,1,1)이 저장되어 있다

     2. (1,1,1,1,1)의 의미는 1페니로 1페니,2페니 3페니를 만드는 갯수이고 이것을 연결해서

     3. 2페니를 활용해서 배열을 채워보면
        2페니 부분에 이미 저장되어 있는 수치에 2페니로 2페니를 만드는 방법은 1가지 밖에 없으므로 +1한다. 여기서 우리는 이 처리를 0번 index에 저장된 1을 사용한다.
        그리고 3페니로 이동하여 이미 (1+1+1)이 저장되어 있는 1에 (1+2)의 경우의 수를 추가한다. 역시나 지금 2페니와 조합이 되어지는 1의 경우의 수를 필요로 하므로 지금의 index에 페니를 빼준 곳의 경우의 수를 합쳐준다.
        마지막으로 4페니로 이동하여 (1+1+1+1)의 경우의 수가 저장되어 있는 곳에 (*2*+2)와 (*1+1*+2)의 경우의 수를 추가해주는데 이 경우의 수는 우리의 지금 2페니에 <u>2페니와 (1+1)</u>의 경우의 수를 합치는 것이다. 밑줄 친 곳의 경우의 수는 우리가 2페니를 구할떄 만들어둔 경우의 수이므로 지금 index에 -2를 하면 얻어올 수 있다.

- 머리로는 이해하는데 말로 설명이 조금 부족하다. 추후 설명 보완을..
