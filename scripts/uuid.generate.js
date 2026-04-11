import { v7 as uuidv7 } from 'uuid'

console.log(Array.from({ length: 10 }).map(() => uuidv7()))
