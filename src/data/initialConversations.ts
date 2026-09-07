import { Conversation } from '../types';

const now = Date.now();
const oneHourAgo = now - 1000 * 60 * 60;
const yesterday = now - 1000 * 60 * 60 * 26;
const threeDaysAgo = now - 1000 * 60 * 60 * 75;
const fiveDaysAgo = now - 1000 * 60 * 60 * 120;

export const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-react-state',
    title: 'React 19 Hooks & Server Actions',
    createdAt: oneHourAgo,
    updatedAt: now,
    modelId: 'gpt-4o',
    messages: [
      {
        id: 'msg-1',
        role: 'user',
        content: 'Can you show me how to write an efficient custom hook in React with TypeScript, and summarize key best practices?',
        timestamp: oneHourAgo
      },
      {
        id: 'msg-2',
        role: 'assistant',
        content: `Here is a modern, type-safe custom hook for **debounced state** in React:

\`\`\`typescript
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
\`\`\`

### Key Best Practices

1. **Keep dependencies clean**: Always clear timers, subscriptions, or abort controllers in cleanup functions.
2. **Stable references**: Avoid re-instantiating object references in dependency arrays.
3. **Graceful fallbacks**: Provide typed defaults for optional parameters.

| Hook Type | Primary Purpose | When to Use |
| :--- | :--- | :--- |
| \`useDebounce\` | Limit high-frequency events | Search bars, auto-saving |
| \`usePrevious\` | Track prior render value | Comparative state animations |
| \`useLocalStorage\` | Sync reactive state with storage | User preferences, theme flags |

Let me know if you would like me to expand on any specific pattern!`,
        timestamp: oneHourAgo + 1000 * 12
      }
    ]
  },
  {
    id: 'conv-python-fastapi',
    title: 'FastAPI vs Express Benchmark',
    createdAt: yesterday - 1000 * 60 * 60 * 3,
    updatedAt: yesterday,
    modelId: 'claude-3-7-sonnet',
    messages: [
      {
        id: 'msg-3',
        role: 'user',
        content: 'How do FastAPI and Express compare for building lightweight microservices?',
        timestamp: yesterday - 1000 * 60 * 60 * 3
      },
      {
        id: 'msg-4',
        role: 'assistant',
        content: `Both **FastAPI** (Python) and **Express** (Node.js) are standout choices for web microservices. Here is how they compare across key dimensions:

### Performance & Architectural Comparison

* **Type Safety & Validation**:
  * **FastAPI**: First-class Pydantic validation and automatic OpenAPI (Swagger) schema generation.
  * **Express**: Unopinionated; requires third-party libraries like Zod or Joi.
* **Async Engine**:
  * **FastAPI**: Python \`asyncio\` backed by Starlette / Uvicorn.
  * **Express**: Node.js event loop with V8 engine.

\`\`\`python
# FastAPI Example
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="Microservice API")

class Item(BaseModel):
    name: str
    price: float
    is_offer: bool = False

@app.post("/items/")
async def create_item(item: Item):
    return {"status": "created", "item": item}
\`\`\`

Feel free to ask if you want help setting up Docker containers or rate limiting!`,
        timestamp: yesterday
      }
    ]
  },
  {
    id: 'conv-tailwind-tips',
    title: 'Tailwind CSS Grid vs Flexbox',
    createdAt: threeDaysAgo,
    updatedAt: threeDaysAgo + 1000 * 60 * 20,
    modelId: 'gemini-2-5-flash',
    messages: [
      {
        id: 'msg-5',
        role: 'user',
        content: 'When should I choose CSS Grid over Flexbox in modern responsive design?',
        timestamp: threeDaysAgo
      },
      {
        id: 'msg-6',
        role: 'assistant',
        content: `A simple rule of thumb:

* **Flexbox** is **1-Dimensional** (Row *or* Column). Best for navbars, pill clusters, input groups, and align-center utilities.
* **Grid** is **2-Dimensional** (Rows *and* Columns simultaneously). Best for dashboards, bento cards, responsive photo galleries, and page layouts.

Both can be composed together for exceptional responsive layouts!`,
        timestamp: threeDaysAgo + 1000 * 60 * 5
      }
    ]
  },
  {
    id: 'conv-database-indexing',
    title: 'PostgreSQL Indexing Strategies',
    createdAt: fiveDaysAgo,
    updatedAt: fiveDaysAgo + 1000 * 60 * 15,
    modelId: 'gemini-2-5-pro',
    messages: [
      {
        id: 'msg-7',
        role: 'user',
        content: 'What are the main index types in Postgres and when should I use B-tree vs GIN?',
        timestamp: fiveDaysAgo
      },
      {
        id: 'msg-8',
        role: 'assistant',
        content: `In PostgreSQL, choosing the right index structure is critical for low-latency queries:

- **B-Tree** (Default): Ideal for equality (\`=\`) and range queries (\`<\`, \`>\`, \`BETWEEN\`).
- **GIN** (Generalized Inverted Index): Best for composite items such as **JSONB**, array containment (\`@>\`), and full-text search.
- **BRIN** (Block Range Index): Optimal for massive append-only timeseries logs ordered by timestamp.`,
        timestamp: fiveDaysAgo + 1000 * 60 * 8
      }
    ]
  }
];
