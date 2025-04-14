
// This file now just re-exports from the modular service files
import { fetchDogs, fetchDogById } from './fetchDogs';
import { createDog } from './createDog';
import { updateDog } from './updateDog';
import { deleteDog } from './deleteDog';

export {
  fetchDogs,
  fetchDogById,
  createDog,
  updateDog,
  deleteDog
};
