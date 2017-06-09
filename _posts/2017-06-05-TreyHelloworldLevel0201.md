---
layout: post
title: "TryHelloWorld Level 2 (1)"
description: "TryHelloWorld Level 2 "
date: 2017-06-05
tags: [algorithm, python]
comments: true
---

#### 1. 최솟값 만들기

> 자연수로 이루어진 길이가 같은 수열 A,B가 있습니다. 최솟값 만들기는 A, B에서 각각 한 개의 숫자를 뽑아 두 수를 곱한 값을 누적하여 더합니다. 이러한 과정을 수열의 길이만큼 반복하여 최종적으로 누적된 값이 최소가 되도록 만드는 것이 목표입니다.
>
> 예를 들어 A = `[1, 2]` , B = `[3, 4]` 라면
>
> 1. A에서 1, B에서 4를 뽑아 곱하여 더합니다.
> 2. A에서 2, B에서 3을 뽑아 곱하여 더합니다.
>
> 수열의 길이만큼 반복하여 최솟값 **10**을 얻을 수 있으며, 이 **10**이 최솟값이 됩니다.
> 수열 A,B가 주어질 때, 최솟값을 반환해주는 getMinSum 함수를 완성하세요.

```python
def getMinSum(A,B):
    answer = 0
    A.sort();B.sort()
    for x in range(len(A)):
        answer += A[x]*B[-1-x]
    return answer
```

- 처음에 문제가 이해가 잘 안갔었다. 하지만 그냥 안에서 적절한 숫자를 뽑고 곱해서 최소 값을 만드는 문제였다.
- 곱은 한 배열에서 가장 작은 숫자와 다른 배열에서 가장 큰 숫자를 곱했을 때 숫치가 가장 작다는 것을 알아야 한다.
- `zip`이나 `reverse`등을 이용하여 문제를 풀 수도 있다.
  <br><br>

#### 2. 2016년

> 2016년 1월 1일은 금요일입니다. 2016년 A월 B일은 무슨 요일일까요? 두 수 A,B를 입력받아 A월 B일이 무슨 요일인지 출력하는 getDayName 함수를 완성하세요. 요일의 이름은 일요일부터 토요일까지 각각
>
> `SUN,MON,TUE,WED,THU,FRI,SAT`
>
> 를 출력해주면 됩니다. 예를 들어 A=5, B=24가 입력된다면 5월 24일은 화요일이므로 `TUE`를 반환하면 됩니다.

```python
def getDayName(a,b):
    days = [31, 29, 31, 30, 31, 30,
            31, 31, 30, 31, 30, 31,]
    day = ["FRI", "SAT", "SUN", "MON", "TUE", "WED", "THU",]
    # 2016/1/1 is FRI
    return day[(sum(days[:a-1])+b-1)%7]
```

- 역시나 알고리즘초반의 단골 문제인 달력.
- 1월 1일을 기준으로 모든 날의 수를 구한 다음 7로 나눈 나머지 값을 요일에 대입한다.

```python
def getDayName(a,b):
    return "FSSMTWTRAUOUEHITNNEDU"[([5,3,0,5,2,6,4,1,6,3,2,6][-a]+b)%7::7]
```

- 조금 응용해보았다.
- 각 요일들을 문자열로 나눈다.
  0번째부터 6번째까지는 각 요일의 첫 문자를 할당한다음 7단위로 한글자씩 넣어준다.
  - 그리고 안쪽 리스트에는 시작 요일를 숫자화하여 월의 역순으로 넣어주고 (역순의 이유는 정순일 	경우 1월이 0번째에 있으니까.. indexing의 편의를 위해서)
  - 월을 이용하여 그 달의 시작 요일의 숫자를 구한 다음 일을 더해준다.
  - 그 더해진 숫자에 reminder연산자를 이용하여 나머지로 요일을 구하고
  - 아까 요일을 문자열로 만든 것을 슬라이싱의 step을 이용하여 요일을 구한다!

<br><br>

#### 3. 행렬의 곱셈

> 행렬의 곱셈은, 곱하려는 두 행렬의 어떤 행과 열을 기준으로, 좌측의 행렬은 해당되는 행, 우측의 행렬은 해당되는 열을 순서대로 곱한 값을 더한 값이 들어갑니다. 행렬을 곱하기 위해선 좌측 행렬의 열의 개수와 우측 행렬의 행의 개수가 같아야 합니다. 곱할 수 있는 두 행렬 A,B가 주어질 때, 행렬을 곱한 값을 출력하는 productMatrix 함수를 완성해 보세요.

```python
def productMatrix(A, B):
    result= [[0 for x in range(len(B[y]))] for y in range(len(A))]
    print(result)
    for y in range(len(A)):
        for x in range(len(B[y])):
            for xx in range(len(B[y])):
                result[y][x] += A[y][xx]*B[xx][x]
    return result
```

- 앞의 식의 한 행과 뒤의 식의 한 열을 다 곱해서 더하는 식으로 풀었다.
- 행렬의 곱은 뒤에 행렬 곱의 최적화때 다시 한번 봐봐야 겠다.
  <br><br>

#### 4. JadenCase문자열 만들기

> Jaden_Case함수는 문자열 s을 매개변수로 입력받습니다.
> s에 모든 단어의 첫 알파벳이 대문자이고, 그 외의 알파벳은 소문자인 문자열을 리턴하도록 함수를 완성하세요
> 예를들어 s가 "3people unFollowed me for the last week"라면 "3people Unfollowed Me For The Last Week"를 리턴하면 됩니다.

```python
def Jaden_Case(s):
    s.lower()
    return s.title()
```

- 위 처럼 간단하게 풀어서 통과는 했으나 자세히 보니 답이 살짝 틀려있었다.(근데 통과시키다니 채점이 너무 허술한거 아닌가..)

- "3people Unfollowed Me For The Last Week" 이 문장이 정답인데

  "3People Unfollowed Me For The Last Week" 라고 숫자 뒤에 글자가 대문자인데 통과가 되었다.

- 그래서 아래의 코드처럼 다시 만들었다


```python
def Jaden_Case(s):
    s=s.lower().split()
    r = []
    for ss in s:
        r.append(ss[0].upper() + ss[1:])
    return " ".join(r)
```

<br><br>

#### 5. 하샤드 수

> 양의 정수 x가 하샤드 수이려면 x의 자릿수의 합으로 x가 나누어져야 합니다. 예를들어 18의 자릿수 합은 1+8=9이고, 18은 9로 나누어 떨어지므로 18은 하샤드 수입니다.
>
> Harshad함수는 양의 정수 n을 매개변수로 입력받습니다. 이 n이 하샤드수인지 아닌지 판단하는 함수를 완성하세요.
> 예를들어 n이 10, 12, 18이면 True를 리턴 11, 13이면 False를 리턴하면 됩니다.

```python
def Harshad(n):
    from functools import reduce
    # n은 하샤드 수 인가요?
    return False if n%reduce(lambda x,y:int(x)+int(y), str(n), 0) else True
```

- 문제 자체는 어렵지 않다.
- 우선 숫자를 각 자리수로 나눈 후, 그 자릿수의 합을 구한다.
- 그리고 원래의 숫자를 `%`연산자를 사용하여 값이 0이면 True아니면 False를 return한다.
- reduce를 안쓰고 sum을 쓰면 되지만 굳이 lambda로 사용해 보았다.
















