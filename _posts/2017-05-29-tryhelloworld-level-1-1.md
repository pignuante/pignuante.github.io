---
layout: post
title: "TryHelloWorld Level-1 (1)"
description: "tryhelloworld 알고리즘 level1"
date: 2017-05-29
tags: [algorithm, python]
comments: true
---



#### 1. x만큼 간격이 있는 n개의 숫자

> number_generator함수는 x와 n을 입력 받습니다.
> 2와 5를 입력 받으면 2부터 시작해서 2씩 증가하는 숫자를 5개 가지는 리스트를 만들어서 리턴합니다.
> [2,4,6,8,10]

 ```python
def number_generator(x, n):
    return [y*x for y in range(1, n+1)]
 ```

- 첫 문제 답게 간단하게 풀 수 있다. <br>



### # 2. 핸드폰번호 가리기.

> 별이는 헬로월드텔레콤에서 고지서를 보내는 일을 하고 있습니다. 개인정보 보호를 위해 고객들의 전화번호는 맨 뒷자리 4자리를 제외한 나머지를 `"*"`으로 바꿔야 합니다.
> 전화번호를 문자열 s로 입력받는 hide_numbers함수를 완성해 별이를 도와주세요
> 예를들어 s가 `"01033334444"`면 `"*******4444"`를 리턴하고, `"027778888"`인 경우는 `"*****8888"`을 리턴하면 됩니다.

```python
def hide_numbers(s):
    return s.replace(s[:-4:], "*"*(len(s)-4))
```

- 이 문제의 경우 input이 2종류로 갈린다.
  1. 핸드폰 번호의 패턴.
  2. 일반전화의 패턴.
- 아무 생각없이 앞에서 부터 갯수를 카운트했다간 괜시리 코드만 길어질수가 있다.
- 슬라이싱을 이용하여 시작지점부터 끝에서 5번째까지만 자르고, `replace()`함수로 앞부분의 길이만큼 대치해준다.<br>

#### 3. 평균 구하기

> def average(list):
> 함수를 완성해서 매개변수 list의 평균값을 return하도록 만들어 보세요.
> 어떠한 크기의 list가 와도 평균값을 구할 수 있어야 합니다.

```python
def average(list):
    return sum(list)/len(list)
```

- 파이썬에서 제공해주는 내장함수인 `sum`과 `len`을 이용하면 쉽게 구할 수 있는 문제이다.<br>



#### 4. 짝수와 홀수

> evenOrOdd 메소드는 int형 num을 매개변수로 받습니다.
> num이 짝수일 경우 "Even"을 반환하고 홀수인 경우 "Odd"를 반환하도록 evenOrOdd에 코드를 작성해 보세요.
> num은 0이상의 정수이며, num이 음수인 경우는 없습니다.

```python
def evenOrOdd(num):
    return "Odd" if num & 1 else "Even"
```

- 이 것 역시 심플하게 삼항연산자를 활용하여서 풀 수 있다.
- 개인적으로 홀짝을 구할때 `num %2 == 0`이런 식도 좋긴 하지만, 약간이라도 속도에서 이득을 볼 수 있게 비트연산자를 활용하여 `num & 1`하는 방식이 더욱 맘에 든다.

```python
def evenOrOdd(num):
    return num % 2 and "Odd" or "Even"
```

- 남의 코드를 보다가 매우 마음에 드는 방식이 있어서 하나 저장해둔다.<br>



#### 5. 제일 작은 수 제거하기

> rm_small함수는 list타입 변수 mylist을 매개변수로 입력받습니다.
> mylist 에서 가장 작은 수를 제거한 리스트를 리턴하고, mylist의 원소가 1개 이하인 경우는 []를 리턴하는 함수를 완성하세요.
> 예를들어 mylist가 [4,3,2,1]인 경우는 [4,3,2]를 리턴 하고, [10, 8, 22]면 [10, 22]를 리턴 합니다.

```python
def rm_small(mylist):
    mylist.remove(min(mylist))
    return mylist
```

- 딱히 알고리즘을 만들필요도 없이 파이썬의 내장함수로 모든것을 처리하였다.<br>



#### 6. 정수제곱근 판별하기

> nextSqaure함수는 정수 n을 매개변수로 입력받습니다.
> n이 임의의 정수 x의 제곱이라면 x+1의 제곱을 리턴하고, n이 임의의 정수 x의 제곱이 아니라면 'no'을 리턴하는 함수를 완성하세요.
> 예를들어 n이 121이라면 이는 정수 11의 제곱이므로 (11+1)의 제곱인 144를 리턴하고, 3이라면 'no'을 리턴하면 됩니다

```python
def nextSquare(n):
    t = int(pow(n, 0.5))
    return (t+1)**2 if t**2==n else "no"
```

- 제곱근을 구하는 여러가지 함수가 있는데 

  1. `n ** 0.5`
  2. `pow(n, 0.5)`
  3. `math.sqrt(n)`

  이 3가지 중에서 굳이 import는 하지 않고 뭔가 전용함수같은 느낌이 나는 것을 선택하였다. <br>



#### 7. 자릿수 더하기

> sum_digit함수는 자연수를 전달 받아서 숫자의 각 자릿수의 합을 구해서 return합니다.
> 예를들어 number = 123이면 1 + 2 + 3 = 6을 return하면 됩니다.
> sum_digit함수를 완성해보세요.

```python
def sum_digit(number):
    from functools import reduce
    return reduce(lambda x,y: x+y, map(int, str(number)), 0)
```

- 괜히 lambda와 reduce함수를 사용해서 풀어보았다.<br>



#### 8. 스트링을 숫자로 바꾸기

> strToInt 메소드는 String형 str을 매개변수로 받습니다.
> str을 숫자로 변환한 결과를 반환하도록 strToInt를 완성하세요.
> 예를들어 str이 "1234"이면 1234를 반환하고, "-1234"이면 -1234를 반환하면 됩니다.
> str은 부호(+,-)와 숫자로만 구성되어 있고, 잘못된 값이 입력되는 경우는 없습니다

```python
def strToInt(str):
    return int(str)
```

- 파이썬의 강력함이 들어나는 문제인 것 같다.<br>



#### 9. 수박수박수박수박수박수?

> water_melon함수는 정수 n을 매개변수로 입력받습니다.
> 길이가 n이고, 수박수박수...와 같은 패턴을 유지하는 문자열을 리턴하도록 함수를 완성하세요.
>
> 예를들어 n이 4이면 '수박수박'을 리턴하고 3이라면 '수박수'를 리턴하면 됩니다.

```python
def water_melon(n):
    s = "수박"
    return s*(n//2)+s[0]*(n&1)
```

- 짝수만큼 반복을 한 후, 홀수가 있으면 "수" 한 글자만 추가하도록 하였다.

```python
def water_melon(n):
    s = "수박" * n
    return s[:n]
```

- 다른 사람이 한 방식. 깔끔하다.<br>



#### 10. 서울에서 김서방찾기

> findKim 함수(메소드)는 String형 배열 seoul을 매개변수로 받습니다.
>
> seoul의 element중 "Kim"의 위치 x를 찾아, "김서방은 x에 있다"는 String을 반환하세요.
> seoul에 "Kim"은 오직 한 번만 나타나며 잘못된 값이 입력되는 경우는 없습니다.

```python
def findKim(seoul):
    return "김서방은 {}에 있다".format(seoul.index("Kim"))
```

- python으로 할 경우, 별 생각없이 풀 수 있는 문제.

























