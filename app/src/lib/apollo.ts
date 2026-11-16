import { ApolloClient, ApolloLink, HttpLink, InMemoryCache } from '@apollo/client';
import { SetContextLink } from '@apollo/client/link/context';
import { getDeviceId } from './deviceId';

export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4000/graphql';

const deviceLink = new SetContextLink(async (prevContext) => ({
  headers: { ...prevContext.headers, 'x-device-id': await getDeviceId() },
}));

export const client = new ApolloClient({
  link: ApolloLink.from([deviceLink, new HttpLink({ uri: API_URL })]),
  cache: new InMemoryCache(),
  defaultOptions: { watchQuery: { fetchPolicy: 'cache-and-network' } },
});
