
import { Dog } from "@/types/dogs";

// Helper function to map database dog record to Dog type
export const mapDbDogToDog = (dbDog: any): Dog => {
  return {
    id: dbDog.id,
    name: dbDog.name,
    breed: dbDog.breed,
    gender: dbDog.gender as 'male' | 'female',
    dateOfBirth: dbDog.date_of_birth,
    color: dbDog.color,
    registrationNumber: dbDog.registration_number,
    notes: dbDog.notes,
    dewormingDate: dbDog.deworming_date,
    vaccinationDate: dbDog.vaccination_date,
    heatInterval: dbDog.heat_interval,
    image_url: dbDog.image_url
  };
};

// Helper function to map Dog type to database fields
export const mapDogToDbDog = (dog: Partial<Dog>) => {
  return {
    name: dog.name,
    breed: dog.breed,
    gender: dog.gender,
    date_of_birth: dog.dateOfBirth,
    color: dog.color,
    registration_number: dog.registrationNumber,
    notes: dog.notes,
    deworming_date: dog.dewormingDate,
    vaccination_date: dog.vaccinationDate,
    heat_interval: dog.heatInterval,
    image_url: dog.image_url
  };
};
