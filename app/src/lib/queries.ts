import { gql, type TypedDocumentNode } from '@apollo/client';
import type { Category } from '@/src/theme';

export interface Place {
  id: string;
  name: string;
  category: Category;
  latitude: number;
  longitude: number;
  description: string;
  imageUrl: string | null;
  imageCredit: string | null;
  visited: boolean;
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  total: number;
  visitedCount: number;
  places: Pick<Place, 'id' | 'name' | 'category' | 'visited' | 'imageUrl'>[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
}

const PLACE_FIELDS = gql`
  fragment PlaceFields on Place {
    id
    name
    category
    latitude
    longitude
    description
    imageUrl
    imageCredit
    visited
  }
`;

export const PLACES: TypedDocumentNode<{ places: Place[] }> = gql`
  ${PLACE_FIELDS}
  query Places {
    places {
      ...PlaceFields
    }
  }
`;

export const PLACE: TypedDocumentNode<{ place: Place | null }, { id: string }> = gql`
  ${PLACE_FIELDS}
  query Place($id: ID!) {
    place(id: $id) {
      ...PlaceFields
    }
  }
`;

const COLLECTION_FIELDS = gql`
  fragment CollectionFields on Collection {
    id
    name
    description
    total
    visitedCount
    places {
      id
      name
      category
      visited
      imageUrl
    }
  }
`;

export const COLLECTIONS: TypedDocumentNode<{ collections: Collection[] }> = gql`
  ${COLLECTION_FIELDS}
  query Collections {
    collections {
      ...CollectionFields
    }
  }
`;

export const COLLECTION: TypedDocumentNode<{ collection: Collection | null }, { id: string }> = gql`
  ${COLLECTION_FIELDS}
  query Collection($id: ID!) {
    collection(id: $id) {
      ...CollectionFields
    }
  }
`;

export const ME: TypedDocumentNode<{
  me: {
    visitedCount: number;
    totalPlaces: number;
    visits: { visitedAt: string; place: Pick<Place, 'id' | 'name' | 'category'> }[];
    achievements: Achievement[];
  };
  places: Pick<Place, 'id' | 'name' | 'category' | 'visited'>[];
}> = gql`
  query Me {
    me {
      visitedCount
      totalPlaces
      visits {
        visitedAt
        place {
          id
          name
          category
        }
      }
      achievements {
        id
        title
        description
        unlocked
      }
    }
    places {
      id
      name
      category
      visited
    }
  }
`;

export const CHECK_IN: TypedDocumentNode<
  {
    checkIn: {
      ok: boolean;
      message: string;
      distanceMeters: number;
      place: Pick<Place, 'id' | 'visited'>;
      newAchievements: Achievement[];
    };
  },
  { placeId: string; latitude: number; longitude: number }
> = gql`
  mutation CheckIn($placeId: ID!, $latitude: Float!, $longitude: Float!) {
    checkIn(placeId: $placeId, latitude: $latitude, longitude: $longitude) {
      ok
      message
      distanceMeters
      place {
        id
        visited
      }
      newAchievements {
        id
        title
        description
        unlocked
      }
    }
  }
`;
