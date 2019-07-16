---
layout: post
title: "Insertion Sort"
description: "What is Insertion Sort?"
date: 2017-05-29
tags: [study, sort, algorithm, Insertion]
author-id: pignu
comments: true
mathjax: true
---

## Sort

#### Insertion sort

1. 삽입정렬이란?

   자료 배열의 모든 요소를 앞에서부터 차례대로 이미 <u>정렬된 배열 부분과 비교</u>하여, 자신의 위치를 찾아 삽입함으로써 정렬을 완성하는 알고리즘이다. 삽입정렬은 크기가 작은 정렬에 효율적이며, 마치 카드놀이를 할 때 손에 쥔 카드를 정렬하는 방법과 매우 유사하다.

```python
/*PSEUDOCODE*/
Insertion-Sort(A)
c1	for j = 2 to A.length			
c2		key = A[j]					
c4		i = j-1						
c5		while i>0 and A[i]>key		
c6			A[i+1] = A[i]			
c7			i = i-1					
c8		A[i+1] = key
```
| 수행시간  |                  횟수                  |
| :---: | :----------------------------------: |
| $c_1$ |                 $n$                  |
| $c_2$ |                $n-1$                 |
| $c_3$ |                $n-1$                 |
| $c_4$ |                $n-1$                 |
| $c_5$ |         $\sum_{j=2}^{n}t_j$          |
| $c_6$ | $\sum_{j=2}^{n}\left( t_j-1 \right)$ |
| $c_7$ | $\sum_{j=2}^{n}\left( t_j-1 \right)$ |
| $c_8$ |                 n-1                  |

1. 삽입정렬의 작동

   1. 탁자위의 카드를 정렬한다고 생각하자.
   2. 카드 한장을 손으로 옮긴다. 
   3. 다음 카드를 이전 카드의 오른쪽으로 옮긴다.
   4. 오른쪽의 카드를 왼쪽의 카드와 비교한다.
   5. 비교 후 큰 카드를 **오른쪽**, 작은 카드를 **왼쪽**으로 이동한다.
      1. 자신의 왼쪽의 카드가 자신보다 모두 작거나, 
      2. 왼쪽에 더 이상의 카드가 없어질떄까지 반복.
   6. 입력이 끝날때까지, `2~5`번의 과정을 반복한다.
      <br>

2. 삽입정렬의 분석

   - 삽입정렬의 수행시간은 **입력의 크기**에 의해서 결정된다.

   - 삽입정렬의 수행시간은 입력 데이터의 **정렬되어진 정도**에 따라서 크기가 같다고 하여도 수행시간이 달라질수 있다.

     <br>

3. 삽입정렬의 수행시간 분석

   - 알고리즘의 수행시간은 각 명령문 수행시간의 합이다.[^1]

   $$
   \begin{align}T\left(n\right)\ =\ &c_1n \ + \ c_2\left(n-1\right) \ + \ c_3\left(n-1\right) \\ 
   &+ \ c_5\sum_{j=2}^{n}t_j \ + \ c_6\sum_{j=2}^{n}\left(t_j-1\right) \ + \ c_7\sum_{j=2}^{n}\left(t_j-1\right) \ + \ c_8\left(n-1\right)\end{align}
   $$

   - **최선**의 상황*(입력 데이터가 이미 정렬된 경우)*의 시간을 구해보자. 이 경우에는
     $$
     \begin{align}
     T\left(n\right) \ &= \ c_1n \ + \ c_2\left(n-1\right) \ +\ c_4\left(n-1\right) \ +\ c_5\left(n-1\right) \ +\ c_8\left(n-1\right)\\
     & = \left(c_1 \ +\ c_2 \ +\  c_4 \ +\  c_5 \ +\  c_8\right)n \ - \ \left(c_2 \ +\  c_4 \ +\  c_5 \ +\  c_8\right)
     \end{align}
     $$

     - 이 수행시간을 $c_i$에 의존하는 상수 $$a, \ b$$에 대해서 $$ax \ +\ b$$라는 $$n$$에 관한 **선형함수**가 된다.

   - **최악**의 상황*(입력 데이터가 역순일 경우)*. 이 경우는 $$t_j\ =\ j$$ 가 된다.
     $$
     \begin{align}
     T\left(n\right) \ = & \quad c_1n + c2(n-1) + c_4(n-1) + c5\left(\frac{n(n+1)}{2}-1\right) \\
     &\quad+ \ c_6\left(\frac{n(n-1)}{2}\right) \ + \ c_7\left(\frac{n(n-1)}{2}\right) \ + c_8\left(n-1\right) \\ \\
     = &\quad \left(\frac{c_5}{2} + \frac{c_6}{2} + \frac{c_7}{2}\right)n^2 \ + \ \left(c_1 \ + \ c_2\ +\ c_4\ +\ \frac{c_5}{2} + \frac{c_6}{2} + \frac{c_7}{2} + c_8\right)n \\
     & \quad-\ \left(c_2\ +\ c_4\ +\ c_5\ +\ c_8\right)
     \end{align}
     $$

     - **최악의 경우**는 수행시간을 $$an^2 \ +\ bn \ +\ c$$로 표현 할 수 잇다.

   - 최선의 경우 : $$ax + b$$

   - 최악의 경우 : $$an^2 \ +\ bn \ +\ c$$

     

4. 예제 코드 python

   ```python
   def insertSort(x):
       print(x)
   	for i in range(1, len(x)):
   		j = i - 1
   		key = x[i]
   		while x[j] > key and j >= 0:
   			x[j+1]  = x[j]
   			j = j - 1
   		x[j+1] = key
           print(x)
   	return x
   ```

   

   [^1]: 수행시간이 $c_n$이 걸리며 $n$번 반복 된다면 수행시간은 $c_n\times n$ 이다.
