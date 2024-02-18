# Emitter.js
sample:
```javascript
// Create an Emitter instance
const emitter = new Emitter();

// Define event handler
function handleEvent(arg) {
  console.log('Event handled:', arg);
}

// Add event listener
emitter.on('exampleEvent', handleEvent);

// Emit event
emitter.emit('exampleEvent', 'Hello, World!');

// Remove event listener
emitter.off('exampleEvent', handleEvent);

```
