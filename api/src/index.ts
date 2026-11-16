import { createServer } from 'node:http';
import { createYoga } from 'graphql-yoga';
import { schema, type Context } from './schema.js';

const yoga = createYoga<{}, Context>({
  schema,
  graphqlEndpoint: '/graphql',
  context: ({ request }) => ({ deviceId: request.headers.get('x-device-id') }),
  cors: { origin: '*', allowedHeaders: ['content-type', 'x-device-id'] },
});

const port = Number(process.env.PORT ?? 4000);
createServer(yoga).listen(port, () => {
  console.log(`API em http://localhost:${port}/graphql`);
});
