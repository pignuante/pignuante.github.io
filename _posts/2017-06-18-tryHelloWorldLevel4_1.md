---
layout: post
title: "TryHelloWorld Level4 (1)"
description: "TryHelloWorld Level4 (1)"
date: 2017-06-18
tags: [algorithm, python]
comments: true
---



#### 01. 가장 큰 정사각형 찾기

> O와 X로 채워진 표가 있습니다. 표 1칸은 1 x 1 의 정사각형으로 이루어져 있습니다. 표에서 O로 이루어진 가장 큰 정사각형을 찾아 넓이를 반환하는 findLargestSquare 함수를 완성하세요. 예를 들어
>
> | 1    | 2    | 3    | 4    | 5    |
> | ---- | ---- | ---- | ---- | ---- |
> | X    | O    | O    | O    | X    |
> | X    | O    | O    | O    | O    |
> | X    | X    | O    | O    | O    |
> | X    | X    | O    | O    | O    |
> | X    | X    | X    | X    | X    |
>
> 가 있다면 정답은
>
> | 1    | 2    | 3    | 4    | 5    |
> | ---- | ---- | ---- | ---- | ---- |
> | X    | O    | O    | O    | X    |
> | X    | O    | `O`  | `O`  | `O`  |
> | X    | X    | `O`  | `O`  | `O`  |
> | X    | X    | `O`  | `O`  | `O`  |
> | X    | X    | X    | X    | X    |
>
> 가 되며 넓이는 9가 되므로 9를 반환해 주면 됩니다.

```python
def findLargestSquare(board):
    answer = 1
#     board = list(map(lambda y: list(map(lambda x: 1 if x == "O" else 0, y)), board))
    board = [[1 if x=="O" else 0 for x in y] for y in board]
    results = [[0 for x in range(len(board[0]))] for y in range(len(board))]
    results[0] = board[0]
    for y in range(len(board)):
        results[y][0] = board[y][0]
    for y in range(1, len(board)):
        for x in range(1, len(board[y])):
            if board[y][x] == 1:
                results[y][x] = min(results[y-1][x], 
                                    results[y-1][x-1], 
                                    results[y][x-1]) + 1
                if results[y][x] > answer:
                    answer = results[y][x]
    
    return answer ** 2
```

- 기본 알고리즘은 좌에서 부터 우로 탐색해 나가면서 지금 노드의 **좌단**, **좌상단**, **상단**의 크기 중 작은 것에 **+1**을 해준다. `min( r[y-][x], r[y-1][x-1], r[y][x-1] )`
  - 이렇게 하면 지금의 내 위치에 있는 숫자가 내 위치로부터 좌측까지의 정사각형의 크기가 된다.
- y축과 x축의 0번째 인덱스에서는 자신의 상단과 좌단의 크기에 접근하려면 오류가 발생하므로 각각 한줄씩 추가해 준다.

<br><br>

































