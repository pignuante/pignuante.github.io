---
layout: post
title: "Probability & Distribution (1)"
description: "Introduction, Set Theory"
date: 2018-03-10
tags: [statistic, mathematical statistics, study]
author-id: pignu
comments: true
---



# 1. Probability & Distribution



## 1.1 Introduction

#### Definition

1. Statistical(*random*) experiment.
   - The outcome can not be predicted with certainly prior to the performance of experiment.
2. Sample space.
   - Collection of every possible outcome from the random[^1] experiment and denoted $$\mathscr{C}$$.
3. Event.
   - Subset of `Sample space` and denoted by A, B, C$$\cdots$$.

> ex 1.1) Consider tossing a coin, then $$\mathscr{C}=\left\{\text{H, T}\right\}$$.
>
> ex 1.2) Consider tossing two dice(one red, the other white), then $$\mathscr{C}=\left\{\left(1, 1\right)\cdots\left(6,6\right)\right\}$$
>
> ex 1.3) Consider sum seven when tossing two dice, then $$\mathscr{C}=\left\{\left(1, 6\right), \left(2, 5\right), \cdots \left(6, 1\right)\right\}$$
>



#### Remark 1.1

Two types of probability.

1. Relative Frequency[^2].
2. Personal[^3].

--------------------------------------------------------



## 1.2 Set Theory

#### Definition 1.2.1

- If each element of set $$C_1$$ is also an element of set $$C_2$$, then $$C_1$$ is called **subset** of $$C_2$$, and denoted by $$C_1\subset C_2$$.

#### Definition 1.2.2

- If a set $$C$$ has no elements, tehn $$C$$ is called the **NULL**(empty) set, and denoted by $$C=\varnothing$$.

#### Definition 1.2.3

- The set of all elements that belong to at least $$C_1$$ or $$C_2$$ is called the **union** of $$C_1$$ and $$C_2$$, and denoted by $$C_1\cup C_2$$.
- It can be generalized to any number of sets $$C_1\cup C_2 \cup \cdots : =\bigcup_{k=1}^\infty C_k$$

> ex 1.2.7) 
>
> 
> $$
> \begin{aligned}
> 	C_k = & \left\{x:\frac{1}{k+1}\le x\le1\right\},\quad k=1,2,3,\cdots \\
> 	\Rightarrow	& \bigcup_{k=1}^{\infty}C_k = \left\{x: 0 \lt x\le 1\right\}
> \end{aligned}
> $$
>

#### Definition 1.2.4

- The set of all elements that belong to each of  $$C_1$$ and $$C_2$$ is called the **intersection** of $$C_1$$ and $$C_2$$, and denoted by $$C_1\cap C_2$$.
- It can be generalized to any number of sets $$C_1\cap C_2 \cap \cdots := \bigcap_{k=1}^\infty C_k$$

> ex 1.2.11)
>
> 
> $$
> \begin{aligned}
> 	C_k = & \left\{x:0\lt x\lt \frac{1}{k}\right\} \\
> 	\Rightarrow & \bigcap_{k=1}^{\infty}C_k = \varnothing
> \end{aligned}
> $$
>

#### Definition 1.2.6

- Let $$C \subset \mathscr{C}$$, then the set that consists of all element of $$\mathscr{C}$$, that are not elements of $$C$$ is called the **complements** of $$C$$, and denoted by $$C^c, \overline{C}$$.

![statistic1.1](http://pignuante.github.io/assets/images/statistic/1/statistic1.1.png)

A **function** is called point or set function. Its domain is point or set respectively.

![statistic1](https://pignu.kr/assets/images/statistic/1/statistic1.png)

하단의 수식이 렌더링이 되질 않아서... 스크린샷도 첨부.

> ex 1.2.24)
>
> 
> $$
> \begin{aligned}
> 	Q\left(c\right)=\underbrace{\int\cdots\int_{0}^{x_2}}_{\text{n times folded}} d_{x1}d_{x2}\cdots dx_n \\
> \end{aligned}
> $$
> 
>
> if
>
>  
> $$
> \begin{aligned}
> 	C=\left\{\left(x_1, x_2,\dots, x_n\right): 0\le x_1\le x_2 \le \cdots\le x_n \le 1\right\}
> \end{aligned}
> $$
> then
>
> 
> $$
> \begin{aligned}
> 	Q\left(C\right) =& \int_0^1\int_0^{x_n}\cdots\int_0^{x_3}\int_0^{x_2}dx_1dx_2\cdots dx_{n-1}dx_n \\
> 	= & \frac{1}{n!},
> \end{aligned}
> $$
>



---------------------------------------



[^1]: unbiased
[^2]: Objective
[^3]: Subjective

