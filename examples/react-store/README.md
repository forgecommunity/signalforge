# SignalForge React Store Example

This example shows the recommended React pattern:

- Keep app state in a `createStore` instance.
- Read narrow slices with `useStoreSelector`.
- Use `batch` for multi-field updates.
- Use `useComputed` for component-local derived values.

```bash
npm install
npm run dev
```

