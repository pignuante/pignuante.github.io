---
layout: post
title: "Project Euler006 with python"
description: ""
date: 2017-11-01
tags: [algorithm, python, math]
comments: true
mathjax: true
---

#### 006. Sum square difference

> The sum of the squares of the first ten natural numbers is,
>
> 12 + 22 + ... + 102 = 385
>
> The square of the sum of the first ten natural numbers is,
>
>  $$(1 + 2 + ... + 10)^2 = 55^2 = 3025$$
>
> Hence the difference between the sum of the squares of the first ten natural numbers and the square of the sum is 3025 − 385 = 2640.
>
> Find the difference between the sum of the squares of the first one hundred natural numbers and the square of the sum.

- 문제는 간단하다 모든 숫자의 제곱의 합과 모든 숫자의 합의 제곱을 구하는 것이다.


- 우리가 중학생때인가 고등학생때쯤 배웠던 공식에 따르면
  $$
  \begin{align}
  	\sum_{i=1}^{n}i\ \ =&\ 1+\cdots+n=\frac{n\left(n+1\right)}{2} \\
  	\sum_{i=1}^{n}i^2 =&\ 1^2+\cdots+n^2 = \frac{n\left(n+1\right)\left(2n+1\right)}{6} \\
  	\sum_{i=1}^{n}i^3 =&\ 1^3+\cdots+n^3 = \left(\frac{n\left(n+1\right)}{2}\right)^2 \\
  \end{align}
  $$
  의 식을 따른다.

- 위의 공식의 첫번째것과 두번째 것을 단순히 코드로 옮겨준다.

  ```python
  def euler006(number=100):
      sumSquare = lambda x: ((x * (x+1)) // 2)**2
      squareSum = lambda x: ( x * (x+1)  * (2*x + 1)) // 6
      return (sumSquare(number) - squareSum(number))

  ```

- 아니면 컴퓨터 이용의 주목적중 하나인 반복 노가다를 시켜보자.

  ```python
  def euler006a(number=100):
      def sumSquare(num=number):
          return sum([x for x in range(1,number+1)])**2
      def squareSum(num=number):
          return sum([x**2 for x in range(1, number+1)])
      return (sumSquare(number) - squareSum(number))
  ```

  ​
