
import { Puppy } from '@/types/breeding';

/**
 * Helper function to convert database puppy record (snake_case) 
 * to frontend Puppy type (camelCase)
 */
export const dbPuppyToFrontend = (dbPuppy: any): Puppy => {
  return {
    id: dbPuppy.id,
    name: dbPuppy.name,
    gender: dbPuppy.gender === 'male' || dbPuppy.gender === 'female' 
      ? dbPuppy.gender 
      : 'male',
    litterId: dbPuppy.litter_id,
    color: dbPuppy.color || '',
    markings: dbPuppy.markings,
    birthWeight: dbPuppy.birth_weight,
    currentWeight: dbPuppy.current_weight,
    sold: dbPuppy.sold || false,
    reserved: dbPuppy.reserved || false,
    newOwner: dbPuppy.new_owner,
    collar: dbPuppy.collar,
    microchip: dbPuppy.microchip,
    breed: dbPuppy.breed,
    imageUrl: dbPuppy.image_url,
    birthDateTime: dbPuppy.birth_date_time,
    registered_name: dbPuppy.registered_name,
    registration_number: dbPuppy.registration_number,
    status: dbPuppy.status || 'Available',
    buyer_name: dbPuppy.buyer_name,
    buyer_phone: dbPuppy.buyer_phone,
    weightLog: [],  // These should be populated separately
    heightLog: [],  // These should be populated separately
    notes: []       // These should be populated separately
  };
};

/**
 * Helper function to convert frontend Puppy type (camelCase)
 * to database record format (snake_case)
 */
export const frontendPuppyToDB = (puppy: Puppy): Record<string, any> => {
  return {
    id: puppy.id,
    name: puppy.name,
    gender: puppy.gender,
    litter_id: puppy.litterId,
    color: puppy.color || '',
    markings: puppy.markings,
    birth_weight: puppy.birthWeight,
    current_weight: puppy.currentWeight,
    sold: puppy.sold || false,
    reserved: puppy.reserved || false,
    new_owner: puppy.newOwner,
    collar: puppy.collar,
    microchip: puppy.microchip,
    breed: puppy.breed,
    image_url: puppy.imageUrl,
    birth_date_time: puppy.birthDateTime,
    registered_name: puppy.registered_name,
    registration_number: puppy.registration_number,
    status: puppy.status || 'Available',
    buyer_name: puppy.buyer_name,
    buyer_phone: puppy.buyer_phone,
  };
};
