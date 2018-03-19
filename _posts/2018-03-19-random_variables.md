---
layout: post
title: "1.5 Random Variables"
description: "Random Variables"
date: 2018-03-19
tags: [statistic, mathematical statistics, study]
comments: true
---



## 1.5 Random Variables



#### Definition 1.5.1

A function X is called random variable[^1], if it is assign to each element $$C\in\mathscr{C}$$  one and only one number $$X\left(c\right)\in x$$. The **space** or **range** of X is  $$D=\left\{x:x=X\left(c\right), \ C\in\mathscr{C}\right\}$$.

- The **random variable** is called **discrete** random variable if D is contable sequence.
- The **random variable** is called **continuous** random variable if D is interval of real number.
- Note that the probability function **P** is defined on $$\beta$$. 
- We define a probability function $$p_x$$ defined on F and $$p_x$$ is called **induced probability function**.

> ex 1.5.1) Toss two fair dice.
>
> - X : Sum of up faces
> - $$\mathscr{C} \ : \ \left\{\left(1,1\right),\left(1,2\right),\cdots,\left(6,6\right)\right\}$$ .
> - $$D=\left\{2,3,\cdots,12\right\}$$.
>
> Find the probability of sum 4.
>
> 
> $$
> \begin{aligned}
> 	P\left(\left(1,3\right)\cup\left(2,2\right)\cup\left(3,1\right)\right)\\
> 	= \frac{3}{36} = p_X\left(4\right) = P\left(4\right)
> \end{aligned}
> $$
>





----------------

#### Definition 1.5.2 (Cumulative Distribution Function)



The cdf of random variable X is 



$$
\begin{aligned}
	F_X\left(x\right) = P\left(X\le x\right) =&\ P\left(c: X\left(c\right)\le x\right)\\
	=&\ P_X\left(\left[-\infty, x\right]\right)
\end{aligned}
$$



> Ex 1.5.3)
>
> ​	X: upface of tossing a fair dice.
>
> ​	Find CDF of X
>
> 
>
> Ex 1.5.4)
>
> ​	X: real number chosen at random in (0, 1).
>
> 
> $$
> \begin{aligned}
> 	p_X\left(\left(a, b\right)\right) =& \left(b-a\right)\\ \\ 
> 	F_X\left(x\right) = P\left(X\le x\right)\\
>     = &\ 0,\quad \text{if }x\lt 0\\
> 	=&\ x, \quad \text{if } 0\le x \le 1\\
> 	=&\ 1, \quad \text{if } x\ge 1
>
> \end{aligned}
> $$
> 
>
> 
>
> 







c.f) 

- $$x\leftarrow x_0$$, convergence from the **right**.

- $$x\rightarrow x_0$$, convergence from the **left**.

  $$
  \begin{aligned}
  \\
  	\lim_{x\leftarrow x_0}F\left(x\right)&\ :\text{Righthand side limit}\\
  	\lim_{x\rightarrow x_0}F\left(x\right)&\ :\text{Lefthand side limit}\\
  \end{aligned}
  $$



##### proof.

$$
\begin{aligned}
	\text{1.}&\ \quad F\left(a\right) =\ P\left(X\le a\right), \quad a\lt b,\ \ \forall a,b\\
	&\ \left\{X\le a\right\}\subset \left\{X\le b\right\}, \quad b\gt a\\
	&\Rightarrow P\left(X\le a\right)\le P\left(X\le b\right)\ \ \text{by theorem 1.3.3} \\ \\
	\text{2.}&\ \lim_{x\to -\infty}\left\{X\le x\right\}= \emptyset \\ 
      &\ \lim_{x\to -\infty}P\left(X\le x\right) = P\left(\emptyset\right) = 0 \\ \\
      
      \text{3.}&\  \lim_{n\rightarrow \infty}\left\{X\lt x\right\} = \mathscr{C}\\
	 &\ \lim_{x\to \infty}\left\{X\le x\right\} = P\left(\mathscr{C}\right) = 1
      
\end{aligned}
$$

4) Let $$\left\{X_n\right\}$$ be a sequence st. $$x\leftarrow x_0$$ and let $$C_n=\left\{X\le x_n\right\}$$.
Then $$C_n$$ is decreasing set and $$\bigcap_{n=1}^\infty C_n=\left\{X\le x_0\right\}$$.
$$P\left(\bigcap_{n-1}^{\infty}C_n\right)=P\left(X\le x_0\right)=F(x_0)=\lim_{n\rightarrow\infty}P(C_n)=\lim_{n\rightarrow}F(x_n)$$.



------------

##### Theorem 1.5.2















-------------

[^1]: r.v.