# @shramigo/contracts

Shared TypeScript domain interfaces and schemas for the ShramiGo monorepo.

## Usage in Apps

In `apps/frontend` or any future workspace package:
```json
"dependencies": {
  "@shramigo/contracts": "workspace:*"
}
```

Importing contracts:
```ts
import type { Booking, Customer, Service, Worker } from "@shramigo/contracts";
```
