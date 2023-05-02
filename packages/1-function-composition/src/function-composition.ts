import { pipe } from "fp-ts/lib/function"

type User = {
    id: string
    name: string
}

type NameAndSurname = {
    name: string
    surname: string
}

declare const findUserById: (id: string) => User
declare const getUserName: (user: User) => string
declare const convertNameToNameAndSurname: (name: string) => NameAndSurname

pipe