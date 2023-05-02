# 1 - Function composition

## Intro 
In this lesson you'll learn some techniques to combine small functions together to create more complex ones. This should help you decompose your program into smaller building blocks with clear responsibility. Also, after this lesson you will know how and when to use two of the `fp-ts` function combinators: `flow` and `pipe`.

## Decomposition
When writing software we often think about the problem at hand as a one big chunk. Functions we write this way are complex, i.e. they do a lot of different things often not related to each other. While it's certeinly easier to write software this way it makes it harder to debug and analyse later on.

Here's an example of an overly complex function:

```typescript
const getNamesOfAllAdultUsers = (db: DB): string[] => {
    const allUsers: User[] = db.query("SELECT name, age FROM users")
    const adultUsers: User[] = allUsers.filter(user => user.age >= 18)
    return adultUsers.map(user => user.name)
} 
```

A nice, 3 line function, what's wrong with it? The problem is the function combines a lot of responsibilities:
- it knows how to query users from DB
- it knows what it means to be an adult
- it knows how to get user name
- it knows the whole flow

So, with the 4 responsibilities identified, let's try to split it into smaller parts:

```typescript
const findAllUsers = (db: DB): User[] => 
    db.query("SELECT name, age FROM users")
const isUserAdult = (user: User): boolean =>
    user => user.age >= 18
const getUserName = (user: User): string => 
    user.name

const getNamesOfAllAdultUsers = (db: DB): string[] => {
    const allUsers: User[] = findAllUsers(db)
    const adultUsers: User[] = allUsers.filter(isUserAdult)
    return adultUsers.map(getUserName)
} 
```

Now, the `getNamesOfAllAdultUsers` knows about one thing: how to get user names, having a DB client, but doesn't care about all the details and business rules. 

## Pipe

Let's see the `getNamesOfAllAdultUsers` again:

```typescript
const getNamesOfAllAdultUsers = (db: DB): string[] => {
    const allUsers: User[] = findAllUsers(db)
    const adultUsers: User[] = allUsers.filter(isUserAdult)
    return adultUsers.map(getUserName)
}
```

Have you noticed that each variable (`db`, `allUSers`, `adultUsers`) is used only once, always in the next line? Looks like the variables are only cluttering the view. We may be tempted to inline this and write something like the following:

```typescript
const getNamesOfAllAdultUsers = (db: DB): string[] => 
    findAllUsers(db).filter(isUserAdult).map(getUserName)
```

JavaScript standard library makes extensive use of chaining and fluent APIs. It's really great at first glance, but has one big limitation: it's based on methods. This means that the implementation of `filter` function comes from `findAllUsers` and our code that uses it has no control over it. What if `findAllUsers` API changes and it returns a Promise or something entirely different? There's a better way to do it. Let's meet `pipe`.

`pipe` is a utility function that helps chaining functions in a more functional way. It takes result of one function and passes it as an argument to the next one. The concept is very popular in many programming languages (ex. `|` in bash, `|>` in Elixir). The signature looks more less like this:

```typescript
declare const pipe: (init: A, fab: (a: A) => B, fbc: (b: B) => C, fcd: (c: C) => D) => D
```

The above is an example for 3 functions, but pipe has overrides for 1-19 functions.

Let's see how we can use it to improve our `getNamesOfAllAdultUsers` function. First we start with a pipe.

```typescript
import { pipe } from 'fp-ts/function'

const getNamesOfAllAdultUsers = (db: DB): string[] => pipe(...)
```

Next we need to call `findAllUsers` with an initial argument:

```typescript
const getNamesOfAllAdultUsers = (db: DB): string[] => pipe(
    db,
    findAllUsers,
)
```

Then we can use `filter` adult users and get their names:

```typescript
const getNamesOfAllAdultUsers = (db: DB): string[] => pipe(
    db,
    findAllUsers,
    users => users.filter(isUserAdult),
    users => users.map(getUserName)
)
```

Some important things to notice here:
- name `users` appears twice, but because it's an argument of two independent function names, the usages don't clash.
- the fluent API exposed by Array is not well-suited for use in pipes. Later you'll learn about `array` module that helps with it.

## Flow

Let's see our function again:
```typescript
const getNamesOfAllAdultUsers = (db: DB): string[] => pipe(
    db,
    findAllUsers,
    users => users.filter(isUserAdult),
    users => users.map(getUserName)
)
```

Have you noticed that the `db` argument is used only once, as initial argment? In such cases we may simplify the code even further by using `flow`. 

`flow` is a counterpart of `pipe`. It does not require an initial argument and returns a function instead. Let's see the signature for 3 functions compared to pipe:


```typescript
declare const pipe: (init: A, fab: (a: A) => B, fbc: (b: B) => C, fcd: (c: C) => D) => D
declare const flow: (fab: (a: A) => B, fbc: (b: B) => C, fcd: (c: C) => D) => (a: A) => D
```

While `pipe` requires an init argument and then calls the functions in order, `flow` simply "glues" the functions together. The result of `flow` is a function that recives same argument as the first function in the list and returns the result of the last function in the list. Let's see an example:

```typescript
const addTwo = (x: number): number => x + 2
const timesTwo = (x: number): number => x * 2

const addTwoThenTimesTwo: (x: number) => number = flow(addTwo, timesTwo)

console.log(addTwoThenTimesTwo(2)); # 8
console.log(addTwoThenTimesTwo(3)); # 10
```

How would our `getNamesOfAllAdultUsers` look like with `flow`?

```typescript
import { flow } from 'fp-ts/function'

const getNamesOfAllAdultUsers = flow(
    findAllUsers,
    users => users.filter(isUserAdult),
    users => users.map(getUserName)
)
```

Looks a bit better, but more importantly our function no longer needs to know what are the arguments to `findAllUsers`! That means one responsibility less.

## Questions

Here are some extra questions to consider. If you're not able to answer them don't worry, they will be explained later in the excercies.

- `getNamesOfAllAdultUsers` has one more dependency to types that could be extracted. Can you find it? 

## Excercies

...