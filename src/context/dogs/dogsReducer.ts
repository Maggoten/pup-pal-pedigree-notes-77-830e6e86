
import { Dog, HeatRecord } from '@/types/dogs';

export type DogsState = {
  dogs: Dog[];
  loading: boolean;
  error: string | null;
  activeDog: Dog | null;
  heatRecords: HeatRecord[];
};

export type DogsAction =
  | { type: 'SET_DOGS'; payload: Dog[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_ACTIVE_DOG'; payload: Dog | null }
  | { type: 'ADD_DOG'; payload: Dog }
  | { type: 'UPDATE_DOG'; payload: { id: string; dog: Dog } }
  | { type: 'REMOVE_DOG'; payload: string }
  | { type: 'SET_HEAT_RECORDS'; payload: HeatRecord[] };

export const initialDogsState: DogsState = {
  dogs: [],
  loading: true,
  error: null,
  activeDog: null,
  heatRecords: [],
};

export const dogsReducer = (state: DogsState, action: DogsAction): DogsState => {
  switch (action.type) {
    case 'SET_DOGS':
      return { ...state, dogs: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_ACTIVE_DOG':
      return { ...state, activeDog: action.payload };
    case 'ADD_DOG':
      return { ...state, dogs: [...state.dogs, action.payload] };
    case 'UPDATE_DOG':
      return {
        ...state,
        dogs: state.dogs.map(dog => 
          dog.id === action.payload.id ? action.payload.dog : dog
        ),
        activeDog: state.activeDog?.id === action.payload.id 
          ? action.payload.dog 
          : state.activeDog
      };
    case 'REMOVE_DOG':
      return {
        ...state,
        dogs: state.dogs.filter(dog => dog.id !== action.payload),
        activeDog: state.activeDog?.id === action.payload ? null : state.activeDog
      };
    case 'SET_HEAT_RECORDS':
      return { ...state, heatRecords: action.payload };
    default:
      return state;
  }
};
